-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.badges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo text UNIQUE,
  nombre text,
  descripcion text,
  icono_url text,
  CONSTRAINT badges_pkey PRIMARY KEY (id)
);
CREATE TABLE public.channel_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text'::text CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'file'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT channel_messages_pkey PRIMARY KEY (id),
  CONSTRAINT channel_messages_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.community_channels(id),
  CONSTRAINT channel_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_id uuid,
  sender_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone,
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id),
  CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
);
CREATE TABLE public.chat_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_id uuid,
  user_id uuid,
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_participants_pkey PRIMARY KEY (id),
  CONSTRAINT chat_participants_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id),
  CONSTRAINT chat_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.chats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user1_id uuid,
  user2_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  community_id uuid,
  unread_count integer DEFAULT 0,
  CONSTRAINT chats_pkey PRIMARY KEY (id),
  CONSTRAINT chats_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.users(id),
  CONSTRAINT chats_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.users(id),
  CONSTRAINT chats_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id)
);
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  user_id uuid,
  parent_id uuid,
  contenido text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id)
);
CREATE TABLE public.communities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  tipo USER-DEFINED DEFAULT 'public'::community_privacy,
  icono_url text,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  member_count integer DEFAULT 0,
  name text,
  image_url text,
  cover_image_url text,
  banner_url text,
  category text,
  is_verified boolean DEFAULT false,
  notifications_enabled boolean DEFAULT true,
  allow_member_posts boolean DEFAULT true,
  require_approval boolean DEFAULT false,
  allow_invites boolean DEFAULT true,
  type character varying DEFAULT 'public'::character varying CHECK (type::text = ANY (ARRAY['public'::character varying, 'private'::character varying]::text[])),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT communities_pkey PRIMARY KEY (id),
  CONSTRAINT communities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.community_channels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_id uuid,
  name text NOT NULL,
  description text,
  type text DEFAULT 'text'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_channels_pkey PRIMARY KEY (id),
  CONSTRAINT community_channels_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id)
);
CREATE TABLE public.community_chats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_id uuid,
  name text NOT NULL,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_chats_pkey PRIMARY KEY (id),
  CONSTRAINT community_chats_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT community_chats_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.community_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_id uuid,
  user_id uuid,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_files_pkey PRIMARY KEY (id),
  CONSTRAINT community_files_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT community_files_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.community_goals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  community_id uuid NOT NULL,
  goal_id uuid NOT NULL,
  relevance_score numeric DEFAULT 1.0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_goals_pkey PRIMARY KEY (id),
  CONSTRAINT community_goals_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT community_goals_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES public.goals(id)
);
CREATE TABLE public.community_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL,
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT community_invitations_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT community_invitations_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public.users(id),
  CONSTRAINT community_invitations_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.community_join_requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  community_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  message text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_join_requests_pkey PRIMARY KEY (id),
  CONSTRAINT community_join_requests_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT community_join_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT community_join_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id)
);
CREATE TABLE public.community_media (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL,
  user_id uuid NOT NULL,
  media_type text NOT NULL CHECK (media_type = ANY (ARRAY['image'::text, 'file'::text, 'video'::text])),
  media_url text NOT NULL,
  file_name text,
  file_size bigint,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_media_pkey PRIMARY KEY (id),
  CONSTRAINT community_media_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT community_media_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.community_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text DEFAULT 'member'::text CHECK (role = ANY (ARRAY['member'::text, 'moderator'::text, 'admin'::text])),
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_members_pkey PRIMARY KEY (id),
  CONSTRAINT community_members_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT community_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.community_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  channel_id uuid,
  user_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_messages_pkey PRIMARY KEY (id),
  CONSTRAINT community_messages_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.community_channels(id),
  CONSTRAINT community_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.community_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_id uuid,
  user_id uuid,
  image_url text NOT NULL,
  caption text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_photos_pkey PRIMARY KEY (id),
  CONSTRAINT community_photos_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT community_photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.community_settings (
  community_id uuid NOT NULL,
  is_private boolean DEFAULT false,
  require_approval boolean DEFAULT false,
  allow_member_posts boolean DEFAULT true,
  allow_member_invites boolean DEFAULT true,
  allow_comments boolean DEFAULT true,
  allow_reactions boolean DEFAULT true,
  show_member_count boolean DEFAULT true,
  show_member_list boolean DEFAULT true,
  enable_notifications boolean DEFAULT true,
  notify_new_members boolean DEFAULT true,
  notify_new_posts boolean DEFAULT true,
  notify_new_comments boolean DEFAULT false,
  auto_moderate boolean DEFAULT false,
  profanity_filter boolean DEFAULT true,
  spam_filter boolean DEFAULT true,
  max_post_length integer DEFAULT 5000,
  max_comment_length integer DEFAULT 1000,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_settings_pkey PRIMARY KEY (community_id),
  CONSTRAINT community_settings_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id)
);
CREATE TABLE public.conversation_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid,
  user_id uuid,
  joined_at timestamp with time zone DEFAULT now(),
  role text DEFAULT 'member'::text CHECK (role = ANY (ARRAY['admin'::text, 'member'::text])),
  CONSTRAINT conversation_participants_pkey PRIMARY KEY (id),
  CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text,
  type text DEFAULT 'direct'::text CHECK (type = ANY (ARRAY['direct'::text, 'group'::text])),
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_message text,
  last_message_at timestamp with time zone,
  participant_one uuid,
  participant_two uuid,
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT conversations_participant_one_fkey FOREIGN KEY (participant_one) REFERENCES public.users(id),
  CONSTRAINT conversations_participant_two_fkey FOREIGN KEY (participant_two) REFERENCES public.users(id)
);
CREATE TABLE public.course_enrollments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  enrolled_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  progress_percentage numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  last_accessed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT course_enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT course_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.course_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid,
  titulo text,
  orden integer,
  CONSTRAINT course_modules_pkey PRIMARY KEY (id),
  CONSTRAINT course_modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.course_topics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  icon text,
  color text DEFAULT '#4A90E2'::text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_topics_pkey PRIMARY KEY (id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text,
  descripcion text,
  nivel USER-DEFINED,
  created_at timestamp with time zone DEFAULT now(),
  imagen_url text,
  category text,
  duracion_total integer,
  total_lecciones integer,
  topic uuid,
  icon text,
  color text DEFAULT '#4A90E2'::text,
  title text,
  description text,
  level text,
  duration integer,
  price numeric DEFAULT 0,
  currency text DEFAULT 'USD'::text,
  is_published boolean DEFAULT true,
  is_free boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  thumbnail_url text,
  instructor_id uuid,
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id)
);
CREATE TABLE public.dismissed_suggestions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dismissed_user_id uuid NOT NULL,
  dismissed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dismissed_suggestions_pkey PRIMARY KEY (id),
  CONSTRAINT dismissed_suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT dismissed_suggestions_dismissed_user_id_fkey FOREIGN KEY (dismissed_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.educational_tools (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  icon text,
  route text,
  is_premium boolean DEFAULT false,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT educational_tools_pkey PRIMARY KEY (id)
);
CREATE TABLE public.faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pregunta text,
  respuesta_md text,
  CONSTRAINT faqs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.formularios_landing (
  id integer NOT NULL DEFAULT nextval('formularios_landing_id_seq'::regclass),
  name character varying NOT NULL,
  email character varying NOT NULL,
  phone character varying,
  age character varying,
  goals ARRAY,
  interests ARRAY,
  timestamp timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT formularios_landing_pkey PRIMARY KEY (id)
);
CREATE TABLE public.glossary (
  termino text NOT NULL,
  definicion_md text,
  CONSTRAINT glossary_pkey PRIMARY KEY (termino)
);
CREATE TABLE public.goals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  icon text,
  category text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT goals_pkey PRIMARY KEY (id)
);
CREATE TABLE public.interests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text,
  category text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT interests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.investment_portfolios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  symbol text,
  quantity numeric,
  purchase_price numeric,
  current_value numeric,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT investment_portfolios_pkey PRIMARY KEY (id),
  CONSTRAINT investment_portfolios_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.knowledge_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  level_order integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT knowledge_levels_pkey PRIMARY KEY (id)
);
CREATE TABLE public.learning_path_courses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  learning_path_id uuid NOT NULL,
  course_id uuid NOT NULL,
  order_index integer NOT NULL,
  is_required boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT learning_path_courses_pkey PRIMARY KEY (id),
  CONSTRAINT learning_path_courses_learning_path_id_fkey FOREIGN KEY (learning_path_id) REFERENCES public.learning_paths(id),
  CONSTRAINT learning_path_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.learning_paths (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  difficulty_level text,
  estimated_duration integer,
  created_at timestamp with time zone DEFAULT now(),
  course_ids ARRAY,
  CONSTRAINT learning_paths_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lesson_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  lesson_id uuid,
  completed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lesson_progress_pkey PRIMARY KEY (id),
  CONSTRAINT lesson_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  module_id uuid,
  titulo text,
  contenido_md text,
  orden integer,
  descripcion text,
  course_id uuid,
  duration integer DEFAULT 0,
  tipo text DEFAULT 'video'::text,
  CONSTRAINT lessons_pkey PRIMARY KEY (id),
  CONSTRAINT lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_modules(id),
  CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.market_data (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  symbol text NOT NULL UNIQUE,
  company_name text NOT NULL,
  current_price numeric NOT NULL,
  price_change numeric NOT NULL,
  price_change_percent numeric NOT NULL,
  color text DEFAULT '#111'::text,
  is_featured boolean DEFAULT false,
  last_updated timestamp with time zone DEFAULT now(),
  CONSTRAINT market_data_pkey PRIMARY KEY (id)
);
CREATE TABLE public.message_reads (
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  last_read_at timestamp with time zone DEFAULT now(),
  CONSTRAINT message_reads_pkey PRIMARY KEY (conversation_id, user_id),
  CONSTRAINT message_reads_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT message_reads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_id uuid,
  sender_id uuid,
  contenido text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  receiver_id uuid,
  media_url text,
  message_type text DEFAULT 'text'::text CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'video'::text, 'file'::text, 'audio'::text, 'voice'::text])),
  conversation_id uuid,
  content text,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id)
);
CREATE TABLE public.news (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  image_url text,
  author_id uuid,
  category text,
  published_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT news_pkey PRIMARY KEY (id),
  CONSTRAINT news_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
);
CREATE TABLE public.news_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT news_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type text,
  payload jsonb,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  community_id uuid,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  post_id uuid,
  from_user_id uuid,
  action_url text,
  actor_id uuid,
  target_object jsonb,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT notifications_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT notifications_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT notifications_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public.users(id),
  CONSTRAINT notifications_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id)
);
CREATE TABLE public.post_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  contenido text NOT NULL,
  parent_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT post_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.post_comments(id)
);
CREATE TABLE public.post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  user_id uuid,
  is_like boolean NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.post_saves (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_saves_pkey PRIMARY KEY (id),
  CONSTRAINT post_saves_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT post_saves_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.post_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  shared_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_shares_pkey PRIMARY KEY (id),
  CONSTRAINT post_shares_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT post_shares_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  community_id uuid,
  contenido text NOT NULL,
  media_url ARRAY DEFAULT '{}'::text[],
  likes_count integer DEFAULT 0,
  dislikes_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  user_name text,
  user_avatar text,
  role text,
  content text,
  image_url text,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  is_pinned boolean DEFAULT false,
  pinned_by uuid,
  pinned_at timestamp with time zone,
  is_edited boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  shares_count integer DEFAULT 0,
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT posts_pinned_by_fkey FOREIGN KEY (pinned_by) REFERENCES public.users(id)
);
CREATE TABLE public.promotion_claims (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  promotion_id uuid NOT NULL,
  user_id uuid NOT NULL,
  claimed_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'claimed'::text CHECK (status = ANY (ARRAY['claimed'::text, 'used'::text, 'expired'::text])),
  CONSTRAINT promotion_claims_pkey PRIMARY KEY (id),
  CONSTRAINT promotion_claims_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT promotion_claims_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.promotion_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  promotion_id uuid NOT NULL,
  user_id uuid NOT NULL,
  viewed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT promotion_views_pkey PRIMARY KEY (id),
  CONSTRAINT promotion_views_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id),
  CONSTRAINT promotion_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.promotions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  discount text,
  image_url text,
  valid_until date,
  location text,
  terms text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT promotions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reporter uuid,
  post_id uuid,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_reporter_fkey FOREIGN KEY (reporter) REFERENCES public.users(id),
  CONSTRAINT reports_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.saved_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  post_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saved_posts_pkey PRIMARY KEY (id),
  CONSTRAINT saved_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT saved_posts_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.simulated_investments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  portfolio_id uuid,
  tipo_activo text,
  monto numeric,
  rendimiento numeric,
  fecha date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT simulated_investments_pkey PRIMARY KEY (id),
  CONSTRAINT simulated_investments_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.simulated_portfolios(id)
);
CREATE TABLE public.simulated_portfolios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT simulated_portfolios_pkey PRIMARY KEY (id),
  CONSTRAINT simulated_portfolios_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  activity_type USER-DEFINED,
  entity_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_activity_pkey PRIMARY KEY (id),
  CONSTRAINT user_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_badges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  badge_id uuid,
  granted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_badges_pkey PRIMARY KEY (id),
  CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id)
);
CREATE TABLE public.user_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  blocked_user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_blocks_pkey PRIMARY KEY (id),
  CONSTRAINT user_blocks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_blocks_blocked_user_id_fkey FOREIGN KEY (blocked_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_budgets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  category text NOT NULL,
  amount numeric,
  period text DEFAULT 'monthly'::text,
  created_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT user_budgets_pkey PRIMARY KEY (id),
  CONSTRAINT user_budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_communities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  community_id uuid,
  joined_at timestamp with time zone DEFAULT now(),
  role text DEFAULT 'member'::text CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'moderator'::text, 'member'::text])),
  status text DEFAULT 'active'::text,
  CONSTRAINT user_communities_pkey PRIMARY KEY (id),
  CONSTRAINT user_communities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_communities_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id)
);
CREATE TABLE public.user_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'blocked'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_connections_pkey PRIMARY KEY (id),
  CONSTRAINT user_connections_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public.users(id),
  CONSTRAINT user_connections_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_course_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  lesson_id uuid,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at timestamp with time zone,
  started_at timestamp with time zone DEFAULT now(),
  last_accessed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_course_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_course_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_course_progress_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT user_course_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);
CREATE TABLE public.user_followers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  follower_id uuid,
  following_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_followers_pkey PRIMARY KEY (id),
  CONSTRAINT user_followers_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id),
  CONSTRAINT user_followers_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_follows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  follower_id uuid,
  following_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  source text DEFAULT 'manual'::text,
  CONSTRAINT user_follows_pkey PRIMARY KEY (id),
  CONSTRAINT user_follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id),
  CONSTRAINT user_follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  goal_id uuid,
  priority integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_goals_pkey PRIMARY KEY (id),
  CONSTRAINT user_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_goals_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES public.goals(id)
);
CREATE TABLE public.user_interests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  interest_id uuid,
  experience_level text DEFAULT 'beginner'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_interests_pkey PRIMARY KEY (id),
  CONSTRAINT user_interests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_interests_interest_id_fkey FOREIGN KEY (interest_id) REFERENCES public.interests(id)
);
CREATE TABLE public.user_knowledge (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  level text NOT NULL,
  specific_areas ARRAY DEFAULT '{}'::text[],
  learning_goals ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_knowledge_pkey PRIMARY KEY (id),
  CONSTRAINT user_knowledge_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  language text DEFAULT 'es'::text,
  notifications boolean DEFAULT true,
  theme text DEFAULT 'system'::text CHECK (theme = ANY (ARRAY['light'::text, 'dark'::text, 'system'::text])),
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  privacy_level text DEFAULT 'public'::text CHECK (privacy_level = ANY (ARRAY['public'::text, 'friends'::text, 'private'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  notifications_enabled boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  privacy_level text DEFAULT 'public'::text,
  language text DEFAULT 'es'::text,
  theme text DEFAULT 'system'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_settings_pkey PRIMARY KEY (id),
  CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  amount numeric,
  type text CHECK (type = ANY (ARRAY['income'::text, 'expense'::text])),
  category text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT user_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  nombre text NOT NULL,
  username text NOT NULL UNIQUE,
  bio text,
  photo_url text,
  pais text,
  metas ARRAY DEFAULT '{}'::text[],
  intereses ARRAY DEFAULT '{}'::text[],
  nivel_finanzas USER-DEFINED DEFAULT 'none'::finance_level,
  reputacion integer DEFAULT 0,
  fecha_registro timestamp with time zone DEFAULT now(),
  email text,
  preferences jsonb DEFAULT '{"theme": "system", "language": "es", "notifications": true}'::jsonb,
  stats jsonb DEFAULT '{"postsCount": 0, "followersCount": 0, "followingCount": 0}'::jsonb,
  full_name text,
  avatar_url text,
  role text DEFAULT 'Usuario'::text,
  is_online boolean DEFAULT false,
  last_seen_at timestamp with time zone DEFAULT now(),
  location text,
  banner_url text,
  is_verified boolean DEFAULT false,
  onboarding_step text DEFAULT 'welcome'::text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.video_bookmarks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  video_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT video_bookmarks_pkey PRIMARY KEY (id),
  CONSTRAINT video_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT video_bookmarks_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id)
);
CREATE TABLE public.video_comments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  video_id uuid NOT NULL,
  content text NOT NULL,
  parent_id uuid,
  like_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT video_comments_pkey PRIMARY KEY (id),
  CONSTRAINT video_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT video_comments_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id),
  CONSTRAINT video_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.video_comments(id)
);
CREATE TABLE public.video_content (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text,
  duration integer,
  course_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT video_content_pkey PRIMARY KEY (id),
  CONSTRAINT video_content_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.video_likes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  video_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT video_likes_pkey PRIMARY KEY (id),
  CONSTRAINT video_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT video_likes_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id)
);
CREATE TABLE public.video_progress (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  video_id uuid NOT NULL,
  progress_seconds integer DEFAULT 0,
  total_seconds integer NOT NULL,
  progress_percentage numeric DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  last_watched_at timestamp with time zone DEFAULT now(),
  watch_time_seconds integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT video_progress_pkey PRIMARY KEY (id),
  CONSTRAINT video_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT video_progress_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id)
);
CREATE TABLE public.video_subtitles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  video_id uuid NOT NULL,
  language_code text NOT NULL,
  language_name text NOT NULL,
  subtitle_url text NOT NULL,
  is_auto_generated boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT video_subtitles_pkey PRIMARY KEY (id),
  CONSTRAINT video_subtitles_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id)
);
CREATE TABLE public.video_themes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  color text DEFAULT '#4A90E2'::text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT video_themes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.videos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  duration integer NOT NULL,
  file_size bigint,
  mime_type text,
  quality text DEFAULT 'HD'::text CHECK (quality = ANY (ARRAY['SD'::text, 'HD'::text, 'FHD'::text, '4K'::text])),
  course_id uuid,
  lesson_id uuid,
  instructor_id uuid,
  category text,
  tags ARRAY,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  is_published boolean DEFAULT false,
  is_free boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  theme_id_fk uuid,
  theme_id uuid,
  CONSTRAINT videos_pkey PRIMARY KEY (id),
  CONSTRAINT videos_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT videos_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id),
  CONSTRAINT videos_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id),
  CONSTRAINT videos_theme_id_fk_fkey FOREIGN KEY (theme_id_fk) REFERENCES public.video_themes(id)
);




RLS - ROW LEVELS SECURITY

Policies
Manage Row Level Security policies for your tables

Docs
Filter tables and policies

schema

public

badges
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

channel_messages

