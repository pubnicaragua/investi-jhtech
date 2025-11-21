CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  attachments_count INTEGER DEFAULT 0,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

CREATE TABLE IF NOT EXISTS support_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_attachments_ticket_id ON support_attachments(ticket_id);

CREATE TABLE IF NOT EXISTS support_ticket_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  old_priority VARCHAR(50),
  new_priority VARCHAR(50),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_history_ticket_id ON support_ticket_history(ticket_id);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets" ON support_tickets
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own attachments" ON support_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = support_attachments.ticket_id 
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create attachments" ON support_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = support_attachments.ticket_id 
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own history" ON support_ticket_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = support_ticket_history.ticket_id 
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_support_tickets_timestamp ON support_tickets;
CREATE TRIGGER update_support_tickets_timestamp
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_timestamp();

CREATE OR REPLACE FUNCTION log_support_ticket_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status OR OLD.priority != NEW.priority THEN
    INSERT INTO support_ticket_history (
      ticket_id, changed_by, old_status, new_status, old_priority, new_priority
    ) VALUES (
      NEW.id, auth.uid(), OLD.status, NEW.status, OLD.priority, NEW.priority
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_ticket_changes ON support_tickets;
CREATE TRIGGER log_ticket_changes
  AFTER UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION log_support_ticket_change();

CREATE OR REPLACE FUNCTION get_recent_errors(limit_count INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  priority VARCHAR,
  status VARCHAR,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  attachments_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    support_tickets.id,
    support_tickets.title,
    support_tickets.priority,
    support_tickets.status,
    support_tickets.user_id,
    support_tickets.created_at,
    support_tickets.attachments_count
  FROM support_tickets
  ORDER BY support_tickets.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_tickets(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  priority VARCHAR,
  status VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  attachments_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    support_tickets.id,
    support_tickets.title,
    support_tickets.description,
    support_tickets.priority,
    support_tickets.status,
    support_tickets.created_at,
    support_tickets.updated_at,
    support_tickets.attachments_count
  FROM support_tickets
  WHERE support_tickets.user_id = user_uuid
  ORDER BY support_tickets.created_at DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_ticket_stats()
RETURNS TABLE (
  total_tickets BIGINT,
  open_tickets BIGINT,
  in_progress_tickets BIGINT,
  resolved_tickets BIGINT,
  critical_tickets BIGINT,
  high_priority_tickets BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status = 'open')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'in_progress')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'resolved')::BIGINT,
    COUNT(*) FILTER (WHERE priority = 'critical')::BIGINT,
    COUNT(*) FILTER (WHERE priority = 'high')::BIGINT
  FROM support_tickets;
END;
$$ LANGUAGE plpgsql;