Disable RLS

Create policy

No data will be selectable via Supabase APIs because RLS is enabled but no policies have been created yet.
No policies created yet

chat_messages

Disable RLS

Create policy

Name	Command	Applied to	Actions

anyone_can_view_messages
SELECT	
public


users_can_send_messages
INSERT	
public

chat_participants
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

chats

Disable RLS

Create policy

Name	Command	Applied to	Actions

chats_rw
ALL	
public

comments

Disable RLS

Create policy

Name	Command	Applied to	Actions

Anyone can view comments
SELECT	
public


comments_crud
ALL	
public


comments_read
SELECT	
public


Users can create comments
INSERT	
public


Users can delete own comments
DELETE	
public

communities
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

community_channels

Disable RLS

Create policy

No data will be selectable via Supabase APIs because RLS is enabled but no policies have been created yet.
No policies created yet

community_chats
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

community_files
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

community_goals
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

community_invitations

Disable RLS

Create policy

No data will be selectable via Supabase APIs because RLS is enabled but no policies have been created yet.
No policies created yet

community_join_requests

Disable RLS

Create policy

Name	Command	Applied to	Actions

admins_update_requests
UPDATE	
public


admins_view_requests
SELECT	
public


users_create_requests
INSERT	
public


view_own_requests
SELECT	
public

community_media

Disable RLS

Create policy

Name	Command	Applied to	Actions

Community members can view community content
SELECT	
public

community_members

Disable RLS

Create policy

No data will be selectable via Supabase APIs because RLS is enabled but no policies have been created yet.
No policies created yet

community_messages
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

community_photos
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

community_settings

Disable RLS

Create policy

Name	Command	Applied to	Actions

admins_insert_settings
INSERT	
public


admins_update_settings
UPDATE	
public


view_community_settings
SELECT	
public

conversation_participants

Disable RLS

Create policy

Name	Command	Applied to	Actions

Users can view participants in their conversations
SELECT	
public


Users can view their own participation
ALL	
public

conversations
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

course_enrollments

Disable RLS

Create policy

Name	Command	Applied to	Actions

Users can manage their own course enrollments
ALL	
public

course_modules
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

course_topics

Disable RLS

Create policy

Name	Command	Applied to	Actions

Course topics are readable by everyone
SELECT	
public

courses

Disable RLS

Create policy

Name	Command	Applied to	Actions

Courses are insertable by authenticated users
INSERT	
public


Courses are readable by everyone
SELECT	
public

dismissed_suggestions
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

educational_tools

Disable RLS

Create policy

Name	Command	Applied to	Actions

Educational tools are readable by everyone
SELECT	
public

faqs
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

formularios_landing

Disable RLS

Create policy

Name	Command	Applied to	Actions

Allow insert for all
INSERT	
public


Allow read for all
SELECT	
public

glossary
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

goals

Disable RLS

Create policy

Name	Command	Applied to	Actions

Goals are viewable by everyone
SELECT	
public


goals_read
SELECT	
public

interests

Disable RLS

Create policy

Name	Command	Applied to	Actions

Interests are viewable by everyone
SELECT	
public


interests_read
SELECT	
public

investment_portfolios
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

knowledge_levels

Disable RLS

Create policy

Name	Command	Applied to	Actions

knowledge_levels_read
SELECT	
public

learning_path_courses
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

learning_paths
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

lesson_progress

Disable RLS

Create policy

Name	Command	Applied to	Actions

lp_owner
ALL	
public


Users can manage their own lesson progress
ALL	
public

lessons

Disable RLS

Create policy

Name	Command	Applied to	Actions

Lessons are readable by everyone
SELECT	
public


lessons_read
SELECT	
public

market_data
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

message_reads
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
Name	Command	Applied to	Actions

Users can manage their own read status
ALL	
public

messages
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
Name	Command	Applied to	Actions

messages_rw
ALL	
public


Users can delete own messages
DELETE	
public


Users can read their messages
SELECT	
public


Users can send messages
INSERT	
public


Users can update own messages
UPDATE	
public

news
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

news_categories
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

notifications

Disable RLS

Create policy

Name	Command	Applied to	Actions

notif_owner
ALL	
public

post_comments

Disable RLS

Create policy

Name	Command	Applied to	Actions

Users can create comments
INSERT	
public


Users can edit their own comments
UPDATE	
public


Users can view all comments
SELECT	
public

post_likes

Disable RLS

Create policy

Name	Command	Applied to	Actions

Anyone can view likes
SELECT	
public


likes_crud
ALL	
public


Users can like posts
INSERT	
public


Users can unlike posts
DELETE	
public

post_saves

Disable RLS

Create policy

Name	Command	Applied to	Actions

Users can manage their own saved posts
ALL	
public

post_shares

Disable RLS

Create policy

Name	Command	Applied to	Actions

Anyone can view shares
SELECT	
public


Users can share posts
INSERT	
public

posts

Disable RLS

Create policy

Name	Command	Applied to	Actions

Anyone can view posts
SELECT	
public


Posts are publicly readable
SELECT	
public


posts_crud
ALL	
public


posts_read
SELECT	
public


Users can create posts
INSERT	
public


Users can delete own posts
DELETE	
public


Users can update own posts
UPDATE	
public

promotion_claims

Disable RLS

Create policy

No data will be selectable via Supabase APIs because RLS is enabled but no policies have been created yet.
No policies created yet

promotion_views

Disable RLS

Create policy

Name	Command	Applied to	Actions

Users can view their own promotion views
ALL	
public

promotions

Disable RLS

Create policy

Name	Command	Applied to	Actions

promotions_read
SELECT	
public

reports

Disable RLS

Create policy

Name	Command	Applied to	Actions

reports_owner
ALL	
public

saved_posts

Disable RLS

Create policy

Name	Command	Applied to	Actions

Users can save posts
INSERT	
public


Users can unsave posts
DELETE	
public


Users can view their own saved posts
SELECT	
public

simulated_investments

Disable RLS

Create policy

No data will be selectable via Supabase APIs because RLS is enabled but no policies have been created yet.
No policies created yet

simulated_portfolios

Disable RLS

Create policy

No data will be selectable via Supabase APIs because RLS is enabled but no policies have been created yet.
No policies created yet

user_activity
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

user_badges

Disable RLS

Create policy

Name	Command	Applied to	Actions

system_can_award_badges
INSERT	
public


ub_read
SELECT	
public

user_blocks

Disable RLS

Create policy

Name	Command	Applied to	Actions

ub_crud
ALL	
public


ub_read
SELECT	
public

user_budgets

Disable RLS

Create policy

Name	Command	Applied to	Actions

Users can manage their own budgets
ALL	
public

user_communities

Disable RLS

Create policy

Name	Command	Applied to	Actions

admins_delete_members
DELETE	
public


admins_update_roles
UPDATE	
public


Users can join communities
INSERT	
authenticated


Users can leave communities
DELETE	
authenticated


Users can view memberships
SELECT	
authenticated


users_can_join_communities
INSERT	
public


view_active_members
SELECT	
public

user_connections

Disable RLS

Create policy

Name	Command	Applied to	Actions

Users can manage their connections
ALL	
public

user_course_progress

Disable RLS

Create policy

Name	Command	Applied to	Actions

Users can manage their own course progress
ALL	
public

user_followers
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

user_follows

Disable RLS

Create policy

Name	Command	Applied to	Actions

Users can manage their own follows
ALL	
public


Users can view all follows
SELECT	
public

user_goals

Disable RLS

Create policy

Name	Command	Applied to	Actions

Users can delete their own goals
DELETE	
public


Users can insert their own goals
INSERT	
public


Users can update their own goals
UPDATE	
public


Users can view their own goals
SELECT	
public

user_interests

Disable RLS

Create policy

Name	Command	Applied to	Actions

Users can delete their own interests
DELETE	
public


Users can insert their own interests
INSERT	
public


Users can update their own interests
UPDATE	
public


Users can view their own interests
SELECT	
public

user_knowledge

Disable RLS

Create policy

Name	Command	Applied to	Actions

Users can insert their own knowledge
INSERT	
public


Users can update their own knowledge
UPDATE	
public


Users can view their own knowledge
SELECT	
public

user_preferences

Disable RLS

Create policy

Name	Command	Applied to	Actions

Users can manage their own preferences
ALL	
public

user_settings
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

user_transactions

Disable RLS

Create policy

Name	Command	Applied to	Actions

Users can manage their own transactions
ALL	
public

users

Disable RLS

Create policy

Name	Command	Applied to	Actions

Anyone can view user profiles
SELECT	
public


Users can insert their own profile
INSERT	
public


Users can read their own profile
SELECT	
public


Users can update own profile
UPDATE	
public


Users can update their own profile
UPDATE	
public


users_read
SELECT	
public


users_update
UPDATE	
public

video_bookmarks
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
Name	Command	Applied to	Actions

video_bookmarks_delete
DELETE	
public


video_bookmarks_insert
INSERT	
public


video_bookmarks_select
SELECT	
public

video_comments
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
Name	Command	Applied to	Actions

Users can create video comments
INSERT	
public


Users can update their own video comments
UPDATE	
public


Video comments are readable by everyone
SELECT	
public

video_content
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
No policies created yet

video_likes
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
Name	Command	Applied to	Actions

video_likes_delete
DELETE	
public


video_likes_insert
INSERT	
public


video_likes_select
SELECT	
public

video_progress
RLS Disabled

Enable RLS

Create policy

Anyone with your project's anonymous key can read, modify, or delete your data.
Name	Command	Applied to	Actions

video_progress_insert
INSERT	
public


video_progress_select
SELECT	
public


video_progress_update
UPDATE	
public

video_subtitles

Disable RLS

Create policy

No data will be selectable via Supabase APIs because RLS is enabled but no policies have been created yet.
No policies created yet

video_themes

Disable RLS

Create policy

Name	Command	Applied to	Actions

Video themes are readable by everyone
SELECT	
public

videos

Disable RLS

Create policy

Name	Command	Applied to	Actions

Instructors can manage their own videos
ALL	
public


Published videos are readable by everyone
SELECT	
public


Videos are insertable by authenticated users
INSERT	
public


Videos are readable by everyone
SELECT	
public



BUCKETS

Storage

New bucket
Search buckets
Search buckets...

All buckets
community-media

Public

Images_Intereses




Listar todas las tablas (por esquema)
| table_schema | table_name                | table_type |
| ------------ | ------------------------- | ---------- |
| auth         | audit_log_entries         | BASE TABLE |
| auth         | flow_state                | BASE TABLE |
| auth         | identities                | BASE TABLE |
| auth         | instances                 | BASE TABLE |
| auth         | mfa_amr_claims            | BASE TABLE |
| auth         | mfa_challenges            | BASE TABLE |
| auth         | mfa_factors               | BASE TABLE |
| auth         | oauth_clients             | BASE TABLE |
| auth         | one_time_tokens           | BASE TABLE |
| auth         | refresh_tokens            | BASE TABLE |
| auth         | saml_providers            | BASE TABLE |
| auth         | saml_relay_states         | BASE TABLE |
| auth         | schema_migrations         | BASE TABLE |
| auth         | sessions                  | BASE TABLE |
| auth         | sso_domains               | BASE TABLE |
| auth         | sso_providers             | BASE TABLE |
| auth         | users                     | BASE TABLE |
| extensions   | pg_stat_statements        | VIEW       |
| extensions   | pg_stat_statements_info   | VIEW       |
| public       | badges                    | BASE TABLE |
| public       | channel_messages          | BASE TABLE |
| public       | chat_messages             | BASE TABLE |
| public       | chat_participants         | BASE TABLE |
| public       | chats                     | BASE TABLE |
| public       | comments                  | BASE TABLE |
| public       | communities               | BASE TABLE |
| public       | community_channels        | BASE TABLE |
| public       | community_chats           | BASE TABLE |
| public       | community_files           | BASE TABLE |
| public       | community_goals           | BASE TABLE |
| public       | community_invitations     | BASE TABLE |
| public       | community_join_requests   | BASE TABLE |
| public       | community_media           | BASE TABLE |
| public       | community_members         | BASE TABLE |
| public       | community_messages        | BASE TABLE |
| public       | community_photos          | BASE TABLE |
| public       | community_settings        | BASE TABLE |
| public       | conversation_participants | BASE TABLE |
| public       | conversations             | BASE TABLE |
| public       | course_enrollments        | BASE TABLE |
| public       | course_modules            | BASE TABLE |
| public       | course_topics             | BASE TABLE |
| public       | courses                   | BASE TABLE |
| public       | dismissed_suggestions     | BASE TABLE |
| public       | educational_tools         | BASE TABLE |
| public       | faqs                      | BASE TABLE |
| public       | formularios_landing       | BASE TABLE |
| public       | glossary                  | BASE TABLE |
| public       | goals                     | BASE TABLE |
| public       | interests                 | BASE TABLE |
| public       | investment_portfolios     | BASE TABLE |
| public       | knowledge_levels          | BASE TABLE |
| public       | learning_path_courses     | BASE TABLE |
| public       | learning_paths            | BASE TABLE |
| public       | lesson_progress           | BASE TABLE |
| public       | lessons                   | BASE TABLE |
| public       | market_data               | BASE TABLE |
| public       | message_reads             | BASE TABLE |
| public       | messages                  | BASE TABLE |
| public       | news                      | BASE TABLE |
| public       | news_categories           | BASE TABLE |
| public       | notifications             | BASE TABLE |
| public       | post_comments             | BASE TABLE |
| public       | post_likes                | BASE TABLE |
| public       | post_saves                | BASE TABLE |
| public       | post_shares               | BASE TABLE |
| public       | posts                     | BASE TABLE |
| public       | promotion_claims          | BASE TABLE |
| public       | promotion_views           | BASE TABLE |
| public       | promotions                | BASE TABLE |
| public       | reports                   | BASE TABLE |
| public       | saved_posts               | BASE TABLE |
| public       | simulated_investments     | BASE TABLE |
| public       | simulated_portfolios      | BASE TABLE |
| public       | user_activity             | BASE TABLE |
| public       | user_badges               | BASE TABLE |
| public       | user_blocks               | BASE TABLE |
| public       | user_budgets              | BASE TABLE |
| public       | user_communities          | BASE TABLE |
| public       | user_connections          | BASE TABLE |
| public       | user_course_progress      | BASE TABLE |
| public       | user_followers            | BASE TABLE |
| public       | user_follows              | BASE TABLE |
| public       | user_goals                | BASE TABLE |
| public       | user_interests            | BASE TABLE |
| public       | user_knowledge            | BASE TABLE |
| public       | user_preferences          | BASE TABLE |
| public       | user_settings             | BASE TABLE |
| public       | user_transactions         | BASE TABLE |
| public       | users                     | BASE TABLE |
| public       | video_bookmarks           | BASE TABLE |
| public       | video_comments            | BASE TABLE |
| public       | video_content             | BASE TABLE |
| public       | video_likes               | BASE TABLE |
| public       | video_progress            | BASE TABLE |
| public       | video_subtitles           | BASE TABLE |
| public       | video_themes              | BASE TABLE |
| public       | videos                    | BASE TABLE |
| realtime     | messages                  | BASE TABLE |
| realtime     | messages_2025_10_08       | BASE TABLE |

Listar todas las vistas
| table_schema | table_name              | view_definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| extensions   | pg_stat_statements      |  SELECT userid,
    dbid,
    toplevel,
    queryid,
    query,
    plans,
    total_plan_time,
    min_plan_time,
    max_plan_time,
    mean_plan_time,
    stddev_plan_time,
    calls,
    total_exec_time,
    min_exec_time,
    max_exec_time,
    mean_exec_time,
    stddev_exec_time,
    rows,
    shared_blks_hit,
    shared_blks_read,
    shared_blks_dirtied,
    shared_blks_written,
    local_blks_hit,
    local_blks_read,
    local_blks_dirtied,
    local_blks_written,
    temp_blks_read,
    temp_blks_written,
    shared_blk_read_time,
    shared_blk_write_time,
    local_blk_read_time,
    local_blk_write_time,
    temp_blk_read_time,
    temp_blk_write_time,
    wal_records,
    wal_fpi,
    wal_bytes,
    jit_functions,
    jit_generation_time,
    jit_inlining_count,
    jit_inlining_time,
    jit_optimization_count,
    jit_optimization_time,
    jit_emission_count,
    jit_emission_time,
    jit_deform_count,
    jit_deform_time,
    stats_since,
    minmax_stats_since
   FROM pg_stat_statements(true) pg_stat_statements(userid, dbid, toplevel, queryid, query, plans, total_plan_time, min_plan_time, max_plan_time, mean_plan_time, stddev_plan_time, calls, total_exec_time, min_exec_time, max_exec_time, mean_exec_time, stddev_exec_time, rows, shared_blks_hit, shared_blks_read, shared_blks_dirtied, shared_blks_written, local_blks_hit, local_blks_read, local_blks_dirtied, local_blks_written, temp_blks_read, temp_blks_written, shared_blk_read_time, shared_blk_write_time, local_blk_read_time, local_blk_write_time, temp_blk_read_time, temp_blk_write_time, wal_records, wal_fpi, wal_bytes, jit_functions, jit_generation_time, jit_inlining_count, jit_inlining_time, jit_optimization_count, jit_optimization_time, jit_emission_count, jit_emission_time, jit_deform_count, jit_deform_time, stats_since, minmax_stats_since); |
| extensions   | pg_stat_statements_info |  SELECT dealloc,
    stats_reset
   FROM pg_stat_statements_info() pg_stat_statements_info(dealloc, stats_reset);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| vault        | decrypted_secrets       | null   

Triggers Por Tabla

| table_schema | table_name        | trigger_name                       | action_timing | event_manipulation | action_statement                                           |
| ------------ | ----------------- | ---------------------------------- | ------------- | ------------------ | ---------------------------------------------------------- |
| auth         | users             | on_auth_user_created               | AFTER         | INSERT             | EXECUTE FUNCTION handle_new_user()                         |
| public       | comments          | trg_comment_del                    | AFTER         | DELETE             | EXECUTE FUNCTION update_post_comments_after_delete()       |
| public       | comments          | trg_post_comments                  | AFTER         | INSERT             | EXECUTE FUNCTION update_post_comments()                    |
| public       | community_members | community_member_count_trigger     | AFTER         | DELETE             | EXECUTE FUNCTION update_community_member_count()           |
| public       | community_members | community_member_count_trigger     | AFTER         | INSERT             | EXECUTE FUNCTION update_community_member_count()           |
| public       | courses           | update_courses_updated_at          | BEFORE        | UPDATE             | EXECUTE FUNCTION update_updated_at_column()                |
| public       | lessons           | update_lessons_updated_at          | BEFORE        | UPDATE             | EXECUTE FUNCTION update_updated_at_column()                |
| public       | messages          | trigger_update_unread_count        | AFTER         | INSERT             | EXECUTE FUNCTION update_chat_unread_count()                |
| public       | messages          | update_conversation_trigger        | AFTER         | INSERT             | EXECUTE FUNCTION update_conversation_last_message()        |
| public       | post_likes        | trg_like_del                       | AFTER         | DELETE             | EXECUTE FUNCTION update_post_likes_after_delete()          |
| public       | post_likes        | trg_post_likes                     | AFTER         | DELETE             | EXECUTE FUNCTION update_post_likes()                       |
| public       | post_likes        | trg_post_likes                     | AFTER         | INSERT             | EXECUTE FUNCTION update_post_likes()                       |
| public       | post_shares       | trigger_decrement_shares           | AFTER         | DELETE             | EXECUTE FUNCTION decrement_shares_count()                  |
| public       | post_shares       | trigger_increment_shares           | AFTER         | INSERT             | EXECUTE FUNCTION increment_shares_count()                  |
| public       | posts             | trg_badge_first_post               | AFTER         | INSERT             | EXECUTE FUNCTION badge_first_post()                        |
| public       | user_communities  | trigger_update_member_count        | AFTER         | INSERT             | EXECUTE FUNCTION update_community_member_count()           |
| public       | user_communities  | trigger_update_member_count        | AFTER         | DELETE             | EXECUTE FUNCTION update_community_member_count()           |
| public       | users             | sync_user_columns_trigger          | BEFORE        | UPDATE             | EXECUTE FUNCTION sync_user_columns()                       |
| public       | video_progress    | update_video_progress_updated_at   | BEFORE        | UPDATE             | EXECUTE FUNCTION update_updated_at_column()                |
| public       | videos            | update_videos_updated_at           | BEFORE        | UPDATE             | EXECUTE FUNCTION update_updated_at_column()                |
| realtime     | subscription      | tr_check_filters                   | BEFORE        | INSERT             | EXECUTE FUNCTION realtime.subscription_check_filters()     |
| realtime     | subscription      | tr_check_filters                   | BEFORE        | UPDATE             | EXECUTE FUNCTION realtime.subscription_check_filters()     |
| storage      | buckets           | enforce_bucket_name_length_trigger | BEFORE        | UPDATE             | EXECUTE FUNCTION storage.enforce_bucket_name_length()      |
| storage      | buckets           | enforce_bucket_name_length_trigger | BEFORE        | INSERT             | EXECUTE FUNCTION storage.enforce_bucket_name_length()      |
| storage      | objects           | objects_delete_delete_prefix       | AFTER         | DELETE             | EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger() |
| storage      | objects           | objects_insert_create_prefix       | BEFORE        | INSERT             | EXECUTE FUNCTION storage.objects_insert_prefix_trigger()   |
| storage      | objects           | objects_update_create_prefix       | BEFORE        | UPDATE             | EXECUTE FUNCTION storage.objects_update_prefix_trigger()   |
| storage      | objects           | update_objects_updated_at          | BEFORE        | UPDATE             | EXECUTE FUNCTION storage.update_updated_at_column()        |
| storage      | prefixes          | prefixes_create_hierarchy          | BEFORE        | INSERT             | EXECUTE FUNCTION storage.prefixes_insert_trigger()         |
| storage      | prefixes          | prefixes_delete_hierarchy          | AFTER         | DELETE             | EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger() |



100 Llaves Foraneas FK

| constraint_name                                | table_schema | table_name                | fk_column         | referenced_table_schema | referenced_table     | referenced_column |
| ---------------------------------------------- | ------------ | ------------------------- | ----------------- | ----------------------- | -------------------- | ----------------- |
| channel_messages_user_id_fkey                  | public       | channel_messages          | user_id           | public                  | users                | id                |
| channel_messages_channel_id_fkey               | public       | channel_messages          | channel_id        | public                  | community_channels   | id                |
| chat_messages_chat_id_fkey                     | public       | chat_messages             | chat_id           | public                  | chats                | id                |
| chat_messages_sender_id_fkey                   | public       | chat_messages             | sender_id         | public                  | users                | id                |
| chat_participants_user_id_fkey                 | public       | chat_participants         | user_id           | public                  | users                | id                |
| chat_participants_chat_id_fkey                 | public       | chat_participants         | chat_id           | public                  | chats                | id                |
| chats_community_id_fkey                        | public       | chats                     | community_id      | public                  | communities          | id                |
| chats_user1_id_fkey                            | public       | chats                     | user1_id          | public                  | users                | id                |
| chats_user2_id_fkey                            | public       | chats                     | user2_id          | public                  | users                | id                |
| comments_user_id_fkey                          | public       | comments                  | user_id           | public                  | users                | id                |
| comments_post_id_fkey                          | public       | comments                  | post_id           | public                  | posts                | id                |
| comments_parent_id_fkey                        | public       | comments                  | parent_id         | public                  | comments             | id                |
| communities_created_by_fkey                    | public       | communities               | created_by        | public                  | users                | id                |
| community_channels_community_id_fkey           | public       | community_channels        | community_id      | public                  | communities          | id                |
| community_chats_created_by_fkey                | public       | community_chats           | created_by        | public                  | users                | id                |
| community_chats_community_id_fkey              | public       | community_chats           | community_id      | public                  | communities          | id                |
| community_files_user_id_fkey                   | public       | community_files           | user_id           | public                  | users                | id                |
| community_files_community_id_fkey              | public       | community_files           | community_id      | public                  | communities          | id                |
| community_goals_community_id_fkey              | public       | community_goals           | community_id      | public                  | communities          | id                |
| community_goals_goal_id_fkey                   | public       | community_goals           | goal_id           | public                  | goals                | id                |
| community_invitations_from_user_id_fkey        | public       | community_invitations     | from_user_id      | public                  | users                | id                |
| community_invitations_community_id_fkey        | public       | community_invitations     | community_id      | public                  | communities          | id                |
| community_invitations_to_user_id_fkey          | public       | community_invitations     | to_user_id        | public                  | users                | id                |
| community_join_requests_reviewed_by_fkey       | public       | community_join_requests   | reviewed_by       | public                  | users                | id                |
| community_join_requests_community_id_fkey      | public       | community_join_requests   | community_id      | public                  | communities          | id                |
| community_join_requests_user_id_fkey           | public       | community_join_requests   | user_id           | public                  | users                | id                |
| community_media_user_id_fkey                   | public       | community_media           | user_id           | public                  | users                | id                |
| community_media_community_id_fkey              | public       | community_media           | community_id      | public                  | communities          | id                |
| community_members_user_id_fkey                 | public       | community_members         | user_id           | public                  | users                | id                |
| community_members_community_id_fkey            | public       | community_members         | community_id      | public                  | communities          | id                |
| community_messages_channel_id_fkey             | public       | community_messages        | channel_id        | public                  | community_channels   | id                |
| community_messages_user_id_fkey                | public       | community_messages        | user_id           | public                  | users                | id                |
| community_photos_community_id_fkey             | public       | community_photos          | community_id      | public                  | communities          | id                |
| community_photos_user_id_fkey                  | public       | community_photos          | user_id           | public                  | users                | id                |
| community_settings_community_id_fkey           | public       | community_settings        | community_id      | public                  | communities          | id                |
| conversation_participants_user_id_fkey         | public       | conversation_participants | user_id           | public                  | users                | id                |
| conversation_participants_conversation_id_fkey | public       | conversation_participants | conversation_id   | public                  | conversations        | id                |
| conversations_participant_two_fkey             | public       | conversations             | participant_two   | public                  | users                | id                |
| conversations_created_by_fkey                  | public       | conversations             | created_by        | public                  | users                | id                |
| conversations_participant_one_fkey             | public       | conversations             | participant_one   | public                  | users                | id                |
| course_enrollments_course_id_fkey              | public       | course_enrollments        | course_id         | public                  | courses              | id                |
| course_enrollments_user_id_fkey                | public       | course_enrollments        | user_id           | public                  | users                | id                |
| course_modules_course_id_fkey                  | public       | course_modules            | course_id         | public                  | courses              | id                |
| courses_instructor_id_fkey                     | public       | courses                   | instructor_id     | public                  | users                | id                |
| dismissed_suggestions_user_id_fkey             | public       | dismissed_suggestions     | user_id           | public                  | users                | id                |
| dismissed_suggestions_dismissed_user_id_fkey   | public       | dismissed_suggestions     | dismissed_user_id | public                  | users                | id                |
| investment_portfolios_user_id_fkey             | public       | investment_portfolios     | user_id           | public                  | users                | id                |
| learning_path_courses_learning_path_id_fkey    | public       | learning_path_courses     | learning_path_id  | public                  | learning_paths       | id                |
| learning_path_courses_course_id_fkey           | public       | learning_path_courses     | course_id         | public                  | courses              | id                |
| lesson_progress_lesson_id_fkey                 | public       | lesson_progress           | lesson_id         | public                  | lessons              | id                |
| lesson_progress_user_id_fkey                   | public       | lesson_progress           | user_id           | public                  | users                | id                |
| lessons_course_id_fkey                         | public       | lessons                   | course_id         | public                  | courses              | id                |
| lessons_module_id_fkey                         | public       | lessons                   | module_id         | public                  | course_modules       | id                |
| message_reads_user_id_fkey                     | public       | message_reads             | user_id           | public                  | users                | id                |
| message_reads_conversation_id_fkey             | public       | message_reads             | conversation_id   | public                  | conversations        | id                |
| messages_conversation_id_fkey                  | public       | messages                  | conversation_id   | public                  | conversations        | id                |
| messages_chat_id_fkey                          | public       | messages                  | chat_id           | public                  | chats                | id                |
| messages_receiver_id_fkey                      | public       | messages                  | receiver_id       | public                  | users                | id                |
| messages_sender_id_fkey                        | public       | messages                  | sender_id         | public                  | users                | id                |
| news_author_id_fkey                            | public       | news                      | author_id         | public                  | users                | id                |
| notifications_post_id_fkey                     | public       | notifications             | post_id           | public                  | posts                | id                |
| notifications_actor_id_fkey                    | public       | notifications             | actor_id          | public                  | users                | id                |
| notifications_user_id_fkey                     | public       | notifications             | user_id           | public                  | users                | id                |
| notifications_from_user_id_fkey                | public       | notifications             | from_user_id      | public                  | users                | id                |
| notifications_community_id_fkey                | public       | notifications             | community_id      | public                  | communities          | id                |
| post_comments_parent_id_fkey                   | public       | post_comments             | parent_id         | public                  | post_comments        | id                |
| post_comments_user_id_fkey                     | public       | post_comments             | user_id           | public                  | users                | id                |
| post_comments_post_id_fkey                     | public       | post_comments             | post_id           | public                  | posts                | id                |
| post_likes_post_id_fkey                        | public       | post_likes                | post_id           | public                  | posts                | id                |
| post_likes_user_id_fkey                        | public       | post_likes                | user_id           | public                  | users                | id                |
| post_saves_user_id_fkey                        | public       | post_saves                | user_id           | public                  | users                | id                |
| post_saves_post_id_fkey                        | public       | post_saves                | post_id           | public                  | posts                | id                |
| post_shares_post_id_fkey                       | public       | post_shares               | post_id           | public                  | posts                | id                |
| post_shares_user_id_fkey                       | public       | post_shares               | user_id           | public                  | users                | id                |
| posts_community_id_fkey                        | public       | posts                     | community_id      | public                  | communities          | id                |
| posts_user_id_fkey                             | public       | posts                     | user_id           | public                  | users                | id                |
| posts_pinned_by_fkey                           | public       | posts                     | pinned_by         | public                  | users                | id                |
| promotion_claims_promotion_id_fkey             | public       | promotion_claims          | promotion_id      | public                  | promotions           | id                |
| promotion_claims_user_id_fkey                  | public       | promotion_claims          | user_id           | public                  | users                | id                |
| promotion_views_promotion_id_fkey              | public       | promotion_views           | promotion_id      | public                  | promotions           | id                |
| promotion_views_user_id_fkey                   | public       | promotion_views           | user_id           | public                  | users                | id                |
| reports_reporter_fkey                          | public       | reports                   | reporter          | public                  | users                | id                |
| reports_post_id_fkey                           | public       | reports                   | post_id           | public                  | posts                | id                |
| saved_posts_user_id_fkey                       | public       | saved_posts               | user_id           | public                  | users                | id                |
| saved_posts_post_id_fkey                       | public       | saved_posts               | post_id           | public                  | posts                | id                |
| simulated_investments_portfolio_id_fkey        | public       | simulated_investments     | portfolio_id      | public                  | simulated_portfolios | id                |
| simulated_portfolios_user_id_fkey              | public       | simulated_portfolios      | user_id           | public                  | users                | id                |
| user_activity_user_id_fkey                     | public       | user_activity             | user_id           | public                  | users                | id                |
| user_badges_user_id_fkey                       | public       | user_badges               | user_id           | public                  | users                | id                |
| user_badges_badge_id_fkey                      | public       | user_badges               | badge_id          | public                  | badges               | id                |
| user_blocks_blocked_user_id_fkey               | public       | user_blocks               | blocked_user_id   | public                  | users                | id                |
| user_blocks_user_id_fkey                       | public       | user_blocks               | user_id           | public                  | users                | id                |
| user_budgets_user_id_fkey                      | public       | user_budgets              | user_id           | public                  | users                | id                |
| user_communities_user_id_fkey                  | public       | user_communities          | user_id           | public                  | users                | id                |
| user_communities_community_id_fkey             | public       | user_communities          | community_id      | public                  | communities          | id                |
| user_connections_to_user_id_fkey               | public       | user_connections          | to_user_id        | public                  | users                | id                |
| user_connections_from_user_id_fkey             | public       | user_connections          | from_user_id      | public                  | users                | id                |
| user_course_progress_lesson_id_fkey            | public       | user_course_progress      | lesson_id         | public                  | lessons              | id                |
| user_course_progress_user_id_fkey              | public       | user_course_progress      | user_id           | public                  | users                | id                |
| user_course_progress_course_id_fkey            | public       | user_course_progress      | course_id         | public                  | courses              | id                |


Listar índices (incluye unicidad)
| schema | table_name                | index_name                                            | is_unique | is_primary | definition                                                                                                                                                                |
| ------ | ------------------------- | ----------------------------------------------------- | --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth   | audit_log_entries         | audit_logs_instance_id_idx                            | false     | false      | CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id)                                                                               |
| auth   | audit_log_entries         | audit_log_entries_pkey                                | true      | true       | CREATE UNIQUE INDEX audit_log_entries_pkey ON auth.audit_log_entries USING btree (id)                                                                                     |
| auth   | flow_state                | flow_state_created_at_idx                             | false     | false      | CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC)                                                                                   |
| auth   | flow_state                | idx_user_id_auth_method                               | false     | false      | CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method)                                                                      |
| auth   | flow_state                | idx_auth_code                                         | false     | false      | CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code)                                                                                                     |
| auth   | flow_state                | flow_state_pkey                                       | true      | true       | CREATE UNIQUE INDEX flow_state_pkey ON auth.flow_state USING btree (id)                                                                                                   |
| auth   | identities                | identities_provider_id_provider_unique                | true      | false      | CREATE UNIQUE INDEX identities_provider_id_provider_unique ON auth.identities USING btree (provider_id, provider)                                                         |
| auth   | identities                | identities_user_id_idx                                | false     | false      | CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id)                                                                                              |
| auth   | identities                | identities_email_idx                                  | false     | false      | CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops)                                                                                 |
| auth   | identities                | identities_pkey                                       | true      | true       | CREATE UNIQUE INDEX identities_pkey ON auth.identities USING btree (id)                                                                                                   |
| auth   | instances                 | instances_pkey                                        | true      | true       | CREATE UNIQUE INDEX instances_pkey ON auth.instances USING btree (id)                                                                                                     |
| auth   | mfa_amr_claims            | mfa_amr_claims_session_id_authentication_method_pkey  | true      | false      | CREATE UNIQUE INDEX mfa_amr_claims_session_id_authentication_method_pkey ON auth.mfa_amr_claims USING btree (session_id, authentication_method)                           |
| auth   | mfa_amr_claims            | amr_id_pk                                             | true      | true       | CREATE UNIQUE INDEX amr_id_pk ON auth.mfa_amr_claims USING btree (id)                                                                                                     |
| auth   | mfa_challenges            | mfa_challenges_pkey                                   | true      | true       | CREATE UNIQUE INDEX mfa_challenges_pkey ON auth.mfa_challenges USING btree (id)                                                                                           |
| auth   | mfa_challenges            | mfa_challenge_created_at_idx                          | false     | false      | CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC)                                                                            |
| auth   | mfa_factors               | mfa_factors_user_friendly_name_unique                 | true      | false      | CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text)      |
| auth   | mfa_factors               | mfa_factors_pkey                                      | true      | true       | CREATE UNIQUE INDEX mfa_factors_pkey ON auth.mfa_factors USING btree (id)                                                                                                 |
| auth   | mfa_factors               | mfa_factors_user_id_idx                               | false     | false      | CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id)                                                                                            |
| auth   | mfa_factors               | factor_id_created_at_idx                              | false     | false      | CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at)                                                                               |
| auth   | mfa_factors               | mfa_factors_last_challenged_at_key                    | true      | false      | CREATE UNIQUE INDEX mfa_factors_last_challenged_at_key ON auth.mfa_factors USING btree (last_challenged_at)                                                               |
| auth   | mfa_factors               | unique_phone_factor_per_user                          | true      | false      | CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone)                                                                         |
| auth   | oauth_clients             | oauth_clients_client_id_key                           | true      | false      | CREATE UNIQUE INDEX oauth_clients_client_id_key ON auth.oauth_clients USING btree (client_id)                                                                             |
| auth   | oauth_clients             | oauth_clients_pkey                                    | true      | true       | CREATE UNIQUE INDEX oauth_clients_pkey ON auth.oauth_clients USING btree (id)                                                                                             |
| auth   | oauth_clients             | oauth_clients_client_id_idx                           | false     | false      | CREATE INDEX oauth_clients_client_id_idx ON auth.oauth_clients USING btree (client_id)                                                                                    |
| auth   | oauth_clients             | oauth_clients_deleted_at_idx                          | false     | false      | CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at)                                                                                  |
| auth   | one_time_tokens           | one_time_tokens_user_id_token_type_key                | true      | false      | CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type)                                                      |
| auth   | one_time_tokens           | one_time_tokens_token_hash_hash_idx                   | false     | false      | CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash)                                                                          |
| auth   | one_time_tokens           | one_time_tokens_pkey                                  | true      | true       | CREATE UNIQUE INDEX one_time_tokens_pkey ON auth.one_time_tokens USING btree (id)                                                                                         |
| auth   | one_time_tokens           | one_time_tokens_relates_to_hash_idx                   | false     | false      | CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to)                                                                          |
| auth   | refresh_tokens            | refresh_tokens_updated_at_idx                         | false     | false      | CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC)                                                                           |
| auth   | refresh_tokens            | refresh_tokens_parent_idx                             | false     | false      | CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent)                                                                                        |
| auth   | refresh_tokens            | refresh_tokens_instance_id_user_id_idx                | false     | false      | CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id)                                                             |
| auth   | refresh_tokens            | refresh_tokens_session_id_revoked_idx                 | false     | false      | CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked)                                                               |
| auth   | refresh_tokens            | refresh_tokens_pkey                                   | true      | true       | CREATE UNIQUE INDEX refresh_tokens_pkey ON auth.refresh_tokens USING btree (id)                                                                                           |
| auth   | refresh_tokens            | refresh_tokens_token_unique                           | true      | false      | CREATE UNIQUE INDEX refresh_tokens_token_unique ON auth.refresh_tokens USING btree (token)                                                                                |
| auth   | refresh_tokens            | refresh_tokens_instance_id_idx                        | false     | false      | CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id)                                                                              |
| auth   | saml_providers            | saml_providers_pkey                                   | true      | true       | CREATE UNIQUE INDEX saml_providers_pkey ON auth.saml_providers USING btree (id)                                                                                           |
| auth   | saml_providers            | saml_providers_entity_id_key                          | true      | false      | CREATE UNIQUE INDEX saml_providers_entity_id_key ON auth.saml_providers USING btree (entity_id)                                                                           |
| auth   | saml_providers            | saml_providers_sso_provider_id_idx                    | false     | false      | CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id)                                                                      |
| auth   | saml_relay_states         | saml_relay_states_created_at_idx                      | false     | false      | CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC)                                                                     |
| auth   | saml_relay_states         | saml_relay_states_for_email_idx                       | false     | false      | CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email)                                                                            |
| auth   | saml_relay_states         | saml_relay_states_sso_provider_id_idx                 | false     | false      | CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id)                                                                |
| auth   | saml_relay_states         | saml_relay_states_pkey                                | true      | true       | CREATE UNIQUE INDEX saml_relay_states_pkey ON auth.saml_relay_states USING btree (id)                                                                                     |
| auth   | schema_migrations         | schema_migrations_pkey                                | true      | true       | CREATE UNIQUE INDEX schema_migrations_pkey ON auth.schema_migrations USING btree (version)                                                                                |
| auth   | sessions                  | sessions_not_after_idx                                | false     | false      | CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC)                                                                                         |
| auth   | sessions                  | sessions_pkey                                         | true      | true       | CREATE UNIQUE INDEX sessions_pkey ON auth.sessions USING btree (id)                                                                                                       |
| auth   | sessions                  | sessions_user_id_idx                                  | false     | false      | CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id)                                                                                                  |
| auth   | sessions                  | user_id_created_at_idx                                | false     | false      | CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at)                                                                                    |
| auth   | sso_domains               | sso_domains_sso_provider_id_idx                       | false     | false      | CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id)                                                                            |
| auth   | sso_domains               | sso_domains_domain_idx                                | true      | false      | CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain))                                                                                |
| auth   | sso_domains               | sso_domains_pkey                                      | true      | true       | CREATE UNIQUE INDEX sso_domains_pkey ON auth.sso_domains USING btree (id)                                                                                                 |
| auth   | sso_providers             | sso_providers_resource_id_pattern_idx                 | false     | false      | CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops)                                                       |
| auth   | sso_providers             | sso_providers_resource_id_idx                         | true      | false      | CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id))                                                                  |
| auth   | sso_providers             | sso_providers_pkey                                    | true      | true       | CREATE UNIQUE INDEX sso_providers_pkey ON auth.sso_providers USING btree (id)                                                                                             |
| auth   | users                     | reauthentication_token_idx                            | true      | false      | CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text)             |
| auth   | users                     | users_phone_key                                       | true      | false      | CREATE UNIQUE INDEX users_phone_key ON auth.users USING btree (phone)                                                                                                     |
| auth   | users                     | email_change_token_new_idx                            | true      | false      | CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text)             |
| auth   | users                     | email_change_token_current_idx                        | true      | false      | CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text) |
| auth   | users                     | users_pkey                                            | true      | true       | CREATE UNIQUE INDEX users_pkey ON auth.users USING btree (id)                                                                                                             |
| auth   | users                     | users_email_partial_key                               | true      | false      | CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false)                                                                 |
| auth   | users                     | confirmation_token_idx                                | true      | false      | CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text)                         |
| auth   | users                     | recovery_token_idx                                    | true      | false      | CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text)                                     |
| auth   | users                     | users_instance_id_email_idx                           | false     | false      | CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text))                                                                    |
| auth   | users                     | users_instance_id_idx                                 | false     | false      | CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id)                                                                                                |
| auth   | users                     | users_is_anonymous_idx                                | false     | false      | CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous)                                                                                              |
| public | badges                    | badges_pkey                                           | true      | true       | CREATE UNIQUE INDEX badges_pkey ON public.badges USING btree (id)                                                                                                         |
| public | badges                    | badges_codigo_key                                     | true      | false      | CREATE UNIQUE INDEX badges_codigo_key ON public.badges USING btree (codigo)                                                                                               |
| public | channel_messages          | channel_messages_pkey                                 | true      | true       | CREATE UNIQUE INDEX channel_messages_pkey ON public.channel_messages USING btree (id)                                                                                     |
| public | chat_messages             | idx_chat_messages_chat_id                             | false     | false      | CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages USING btree (chat_id)                                                                                      |
| public | chat_messages             | chat_messages_pkey                                    | true      | true       | CREATE UNIQUE INDEX chat_messages_pkey ON public.chat_messages USING btree (id)                                                                                           |
| public | chat_messages             | idx_chat_messages_sender                              | false     | false      | CREATE INDEX idx_chat_messages_sender ON public.chat_messages USING btree (sender_id)                                                                                     |
| public | chat_messages             | idx_chat_messages_created_at                          | false     | false      | CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at DESC)                                                                           |
| public | chat_participants         | chat_participants_chat_id_user_id_key                 | true      | false      | CREATE UNIQUE INDEX chat_participants_chat_id_user_id_key ON public.chat_participants USING btree (chat_id, user_id)                                                      |
| public | chat_participants         | chat_participants_pkey                                | true      | true       | CREATE UNIQUE INDEX chat_participants_pkey ON public.chat_participants USING btree (id)                                                                                   |
| public | chats                     | chats_pkey                                            | true      | true       | CREATE UNIQUE INDEX chats_pkey ON public.chats USING btree (id)                                                                                                           |
| public | chats                     | idx_chats_pair_unique                                 | true      | false      | CREATE UNIQUE INDEX idx_chats_pair_unique ON public.chats USING btree (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))                                           |
| public | comments                  | comments_pkey                                         | true      | true       | CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id)                                                                                                     |
| public | comments                  | idx_comments_user                                     | false     | false      | CREATE INDEX idx_comments_user ON public.comments USING btree (user_id)                                                                                                   |
| public | comments                  | idx_comments_post                                     | false     | false      | CREATE INDEX idx_comments_post ON public.comments USING btree (post_id)                                                                                                   |
| public | communities               | communities_pkey                                      | true      | true       | CREATE UNIQUE INDEX communities_pkey ON public.communities USING btree (id)                                                                                               |
| public | community_channels        | community_channels_pkey                               | true      | true       | CREATE UNIQUE INDEX community_channels_pkey ON public.community_channels USING btree (id)                                                                                 |
| public | community_chats           | community_chats_pkey                                  | true      | true       | CREATE UNIQUE INDEX community_chats_pkey ON public.community_chats USING btree (id)                                                                                       |
| public | community_files           | community_files_pkey                                  | true      | true       | CREATE UNIQUE INDEX community_files_pkey ON public.community_files USING btree (id)                                                                                       |
| public | community_goals           | community_goals_pkey                                  | true      | true       | CREATE UNIQUE INDEX community_goals_pkey ON public.community_goals USING btree (id)                                                                                       |
| public | community_goals           | community_goals_community_id_goal_id_key              | true      | false      | CREATE UNIQUE INDEX community_goals_community_id_goal_id_key ON public.community_goals USING btree (community_id, goal_id)                                                |
| public | community_invitations     | community_invitations_pkey                            | true      | true       | CREATE UNIQUE INDEX community_invitations_pkey ON public.community_invitations USING btree (id)                                                                           |
| public | community_join_requests   | community_join_requests_community_id_user_id_key      | true      | false      | CREATE UNIQUE INDEX community_join_requests_community_id_user_id_key ON public.community_join_requests USING btree (community_id, user_id)                                |
| public | community_join_requests   | community_join_requests_pkey                          | true      | true       | CREATE UNIQUE INDEX community_join_requests_pkey ON public.community_join_requests USING btree (id)                                                                       |
| public | community_join_requests   | idx_community_join_requests_community                 | false     | false      | CREATE INDEX idx_community_join_requests_community ON public.community_join_requests USING btree (community_id, status)                                                   |
| public | community_join_requests   | idx_community_join_requests_user                      | false     | false      | CREATE INDEX idx_community_join_requests_user ON public.community_join_requests USING btree (user_id)                                                                     |
| public | community_media           | community_media_pkey                                  | true      | true       | CREATE UNIQUE INDEX community_media_pkey ON public.community_media USING btree (id)                                                                                       |
| public | community_members         | community_members_community_id_user_id_key            | true      | false      | CREATE UNIQUE INDEX community_members_community_id_user_id_key ON public.community_members USING btree (community_id, user_id)                                            |
| public | community_members         | community_members_pkey                                | true      | true       | CREATE UNIQUE INDEX community_members_pkey ON public.community_members USING btree (id)                                                                                   |
| public | community_messages        | community_messages_pkey                               | true      | true       | CREATE UNIQUE INDEX community_messages_pkey ON public.community_messages USING btree (id)                                                                                 |
| public | community_photos          | community_photos_pkey                                 | true      | true       | CREATE UNIQUE INDEX community_photos_pkey ON public.community_photos USING btree (id)                                                                                     |
| public | community_settings        | idx_community_settings_community_id                   | false     | false      | CREATE INDEX idx_community_settings_community_id ON public.community_settings USING btree (community_id)                                                                  |
| public | community_settings        | community_settings_pkey                               | true      | true       | CREATE UNIQUE INDEX community_settings_pkey ON public.community_settings USING btree (community_id)                                                                       |
| public | conversation_participants | conversation_participants_pkey                        | true      | true       | CREATE UNIQUE INDEX conversation_participants_pkey ON public.conversation_participants USING btree (id)                                                                   |
| public | conversation_participants | idx_conversation_participants_user                    | false     | false      | CREATE INDEX idx_conversation_participants_user ON public.conversation_participants USING btree (user_id)                                                                 |
| public | conversation_participants | conversation_participants_conversation_id_user_id_key | true      | false      | CREATE UNIQUE INDEX conversation_participants_conversation_id_user_id_key ON public.conversation_participants USING btree (conversation_id, user_id)                      |

Listar constraints (checks, unique, primary keys)
| table_schema | table_name              | constraint_name                                      | constraint_type | constraint_definition                                                                                     |
| ------------ | ----------------------- | ---------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------- |
| auth         | audit_log_entries       | audit_log_entries_pkey                               | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| auth         | flow_state              | flow_state_pkey                                      | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| auth         | identities              | identities_pkey                                      | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| auth         | identities              | identities_provider_id_provider_unique               | UNIQUE          | UNIQUE (provider_id, provider)                                                                            |
| auth         | identities              | identities_user_id_fkey                              | FOREIGN KEY     | FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE                                         |
| auth         | instances               | instances_pkey                                       | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| auth         | mfa_amr_claims          | mfa_amr_claims_session_id_authentication_method_pkey | UNIQUE          | UNIQUE (session_id, authentication_method)                                                                |
| auth         | mfa_amr_claims          | mfa_amr_claims_session_id_fkey                       | FOREIGN KEY     | FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE                                   |
| auth         | mfa_amr_claims          | amr_id_pk                                            | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| auth         | mfa_challenges          | mfa_challenges_auth_factor_id_fkey                   | FOREIGN KEY     | FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE                                 |
| auth         | mfa_challenges          | mfa_challenges_pkey                                  | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| auth         | mfa_factors             | mfa_factors_pkey                                     | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| auth         | mfa_factors             | mfa_factors_user_id_fkey                             | FOREIGN KEY     | FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE                                         |
| auth         | mfa_factors             | mfa_factors_last_challenged_at_key                   | UNIQUE          | UNIQUE (last_challenged_at)                                                                               |
| auth         | oauth_clients           | oauth_clients_client_uri_length                      | CHECK           | CHECK ((char_length(client_uri) <= 2048))                                                                 |
| auth         | oauth_clients           | oauth_clients_client_id_key                          | UNIQUE          | UNIQUE (client_id)                                                                                        |
| auth         | oauth_clients           | oauth_clients_logo_uri_length                        | CHECK           | CHECK ((char_length(logo_uri) <= 2048))                                                                   |
| auth         | oauth_clients           | oauth_clients_pkey                                   | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| auth         | oauth_clients           | oauth_clients_client_name_length                     | CHECK           | CHECK ((char_length(client_name) <= 1024))                                                                |
| auth         | one_time_tokens         | one_time_tokens_pkey                                 | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| auth         | one_time_tokens         | one_time_tokens_token_hash_check                     | CHECK           | CHECK ((char_length(token_hash) > 0))                                                                     |
| auth         | one_time_tokens         | one_time_tokens_user_id_fkey                         | FOREIGN KEY     | FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE                                         |
| auth         | refresh_tokens          | refresh_tokens_pkey                                  | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| auth         | refresh_tokens          | refresh_tokens_session_id_fkey                       | FOREIGN KEY     | FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE                                   |
| auth         | refresh_tokens          | refresh_tokens_token_unique                          | UNIQUE          | UNIQUE (token)                                                                                            |
| auth         | saml_providers          | saml_providers_pkey                                  | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| auth         | saml_providers          | saml_providers_entity_id_key                         | UNIQUE          | UNIQUE (entity_id)                                                                                        |
| auth         | saml_providers          | saml_providers_sso_provider_id_fkey                  | FOREIGN KEY     | FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE                         |
| auth         | saml_providers          | entity_id not empty                                  | CHECK           | CHECK ((char_length(entity_id) > 0))                                                                      |
| auth         | saml_providers          | metadata_url not empty                               | CHECK           | CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0)))                                  |
| auth         | saml_providers          | metadata_xml not empty                               | CHECK           | CHECK ((char_length(metadata_xml) > 0))                                                                   |
| auth         | saml_relay_states       | saml_relay_states_pkey                               | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| auth         | saml_relay_states       | request_id not empty                                 | CHECK           | CHECK ((char_length(request_id) > 0))                                                                     |
| auth         | saml_relay_states       | saml_relay_states_sso_provider_id_fkey               | FOREIGN KEY     | FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE                         |
| auth         | saml_relay_states       | saml_relay_states_flow_state_id_fkey                 | FOREIGN KEY     | FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE                              |
| auth         | sessions                | sessions_user_id_fkey                                | FOREIGN KEY     | FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE                                         |
| auth         | sessions                | sessions_pkey                                        | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| auth         | sso_domains             | sso_domains_sso_provider_id_fkey                     | FOREIGN KEY     | FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE                         |
| auth         | sso_domains             | sso_domains_pkey                                     | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| auth         | sso_domains             | domain not empty                                     | CHECK           | CHECK ((char_length(domain) > 0))                                                                         |
| auth         | sso_providers           | sso_providers_pkey                                   | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| auth         | sso_providers           | resource_id not empty                                | CHECK           | CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))                                    |
| auth         | users                   | users_pkey                                           | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| auth         | users                   | users_email_change_confirm_status_check              | CHECK           | CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))                       |
| auth         | users                   | users_phone_key                                      | UNIQUE          | UNIQUE (phone)                                                                                            |
| auth         | users                   | users_pkey                                           | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| public       | badges                  | badges_codigo_key                                    | UNIQUE          | UNIQUE (codigo)                                                                                           |
| public       | badges                  | badges_pkey                                          | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| public       | channel_messages        | channel_messages_user_id_fkey                        | FOREIGN KEY     | FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE                                              |
| public       | channel_messages        | channel_messages_channel_id_fkey                     | FOREIGN KEY     | FOREIGN KEY (channel_id) REFERENCES community_channels(id) ON DELETE CASCADE                              |
| public       | channel_messages        | channel_messages_pkey                                | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| public       | channel_messages        | channel_messages_message_type_check                  | CHECK           | CHECK ((message_type = ANY (ARRAY['text'::text, 'image'::text, 'file'::text])))                           |
| public       | chat_messages           | chat_messages_chat_id_fkey                           | FOREIGN KEY     | FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE                                              |
| public       | chat_messages           | chat_messages_pkey                                   | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| public       | chat_messages           | chat_messages_sender_id_fkey                         | FOREIGN KEY     | FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE                                            |
| public       | chat_participants       | chat_participants_user_id_fkey                       | FOREIGN KEY     | FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE                                              |
| public       | chat_participants       | chat_participants_chat_id_user_id_key                | UNIQUE          | UNIQUE (chat_id, user_id)                                                                                 |
| public       | chat_participants       | chat_participants_pkey                               | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| public       | chat_participants       | chat_participants_chat_id_fkey                       | FOREIGN KEY     | FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE                                              |
| public       | chats                   | chats_community_id_fkey                              | FOREIGN KEY     | FOREIGN KEY (community_id) REFERENCES communities(id)                                                     |
| public       | chats                   | chats_user2_id_fkey                                  | FOREIGN KEY     | FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE                                             |
| public       | chats                   | chats_pkey                                           | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| public       | chats                   | chats_user1_id_fkey                                  | FOREIGN KEY     | FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE                                             |
| public       | comments                | comments_pkey                                        | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| public       | comments                | comments_parent_id_fkey                              | FOREIGN KEY     | FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE                                         |
| public       | comments                | comments_user_id_fkey                                | FOREIGN KEY     | FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE                                              |
| public       | comments                | comments_post_id_fkey                                | FOREIGN KEY     | FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE                                              |
| public       | communities             | communities_created_by_fkey                          | FOREIGN KEY     | FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL                                          |
| public       | communities             | communities_pkey                                     | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| public       | communities             | communities_type_check                               | CHECK           | CHECK (((type)::text = ANY ((ARRAY['public'::character varying, 'private'::character varying])::text[]))) |
| public       | community_channels      | community_channels_community_id_fkey                 | FOREIGN KEY     | FOREIGN KEY (community_id) REFERENCES communities(id)                                                     |
| public       | community_channels      | community_channels_pkey                              | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| public       | community_chats         | community_chats_pkey                                 | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| public       | community_chats         | community_chats_created_by_fkey                      | FOREIGN KEY     | FOREIGN KEY (created_by) REFERENCES users(id)                                                             |
| public       | community_chats         | community_chats_community_id_fkey                    | FOREIGN KEY     | FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE                                   |
| public       | community_files         | community_files_community_id_fkey                    | FOREIGN KEY     | FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE                                   |
| public       | community_files         | community_files_user_id_fkey                         | FOREIGN KEY     | FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE                                              |
| public       | community_files         | community_files_pkey                                 | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| public       | community_goals         | community_goals_community_id_fkey                    | FOREIGN KEY     | FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE                                   |
| public       | community_goals         | community_goals_goal_id_fkey                         | FOREIGN KEY     | FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE                                              |
| public       | community_goals         | community_goals_pkey                                 | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| public       | community_goals         | community_goals_community_id_goal_id_key             | UNIQUE          | UNIQUE (community_id, goal_id)                                                                            |
| public       | community_invitations   | community_invitations_to_user_id_fkey                | FOREIGN KEY     | FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE                                           |
| public       | community_invitations   | community_invitations_status_check                   | CHECK           | CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])))                       |
| public       | community_invitations   | community_invitations_community_id_fkey              | FOREIGN KEY     | FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE                                   |
| public       | community_invitations   | community_invitations_pkey                           | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| public       | community_invitations   | community_invitations_from_user_id_fkey              | FOREIGN KEY     | FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE                                         |
| public       | community_join_requests | community_join_requests_pkey                         | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| public       | community_join_requests | community_join_requests_community_id_user_id_key     | UNIQUE          | UNIQUE (community_id, user_id)                                                                            |
| public       | community_join_requests | community_join_requests_reviewed_by_fkey             | FOREIGN KEY     | FOREIGN KEY (reviewed_by) REFERENCES users(id)                                                            |
| public       | community_join_requests | community_join_requests_status_check                 | CHECK           | CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))                       |
| public       | community_join_requests | community_join_requests_community_id_fkey            | FOREIGN KEY     | FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE                                   |
| public       | community_join_requests | community_join_requests_user_id_fkey                 | FOREIGN KEY     | FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE                                              |
| public       | community_media         | community_media_pkey                                 | PRIMARY KEY     | PRIMARY KEY (id)                                                                                          |
| public       | community_media         | community_media_media_type_check                     | CHECK           | CHECK ((media_type = ANY (ARRAY['image'::text, 'file'::text, 'video'::text])))                            |
| public       | community_media         | community_media_community_id_fkey                    | FOREIGN KEY     | FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE                                   |
| public       | community_media         | community_media_user_id_fkey                         | FOREIGN KEY     | FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE                                              |
| public       | community_members       | community_members_user_id_fkey                       | FOREIGN KEY     | FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE                                              |
| public       | community_members       | community_members_role_check                         | CHECK           | CHECK ((role = ANY (ARRAY['member'::text, 'moderator'::text, 'admin'::text])))                            |
| public       | community_members       | community_members_community_id_user_id_key           | UNIQUE          | UNIQUE (community_id, user_id)                                                                            |


Listar columnas por tabla (tipos, nulos, defaults)
| table_schema | table_name        | column_name            | ordinal_position | data_type                   | is_nullable | column_default                                  |
| ------------ | ----------------- | ---------------------- | ---------------- | --------------------------- | ----------- | ----------------------------------------------- |
| auth         | audit_log_entries | instance_id            | 1                | uuid                        | YES         | null                                            |
| auth         | audit_log_entries | id                     | 2                | uuid                        | NO          | null                                            |
| auth         | audit_log_entries | payload                | 3                | json                        | YES         | null                                            |
| auth         | audit_log_entries | created_at             | 4                | timestamp with time zone    | YES         | null                                            |
| auth         | audit_log_entries | ip_address             | 5                | character varying           | NO          | ''::character varying                           |
| auth         | flow_state        | id                     | 1                | uuid                        | NO          | null                                            |
| auth         | flow_state        | user_id                | 2                | uuid                        | YES         | null                                            |
| auth         | flow_state        | auth_code              | 3                | text                        | NO          | null                                            |
| auth         | flow_state        | code_challenge_method  | 4                | USER-DEFINED                | NO          | null                                            |
| auth         | flow_state        | code_challenge         | 5                | text                        | NO          | null                                            |
| auth         | flow_state        | provider_type          | 6                | text                        | NO          | null                                            |
| auth         | flow_state        | provider_access_token  | 7                | text                        | YES         | null                                            |
| auth         | flow_state        | provider_refresh_token | 8                | text                        | YES         | null                                            |
| auth         | flow_state        | created_at             | 9                | timestamp with time zone    | YES         | null                                            |
| auth         | flow_state        | updated_at             | 10               | timestamp with time zone    | YES         | null                                            |
| auth         | flow_state        | authentication_method  | 11               | text                        | NO          | null                                            |
| auth         | flow_state        | auth_code_issued_at    | 12               | timestamp with time zone    | YES         | null                                            |
| auth         | identities        | provider_id            | 1                | text                        | NO          | null                                            |
| auth         | identities        | user_id                | 2                | uuid                        | NO          | null                                            |
| auth         | identities        | identity_data          | 3                | jsonb                       | NO          | null                                            |
| auth         | identities        | provider               | 4                | text                        | NO          | null                                            |
| auth         | identities        | last_sign_in_at        | 5                | timestamp with time zone    | YES         | null                                            |
| auth         | identities        | created_at             | 6                | timestamp with time zone    | YES         | null                                            |
| auth         | identities        | updated_at             | 7                | timestamp with time zone    | YES         | null                                            |
| auth         | identities        | email                  | 8                | text                        | YES         | null                                            |
| auth         | identities        | id                     | 9                | uuid                        | NO          | gen_random_uuid()                               |
| auth         | instances         | id                     | 1                | uuid                        | NO          | null                                            |
| auth         | instances         | uuid                   | 2                | uuid                        | YES         | null                                            |
| auth         | instances         | raw_base_config        | 3                | text                        | YES         | null                                            |
| auth         | instances         | created_at             | 4                | timestamp with time zone    | YES         | null                                            |
| auth         | instances         | updated_at             | 5                | timestamp with time zone    | YES         | null                                            |
| auth         | mfa_amr_claims    | session_id             | 1                | uuid                        | NO          | null                                            |
| auth         | mfa_amr_claims    | created_at             | 2                | timestamp with time zone    | NO          | null                                            |
| auth         | mfa_amr_claims    | updated_at             | 3                | timestamp with time zone    | NO          | null                                            |
| auth         | mfa_amr_claims    | authentication_method  | 4                | text                        | NO          | null                                            |
| auth         | mfa_amr_claims    | id                     | 5                | uuid                        | NO          | null                                            |
| auth         | mfa_challenges    | id                     | 1                | uuid                        | NO          | null                                            |
| auth         | mfa_challenges    | factor_id              | 2                | uuid                        | NO          | null                                            |
| auth         | mfa_challenges    | created_at             | 3                | timestamp with time zone    | NO          | null                                            |
| auth         | mfa_challenges    | verified_at            | 4                | timestamp with time zone    | YES         | null                                            |
| auth         | mfa_challenges    | ip_address             | 5                | inet                        | NO          | null                                            |
| auth         | mfa_challenges    | otp_code               | 6                | text                        | YES         | null                                            |
| auth         | mfa_challenges    | web_authn_session_data | 7                | jsonb                       | YES         | null                                            |
| auth         | mfa_factors       | id                     | 1                | uuid                        | NO          | null                                            |
| auth         | mfa_factors       | user_id                | 2                | uuid                        | NO          | null                                            |
| auth         | mfa_factors       | friendly_name          | 3                | text                        | YES         | null                                            |
| auth         | mfa_factors       | factor_type            | 4                | USER-DEFINED                | NO          | null                                            |
| auth         | mfa_factors       | status                 | 5                | USER-DEFINED                | NO          | null                                            |
| auth         | mfa_factors       | created_at             | 6                | timestamp with time zone    | NO          | null                                            |
| auth         | mfa_factors       | updated_at             | 7                | timestamp with time zone    | NO          | null                                            |
| auth         | mfa_factors       | secret                 | 8                | text                        | YES         | null                                            |
| auth         | mfa_factors       | phone                  | 9                | text                        | YES         | null                                            |
| auth         | mfa_factors       | last_challenged_at     | 10               | timestamp with time zone    | YES         | null                                            |
| auth         | mfa_factors       | web_authn_credential   | 11               | jsonb                       | YES         | null                                            |
| auth         | mfa_factors       | web_authn_aaguid       | 12               | uuid                        | YES         | null                                            |
| auth         | oauth_clients     | id                     | 1                | uuid                        | NO          | null                                            |
| auth         | oauth_clients     | client_id              | 2                | text                        | NO          | null                                            |
| auth         | oauth_clients     | client_secret_hash     | 3                | text                        | NO          | null                                            |
| auth         | oauth_clients     | registration_type      | 4                | USER-DEFINED                | NO          | null                                            |
| auth         | oauth_clients     | redirect_uris          | 5                | text                        | NO          | null                                            |
| auth         | oauth_clients     | grant_types            | 6                | text                        | NO          | null                                            |
| auth         | oauth_clients     | client_name            | 7                | text                        | YES         | null                                            |
| auth         | oauth_clients     | client_uri             | 8                | text                        | YES         | null                                            |
| auth         | oauth_clients     | logo_uri               | 9                | text                        | YES         | null                                            |
| auth         | oauth_clients     | created_at             | 10               | timestamp with time zone    | NO          | now()                                           |
| auth         | oauth_clients     | updated_at             | 11               | timestamp with time zone    | NO          | now()                                           |
| auth         | oauth_clients     | deleted_at             | 12               | timestamp with time zone    | YES         | null                                            |
| auth         | one_time_tokens   | id                     | 1                | uuid                        | NO          | null                                            |
| auth         | one_time_tokens   | user_id                | 2                | uuid                        | NO          | null                                            |
| auth         | one_time_tokens   | token_type             | 3                | USER-DEFINED                | NO          | null                                            |
| auth         | one_time_tokens   | token_hash             | 4                | text                        | NO          | null                                            |
| auth         | one_time_tokens   | relates_to             | 5                | text                        | NO          | null                                            |
| auth         | one_time_tokens   | created_at             | 6                | timestamp without time zone | NO          | now()                                           |
| auth         | one_time_tokens   | updated_at             | 7                | timestamp without time zone | NO          | now()                                           |
| auth         | refresh_tokens    | instance_id            | 1                | uuid                        | YES         | null                                            |
| auth         | refresh_tokens    | id                     | 2                | bigint                      | NO          | nextval('auth.refresh_tokens_id_seq'::regclass) |
| auth         | refresh_tokens    | token                  | 3                | character varying           | YES         | null                                            |
| auth         | refresh_tokens    | user_id                | 4                | character varying           | YES         | null                                            |
| auth         | refresh_tokens    | revoked                | 5                | boolean                     | YES         | null                                            |
| auth         | refresh_tokens    | created_at             | 6                | timestamp with time zone    | YES         | null                                            |
| auth         | refresh_tokens    | updated_at             | 7                | timestamp with time zone    | YES         | null                                            |
| auth         | refresh_tokens    | parent                 | 8                | character varying           | YES         | null                                            |
| auth         | refresh_tokens    | session_id             | 9                | uuid                        | YES         | null                                            |
| auth         | saml_providers    | id                     | 1                | uuid                        | NO          | null                                            |
| auth         | saml_providers    | sso_provider_id        | 2                | uuid                        | NO          | null                                            |
| auth         | saml_providers    | entity_id              | 3                | text                        | NO          | null                                            |
| auth         | saml_providers    | metadata_xml           | 4                | text                        | NO          | null                                            |
| auth         | saml_providers    | metadata_url           | 5                | text                        | YES         | null                                            |
| auth         | saml_providers    | attribute_mapping      | 6                | jsonb                       | YES         | null                                            |
| auth         | saml_providers    | created_at             | 7                | timestamp with time zone    | YES         | null                                            |
| auth         | saml_providers    | updated_at             | 8                | timestamp with time zone    | YES         | null                                            |
| auth         | saml_providers    | name_id_format         | 9                | text                        | YES         | null                                            |
| auth         | saml_relay_states | id                     | 1                | uuid                        | NO          | null                                            |
| auth         | saml_relay_states | sso_provider_id        | 2                | uuid                        | NO          | null                                            |
| auth         | saml_relay_states | request_id             | 3                | text                        | NO          | null                                            |
| auth         | saml_relay_states | for_email              | 4                | text                        | YES         | null                                            |
| auth         | saml_relay_states | redirect_to            | 5                | text                        | YES         | null                                            |
| auth         | saml_relay_states | created_at             | 7                | timestamp with time zone    | YES         | null                                            |
| auth         | saml_relay_states | updated_at             | 8                | timestamp with time zone    | YES         | null                                            |
| auth         | saml_relay_states | flow_state_id          | 9                | uuid                        | YES         | null                                            |


Listar funciones SECURITY DEFINER (útil por seguridad)
| schema    | function_name               | definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| graphql   | get_schema_version          | CREATE OR REPLACE FUNCTION graphql.get_schema_version()
 RETURNS integer
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
    select last_value from graphql.seq_schema_version;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| graphql   | increment_schema_version    | CREATE OR REPLACE FUNCTION graphql.increment_schema_version()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
    perform pg_catalog.nextval('graphql.seq_schema_version');
end;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| pgbouncer | get_auth                    | CREATE OR REPLACE FUNCTION pgbouncer.get_auth(p_usename text)
 RETURNS TABLE(username text, password text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| public    | can_manage_community_member | CREATE OR REPLACE FUNCTION public.can_manage_community_member(p_community_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_communities
        WHERE community_id = p_community_id
        AND user_id = p_user_id
        AND role IN ('owner', 'admin')
        AND status = 'active'
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| public    | get_recommended_communities | CREATE OR REPLACE FUNCTION public.get_recommended_communities(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN '[]'::json;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| public    | get_suggested_people        | CREATE OR REPLACE FUNCTION public.get_suggested_people(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$  
BEGIN  
    RETURN '[]'::json;  
END;  
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| public    | get_user_conversations      | CREATE OR REPLACE FUNCTION public.get_user_conversations(p_user_id uuid)
 RETURNS TABLE(id uuid, type text, last_message text, last_message_at timestamp with time zone, unread_count bigint, other_participant json)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.type,
        c.last_message,
        c.last_message_at,
        COALESCE((
            SELECT COUNT(*) FROM messages m
            WHERE m.conversation_id = c.id
            AND m.sender_id != p_user_id
            AND m.created_at > COALESCE((
                SELECT last_read_at FROM message_reads 
                WHERE user_id = p_user_id AND conversation_id = c.id
            ), '1970-01-01'::timestamptz)
        ), 0) as unread_count,
        CASE 
            WHEN c.participant_one = p_user_id THEN
                (SELECT json_build_object(
                    'id', u.id,
                    'nombre', u.nombre,
                    'avatar_url', u.avatar_url,
                    'is_online', u.is_online
                ) FROM users u WHERE u.id = c.participant_two)
            ELSE
                (SELECT json_build_object(
                    'id', u.id,
                    'nombre', u.nombre,
                    'avatar_url', u.avatar_url,
                    'is_online', u.is_online
                ) FROM users u WHERE u.id = c.participant_one)
        END as other_participant
    FROM conversations c
    WHERE c.participant_one = p_user_id OR c.participant_two = p_user_id
    ORDER BY c.last_message_at DESC;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| public    | get_user_quick_stats        | CREATE OR REPLACE FUNCTION public.get_user_quick_stats(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'notifications_count', COALESCE((
            SELECT COUNT(*) FROM notifications 
            WHERE user_id = p_user_id AND is_read = false
        ), 0),
        'messages_count', COALESCE((
            SELECT COUNT(*) FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE (c.participant_one = p_user_id OR c.participant_two = p_user_id)
            AND m.sender_id != p_user_id
        ), 0),
        'followers_count', COALESCE((
            SELECT COUNT(*) FROM user_follows 
            WHERE following_id = p_user_id
        ), 0),
        'following_count', COALESCE((
            SELECT COUNT(*) FROM user_follows 
            WHERE follower_id = p_user_id
        ), 0),
        'posts_count', COALESCE((
            SELECT COUNT(*) FROM posts 
            WHERE user_id = p_user_id
        ), 0)
    ) INTO result;
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'notifications_count', 0,
        'messages_count', 0,
        'followers_count', 0,
        'following_count', 0,
        'posts_count', 0,
        'error', SQLERRM
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| public    | handle_new_user             | CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$  
BEGIN  
  INSERT INTO public.users (id, email, fecha_registro, nombre, username)  
  VALUES (  
    new.id,   
    new.email,   
    new.created_at,  
    COALESCE(new.raw_user_meta_data->>'nombre', 'Usuario'),  
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substring(new.id::text, 1, 8))  
  );  
  RETURN new;  
END;  
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| public    | mark_messages_as_read       | CREATE OR REPLACE FUNCTION public.mark_messages_as_read(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Marcar todos los mensajes como leídos para el usuario
    INSERT INTO message_reads (conversation_id, user_id, last_read_at)
    SELECT DISTINCT m.conversation_id, p_user_id, NOW()
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE (c.participant_one = p_user_id OR c.participant_two = p_user_id)
    ON CONFLICT (conversation_id, user_id) 
    DO UPDATE SET last_read_at = NOW();
    
    RETURN json_build_object(
        'status', 'success',
        'message', 'Messages marked as read'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'status', 'error',
        'message', SQLERRM
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| public    | save_user_goals             | CREATE OR REPLACE FUNCTION public.save_user_goals(p_user_id uuid, p_goal_ids uuid[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Eliminar metas anteriores
  DELETE FROM user_goals WHERE user_id = p_user_id;
  
  -- Insertar nuevas metas con prioridad
  FOR i IN 1..array_length(p_goal_ids, 1) LOOP
    INSERT INTO user_goals (user_id, goal_id, priority)
    VALUES (p_user_id, p_goal_ids[i], i)
    ON CONFLICT (user_id, goal_id) DO UPDATE SET priority = i;
  END LOOP;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| public    | save_user_knowledge_level   | CREATE OR REPLACE FUNCTION public.save_user_knowledge_level(p_user_id uuid, p_level text, p_specific_areas text[] DEFAULT '{}'::text[], p_learning_goals text[] DEFAULT '{}'::text[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO user_knowledge (user_id, level, specific_areas, learning_goals)
  VALUES (p_user_id, p_level, p_specific_areas, p_learning_goals)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    level = EXCLUDED.level,
    specific_areas = EXCLUDED.specific_areas,
    learning_goals = EXCLUDED.learning_goals,
    updated_at = NOW();
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| public    | search_all                  | CREATE OR REPLACE FUNCTION public.search_all(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN json_build_object(
        'users', COALESCE((
            SELECT json_agg(json_build_object(
                'id', id,
                'nombre', nombre,
                'avatar_url', avatar_url
            ))
            FROM users
            WHERE id != p_user_id
            LIMIT 5
        ), '[]'::json),
        'communities', COALESCE((
            SELECT json_agg(json_build_object(
                'id', id,
                'nombre', nombre,
                'descripcion', descripcion
            ))
            FROM communities
            LIMIT 5
        ), '[]'::json),
        'posts', COALESCE((
            SELECT json_agg(json_build_object(
                'id', p.id,
                'titulo', p.titulo,
                'contenido', p.contenido,
                'user_nombre', u.nombre
            ))
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LIMIT 5
        ), '[]'::json)
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'users', '[]'::json,
        'communities', '[]'::json,
        'posts', '[]'::json,
        'error', SQLERRM
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| public    | search_all                  | CREATE OR REPLACE FUNCTION public.search_all(search_term text, current_user_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(result_type text, id uuid, title text, description text, avatar_url text, relevance_score double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$  
BEGIN  
    RETURN QUERY  
    -- Buscar usuarios  
    SELECT   
        'user'::TEXT as result_type,  
        u.id,  
        u.nombre as title,  
        u.bio as description,  
        u.avatar_url,  
        CASE   
            WHEN u.nombre ILIKE '%' || search_term || '%' THEN 1.0  
            WHEN u.username ILIKE '%' || search_term || '%' THEN 0.8  
            WHEN u.bio ILIKE '%' || search_term || '%' THEN 0.6  
            ELSE 0.3  
        END as relevance_score  
    FROM users u  
    WHERE u.nombre ILIKE '%' || search_term || '%'  
       OR u.username ILIKE '%' || search_term || '%'  
       OR u.bio ILIKE '%' || search_term || '%'  
      
    UNION ALL  
      
    -- Buscar posts  
    SELECT   
        'post'::TEXT as result_type,  
        p.id,  
        LEFT(p.contenido, 100) as title,  
        p.contenido as description,  
        u.avatar_url,  
        CASE   
            WHEN p.contenido ILIKE '%' || search_term || '%' THEN 0.9  
            ELSE 0.4  
        END as relevance_score  
    FROM posts p  
    JOIN users u ON p.user_id = u.id  
    WHERE p.contenido ILIKE '%' || search_term || '%'  
      
    UNION ALL  
      
    -- Buscar comunidades  
    SELECT   
        'community'::TEXT as result_type,  
        c.id,  
        c.nombre as title,  
        c.descripcion as description,  
        c.imagen_url as avatar_url,  
        CASE   
            WHEN c.nombre ILIKE '%' || search_term || '%' THEN 1.0  
            WHEN c.descripcion ILIKE '%' || search_term || '%' THEN 0.7  
            ELSE 0.4  
        END as relevance_score  
    FROM communities c  
    WHERE c.nombre ILIKE '%' || search_term || '%'  
       OR c.descripcion ILIKE '%' || search_term || '%'  
      
    ORDER BY relevance_score DESC  
    LIMIT 50;  
END;  
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| public    | update_user_interests       | CREATE OR REPLACE FUNCTION public.update_user_interests(user_id uuid, new_interests text[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$  
BEGIN  
  UPDATE users   
  SET intereses = new_interests   
  WHERE id = user_id;  
    
  IF NOT FOUND THEN  
    INSERT INTO users (id, intereses)   
    VALUES (user_id, new_interests)  
    ON CONFLICT (id) DO UPDATE SET intereses = new_interests;  
  END IF;  
END;  
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| storage   | add_prefixes                | CREATE OR REPLACE FUNCTION storage.add_prefixes(_bucket_id text, _name text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| storage   | delete_leaf_prefixes        | CREATE OR REPLACE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| storage   | delete_prefix               | CREATE OR REPLACE FUNCTION storage.delete_prefix(_bucket_id text, _name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| storage   | lock_top_prefixes           | CREATE OR REPLACE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| storage   | objects_delete_cleanup      | CREATE OR REPLACE FUNCTION storage.objects_delete_cleanup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| storage   | objects_update_cleanup      | CREATE OR REPLACE FUNCTION storage.objects_update_cleanup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD−NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$function$
 |
| storage   | prefixes_delete_cleanup     | CREATE OR REPLACE FUNCTION storage.prefixes_delete_cleanup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| vault     | create_secret               | CREATE OR REPLACE FUNCTION vault.create_secret(new_secret text, new_name text DEFAULT NULL::text, new_description text DEFAULT ''::text, new_key_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  rec record;
BEGIN
  INSERT INTO vault.secrets (secret, name, description)
  VALUES (
    new_secret,
    new_name,
    new_description
  )
  RETURNING * INTO rec;
  UPDATE vault.secrets s
  SET secret = encode(vault._crypto_aead_det_encrypt(
    message := convert_to(rec.secret, 'utf8'),
    additional := convert_to(s.id::text, 'utf8'),
    key_id := 0,
    context := 'pgsodium'::bytea,
    nonce := rec.nonce
  ), 'base64')
  WHERE id = rec.id;
  RETURN rec.id;
END
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| vault     | update_secret               | CREATE OR REPLACE FUNCTION vault.update_secret(secret_id uuid, new_secret text DEFAULT NULL::text, new_name text DEFAULT NULL::text, new_description text DEFAULT NULL::text, new_key_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  decrypted_secret text := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE id = secret_id);
BEGIN
  UPDATE vault.secrets s
  SET
    secret = CASE WHEN new_secret IS NULL THEN s.secret
                  ELSE encode(vault._crypto_aead_det_encrypt(
                    message := convert_to(new_secret, 'utf8'),
                    additional := convert_to(s.id::text, 'utf8'),
                    key_id := 0,
                    context := 'pgsodium'::bytea,
                    nonce := s.nonce
                  ), 'base64') END,
    name = coalesce(new_name, s.name),
    description = coalesce(new_description, s.description),
    updated_at = now()
  WHERE s.id = secret_id;
END
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |


Listar funciones
| schema         | function_name                           | result_type                                                                                                                                                            | arguments                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | type    | definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| auth           | email                                   | text                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION auth.email()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| auth           | jwt                                     | jsonb                                                                                                                                                                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION auth.jwt()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| auth           | role                                    | text                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION auth.role()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| auth           | uid                                     | uuid                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION auth.uid()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| extensions     | armor                                   | text                                                                                                                                                                   | bytea                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | normal  | CREATE OR REPLACE FUNCTION extensions.armor(bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_armor$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| extensions     | armor                                   | text                                                                                                                                                                   | bytea, text[], text[]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | normal  | CREATE OR REPLACE FUNCTION extensions.armor(bytea, text[], text[])
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_armor$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| extensions     | crypt                                   | text                                                                                                                                                                   | text, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | normal  | CREATE OR REPLACE FUNCTION extensions.crypt(text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_crypt$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| extensions     | dearmor                                 | bytea                                                                                                                                                                  | text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | normal  | CREATE OR REPLACE FUNCTION extensions.dearmor(text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_dearmor$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| extensions     | decrypt                                 | bytea                                                                                                                                                                  | bytea, bytea, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | normal  | CREATE OR REPLACE FUNCTION extensions.decrypt(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_decrypt$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| extensions     | decrypt_iv                              | bytea                                                                                                                                                                  | bytea, bytea, bytea, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | normal  | CREATE OR REPLACE FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_decrypt_iv$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| extensions     | digest                                  | bytea                                                                                                                                                                  | bytea, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | normal  | CREATE OR REPLACE FUNCTION extensions.digest(bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_digest$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| extensions     | digest                                  | bytea                                                                                                                                                                  | text, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | normal  | CREATE OR REPLACE FUNCTION extensions.digest(text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_digest$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| extensions     | encrypt                                 | bytea                                                                                                                                                                  | bytea, bytea, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | normal  | CREATE OR REPLACE FUNCTION extensions.encrypt(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_encrypt$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| extensions     | encrypt_iv                              | bytea                                                                                                                                                                  | bytea, bytea, bytea, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | normal  | CREATE OR REPLACE FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_encrypt_iv$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| extensions     | gen_random_bytes                        | bytea                                                                                                                                                                  | integer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | normal  | CREATE OR REPLACE FUNCTION extensions.gen_random_bytes(integer)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_random_bytes$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| extensions     | gen_random_uuid                         | uuid                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION extensions.gen_random_uuid()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/pgcrypto', $function$pg_random_uuid$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| extensions     | gen_salt                                | text                                                                                                                                                                   | text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | normal  | CREATE OR REPLACE FUNCTION extensions.gen_salt(text)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_gen_salt$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| extensions     | gen_salt                                | text                                                                                                                                                                   | text, integer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | normal  | CREATE OR REPLACE FUNCTION extensions.gen_salt(text, integer)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_gen_salt_rounds$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| extensions     | grant_pg_cron_access                    | event_trigger                                                                                                                                                          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION extensions.grant_pg_cron_access()
 RETURNS event_trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| extensions     | grant_pg_graphql_access                 | event_trigger                                                                                                                                                          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION extensions.grant_pg_graphql_access()
 RETURNS event_trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$function$
                                                                                                                      |
| extensions     | grant_pg_net_access                     | event_trigger                                                                                                                                                          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION extensions.grant_pg_net_access()
 RETURNS event_trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| extensions     | hmac                                    | bytea                                                                                                                                                                  | bytea, bytea, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | normal  | CREATE OR REPLACE FUNCTION extensions.hmac(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_hmac$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| extensions     | hmac                                    | bytea                                                                                                                                                                  | text, text, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | normal  | CREATE OR REPLACE FUNCTION extensions.hmac(text, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_hmac$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| extensions     | pg_stat_statements                      | SETOF record                                                                                                                                                           | showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone | normal  | CREATE OR REPLACE FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone)
 RETURNS SETOF record
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pg_stat_statements', $function$pg_stat_statements_1_11$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| extensions     | pg_stat_statements_info                 | record                                                                                                                                                                 | OUT dealloc bigint, OUT stats_reset timestamp with time zone                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | normal  | CREATE OR REPLACE FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone)
 RETURNS record
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pg_stat_statements', $function$pg_stat_statements_info$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| extensions     | pg_stat_statements_reset                | timestamp with time zone                                                                                                                                               | userid oid DEFAULT 0, dbid oid DEFAULT 0, queryid bigint DEFAULT 0, minmax_only boolean DEFAULT false                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | normal  | CREATE OR REPLACE FUNCTION extensions.pg_stat_statements_reset(userid oid DEFAULT 0, dbid oid DEFAULT 0, queryid bigint DEFAULT 0, minmax_only boolean DEFAULT false)
 RETURNS timestamp with time zone
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pg_stat_statements', $function$pg_stat_statements_reset_1_11$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| extensions     | pgp_armor_headers                       | SETOF record                                                                                                                                                           | text, OUT key text, OUT value text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text)
 RETURNS SETOF record
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_armor_headers$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| extensions     | pgp_key_id                              | text                                                                                                                                                                   | bytea                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_key_id(bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_key_id_w$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| extensions     | pgp_pub_decrypt                         | text                                                                                                                                                                   | bytea, bytea                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt(bytea, bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| extensions     | pgp_pub_decrypt                         | text                                                                                                                                                                   | bytea, bytea, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| extensions     | pgp_pub_decrypt                         | text                                                                                                                                                                   | bytea, bytea, text, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| extensions     | pgp_pub_decrypt_bytea                   | bytea                                                                                                                                                                  | bytea, bytea                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| extensions     | pgp_pub_decrypt_bytea                   | bytea                                                                                                                                                                  | bytea, bytea, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| extensions     | pgp_pub_decrypt_bytea                   | bytea                                                                                                                                                                  | bytea, bytea, text, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| extensions     | pgp_pub_encrypt                         | bytea                                                                                                                                                                  | text, bytea                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_pub_encrypt(text, bytea)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_text$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| extensions     | pgp_pub_encrypt                         | bytea                                                                                                                                                                  | text, bytea, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_pub_encrypt(text, bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_text$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| extensions     | pgp_pub_encrypt_bytea                   | bytea                                                                                                                                                                  | bytea, bytea                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_bytea$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| extensions     | pgp_pub_encrypt_bytea                   | bytea                                                                                                                                                                  | bytea, bytea, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_bytea$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| extensions     | pgp_sym_decrypt                         | text                                                                                                                                                                   | bytea, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_sym_decrypt(bytea, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_text$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| extensions     | pgp_sym_decrypt                         | text                                                                                                                                                                   | bytea, text, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_sym_decrypt(bytea, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_text$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| extensions     | pgp_sym_decrypt_bytea                   | bytea                                                                                                                                                                  | bytea, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_bytea$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| extensions     | pgp_sym_decrypt_bytea                   | bytea                                                                                                                                                                  | bytea, text, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_bytea$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| extensions     | pgp_sym_encrypt                         | bytea                                                                                                                                                                  | text, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_sym_encrypt(text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_text$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| extensions     | pgp_sym_encrypt                         | bytea                                                                                                                                                                  | text, text, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_sym_encrypt(text, text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_text$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| extensions     | pgp_sym_encrypt_bytea                   | bytea                                                                                                                                                                  | bytea, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_bytea$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| extensions     | pgp_sym_encrypt_bytea                   | bytea                                                                                                                                                                  | bytea, text, text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | normal  | CREATE OR REPLACE FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_bytea$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| extensions     | pgrst_ddl_watch                         | event_trigger                                                                                                                                                          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION extensions.pgrst_ddl_watch()
 RETURNS event_trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| extensions     | pgrst_drop_watch                        | event_trigger                                                                                                                                                          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION extensions.pgrst_drop_watch()
 RETURNS event_trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| extensions     | set_graphql_placeholder                 | event_trigger                                                                                                                                                          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION extensions.set_graphql_placeholder()
 RETURNS event_trigger
 LANGUAGE plpgsql
AS $function$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| extensions     | uuid_generate_v1                        | uuid                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION extensions.uuid_generate_v1()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| extensions     | uuid_generate_v1mc                      | uuid                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION extensions.uuid_generate_v1mc()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1mc$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| extensions     | uuid_generate_v3                        | uuid                                                                                                                                                                   | namespace uuid, name text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | normal  | CREATE OR REPLACE FUNCTION extensions.uuid_generate_v3(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v3$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| extensions     | uuid_generate_v4                        | uuid                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION extensions.uuid_generate_v4()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v4$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| extensions     | uuid_generate_v5                        | uuid                                                                                                                                                                   | namespace uuid, name text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | normal  | CREATE OR REPLACE FUNCTION extensions.uuid_generate_v5(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v5$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| extensions     | uuid_nil                                | uuid                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION extensions.uuid_nil()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_nil$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| extensions     | uuid_ns_dns                             | uuid                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION extensions.uuid_ns_dns()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_dns$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| extensions     | uuid_ns_oid                             | uuid                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION extensions.uuid_ns_oid()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_oid$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| extensions     | uuid_ns_url                             | uuid                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION extensions.uuid_ns_url()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_url$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| extensions     | uuid_ns_x500                            | uuid                                                                                                                                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION extensions.uuid_ns_x500()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_x500$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| graphql        | _internal_resolve                       | jsonb                                                                                                                                                                  | query text, variables jsonb DEFAULT '{}'::jsonb, "operationName" text DEFAULT NULL::text, extensions jsonb DEFAULT NULL::jsonb                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | normal  | CREATE OR REPLACE FUNCTION graphql._internal_resolve(query text, variables jsonb DEFAULT '{}'::jsonb, "operationName" text DEFAULT NULL::text, extensions jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE c
AS '$libdir/pg_graphql', $function$resolve_wrapper$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| graphql        | comment_directive                       | jsonb                                                                                                                                                                  | comment_ text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | normal  | CREATE OR REPLACE FUNCTION graphql.comment_directive(comment_ text)
 RETURNS jsonb
 LANGUAGE sql
 IMMUTABLE
AS $function$
    /*
    comment on column public.account.name is '@graphql.name: myField'
    */
    select
        coalesce(
            (
                regexp_match(
                    comment_,
                    '@graphql\((.+)\)'
                )
            )[1]::jsonb,
            jsonb_build_object()
        )
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| graphql        | exception                               | text                                                                                                                                                                   | message text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | normal  | CREATE OR REPLACE FUNCTION graphql.exception(message text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
begin
    raise exception using errcode='22000', message=message;
end;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| graphql        | get_schema_version                      | integer                                                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION graphql.get_schema_version()
 RETURNS integer
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
    select last_value from graphql.seq_schema_version;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| graphql        | increment_schema_version                | event_trigger                                                                                                                                                          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION graphql.increment_schema_version()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
    perform pg_catalog.nextval('graphql.seq_schema_version');
end;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| graphql        | resolve                                 | jsonb                                                                                                                                                                  | query text, variables jsonb DEFAULT '{}'::jsonb, "operationName" text DEFAULT NULL::text, extensions jsonb DEFAULT NULL::jsonb                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | normal  | CREATE OR REPLACE FUNCTION graphql.resolve(query text, variables jsonb DEFAULT '{}'::jsonb, "operationName" text DEFAULT NULL::text, extensions jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
declare
    res jsonb;
    message_text text;
begin
  begin
    select graphql._internal_resolve("query" := "query",
                                     "variables" := "variables",
                                     "operationName" := "operationName",
                                     "extensions" := "extensions") into res;
    return res;
  exception
    when others then
    get stacked diagnostics message_text = message_text;
    return
    jsonb_build_object('data', null,
                       'errors', jsonb_build_array(jsonb_build_object('message', message_text)));
  end;
end;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| graphql_public | graphql                                 | jsonb                                                                                                                                                                  | "operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | normal  | CREATE OR REPLACE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE sql
AS $function$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| pgbouncer      | get_auth                                | TABLE(username text, password text)                                                                                                                                    | p_usename text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | normal  | CREATE OR REPLACE FUNCTION pgbouncer.get_auth(p_usename text)
 RETURNS TABLE(username text, password text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| public         | add_comment                             | uuid                                                                                                                                                                   | p_post_id uuid, p_user_id uuid, p_content text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | normal  | CREATE OR REPLACE FUNCTION public.add_comment(p_post_id uuid, p_user_id uuid, p_content text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$ DECLARE comment_id uuid; BEGIN INSERT INTO comments (post_id, user_id, contenido) VALUES (p_post_id, p_user_id, p_content) RETURNING id INTO comment_id; UPDATE posts SET comment_count = comment_count + 1 WHERE id = p_post_id; RETURN comment_id; END; $function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| public         | after_like_delete                       | trigger                                                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger | CREATE OR REPLACE FUNCTION public.after_like_delete()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  perform public.update_post_likes();
  return null;
end $function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| public         | badge_first_post                        | trigger                                                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger | CREATE OR REPLACE FUNCTION public.badge_first_post()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare v_badge uuid;
begin
  if (select count(*) from public.posts where user_id = new.user_id) = 1 then
    select id into v_badge from public.badges where codigo = 'first_post';
    insert into public.user_badges(user_id,badge_id)
    values (new.user_id,v_badge)
    on conflict do nothing;
  end if;
  return null;
end; $function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| public         | can_manage_community_member             | boolean                                                                                                                                                                | p_community_id uuid, p_user_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | normal  | CREATE OR REPLACE FUNCTION public.can_manage_community_member(p_community_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_communities
        WHERE community_id = p_community_id
        AND user_id = p_user_id
        AND role IN ('owner', 'admin')
        AND status = 'active'
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| public         | decrement_shares_count                  | trigger                                                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger | CREATE OR REPLACE FUNCTION public.decrement_shares_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE posts SET shares_count = GREATEST(shares_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| public         | get_community_members                   | TABLE(id uuid, nombre text, username text, avatar_url text, role text, joined_at timestamp with time zone)                                                             | p_community_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | normal  | CREATE OR REPLACE FUNCTION public.get_community_members(p_community_id uuid)
 RETURNS TABLE(id uuid, nombre text, username text, avatar_url text, role text, joined_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.nombre,
    u.username,
    u.avatar_url,
    uc.role,
    uc.joined_at
  FROM user_communities uc
  JOIN users u ON uc.user_id = u.id
  WHERE uc.community_id = p_community_id
    AND uc.status = 'active'
  ORDER BY uc.joined_at DESC;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| public         | get_community_stats                     | json                                                                                                                                                                   | p_community_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | normal  | CREATE OR REPLACE FUNCTION public.get_community_stats(p_community_id uuid)
 RETURNS json
 LANGUAGE plpgsql
AS $function$  
DECLARE  
    result JSON;  
BEGIN  
    SELECT json_build_object(  
        'total_members', (SELECT COUNT(*) FROM community_members WHERE community_id = p_community_id),  
        'active_members', (SELECT COUNT(*) FROM community_members cm   
                          JOIN users u ON cm.user_id = u.id   
                          WHERE cm.community_id = p_community_id   
                          AND u.last_seen_at > NOW() - INTERVAL '7 days'),  
        'total_posts', (SELECT COUNT(*) FROM posts WHERE community_id = p_community_id),  
        'posts_this_week', (SELECT COUNT(*) FROM posts   
                           WHERE community_id = p_community_id   
                           AND created_at > NOW() - INTERVAL '7 days'),  
        'engagement_rate', COALESCE((SELECT AVG(likes_count + comment_count)   
                                   FROM posts   
                                   WHERE community_id = p_community_id), 0)  
    ) INTO result;  
      
    RETURN result;  
END;  
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| public         | get_people_by_shared_interests          | TABLE(user_id uuid, nombre text, avatar_url text, shared_interests text[])                                                                                             | p_user_id uuid, p_limit integer DEFAULT 10                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | normal  | CREATE OR REPLACE FUNCTION public.get_people_by_shared_interests(p_user_id uuid, p_limit integer DEFAULT 10)
 RETURNS TABLE(user_id uuid, nombre text, avatar_url text, shared_interests text[])
 LANGUAGE plpgsql
AS $function$  
DECLARE  
  user_interests TEXT[];  
BEGIN  
  -- Obtener intereses del usuario (usando u.id para evitar ambigüedad)  
  SELECT u.intereses INTO user_interests  
  FROM users u  
  WHERE u.id = p_user_id;  
    
  -- Si el usuario no tiene intereses, retornar vacío  
  IF user_interests IS NULL OR array_length(user_interests, 1) = 0 THEN  
    RETURN;  
  END IF;  
    
  -- Buscar usuarios con intereses compartidos  
  RETURN QUERY  
  SELECT   
    u.id as user_id,  
    u.nombre,  
    u.avatar_url,  
    (u.intereses & user_interests) as shared_interests  
  FROM users u  
  WHERE u.id != p_user_id  
    AND u.intereses IS NOT NULL  
    AND array_length(u.intereses & user_interests, 1) > 0  
  ORDER BY array_length(u.intereses & user_interests, 1) DESC  
  LIMIT p_limit;  
END;  
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| public         | get_personalized_feed                   | TABLE(id uuid, contenido text, created_at timestamp with time zone, user_id uuid, full_name text, avatar_url text, role text)                                          | p_user_id uuid, p_limit integer DEFAULT 20                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | normal  | CREATE OR REPLACE FUNCTION public.get_personalized_feed(p_user_id uuid, p_limit integer DEFAULT 20)
 RETURNS TABLE(id uuid, contenido text, created_at timestamp with time zone, user_id uuid, full_name text, avatar_url text, role text)
 LANGUAGE plpgsql
AS $function$  
BEGIN  
  RETURN QUERY  
  SELECT   
    p.id,  
    p.contenido,  
    p.created_at,  
    p.user_id,  
    u.full_name,  
    u.avatar_url,  
    u.role  
  FROM posts p  
  JOIN users u ON p.user_id = u.id  
  ORDER BY p.created_at DESC  
  LIMIT p_limit;  
END;  
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| public         | get_personalized_feed                   | SETOF posts                                                                                                                                                            | p_user uuid, p_interests text[], p_communities uuid[]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | normal  | CREATE OR REPLACE FUNCTION public.get_personalized_feed(p_user uuid, p_interests text[], p_communities uuid[])
 RETURNS SETOF posts
 LANGUAGE plpgsql
AS $function$  
BEGIN  
  RETURN QUERY  
  SELECT * FROM posts   
  WHERE (  
    community_id = ANY(p_communities) OR  
    user_id IN (  
      SELECT user_id FROM user_communities   
      WHERE community_id = ANY(p_communities)  
    )  
  )  
  ORDER BY created_at DESC;  
END;  
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| public         | get_promotions                          | TABLE(id uuid, title text, discount text, image_url text, valid_until date, location text, description text)                                                           | p_user_id uuid, p_search text DEFAULT ''::text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | normal  | CREATE OR REPLACE FUNCTION public.get_promotions(p_user_id uuid, p_search text DEFAULT ''::text)
 RETURNS TABLE(id uuid, title text, discount text, image_url text, valid_until date, location text, description text)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pr.title,
    pr.discount,
    pr.image_url,
    pr.valid_until,
    pr.location,
    pr.description
  FROM promotions pr
  WHERE pr.active = true
    AND (p_search = '' OR pr.title ILIKE '%' || p_search || '%')
  ORDER BY pr.created_at DESC;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| public         | get_recent_posts                        | TABLE(id uuid, content text, image text, likes integer, comments integer, shares integer, author jsonb, created_at timestamp with time zone)                           | user_id_param uuid, filter_param text DEFAULT 'De mis contactos'::text, limit_param integer DEFAULT 20                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | normal  | CREATE OR REPLACE FUNCTION public.get_recent_posts(user_id_param uuid, filter_param text DEFAULT 'De mis contactos'::text, limit_param integer DEFAULT 20)
 RETURNS TABLE(id uuid, content text, image text, likes integer, comments integer, shares integer, author jsonb, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.contenido as content,
    CASE 
      WHEN array_length(p.media_url, 1) > 0 THEN p.media_url[1]
      ELSE NULL
    END as image,
    COALESCE(p.likes_count, 0)::INTEGER as likes,
    COALESCE(p.comment_count, 0)::INTEGER as comments,
    COALESCE(p.shares, 0)::INTEGER as shares,
    jsonb_build_object(
      'id', u.id,
      'name', COALESCE(u.full_name, u.nombre, 'Usuario'),
      'avatar', u.avatar_url,
      'role', u.role
    ) as author,
    p.created_at
  FROM posts p
  JOIN users u ON p.user_id = u.id
  WHERE 
    CASE 
      WHEN filter_param = 'Últimas 24 horas' THEN p.created_at > NOW() - INTERVAL '24 hours'
      WHEN filter_param = 'Semanal' THEN p.created_at > NOW() - INTERVAL '7 days'
      ELSE true
    END
  ORDER BY p.created_at DESC
  LIMIT limit_param;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| public         | get_recommended_communities             | json                                                                                                                                                                   | p_user_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | normal  | CREATE OR REPLACE FUNCTION public.get_recommended_communities(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN '[]'::json;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| public         | get_recommended_communities             | SETOF communities                                                                                                                                                      | p_user uuid, p_interests text[], p_knowledge_level text                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | normal  | CREATE OR REPLACE FUNCTION public.get_recommended_communities(p_user uuid, p_interests text[], p_knowledge_level text)
 RETURNS SETOF communities
 LANGUAGE plpgsql
AS $function$  
BEGIN  
  RETURN QUERY  
  SELECT * FROM communities c  
  WHERE c.id NOT IN (  
    SELECT community_id FROM user_communities   
    WHERE user_id = p_user  
  )  
  -- Lógica de recomendación basada en intereses  
  ORDER BY created_at DESC  
  LIMIT 10;  
END;  
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| public         | get_recommended_communities_by_goals    | TABLE(community_id uuid, community_name text, community_description text, community_avatar_url text, members_count bigint, match_score numeric, matching_goals text[]) | p_user_id uuid, p_limit integer DEFAULT 10                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | normal  | CREATE OR REPLACE FUNCTION public.get_recommended_communities_by_goals(p_user_id uuid, p_limit integer DEFAULT 10)
 RETURNS TABLE(community_id uuid, community_name text, community_description text, community_avatar_url text, members_count bigint, match_score numeric, matching_goals text[])
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH user_goal_ids AS (
    SELECT ug.goal_id
    FROM user_goals ug
    WHERE ug.user_id = p_user_id
  ),
  community_scores AS (
    SELECT 
      c.id as community_id,
      COALESCE(c.name, c.nombre) as community_name,
      c.descripcion as community_description,
      COALESCE(c.icono_url, c.image_url) as community_avatar_url,
      COALESCE(c.member_count, COUNT(DISTINCT uc.user_id)) as members_count,
      (COUNT(DISTINCT ug2.goal_id)::numeric / NULLIF((SELECT COUNT(*) FROM user_goal_ids), 0)) * 100 as match_score,
      ARRAY_AGG(DISTINCT g.name) as matching_goals
    FROM communities c
    LEFT JOIN user_communities uc ON c.id = uc.community_id
    LEFT JOIN user_goals ug2 ON ug2.user_id = uc.user_id
    LEFT JOIN goals g ON g.id = ug2.goal_id
    WHERE ug2.goal_id IN (SELECT goal_id FROM user_goal_ids)
      AND c.id NOT IN (
        SELECT uc2.community_id 
        FROM user_communities uc2
        WHERE uc2.user_id = p_user_id
      )
    GROUP BY c.id, c.name, c.nombre, c.descripcion, c.icono_url, c.image_url, c.member_count
    HAVING COUNT(DISTINCT ug2.goal_id) > 0
  )
  SELECT 
    cs.community_id,
    cs.community_name,
    cs.community_description,
    cs.community_avatar_url,
    cs.members_count,
    cs.match_score,
    cs.matching_goals
  FROM community_scores cs
  ORDER BY cs.match_score DESC, cs.members_count DESC
  LIMIT p_limit;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| public         | get_recommended_communities_by_goals_v2 | TABLE(community_id uuid, community_name text, community_description text, community_avatar_url text, members_count bigint, match_score numeric, matching_goals text[]) | p_user_id uuid, p_limit integer DEFAULT 10                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | normal  | CREATE OR REPLACE FUNCTION public.get_recommended_communities_by_goals_v2(p_user_id uuid, p_limit integer DEFAULT 10)
 RETURNS TABLE(community_id uuid, community_name text, community_description text, community_avatar_url text, members_count bigint, match_score numeric, matching_goals text[])
 LANGUAGE plpgsql
AS $function$  
BEGIN  
  RETURN QUERY  
  WITH user_goal_ids AS (  
    SELECT ug.goal_id  
    FROM user_goals ug  
    WHERE ug.user_id = p_user_id  
  ),  
  community_scores AS (  
    SELECT   
      c.id as community_id,  
      COALESCE(c.name, c.nombre) as community_name,  
      c.descripcion as community_description,  
      COALESCE(c.icono_url, c.image_url) as community_avatar_url,  
      COALESCE(c.member_count, 0::BIGINT) as members_count,  -- Asegurar tipo BIGINT  
      (SUM(cg.relevance_score)::numeric / NULLIF((SELECT COUNT(*) FROM user_goal_ids), 0)) * 100 as match_score,  
      ARRAY_AGG(DISTINCT g.name) as matching_goals  
    FROM communities c  
    INNER JOIN community_goals cg ON c.id = cg.community_id  
    INNER JOIN goals g ON g.id = cg.goal_id  
    WHERE cg.goal_id IN (SELECT goal_id FROM user_goal_ids)  
      AND c.id NOT IN (  
        SELECT uc.community_id   
        FROM user_communities uc   
        WHERE uc.user_id = p_user_id  
      )  
    GROUP BY c.id, c.name, c.nombre, c.descripcion, c.icono_url, c.image_url, c.member_count  
    HAVING COUNT(DISTINCT cg.goal_id) > 0  
  )  
  SELECT   
    cs.community_id,  
    cs.community_name,  
    cs.community_description,  
    cs.community_avatar_url,  
    cs.members_count,  
    cs.match_score,  
    cs.matching_goals  
  FROM community_scores cs  
  ORDER BY cs.match_score DESC, cs.members_count DESC  
  LIMIT p_limit;  
END;  
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| public         | get_recommended_communities_by_goals_v3 | TABLE(community_id uuid, community_name text, community_description text, community_avatar_url text, members_count bigint, match_score numeric, matching_goals text[]) | p_user_id uuid, p_limit integer DEFAULT 10                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | normal  | CREATE OR REPLACE FUNCTION public.get_recommended_communities_by_goals_v3(p_user_id uuid, p_limit integer DEFAULT 10)
 RETURNS TABLE(community_id uuid, community_name text, community_description text, community_avatar_url text, members_count bigint, match_score numeric, matching_goals text[])
 LANGUAGE plpgsql
AS $function$
DECLARE
  user_knowledge_level TEXT;
BEGIN
  -- Obtener nivel de conocimiento del usuario
  SELECT level INTO user_knowledge_level
  FROM user_knowledge
  WHERE user_id = p_user_id
  LIMIT 1;
  
  RETURN QUERY
  WITH user_goal_ids AS (
    SELECT ug.goal_id
    FROM user_goals ug
    WHERE ug.user_id = p_user_id
  ),
  community_scores AS (
    SELECT 
      c.id as community_id,
      COALESCE(c.name, c.nombre) as community_name,
      c.descripcion as community_description,
      COALESCE(c.icono_url, c.image_url) as community_avatar_url,
      COALESCE(c.member_count, 0) as members_count,
      -- Score ponderado por relevancia Y nivel de conocimiento
      (
        SUM(cg.relevance_score) * 
        CASE 
          -- Si es principiante, priorizar comunidades para principiantes
          WHEN user_knowledge_level = 'basic' AND c.nombre ILIKE '%principiante%' THEN 1.5
          -- Si es intermedio, priorizar comunidades intermedias
          WHEN user_knowledge_level = 'intermediate' AND c.nombre NOT ILIKE '%principiante%' THEN 1.3
          -- Si es avanzado, priorizar comunidades avanzadas
          WHEN user_knowledge_level = 'advanced' AND (c.nombre ILIKE '%trading%' OR c.nombre ILIKE '%avanzado%') THEN 1.4
          ELSE 1.0
        END
      )::numeric / NULLIF((SELECT COUNT(*) FROM user_goal_ids), 0) * 100 as match_score,
      ARRAY_AGG(DISTINCT g.name) as matching_goals
    FROM communities c
    INNER JOIN community_goals cg ON c.id = cg.community_id
    INNER JOIN goals g ON g.id = cg.goal_id
    WHERE cg.goal_id IN (SELECT goal_id FROM user_goal_ids)
      AND c.id NOT IN (
        SELECT uc.community_id 
        FROM user_communities uc
        WHERE uc.user_id = p_user_id
      )
    GROUP BY c.id, c.name, c.nombre, c.descripcion, c.icono_url, c.image_url, c.member_count
    HAVING COUNT(DISTINCT cg.goal_id) > 0
  )
  SELECT 
    cs.community_id,
    cs.community_name,
    cs.community_description,
    cs.community_avatar_url,
    cs.members_count,
    cs.match_score,
    cs.matching_goals
  FROM community_scores cs
  ORDER BY cs.match_score DESC, cs.members_count DESC
  LIMIT p_limit;
END;
$function$
 |
| public         | get_recommended_users                   | TABLE(id uuid, nombre text, username text, photo_url text)                                                                                                             | p_user uuid, p_count integer DEFAULT 10                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | normal  | CREATE OR REPLACE FUNCTION public.get_recommended_users(p_user uuid, p_count integer DEFAULT 10)
 RETURNS TABLE(id uuid, nombre text, username text, photo_url text)
 LANGUAGE sql
 STABLE
AS $function$
select u.id, u.nombre, u.username, u.photo_url
from   public.users u
where  u.id <> p_user
  and  cardinality(
         array(
           select unnest(u.intereses)
           intersect
           select unnest((select intereses from public.users where id = p_user))
         )
       ) > 0
order  by random()
limit  p_count;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| public         | get_suggested_communities               | TABLE(id uuid, name text, image_url text, type text, members_count integer)                                                                                            | user_id_param uuid, limit_param integer DEFAULT 10                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | normal  | CREATE OR REPLACE FUNCTION public.get_suggested_communities(user_id_param uuid, limit_param integer DEFAULT 10)
 RETURNS TABLE(id uuid, name text, image_url text, type text, members_count integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.nombre as name,
    c.image_url,
    c.tipo::TEXT as type,  -- CAST a TEXT para evitar error de tipo
    COALESCE(c.member_count, 0)::INTEGER as members_count
  FROM communities c
  ORDER BY c.member_count DESC NULLS LAST, c.created_at DESC
  LIMIT limit_param;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| public         | get_suggested_people                    | json                                                                                                                                                                   | p_user_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | normal  | CREATE OR REPLACE FUNCTION public.get_suggested_people(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$  
BEGIN  
    RETURN '[]'::json;  
END;  
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| public         | get_suggested_people                    | TABLE(id uuid, name text, avatar_url text, role text, interests text[])                                                                                                | p_user_id uuid, p_limit integer DEFAULT 10                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | normal  | CREATE OR REPLACE FUNCTION public.get_suggested_people(p_user_id uuid, p_limit integer DEFAULT 10)
 RETURNS TABLE(id uuid, name text, avatar_url text, role text, interests text[])
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    COALESCE(u.full_name, u.nombre, 'Usuario') as name,
    u.avatar_url,
    u.role,
    u.intereses as interests
  FROM users u
  WHERE u.id != p_user_id
    AND u.avatar_url IS NOT NULL
    AND array_length(u.intereses, 1) > 0
  ORDER BY u.fecha_registro DESC  -- Usar fecha_registro en lugar de created_at
  LIMIT p_limit;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| public         | get_suggested_people_v2                 | TABLE(user_id uuid, name text, avatar_url text, profession text, expertise_areas text[], mutual_connections integer, compatibility_score integer, reason text)         | p_user_id uuid, p_limit integer DEFAULT 10                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | normal  | CREATE OR REPLACE FUNCTION public.get_suggested_people_v2(p_user_id uuid, p_limit integer DEFAULT 10)
 RETURNS TABLE(user_id uuid, name text, avatar_url text, profession text, expertise_areas text[], mutual_connections integer, compatibility_score integer, reason text)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH already_following AS (
    -- Personas que YA sigue
    SELECT following_id FROM user_follows WHERE follower_id = p_user_id
  ),
  user_goals AS (
    SELECT goal_id FROM user_goals WHERE user_id = p_user_id
  ),
  candidate_users AS (
    SELECT DISTINCT
      u.id,
      u.nombre as name,
      COALESCE(u.avatar_url, 'https://i.pravatar.cc/100') as avatar_url,
      COALESCE(u.bio, 'Inversionista') as profession,
      ARRAY['Inversiones'] as expertise_areas,
      (
        SELECT COUNT(*)::integer
        FROM user_follows uf1
        WHERE uf1.follower_id = p_user_id
          AND uf1.following_id IN (
            SELECT follower_id 
            FROM user_follows uf2 
            WHERE uf2.following_id = u.id
          )
      ) as mutual_connections,
      (
        SELECT COUNT(*)::integer * 20
        FROM user_goals ug
        WHERE ug.user_id = u.id
          AND ug.goal_id IN (SELECT goal_id FROM user_goals)
      ) + 50 as compatibility_score,
      CASE 
        WHEN (SELECT COUNT(*) FROM user_goals ug WHERE ug.user_id = u.id AND ug.goal_id IN (SELECT goal_id FROM user_goals)) > 0
        THEN 'Intereses similares'
        ELSE 'Recomendado para ti'
      END as reason
    FROM users u
    WHERE u.id != p_user_id
      -- ✅ FILTRO MEJORADO: Excluir personas ya seguidas
      AND u.id NOT IN (SELECT following_id FROM already_following)
      AND u.nombre IS NOT NULL
      AND u.nombre != ''
      AND u.nombre NOT ILIKE '%test%'
      AND u.nombre NOT ILIKE '%user %'
      AND u.nombre NOT ILIKE '%abc%'
    ORDER BY compatibility_score DESC, mutual_connections DESC
    LIMIT p_limit * 2  -- Obtener el doble para compensar filtros
  )
  SELECT * FROM candidate_users
  LIMIT p_limit;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| public         | get_user_communities                    | TABLE(id uuid, nombre text, icono_url text)                                                                                                                            | p_user_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | normal  | CREATE OR REPLACE FUNCTION public.get_user_communities(p_user_id uuid)
 RETURNS TABLE(id uuid, nombre text, icono_url text)
 LANGUAGE plpgsql
AS $function$  
BEGIN  
  RETURN QUERY  
  SELECT c.id, c.nombre, c.icono_url  
  FROM communities c  
  INNER JOIN user_communities uc ON c.id = uc.community_id  
  WHERE uc.user_id = p_user_id;  
END;  
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| public         | get_user_conversations                  | TABLE(id uuid, type text, last_message text, last_message_at timestamp with time zone, unread_count bigint, other_participant json)                                    | p_user_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | normal  | CREATE OR REPLACE FUNCTION public.get_user_conversations(p_user_id uuid)
 RETURNS TABLE(id uuid, type text, last_message text, last_message_at timestamp with time zone, unread_count bigint, other_participant json)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.type,
        c.last_message,
        c.last_message_at,
        COALESCE((
            SELECT COUNT(*) FROM messages m
            WHERE m.conversation_id = c.id
            AND m.sender_id != p_user_id
            AND m.created_at > COALESCE((
                SELECT last_read_at FROM message_reads 
                WHERE user_id = p_user_id AND conversation_id = c.id
            ), '1970-01-01'::timestamptz)
        ), 0) as unread_count,
        CASE 
            WHEN c.participant_one = p_user_id THEN
                (SELECT json_build_object(
                    'id', u.id,
                    'nombre', u.nombre,
                    'avatar_url', u.avatar_url,
                    'is_online', u.is_online
                ) FROM users u WHERE u.id = c.participant_two)
            ELSE
                (SELECT json_build_object(
                    'id', u.id,
                    'nombre', u.nombre,
                    'avatar_url', u.avatar_url,
                    'is_online', u.is_online
                ) FROM users u WHERE u.id = c.participant_one)
        END as other_participant
    FROM conversations c
    WHERE c.participant_one = p_user_id OR c.participant_two = p_user_id
    ORDER BY c.last_message_at DESC;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| public         | get_user_interests                      | TABLE(interest_id uuid, interest_name text, experience_level text)                                                                                                     | p_user_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | normal  | CREATE OR REPLACE FUNCTION public.get_user_interests(p_user_id uuid)
 RETURNS TABLE(interest_id uuid, interest_name text, experience_level text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        ui.interest_id,
        COALESCE(ii.name, ui.interest_name) as interest_name,
        ui.experience_level
    FROM user_interests ui
    LEFT JOIN investment_interests ii ON ui.interest_id = ii.id
    WHERE ui.user_id = p_user_id;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| public         | get_user_quick_stats                    | json                                                                                                                                                                   | p_user_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | normal  | CREATE OR REPLACE FUNCTION public.get_user_quick_stats(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'notifications_count', COALESCE((
            SELECT COUNT(*) FROM notifications 
            WHERE user_id = p_user_id AND is_read = false
        ), 0),
        'messages_count', COALESCE((
            SELECT COUNT(*) FROM messages m
            JOIN conversations c ON m.conversation_id = c.id
            WHERE (c.participant_one = p_user_id OR c.participant_two = p_user_id)
            AND m.sender_id != p_user_id
        ), 0),
        'followers_count', COALESCE((
            SELECT COUNT(*) FROM user_follows 
            WHERE following_id = p_user_id
        ), 0),
        'following_count', COALESCE((
            SELECT COUNT(*) FROM user_follows 
            WHERE follower_id = p_user_id
        ), 0),
        'posts_count', COALESCE((
            SELECT COUNT(*) FROM posts 
            WHERE user_id = p_user_id
        ), 0)
    ) INTO result;
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'notifications_count', 0,
        'messages_count', 0,
        'followers_count', 0,
        'following_count', 0,
        'posts_count', 0,
        'error', SQLERRM
    );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| public         | get_user_stats                          | TABLE(followers_count integer, following_count integer, posts_count integer)                                                                                           | user_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | normal  | CREATE OR REPLACE FUNCTION public.get_user_stats(user_id uuid)
 RETURNS TABLE(followers_count integer, following_count integer, posts_count integer)
 LANGUAGE plpgsql
AS $function$  
BEGIN  
  RETURN QUERY  
  SELECT   
    (SELECT COUNT(*)::INTEGER FROM user_follows WHERE following_id = user_id) as followers_count,  
    (SELECT COUNT(*)::INTEGER FROM user_follows WHERE follower_id = user_id) as following_count,  
    (SELECT COUNT(*)::INTEGER FROM posts WHERE posts.user_id = get_user_stats.user_id) as posts_count;  
END;  
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| public         | getuserquickstats                       | TABLE(postscount bigint, followerscount bigint, followingcount bigint, communitiescount bigint, likesreceived bigint, commentsreceived bigint)                         | p_user_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | normal  | CREATE OR REPLACE FUNCTION public.getuserquickstats(p_user_id uuid)
 RETURNS TABLE(postscount bigint, followerscount bigint, followingcount bigint, communitiescount bigint, likesreceived bigint, commentsreceived bigint)
 LANGUAGE plpgsql
AS $function$  
BEGIN  
    RETURN QUERY  
    SELECT   
        (SELECT COUNT(*) FROM posts WHERE user_id = p_user_id),  
        (SELECT COUNT(*) FROM user_follows WHERE following_id = p_user_id),  
        (SELECT COUNT(*) FROM user_follows WHERE follower_id = p_user_id),  
        (SELECT COUNT(*) FROM community_members WHERE user_id = p_user_id),  
        (SELECT COALESCE(SUM(likes_count), 0) FROM posts WHERE user_id = p_user_id),  
        (SELECT COALESCE(SUM(comment_count), 0) FROM posts WHERE user_id = p_user_id);  
END;  
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| public         | handle_new_user                         | trigger                                                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger | CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$  
BEGIN  
  INSERT INTO public.users (id, email, fecha_registro, nombre, username)  
  VALUES (  
    new.id,   
    new.email,   
    new.created_at,  
    COALESCE(new.raw_user_meta_data->>'nombre', 'Usuario'),  
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substring(new.id::text, 1, 8))  
  );  
  RETURN new;  
END;  
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| public         | increment_post_comments                 | void                                                                                                                                                                   | post_id uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | normal  | CREATE OR REPLACE FUNCTION public.increment_post_comments(post_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$  
BEGIN  
    UPDATE posts   
    SET comment_count = COALESCE(comment_count, 0) + 1,  
        updated_at = NOW()  
    WHERE id = post_id;  
END;  
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| public         | increment_shares_count                  | trigger                                                                                                                                                                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | trigger | CREATE OR REPLACE FUNCTION public.increment_shares_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| public         | increment_video_view_count              | void                                                                                                                                                                   | video_uuid uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | normal  | CREATE OR REPLACE FUNCTION public.increment_video_view_count(video_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE videos
    SET view_count = view_count + 1
    WHERE id = video_uuid;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| public         | mark_chat_as_read                       | void                                                                                                                                                                   | chat_id_param uuid, user_id_param uuid                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | normal  | CREATE OR REPLACE FUNCTION public.mark_chat_as_read(chat_id_param uuid, user_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Resetear el contador de mensajes no leídos
    UPDATE public.chats
    SET unread_count = 0
    WHERE id = chat_id_param;
    
    -- Opcional: Actualizar read_at en chat_messages si existe esa tabla
    UPDATE public.chat_messages
    SET read_at = NOW()
    WHERE chat_id = chat_id_param
    AND sender_id != user_id_param
    AND read_at IS NULL;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

Query corregido para permisos de tablas:
| schemaname | object_name               | privileges                                                |
| ---------- | ------------------------- | --------------------------------------------------------- |
| auth       | audit_log_entries         | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| auth       | flow_state                | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| auth       | identities                | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| auth       | instances                 | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| auth       | mfa_amr_claims            | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| auth       | mfa_challenges            | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| auth       | mfa_factors               | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| auth       | oauth_clients             | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| auth       | one_time_tokens           | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| auth       | refresh_tokens            | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| auth       | saml_providers            | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| auth       | saml_relay_states         | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| auth       | sessions                  | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| auth       | sso_domains               | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| auth       | sso_providers             | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| auth       | users                     | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| extensions | pg_stat_statements        | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| extensions | pg_stat_statements_info   | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | badges                    | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | channel_messages          | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | chat_messages             | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | chat_participants         | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | chats                     | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | comments                  | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | communities               | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | community_channels        | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | community_chats           | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | community_files           | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | community_goals           | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | community_invitations     | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | community_join_requests   | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | community_media           | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | community_members         | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | community_messages        | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | community_photos          | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | community_settings        | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | conversation_participants | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | conversations             | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | course_enrollments        | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | course_modules            | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | course_topics             | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | courses                   | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | dismissed_suggestions     | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | educational_tools         | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | faqs                      | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | formularios_landing       | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | glossary                  | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | goals                     | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | interests                 | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | investment_portfolios     | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | knowledge_levels          | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | learning_path_courses     | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | learning_paths            | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | lesson_progress           | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | lessons                   | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | market_data               | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | message_reads             | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | messages                  | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | news                      | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | news_categories           | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | notifications             | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | post_comments             | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | post_likes                | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | post_saves                | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | post_shares               | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | posts                     | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | promotion_claims          | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | promotion_views           | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | promotions                | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | reports                   | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | saved_posts               | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | simulated_investments     | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | simulated_portfolios      | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | user_activity             | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | user_badges               | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | user_blocks               | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | user_budgets              | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | user_communities          | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | user_connections          | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | user_course_progress      | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | user_followers            | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | user_follows              | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | user_goals                | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | user_interests            | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | user_knowledge            | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | user_preferences          | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | user_settings             | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | user_transactions         | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | users                     | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | video_bookmarks           | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | video_comments            | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | video_content             | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | video_likes               | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | video_progress            | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | video_subtitles           | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | video_themes              | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| public     | videos                    | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| realtime   | messages                  | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| realtime   | messages_2025_10_08       | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |
| realtime   | messages_2025_10_09       | {DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE} |



Query corregido para privilegios en funciones:
| schema         | function_name                           | grants                                                                                                                                                                       |
| -------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth           | email                                   | ["=X/supabase_auth_admin","dashboard_user=X/supabase_auth_admin","supabase_auth_admin=X/supabase_auth_admin"]                                                                |
| auth           | jwt                                     | ["=X/supabase_auth_admin","dashboard_user=X/supabase_auth_admin","postgres=X/supabase_auth_admin","supabase_auth_admin=X/supabase_auth_admin"]                               |
| auth           | role                                    | ["=X/supabase_auth_admin","dashboard_user=X/supabase_auth_admin","supabase_auth_admin=X/supabase_auth_admin"]                                                                |
| auth           | uid                                     | ["=X/supabase_auth_admin","dashboard_user=X/supabase_auth_admin","supabase_auth_admin=X/supabase_auth_admin"]                                                                |
| extensions     | armor                                   | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | crypt                                   | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | dearmor                                 | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | decrypt                                 | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | decrypt_iv                              | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | digest                                  | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | encrypt                                 | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | encrypt_iv                              | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | gen_random_bytes                        | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | gen_random_uuid                         | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | gen_salt                                | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | grant_pg_cron_access                    | ["=X/supabase_admin","dashboard_user=X/supabase_admin","supabase_admin=X*/supabase_admin"]                                                                                   |
| extensions     | grant_pg_graphql_access                 | ["=X/supabase_admin","postgres=X*/supabase_admin","supabase_admin=X/supabase_admin"]                                                                                         |
| extensions     | grant_pg_net_access                     | ["=X/supabase_admin","dashboard_user=X/supabase_admin","supabase_admin=X*/supabase_admin"]                                                                                   |
| extensions     | hmac                                    | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | pg_stat_statements                      | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | pg_stat_statements_info                 | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | pg_stat_statements_reset                | ["dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                                         |
| extensions     | pgp_armor_headers                       | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | pgp_key_id                              | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | pgp_pub_decrypt                         | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | pgp_pub_decrypt_bytea                   | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | pgp_pub_encrypt                         | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | pgp_pub_encrypt_bytea                   | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | pgp_sym_decrypt                         | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | pgp_sym_decrypt_bytea                   | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | pgp_sym_encrypt                         | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | pgp_sym_encrypt_bytea                   | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | pgrst_ddl_watch                         | ["=X/supabase_admin","postgres=X*/supabase_admin","supabase_admin=X/supabase_admin"]                                                                                         |
| extensions     | pgrst_drop_watch                        | ["=X/supabase_admin","postgres=X*/supabase_admin","supabase_admin=X/supabase_admin"]                                                                                         |
| extensions     | set_graphql_placeholder                 | ["=X/supabase_admin","postgres=X*/supabase_admin","supabase_admin=X/supabase_admin"]                                                                                         |
| extensions     | uuid_generate_v1                        | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | uuid_generate_v1mc                      | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | uuid_generate_v3                        | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | uuid_generate_v4                        | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | uuid_generate_v5                        | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | uuid_nil                                | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | uuid_ns_dns                             | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | uuid_ns_oid                             | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | uuid_ns_url                             | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| extensions     | uuid_ns_x500                            | ["=X/postgres","dashboard_user=X/postgres","postgres=X*/postgres"]                                                                                                           |
| graphql        | _internal_resolve                       | ["=X/supabase_admin","anon=X/supabase_admin","authenticated=X/supabase_admin","postgres=X/supabase_admin","service_role=X/supabase_admin","supabase_admin=X/supabase_admin"] |
| graphql        | comment_directive                       | ["=X/supabase_admin","anon=X/supabase_admin","authenticated=X/supabase_admin","postgres=X/supabase_admin","service_role=X/supabase_admin","supabase_admin=X/supabase_admin"] |
| graphql        | exception                               | ["=X/supabase_admin","anon=X/supabase_admin","authenticated=X/supabase_admin","postgres=X/supabase_admin","service_role=X/supabase_admin","supabase_admin=X/supabase_admin"] |
| graphql        | get_schema_version                      | ["=X/supabase_admin","anon=X/supabase_admin","authenticated=X/supabase_admin","postgres=X/supabase_admin","service_role=X/supabase_admin","supabase_admin=X/supabase_admin"] |
| graphql        | increment_schema_version                | ["=X/supabase_admin","anon=X/supabase_admin","authenticated=X/supabase_admin","postgres=X/supabase_admin","service_role=X/supabase_admin","supabase_admin=X/supabase_admin"] |
| graphql        | resolve                                 | ["=X/supabase_admin","anon=X/supabase_admin","authenticated=X/supabase_admin","postgres=X/supabase_admin","service_role=X/supabase_admin","supabase_admin=X/supabase_admin"] |
| graphql_public | graphql                                 | ["=X/supabase_admin","anon=X/supabase_admin","authenticated=X/supabase_admin","postgres=X/supabase_admin","service_role=X/supabase_admin","supabase_admin=X/supabase_admin"] |
| pgbouncer      | get_auth                                | ["pgbouncer=X/supabase_admin","postgres=X/supabase_admin","supabase_admin=X/supabase_admin"]                                                                                 |
| public         | add_comment                             | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | after_like_delete                       | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | badge_first_post                        | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | can_manage_community_member             | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | decrement_shares_count                  | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_community_members                   | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_community_stats                     | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_people_by_shared_interests          | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_personalized_feed                   | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_promotions                          | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_recent_posts                        | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_recommended_communities             | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_recommended_communities_by_goals    | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_recommended_communities_by_goals_v2 | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_recommended_communities_by_goals_v3 | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_recommended_users                   | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_suggested_communities               | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_suggested_people                    | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_suggested_people_v2                 | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_user_communities                    | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_user_conversations                  | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_user_interests                      | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_user_quick_stats                    | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | get_user_stats                          | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | getuserquickstats                       | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | handle_new_user                         | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | increment_post_comments                 | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | increment_shares_count                  | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | increment_video_view_count              | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | mark_chat_as_read                       | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | mark_messages_as_read                   | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | save_user_goals                         | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | save_user_interests                     | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | save_user_knowledge_level               | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | search_all                              | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | share_post                              | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | sync_user_columns                       | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | update_chat_unread_count                | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | update_community_member_count           | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | update_conversation_last_message        | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | update_course_enrollment_count          | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | update_post_comments                    | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | update_post_comments_after_delete       | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | update_post_likes                       | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | update_post_likes_after_delete          | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | update_updated_at_column                | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |
| public         | update_user_interests                   | ["=X/postgres","anon=X/postgres","authenticated=X/postgres","postgres=X/postgres","service_role=X/postgres"]                                                                 |

Query corregido para dependencias básicas (objetos dependientes):
| dependent_catalog_object | objid  | refobjid | deptype |
| ------------------------ | ------ | -------- | ------- |
| pg_class                 | 116080 | 89141    | P       |
| pg_class                 | 116092 | 89141    | P       |
| pg_class                 | 116104 | 89141    | P       |
| pg_class                 | 116078 | 17264    | P       |
| pg_class                 | 116126 | 17264    | P       |
| pg_class                 | 116116 | 89141    | P       |
| pg_class                 | 116128 | 89141    | P       |
| pg_class                 | 116114 | 17264    | P       |
| pg_class                 | 116102 | 17264    | P       |
| pg_class                 | 116090 | 17264    | P       |
| pg_class                 | 122221 | 17264    | P       |
| pg_class                 | 122223 | 89141    | P       |
| pg_class                 | 116114 | 116107   | S       |
| pg_class                 | 116104 | 116095   | S       |
| pg_class                 | 116102 | 116095   | S       |
| pg_class                 | 116128 | 116119   | S       |
| pg_class                 | 116092 | 116083   | S       |
| pg_class                 | 122223 | 122214   | S       |
| pg_class                 | 116116 | 116107   | S       |
| pg_class                 | 122221 | 122214   | S       |
| pg_class                 | 116126 | 116119   | S       |
| pg_class                 | 116080 | 116071   | S       |
| pg_class                 | 116090 | 116083   | S       |
| pg_class                 | 116078 | 116071   | S       |
| pg_class                 | 16929  | 16928    | a       |
| pg_class                 | 89141  | 17251    | a       |
| pg_class                 | 89141  | 17251    | a       |
| pg_class                 | 16558  | 16544    | a       |
| pg_class                 | 16581  | 16559    | a       |
| pg_class                 | 16915  | 16723    | a       |
| pg_class                 | 16929  | 16928    | a       |
| pg_class                 | 16527  | 16526    | a       |
| pg_class                 | 16514  | 16505    | a       |
| pg_class                 | 16527  | 16526    | a       |
| pg_class                 | 16510  | 16509    | a       |
| pg_class                 | 16885  | 16872    | a       |
| pg_class                 | 16886  | 16872    | a       |
| pg_class                 | 16906  | 16493    | a       |
| pg_class                 | 16932  | 16925    | a       |
| pg_class                 | 16853  | 16839    | a       |
| pg_class                 | 16835  | 16834    | a       |
| pg_class                 | 16828  | 16753    | a       |
| pg_class                 | 16835  | 16834    | a       |
| pg_class                 | 16861  | 16860    | a       |
| pg_class                 | 16844  | 16843    | a       |
| pg_class                 | 16853  | 16839    | a       |
| pg_class                 | 16530  | 16523    | a       |
| pg_class                 | 16877  | 16876    | a       |
| pg_class                 | 16503  | 16493    | a       |
| pg_class                 | 16510  | 16509    | a       |
| pg_class                 | 16513  | 16505    | a       |
| pg_class                 | 16514  | 16505    | a       |
| pg_class                 | 16520  | 16519    | a       |
| pg_class                 | 16520  | 16519    | a       |
| pg_class                 | 58823  | 58809    | a       |
| pg_class                 | 58824  | 58809    | a       |
| pg_class                 | 89141  | 17251    | a       |
| pg_class                 | 89141  | 17251    | a       |
| pg_class                 | 16580  | 16559    | a       |
| pg_class                 | 16580  | 16559    | a       |
| pg_class                 | 16665  | 16664    | a       |
| pg_class                 | 16906  | 16493    | a       |
| pg_class                 | 16816  | 16815    | a       |
| pg_class                 | 16804  | 16803    | a       |
| pg_class                 | 16826  | 16753    | a       |
| pg_class                 | 16791  | 16790    | a       |
| pg_class                 | 16750  | 16493    | a       |
| pg_class                 | 16799  | 16787    | a       |
| pg_class                 | 16826  | 16753    | a       |
| pg_class                 | 16861  | 16860    | a       |
| pg_class                 | 16747  | 16493    | a       |
| pg_class                 | 16744  | 16493    | a       |
| pg_class                 | 16743  | 16723    | a       |
| pg_class                 | 16744  | 16493    | a       |
| pg_class                 | 16747  | 16493    | a       |
| pg_class                 | 35339  | 35338    | a       |
| pg_class                 | 16746  | 16493    | a       |
| pg_class                 | 16746  | 16493    | a       |
| pg_class                 | 16749  | 16493    | a       |
| pg_class                 | 16749  | 16493    | a       |
| pg_class                 | 16750  | 16493    | a       |
| pg_class                 | 16791  | 16790    | a       |
| pg_class                 | 16799  | 16787    | a       |
| pg_class                 | 16799  | 16787    | a       |
| pg_class                 | 16804  | 16803    | a       |
| pg_class                 | 16816  | 16815    | a       |
| pg_class                 | 16827  | 16787    | a       |
| pg_class                 | 16827  | 16787    | a       |
| pg_class                 | 16829  | 16505    | a       |
| pg_class                 | 16829  | 16505    | a       |
| pg_class                 | 16838  | 16830    | a       |
| pg_class                 | 16838  | 16830    | a       |
| pg_class                 | 16844  | 16843    | a       |
| pg_class                 | 16852  | 16839    | a       |
| pg_class                 | 58818  | 58817    | a       |
| pg_class                 | 16504  | 16505    | a       |
| pg_class                 | 16665  | 16664    | a       |
| pg_class                 | 16877  | 16876    | a       |
| pg_class                 | 38551  | 16830    | a       |
| pg_class                 | 16714  | 16713    | a       |