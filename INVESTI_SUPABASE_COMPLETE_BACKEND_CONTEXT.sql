-- =====================================================  
-- INVESTI APP - CONTEXTO COMPLETO DEL BACKEND SUPABASE  
-- WARNING: This schema is for context only and is not meant to be run.  
-- Archivo de referencia para Windsurf/VS Code con toda la información del backend  
-- =====================================================  
  
-- CONFIGURACIÓN DE CONEXIÓN  
-- URL: https://paoliakwfoczcallnecf.supabase.co  
-- ANON KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  
  
-- =====================================================  
-- SECCIÓN 1: ESTRUCTURA COMPLETA DE TABLAS (47 tablas)  
-- =====================================================  
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
  savings_goal numeric DEFAULT 0,
  current_savings numeric DEFAULT 0,
  savings_goal_description text,
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
  created_by text,
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
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'banned'::text])),
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
  media_url text,
  message_type text,
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
CREATE TABLE public.community_post (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL,
  user_id uuid NOT NULL,
  contenido text NOT NULL,
  media_url ARRAY DEFAULT '{}'::text[],
  likes_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_pinned boolean DEFAULT false,
  pinned_by uuid,
  pinned_at timestamp with time zone,
  CONSTRAINT community_post_pkey PRIMARY KEY (id),
  CONSTRAINT community_post_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(id),
  CONSTRAINT community_post_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT community_post_pinned_by_fkey FOREIGN KEY (pinned_by) REFERENCES public.users(id)
);
CREATE TABLE public.community_post_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  parent_id uuid,
  contenido text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT community_post_comments_post_id_fkey FOREIGN KEY (community_post_id) REFERENCES public.community_post(id),
  CONSTRAINT community_post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT community_post_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.community_post_comments(id)
);
CREATE TABLE public.community_post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  is_like boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT community_post_likes_post_id_fkey FOREIGN KEY (community_post_id) REFERENCES public.community_post(id),
  CONSTRAINT community_post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.community_post_saves (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_post_saves_pkey PRIMARY KEY (id),
  CONSTRAINT community_post_saves_post_id_fkey FOREIGN KEY (community_post_id) REFERENCES public.community_post(id),
  CONSTRAINT community_post_saves_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.community_post_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  community_post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  shared_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_post_shares_pkey PRIMARY KEY (id),
  CONSTRAINT community_post_shares_post_id_fkey FOREIGN KEY (community_post_id) REFERENCES public.community_post(id),
  CONSTRAINT community_post_shares_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
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




-- Obtener todas las tablas del esquema público
| schemaname | tablename             | tableowner | tablespace | hasindexes | hasrules | hastriggers |
| ---------- | --------------------- | ---------- | ---------- | ---------- | -------- | ----------- |
| public     | badges                | postgres   | null       | true       | false    | true        |
| public     | channel_messages      | postgres   | null       | true       | false    | true        |
| public     | chat_messages         | postgres   | null       | true       | false    | true        |
| public     | chat_participants     | postgres   | null       | true       | false    | true        |
| public     | chats                 | postgres   | null       | true       | false    | true        |
| public     | comments              | postgres   | null       | true       | false    | true        |
| public     | communities           | postgres   | null       | true       | false    | true        |
| public     | community_channels    | postgres   | null       | true       | false    | true        |
| public     | community_chats       | postgres   | null       | true       | false    | true        |
| public     | community_files       | postgres   | null       | true       | false    | true        |
| public     | community_invitations | postgres   | null       | true       | false    | true        |
| public     | community_media       | postgres   | null       | true       | false    | true        |
| public     | community_members     | postgres   | null       | true       | false    | true        |
| public     | community_messages    | postgres   | null       | true       | false    | true        |
| public     | community_photos      | postgres   | null       | true       | false    | true        |
| public     | course_modules        | postgres   | null       | true       | false    | true        |
| public     | courses               | postgres   | null       | true       | false    | true        |
| public     | dismissed_suggestions | postgres   | null       | true       | false    | true        |
| public     | faqs                  | postgres   | null       | true       | false    | false       |
| public     | formularios_landing   | postgres   | null       | true       | false    | false       |
| public     | glossary              | postgres   | null       | true       | false    | false       |
| public     | goals                 | postgres   | null       | true       | false    | false       |
| public     | interests             | postgres   | null       | true       | false    | false       |
| public     | knowledge_levels      | postgres   | null       | true       | false    | false       |
| public     | lesson_progress       | postgres   | null       | true       | false    | true        |
| public     | lessons               | postgres   | null       | true       | false    | true        |
| public     | market_data           | postgres   | null       | true       | false    | false       |
| public     | messages              | postgres   | null       | true       | false    | true        |
| public     | news                  | postgres   | null       | true       | false    | true        |
| public     | news_categories       | postgres   | null       | true       | false    | false       |
| public     | notifications         | postgres   | null       | true       | false    | true        |
| public     | post_comments         | postgres   | null       | true       | false    | true        |
| public     | post_likes            | postgres   | null       | true       | false    | true        |
| public     | post_saves            | postgres   | null       | true       | false    | true        |
| public     | posts                 | postgres   | null       | true       | false    | true        |
| public     | promotion_claims      | postgres   | null       | true       | false    | true        |
| public     | promotion_views       | postgres   | null       | true       | false    | true        |
| public     | promotions            | postgres   | null       | true       | false    | true        |
| public     | reports               | postgres   | null       | true       | false    | true        |
| public     | saved_posts           | postgres   | null       | true       | false    | true        |
| public     | simulated_investments | postgres   | null       | true       | false    | true        |
| public     | simulated_portfolios  | postgres   | null       | true       | false    | true        |
| public     | user_activity         | postgres   | null       | true       | false    | true        |
| public     | user_badges           | postgres   | null       | true       | false    | true        |
| public     | user_blocks           | postgres   | null       | true       | false    | true        |
| public     | user_communities      | postgres   | null       | true       | false    | true        |
| public     | user_connections      | postgres   | null       | true       | false    | true        |
| public     | user_followers        | postgres   | null       | true       | false    | true        |
| public     | user_follows          | postgres   | null       | true       | false    | true        |
| public     | user_preferences      | postgres   | null       | true       | false    | true        |
| public     | user_settings         | postgres   | null       | true       | false    | true        |
| public     | users                 | postgres   | null       | true       | false    | true        |




-- Obtener información detallada de columnas por tabla
| table_name            | column_name           | data_type                | is_nullable | column_default                                                        | character_maximum_length |
| --------------------- | --------------------- | ------------------------ | ----------- | --------------------------------------------------------------------- | ------------------------ |
| badges                | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| badges                | codigo                | text                     | YES         | null                                                                  | null                     |
| badges                | nombre                | text                     | YES         | null                                                                  | null                     |
| badges                | descripcion           | text                     | YES         | null                                                                  | null                     |
| badges                | icono_url             | text                     | YES         | null                                                                  | null                     |
| channel_messages      | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| channel_messages      | channel_id            | uuid                     | NO          | null                                                                  | null                     |
| channel_messages      | user_id               | uuid                     | NO          | null                                                                  | null                     |
| channel_messages      | content               | text                     | NO          | null                                                                  | null                     |
| channel_messages      | message_type          | text                     | YES         | 'text'::text                                                          | null                     |
| channel_messages      | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| channel_messages      | updated_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| chat_messages         | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| chat_messages         | chat_id               | uuid                     | YES         | null                                                                  | null                     |
| chat_messages         | sender_id             | uuid                     | YES         | null                                                                  | null                     |
| chat_messages         | content               | text                     | NO          | null                                                                  | null                     |
| chat_messages         | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| chat_messages         | read_at               | timestamp with time zone | YES         | null                                                                  | null                     |
| chat_participants     | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| chat_participants     | chat_id               | uuid                     | YES         | null                                                                  | null                     |
| chat_participants     | user_id               | uuid                     | YES         | null                                                                  | null                     |
| chat_participants     | joined_at             | timestamp with time zone | YES         | now()                                                                 | null                     |
| chats                 | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| chats                 | user1_id              | uuid                     | YES         | null                                                                  | null                     |
| chats                 | user2_id              | uuid                     | YES         | null                                                                  | null                     |
| chats                 | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| chats                 | community_id          | uuid                     | YES         | null                                                                  | null                     |
| comments              | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| comments              | post_id               | uuid                     | YES         | null                                                                  | null                     |
| comments              | user_id               | uuid                     | YES         | null                                                                  | null                     |
| comments              | parent_id             | uuid                     | YES         | null                                                                  | null                     |
| comments              | contenido             | text                     | NO          | null                                                                  | null                     |
| comments              | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| communities           | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| communities           | nombre                | text                     | NO          | null                                                                  | null                     |
| communities           | descripcion           | text                     | YES         | null                                                                  | null                     |
| communities           | tipo                  | USER-DEFINED             | YES         | 'public'::community_privacy                                           | null                     |
| communities           | icono_url             | text                     | YES         | null                                                                  | null                     |
| communities           | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| communities           | created_by            | uuid                     | YES         | null                                                                  | null                     |
| communities           | member_count          | integer                  | YES         | 0                                                                     | null                     |
| communities           | name                  | text                     | YES         | null                                                                  | null                     |
| communities           | image_url             | text                     | YES         | null                                                                  | null                     |
| community_channels    | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| community_channels    | community_id          | uuid                     | YES         | null                                                                  | null                     |
| community_channels    | name                  | text                     | NO          | null                                                                  | null                     |
| community_channels    | description           | text                     | YES         | null                                                                  | null                     |
| community_channels    | type                  | text                     | YES         | 'text'::text                                                          | null                     |
| community_channels    | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| community_chats       | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| community_chats       | community_id          | uuid                     | YES         | null                                                                  | null                     |
| community_chats       | name                  | text                     | NO          | null                                                                  | null                     |
| community_chats       | created_by            | uuid                     | YES         | null                                                                  | null                     |
| community_chats       | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| community_chats       | updated_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| community_files       | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| community_files       | community_id          | uuid                     | YES         | null                                                                  | null                     |
| community_files       | user_id               | uuid                     | YES         | null                                                                  | null                     |
| community_files       | file_name             | text                     | NO          | null                                                                  | null                     |
| community_files       | file_url              | text                     | NO          | null                                                                  | null                     |
| community_files       | file_type             | text                     | NO          | null                                                                  | null                     |
| community_files       | file_size             | integer                  | YES         | null                                                                  | null                     |
| community_files       | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| community_invitations | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| community_invitations | community_id          | uuid                     | NO          | null                                                                  | null                     |
| community_invitations | from_user_id          | uuid                     | NO          | null                                                                  | null                     |
| community_invitations | to_user_id            | uuid                     | NO          | null                                                                  | null                     |
| community_invitations | status                | text                     | YES         | 'pending'::text                                                       | null                     |
| community_invitations | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| community_invitations | updated_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| community_media       | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| community_media       | community_id          | uuid                     | NO          | null                                                                  | null                     |
| community_media       | user_id               | uuid                     | NO          | null                                                                  | null                     |
| community_media       | media_type            | text                     | NO          | null                                                                  | null                     |
| community_media       | media_url             | text                     | NO          | null                                                                  | null                     |
| community_media       | file_name             | text                     | YES         | null                                                                  | null                     |
| community_media       | file_size             | bigint                   | YES         | null                                                                  | null                     |
| community_media       | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| community_members     | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| community_members     | community_id          | uuid                     | NO          | null                                                                  | null                     |
| community_members     | user_id               | uuid                     | NO          | null                                                                  | null                     |
| community_members     | role                  | text                     | YES         | 'member'::text                                                        | null                     |
| community_members     | joined_at             | timestamp with time zone | YES         | now()                                                                 | null                     |
| community_messages    | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| community_messages    | channel_id            | uuid                     | YES         | null                                                                  | null                     |
| community_messages    | user_id               | uuid                     | YES         | null                                                                  | null                     |
| community_messages    | content               | text                     | NO          | null                                                                  | null                     |
| community_messages    | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| community_photos      | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| community_photos      | community_id          | uuid                     | YES         | null                                                                  | null                     |
| community_photos      | user_id               | uuid                     | YES         | null                                                                  | null                     |
| community_photos      | image_url             | text                     | NO          | null                                                                  | null                     |
| community_photos      | caption               | text                     | YES         | null                                                                  | null                     |
| community_photos      | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| course_modules        | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| course_modules        | course_id             | uuid                     | YES         | null                                                                  | null                     |
| course_modules        | titulo                | text                     | YES         | null                                                                  | null                     |
| course_modules        | orden                 | integer                  | YES         | null                                                                  | null                     |
| courses               | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| courses               | titulo                | text                     | YES         | null                                                                  | null                     |
| courses               | descripcion           | text                     | YES         | null                                                                  | null                     |
| courses               | nivel                 | USER-DEFINED             | YES         | null                                                                  | null                     |
| courses               | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| courses               | imagen_url            | text                     | YES         | null                                                                  | null                     |
| dismissed_suggestions | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| dismissed_suggestions | user_id               | uuid                     | NO          | null                                                                  | null                     |
| dismissed_suggestions | dismissed_user_id     | uuid                     | NO          | null                                                                  | null                     |
| dismissed_suggestions | dismissed_at          | timestamp with time zone | YES         | now()                                                                 | null                     |
| faqs                  | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| faqs                  | pregunta              | text                     | YES         | null                                                                  | null                     |
| faqs                  | respuesta_md          | text                     | YES         | null                                                                  | null                     |
| formularios_landing   | id                    | integer                  | NO          | nextval('formularios_landing_id_seq'::regclass)                       | null                     |
| formularios_landing   | name                  | character varying        | NO          | null                                                                  | 255                      |
| formularios_landing   | email                 | character varying        | NO          | null                                                                  | 255                      |
| formularios_landing   | phone                 | character varying        | YES         | null                                                                  | 20                       |
| formularios_landing   | age                   | character varying        | YES         | null                                                                  | 20                       |
| formularios_landing   | goals                 | ARRAY                    | YES         | null                                                                  | null                     |
| formularios_landing   | interests             | ARRAY                    | YES         | null                                                                  | null                     |
| formularios_landing   | timestamp             | timestamp with time zone | YES         | null                                                                  | null                     |
| formularios_landing   | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| formularios_landing   | updated_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| glossary              | termino               | text                     | NO          | null                                                                  | null                     |
| glossary              | definicion_md         | text                     | YES         | null                                                                  | null                     |
| goals                 | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| goals                 | name                  | text                     | NO          | null                                                                  | null                     |
| goals                 | description           | text                     | YES         | null                                                                  | null                     |
| goals                 | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| goals                 | icon                  | text                     | YES         | null                                                                  | null                     |
| interests             | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| interests             | name                  | text                     | NO          | null                                                                  | null                     |
| interests             | icon                  | text                     | YES         | null                                                                  | null                     |
| interests             | category              | text                     | YES         | null                                                                  | null                     |
| interests             | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| knowledge_levels      | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| knowledge_levels      | name                  | text                     | NO          | null                                                                  | null                     |
| knowledge_levels      | description           | text                     | YES         | null                                                                  | null                     |
| knowledge_levels      | level_order           | integer                  | YES         | null                                                                  | null                     |
| knowledge_levels      | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| lesson_progress       | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| lesson_progress       | user_id               | uuid                     | YES         | null                                                                  | null                     |
| lesson_progress       | lesson_id             | uuid                     | YES         | null                                                                  | null                     |
| lesson_progress       | completed_at          | timestamp with time zone | YES         | now()                                                                 | null                     |
| lessons               | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| lessons               | module_id             | uuid                     | YES         | null                                                                  | null                     |
| lessons               | titulo                | text                     | YES         | null                                                                  | null                     |
| lessons               | contenido_md          | text                     | YES         | null                                                                  | null                     |
| lessons               | orden                 | integer                  | YES         | null                                                                  | null                     |
| lessons               | descripcion           | text                     | YES         | null                                                                  | null                     |
| market_data           | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| market_data           | symbol                | text                     | NO          | null                                                                  | null                     |
| market_data           | company_name          | text                     | NO          | null                                                                  | null                     |
| market_data           | current_price         | numeric                  | NO          | null                                                                  | null                     |
| market_data           | price_change          | numeric                  | NO          | null                                                                  | null                     |
| market_data           | price_change_percent  | numeric                  | NO          | null                                                                  | null                     |
| market_data           | color                 | text                     | YES         | '#111'::text                                                          | null                     |
| market_data           | is_featured           | boolean                  | YES         | false                                                                 | null                     |
| market_data           | last_updated          | timestamp with time zone | YES         | now()                                                                 | null                     |
| messages              | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| messages              | chat_id               | uuid                     | YES         | null                                                                  | null                     |
| messages              | sender_id             | uuid                     | YES         | null                                                                  | null                     |
| messages              | contenido             | text                     | NO          | null                                                                  | null                     |
| messages              | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| news                  | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| news                  | title                 | text                     | NO          | null                                                                  | null                     |
| news                  | content               | text                     | NO          | null                                                                  | null                     |
| news                  | excerpt               | text                     | YES         | null                                                                  | null                     |
| news                  | image_url             | text                     | YES         | null                                                                  | null                     |
| news                  | author_id             | uuid                     | YES         | null                                                                  | null                     |
| news                  | category              | text                     | YES         | null                                                                  | null                     |
| news                  | published_at          | timestamp with time zone | YES         | now()                                                                 | null                     |
| news                  | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| news_categories       | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| news_categories       | name                  | text                     | NO          | null                                                                  | null                     |
| news_categories       | description           | text                     | YES         | null                                                                  | null                     |
| news_categories       | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| notifications         | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| notifications         | user_id               | uuid                     | YES         | null                                                                  | null                     |
| notifications         | type                  | text                     | YES         | null                                                                  | null                     |
| notifications         | payload               | jsonb                    | YES         | null                                                                  | null                     |
| notifications         | read                  | boolean                  | YES         | false                                                                 | null                     |
| notifications         | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| notifications         | community_id          | uuid                     | YES         | null                                                                  | null                     |
| notifications         | is_read               | boolean                  | YES         | false                                                                 | null                     |
| notifications         | read_at               | timestamp with time zone | YES         | null                                                                  | null                     |
| notifications         | post_id               | uuid                     | YES         | null                                                                  | null                     |
| notifications         | from_user_id          | uuid                     | YES         | null                                                                  | null                     |
| post_comments         | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| post_comments         | post_id               | uuid                     | NO          | null                                                                  | null                     |
| post_comments         | user_id               | uuid                     | NO          | null                                                                  | null                     |
| post_comments         | contenido             | text                     | NO          | null                                                                  | null                     |
| post_comments         | parent_id             | uuid                     | YES         | null                                                                  | null                     |
| post_comments         | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| post_comments         | updated_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| post_likes            | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| post_likes            | post_id               | uuid                     | YES         | null                                                                  | null                     |
| post_likes            | user_id               | uuid                     | YES         | null                                                                  | null                     |
| post_likes            | is_like               | boolean                  | NO          | null                                                                  | null                     |
| post_likes            | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| post_saves            | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| post_saves            | post_id               | uuid                     | NO          | null                                                                  | null                     |
| post_saves            | user_id               | uuid                     | NO          | null                                                                  | null                     |
| post_saves            | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| posts                 | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| posts                 | user_id               | uuid                     | YES         | null                                                                  | null                     |
| posts                 | community_id          | uuid                     | YES         | null                                                                  | null                     |
| posts                 | contenido             | text                     | NO          | null                                                                  | null                     |
| posts                 | media_url             | ARRAY                    | YES         | '{}'::text[]                                                          | null                     |
| posts                 | likes_count           | integer                  | YES         | 0                                                                     | null                     |
| posts                 | dislikes_count        | integer                  | YES         | 0                                                                     | null                     |
| posts                 | comment_count         | integer                  | YES         | 0                                                                     | null                     |
| posts                 | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| posts                 | user_name             | text                     | YES         | null                                                                  | null                     |
| posts                 | user_avatar           | text                     | YES         | null                                                                  | null                     |
| posts                 | role                  | text                     | YES         | null                                                                  | null                     |
| posts                 | content               | text                     | YES         | null                                                                  | null                     |
| posts                 | image_url             | text                     | YES         | null                                                                  | null                     |
| posts                 | likes                 | integer                  | YES         | 0                                                                     | null                     |
| posts                 | comments              | integer                  | YES         | 0                                                                     | null                     |
| posts                 | shares                | integer                  | YES         | 0                                                                     | null                     |
| posts                 | is_pinned             | boolean                  | YES         | false                                                                 | null                     |
| posts                 | pinned_by             | uuid                     | YES         | null                                                                  | null                     |
| posts                 | pinned_at             | timestamp with time zone | YES         | null                                                                  | null                     |
| posts                 | is_edited             | boolean                  | YES         | false                                                                 | null                     |
| posts                 | updated_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| promotion_claims      | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| promotion_claims      | promotion_id          | uuid                     | NO          | null                                                                  | null                     |
| promotion_claims      | user_id               | uuid                     | NO          | null                                                                  | null                     |
| promotion_claims      | claimed_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| promotion_claims      | status                | text                     | YES         | 'claimed'::text                                                       | null                     |
| promotion_views       | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| promotion_views       | promotion_id          | uuid                     | NO          | null                                                                  | null                     |
| promotion_views       | user_id               | uuid                     | NO          | null                                                                  | null                     |
| promotion_views       | viewed_at             | timestamp with time zone | YES         | now()                                                                 | null                     |
| promotions            | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| promotions            | title                 | text                     | NO          | null                                                                  | null                     |
| promotions            | description           | text                     | YES         | null                                                                  | null                     |
| promotions            | category              | text                     | YES         | null                                                                  | null                     |
| promotions            | discount              | text                     | YES         | null                                                                  | null                     |
| promotions            | image_url             | text                     | YES         | null                                                                  | null                     |
| promotions            | valid_until           | date                     | YES         | null                                                                  | null                     |
| promotions            | location              | text                     | YES         | null                                                                  | null                     |
| promotions            | terms                 | text                     | YES         | null                                                                  | null                     |
| promotions            | active                | boolean                  | YES         | true                                                                  | null                     |
| promotions            | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| reports               | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| reports               | reporter              | uuid                     | YES         | null                                                                  | null                     |
| reports               | post_id               | uuid                     | YES         | null                                                                  | null                     |
| reports               | reason                | text                     | YES         | null                                                                  | null                     |
| reports               | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| saved_posts           | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| saved_posts           | user_id               | uuid                     | YES         | null                                                                  | null                     |
| saved_posts           | post_id               | uuid                     | YES         | null                                                                  | null                     |
| saved_posts           | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| simulated_investments | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| simulated_investments | portfolio_id          | uuid                     | YES         | null                                                                  | null                     |
| simulated_investments | tipo_activo           | text                     | YES         | null                                                                  | null                     |
| simulated_investments | monto                 | numeric                  | YES         | null                                                                  | null                     |
| simulated_investments | rendimiento           | numeric                  | YES         | null                                                                  | null                     |
| simulated_investments | fecha                 | date                     | YES         | null                                                                  | null                     |
| simulated_investments | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| simulated_portfolios  | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| simulated_portfolios  | user_id               | uuid                     | YES         | null                                                                  | null                     |
| simulated_portfolios  | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| user_activity         | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| user_activity         | user_id               | uuid                     | YES         | null                                                                  | null                     |
| user_activity         | activity_type         | USER-DEFINED             | YES         | null                                                                  | null                     |
| user_activity         | entity_id             | uuid                     | YES         | null                                                                  | null                     |
| user_activity         | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| user_badges           | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| user_badges           | user_id               | uuid                     | YES         | null                                                                  | null                     |
| user_badges           | badge_id              | uuid                     | YES         | null                                                                  | null                     |
| user_badges           | granted_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| user_blocks           | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| user_blocks           | user_id               | uuid                     | NO          | null                                                                  | null                     |
| user_blocks           | blocked_user_id       | uuid                     | NO          | null                                                                  | null                     |
| user_blocks           | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| user_communities      | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| user_communities      | user_id               | uuid                     | YES         | null                                                                  | null                     |
| user_communities      | community_id          | uuid                     | YES         | null                                                                  | null                     |
| user_communities      | joined_at             | timestamp with time zone | YES         | now()                                                                 | null                     |
| user_connections      | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| user_connections      | from_user_id          | uuid                     | NO          | null                                                                  | null                     |
| user_connections      | to_user_id            | uuid                     | NO          | null                                                                  | null                     |
| user_connections      | status                | text                     | YES         | 'pending'::text                                                       | null                     |
| user_connections      | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| user_connections      | updated_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| user_followers        | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| user_followers        | follower_id           | uuid                     | YES         | null                                                                  | null                     |
| user_followers        | following_id          | uuid                     | YES         | null                                                                  | null                     |
| user_followers        | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| user_follows          | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| user_follows          | follower_id           | uuid                     | YES         | null                                                                  | null                     |
| user_follows          | following_id          | uuid                     | YES         | null                                                                  | null                     |
| user_follows          | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| user_preferences      | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| user_preferences      | user_id               | uuid                     | NO          | null                                                                  | null                     |
| user_preferences      | language              | text                     | YES         | 'es'::text                                                            | null                     |
| user_preferences      | notifications         | boolean                  | YES         | true                                                                  | null                     |
| user_preferences      | theme                 | text                     | YES         | 'system'::text                                                        | null                     |
| user_preferences      | email_notifications   | boolean                  | YES         | true                                                                  | null                     |
| user_preferences      | push_notifications    | boolean                  | YES         | true                                                                  | null                     |
| user_preferences      | privacy_level         | text                     | YES         | 'public'::text                                                        | null                     |
| user_preferences      | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| user_preferences      | updated_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| user_settings         | id                    | uuid                     | NO          | gen_random_uuid()                                                     | null                     |
| user_settings         | user_id               | uuid                     | YES         | null                                                                  | null                     |
| user_settings         | notifications_enabled | boolean                  | YES         | true                                                                  | null                     |
| user_settings         | email_notifications   | boolean                  | YES         | true                                                                  | null                     |
| user_settings         | push_notifications    | boolean                  | YES         | true                                                                  | null                     |
| user_settings         | privacy_level         | text                     | YES         | 'public'::text                                                        | null                     |
| user_settings         | language              | text                     | YES         | 'es'::text                                                            | null                     |
| user_settings         | theme                 | text                     | YES         | 'system'::text                                                        | null                     |
| user_settings         | created_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| user_settings         | updated_at            | timestamp with time zone | YES         | now()                                                                 | null                     |
| users                 | id                    | uuid                     | NO          | null                                                                  | null                     |
| users                 | nombre                | text                     | NO          | null                                                                  | null                     |
| users                 | username              | text                     | NO          | null                                                                  | null                     |
| users                 | bio                   | text                     | YES         | null                                                                  | null                     |
| users                 | photo_url             | text                     | YES         | null                                                                  | null                     |
| users                 | pais                  | text                     | YES         | null                                                                  | null                     |
| users                 | metas                 | ARRAY                    | YES         | '{}'::text[]                                                          | null                     |
| users                 | intereses             | ARRAY                    | YES         | '{}'::text[]                                                          | null                     |
| users                 | nivel_finanzas        | USER-DEFINED             | YES         | 'none'::finance_level                                                 | null                     |
| users                 | reputacion            | integer                  | YES         | 0                                                                     | null                     |
| users                 | fecha_registro        | timestamp with time zone | YES         | now()                                                                 | null                     |
| users                 | email                 | text                     | YES         | null                                                                  | null                     |
| users                 | preferences           | jsonb                    | YES         | '{"theme": "system", "language": "es", "notifications": true}'::jsonb | null                     |
| users                 | stats                 | jsonb                    | YES         | '{"postsCount": 0, "followersCount": 0, "followingCount": 0}'::jsonb  | null                     |
| users                 | full_name             | text                     | YES         | null                                                                  | null                     |
| users                 | avatar_url            | text                     | YES         | null                                                                  | null                     |
| users                 | role                  | text                     | YES         | 'Usuario'::text                                                       | null                     |
| users                 | is_online             | boolean                  | YES         | false                                                                 | null                     |
| users                 | last_seen_at          | timestamp with time zone | YES         | now()                                                                 | null                     |
| users                 | location              | text                     | YES         | null                                                                  | null                     |
| users                 | banner_url            | text                     | YES         | null                                                                  | null                     |
| users                 | is_verified           | boolean                  | YES         | false                                                                 | null                     |





-- Obtener todas las foreign keys  
| table_name            | column_name       | foreign_table_name   | foreign_column_name | constraint_name                              |
| --------------------- | ----------------- | -------------------- | ------------------- | -------------------------------------------- |
| channel_messages      | user_id           | users                | id                  | channel_messages_user_id_fkey                |
| channel_messages      | channel_id        | community_channels   | id                  | channel_messages_channel_id_fkey             |
| chat_messages         | chat_id           | chats                | id                  | chat_messages_chat_id_fkey                   |
| chat_messages         | sender_id         | users                | id                  | chat_messages_sender_id_fkey                 |
| chat_participants     | chat_id           | chats                | id                  | chat_participants_chat_id_fkey               |
| chat_participants     | user_id           | users                | id                  | chat_participants_user_id_fkey               |
| chats                 | community_id      | communities          | id                  | chats_community_id_fkey                      |
| chats                 | user1_id          | users                | id                  | chats_user1_id_fkey                          |
| chats                 | user2_id          | users                | id                  | chats_user2_id_fkey                          |
| comments              | user_id           | users                | id                  | comments_user_id_fkey                        |
| comments              | post_id           | posts                | id                  | comments_post_id_fkey                        |
| comments              | parent_id         | comments             | id                  | comments_parent_id_fkey                      |
| communities           | created_by        | users                | id                  | communities_created_by_fkey                  |
| community_channels    | community_id      | communities          | id                  | community_channels_community_id_fkey         |
| community_chats       | community_id      | communities          | id                  | community_chats_community_id_fkey            |
| community_chats       | created_by        | users                | id                  | community_chats_created_by_fkey              |
| community_files       | community_id      | communities          | id                  | community_files_community_id_fkey            |
| community_files       | user_id           | users                | id                  | community_files_user_id_fkey                 |
| community_invitations | from_user_id      | users                | id                  | community_invitations_from_user_id_fkey      |
| community_invitations | community_id      | communities          | id                  | community_invitations_community_id_fkey      |
| community_invitations | to_user_id        | users                | id                  | community_invitations_to_user_id_fkey        |
| community_media       | community_id      | communities          | id                  | community_media_community_id_fkey            |
| community_media       | user_id           | users                | id                  | community_media_user_id_fkey                 |
| community_members     | community_id      | communities          | id                  | community_members_community_id_fkey          |
| community_members     | user_id           | users                | id                  | community_members_user_id_fkey               |
| community_messages    | user_id           | users                | id                  | community_messages_user_id_fkey              |
| community_messages    | channel_id        | community_channels   | id                  | community_messages_channel_id_fkey           |
| community_photos      | community_id      | communities          | id                  | community_photos_community_id_fkey           |
| community_photos      | user_id           | users                | id                  | community_photos_user_id_fkey                |
| course_modules        | course_id         | courses              | id                  | course_modules_course_id_fkey                |
| dismissed_suggestions | dismissed_user_id | users                | id                  | dismissed_suggestions_dismissed_user_id_fkey |
| dismissed_suggestions | user_id           | users                | id                  | dismissed_suggestions_user_id_fkey           |
| lesson_progress       | lesson_id         | lessons              | id                  | lesson_progress_lesson_id_fkey               |
| lesson_progress       | user_id           | users                | id                  | lesson_progress_user_id_fkey                 |
| lessons               | module_id         | course_modules       | id                  | lessons_module_id_fkey                       |
| messages              | chat_id           | chats                | id                  | messages_chat_id_fkey                        |
| messages              | sender_id         | users                | id                  | messages_sender_id_fkey                      |
| news                  | author_id         | users                | id                  | news_author_id_fkey                          |
| notifications         | user_id           | users                | id                  | notifications_user_id_fkey                   |
| notifications         | community_id      | communities          | id                  | notifications_community_id_fkey              |
| notifications         | post_id           | posts                | id                  | notifications_post_id_fkey                   |
| notifications         | from_user_id      | users                | id                  | notifications_from_user_id_fkey              |
| post_comments         | post_id           | posts                | id                  | post_comments_post_id_fkey                   |
| post_comments         | parent_id         | post_comments        | id                  | post_comments_parent_id_fkey                 |
| post_comments         | user_id           | users                | id                  | post_comments_user_id_fkey                   |
| post_likes            | user_id           | users                | id                  | post_likes_user_id_fkey                      |
| post_likes            | post_id           | posts                | id                  | post_likes_post_id_fkey                      |
| post_saves            | user_id           | users                | id                  | post_saves_user_id_fkey                      |
| post_saves            | post_id           | posts                | id                  | post_saves_post_id_fkey                      |
| posts                 | community_id      | communities          | id                  | posts_community_id_fkey                      |
| posts                 | pinned_by         | users                | id                  | posts_pinned_by_fkey                         |
| posts                 | user_id           | users                | id                  | posts_user_id_fkey                           |
| promotion_claims      | promotion_id      | promotions           | id                  | promotion_claims_promotion_id_fkey           |
| promotion_claims      | user_id           | users                | id                  | promotion_claims_user_id_fkey                |
| promotion_views       | user_id           | users                | id                  | promotion_views_user_id_fkey                 |
| promotion_views       | promotion_id      | promotions           | id                  | promotion_views_promotion_id_fkey            |
| reports               | post_id           | posts                | id                  | reports_post_id_fkey                         |
| reports               | reporter          | users                | id                  | reports_reporter_fkey                        |
| saved_posts           | post_id           | posts                | id                  | saved_posts_post_id_fkey                     |
| saved_posts           | user_id           | users                | id                  | saved_posts_user_id_fkey                     |
| simulated_investments | portfolio_id      | simulated_portfolios | id                  | simulated_investments_portfolio_id_fkey      |
| simulated_portfolios  | user_id           | users                | id                  | simulated_portfolios_user_id_fkey            |
| user_activity         | user_id           | users                | id                  | user_activity_user_id_fkey                   |
| user_badges           | badge_id          | badges               | id                  | user_badges_badge_id_fkey                    |
| user_badges           | user_id           | users                | id                  | user_badges_user_id_fkey                     |
| user_blocks           | blocked_user_id   | users                | id                  | user_blocks_blocked_user_id_fkey             |
| user_blocks           | user_id           | users                | id                  | user_blocks_user_id_fkey                     |
| user_communities      | community_id      | communities          | id                  | user_communities_community_id_fkey           |
| user_communities      | user_id           | users                | id                  | user_communities_user_id_fkey                |
| user_connections      | from_user_id      | users                | id                  | user_connections_from_user_id_fkey           |
| user_connections      | to_user_id        | users                | id                  | user_connections_to_user_id_fkey             |
| user_followers        | follower_id       | users                | id                  | user_followers_follower_id_fkey              |
| user_followers        | following_id      | users                | id                  | user_followers_following_id_fkey             |
| user_follows          | follower_id       | users                | id                  | user_follows_follower_id_fkey                |
| user_follows          | following_id      | users                | id                  | user_follows_following_id_fkey               |
| user_preferences      | user_id           | users                | id                  | user_preferences_user_id_fkey                |
| user_settings         | user_id           | users                | id                  | user_settings_user_id_fkey                   |




-- Obtener todos los índices  
| schemaname | tablename             | indexname                                           | indexdef                                                                                                                                         |
| ---------- | --------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| public     | badges                | badges_codigo_key                                   | CREATE UNIQUE INDEX badges_codigo_key ON public.badges USING btree (codigo)                                                                      |
| public     | badges                | badges_pkey                                         | CREATE UNIQUE INDEX badges_pkey ON public.badges USING btree (id)                                                                                |
| public     | channel_messages      | channel_messages_pkey                               | CREATE UNIQUE INDEX channel_messages_pkey ON public.channel_messages USING btree (id)                                                            |
| public     | chat_messages         | chat_messages_pkey                                  | CREATE UNIQUE INDEX chat_messages_pkey ON public.chat_messages USING btree (id)                                                                  |
| public     | chat_messages         | idx_chat_messages_chat_id                           | CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages USING btree (chat_id)                                                             |
| public     | chat_messages         | idx_chat_messages_created_at                        | CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at DESC)                                                  |
| public     | chat_participants     | chat_participants_chat_id_user_id_key               | CREATE UNIQUE INDEX chat_participants_chat_id_user_id_key ON public.chat_participants USING btree (chat_id, user_id)                             |
| public     | chat_participants     | chat_participants_pkey                              | CREATE UNIQUE INDEX chat_participants_pkey ON public.chat_participants USING btree (id)                                                          |
| public     | chats                 | chats_pkey                                          | CREATE UNIQUE INDEX chats_pkey ON public.chats USING btree (id)                                                                                  |
| public     | chats                 | idx_chats_pair_unique                               | CREATE UNIQUE INDEX idx_chats_pair_unique ON public.chats USING btree (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))                  |
| public     | comments              | comments_pkey                                       | CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id)                                                                            |
| public     | comments              | idx_comments_post                                   | CREATE INDEX idx_comments_post ON public.comments USING btree (post_id)                                                                          |
| public     | comments              | idx_comments_user                                   | CREATE INDEX idx_comments_user ON public.comments USING btree (user_id)                                                                          |
| public     | communities           | communities_pkey                                    | CREATE UNIQUE INDEX communities_pkey ON public.communities USING btree (id)                                                                      |
| public     | community_channels    | community_channels_pkey                             | CREATE UNIQUE INDEX community_channels_pkey ON public.community_channels USING btree (id)                                                        |
| public     | community_chats       | community_chats_pkey                                | CREATE UNIQUE INDEX community_chats_pkey ON public.community_chats USING btree (id)                                                              |
| public     | community_files       | community_files_pkey                                | CREATE UNIQUE INDEX community_files_pkey ON public.community_files USING btree (id)                                                              |
| public     | community_invitations | community_invitations_pkey                          | CREATE UNIQUE INDEX community_invitations_pkey ON public.community_invitations USING btree (id)                                                  |
| public     | community_media       | community_media_pkey                                | CREATE UNIQUE INDEX community_media_pkey ON public.community_media USING btree (id)                                                              |
| public     | community_members     | community_members_community_id_user_id_key          | CREATE UNIQUE INDEX community_members_community_id_user_id_key ON public.community_members USING btree (community_id, user_id)                   |
| public     | community_members     | community_members_pkey                              | CREATE UNIQUE INDEX community_members_pkey ON public.community_members USING btree (id)                                                          |
| public     | community_messages    | community_messages_pkey                             | CREATE UNIQUE INDEX community_messages_pkey ON public.community_messages USING btree (id)                                                        |
| public     | community_photos      | community_photos_pkey                               | CREATE UNIQUE INDEX community_photos_pkey ON public.community_photos USING btree (id)                                                            |
| public     | course_modules        | course_modules_course_id_orden_key                  | CREATE UNIQUE INDEX course_modules_course_id_orden_key ON public.course_modules USING btree (course_id, orden)                                   |
| public     | course_modules        | course_modules_pkey                                 | CREATE UNIQUE INDEX course_modules_pkey ON public.course_modules USING btree (id)                                                                |
| public     | courses               | courses_pkey                                        | CREATE UNIQUE INDEX courses_pkey ON public.courses USING btree (id)                                                                              |
| public     | dismissed_suggestions | dismissed_suggestions_pkey                          | CREATE UNIQUE INDEX dismissed_suggestions_pkey ON public.dismissed_suggestions USING btree (id)                                                  |
| public     | dismissed_suggestions | dismissed_suggestions_user_id_dismissed_user_id_key | CREATE UNIQUE INDEX dismissed_suggestions_user_id_dismissed_user_id_key ON public.dismissed_suggestions USING btree (user_id, dismissed_user_id) |
| public     | faqs                  | faqs_pkey                                           | CREATE UNIQUE INDEX faqs_pkey ON public.faqs USING btree (id)                                                                                    |
| public     | formularios_landing   | formularios_landing_pkey                            | CREATE UNIQUE INDEX formularios_landing_pkey ON public.formularios_landing USING btree (id)                                                      |
| public     | formularios_landing   | idx_formularios_age                                 | CREATE INDEX idx_formularios_age ON public.formularios_landing USING btree (age)                                                                 |
| public     | formularios_landing   | idx_formularios_created_at                          | CREATE INDEX idx_formularios_created_at ON public.formularios_landing USING btree (created_at)                                                   |
| public     | formularios_landing   | idx_formularios_email                               | CREATE INDEX idx_formularios_email ON public.formularios_landing USING btree (email)                                                             |
| public     | glossary              | glossary_pkey                                       | CREATE UNIQUE INDEX glossary_pkey ON public.glossary USING btree (termino)                                                                       |
| public     | goals                 | goals_pkey                                          | CREATE UNIQUE INDEX goals_pkey ON public.goals USING btree (id)                                                                                  |
| public     | interests             | interests_pkey                                      | CREATE UNIQUE INDEX interests_pkey ON public.interests USING btree (id)                                                                          |
| public     | knowledge_levels      | knowledge_levels_pkey                               | CREATE UNIQUE INDEX knowledge_levels_pkey ON public.knowledge_levels USING btree (id)                                                            |
| public     | lesson_progress       | lesson_progress_pkey                                | CREATE UNIQUE INDEX lesson_progress_pkey ON public.lesson_progress USING btree (id)                                                              |
| public     | lesson_progress       | lesson_progress_user_id_lesson_id_key               | CREATE UNIQUE INDEX lesson_progress_user_id_lesson_id_key ON public.lesson_progress USING btree (user_id, lesson_id)                             |
| public     | lessons               | lessons_module_id_orden_key                         | CREATE UNIQUE INDEX lessons_module_id_orden_key ON public.lessons USING btree (module_id, orden)                                                 |
| public     | lessons               | lessons_pkey                                        | CREATE UNIQUE INDEX lessons_pkey ON public.lessons USING btree (id)                                                                              |
| public     | market_data           | market_data_pkey                                    | CREATE UNIQUE INDEX market_data_pkey ON public.market_data USING btree (id)                                                                      |
| public     | market_data           | market_data_symbol_key                              | CREATE UNIQUE INDEX market_data_symbol_key ON public.market_data USING btree (symbol)                                                            |
| public     | messages              | idx_messages_chat_id                                | CREATE INDEX idx_messages_chat_id ON public.messages USING btree (chat_id)                                                                       |
| public     | messages              | idx_messages_created                                | CREATE INDEX idx_messages_created ON public.messages USING btree (created_at)                                                                    |
| public     | messages              | idx_messages_created_at                             | CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at DESC)                                                            |
| public     | messages              | messages_pkey                                       | CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id)                                                                            |
| public     | news                  | news_pkey                                           | CREATE UNIQUE INDEX news_pkey ON public.news USING btree (id)                                                                                    |
| public     | news_categories       | news_categories_name_key                            | CREATE UNIQUE INDEX news_categories_name_key ON public.news_categories USING btree (name)                                                        |
| public     | news_categories       | news_categories_pkey                                | CREATE UNIQUE INDEX news_categories_pkey ON public.news_categories USING btree (id)                                                              |
| public     | notifications         | notifications_pkey                                  | CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id)                                                                  |
| public     | post_comments         | post_comments_pkey                                  | CREATE UNIQUE INDEX post_comments_pkey ON public.post_comments USING btree (id)                                                                  |
| public     | post_likes            | idx_likes_post_user                                 | CREATE INDEX idx_likes_post_user ON public.post_likes USING btree (post_id, user_id)                                                             |
| public     | post_likes            | post_likes_pkey                                     | CREATE UNIQUE INDEX post_likes_pkey ON public.post_likes USING btree (id)                                                                        |
| public     | post_likes            | post_likes_post_id_user_id_key                      | CREATE UNIQUE INDEX post_likes_post_id_user_id_key ON public.post_likes USING btree (post_id, user_id)                                           |
| public     | post_saves            | post_saves_pkey                                     | CREATE UNIQUE INDEX post_saves_pkey ON public.post_saves USING btree (id)                                                                        |
| public     | post_saves            | post_saves_post_id_user_id_key                      | CREATE UNIQUE INDEX post_saves_post_id_user_id_key ON public.post_saves USING btree (post_id, user_id)                                           |
| public     | posts                 | idx_posts_created                                   | CREATE INDEX idx_posts_created ON public.posts USING btree (created_at DESC)                                                                     |
| public     | posts                 | idx_posts_user                                      | CREATE INDEX idx_posts_user ON public.posts USING btree (user_id)                                                                                |
| public     | posts                 | posts_pkey                                          | CREATE UNIQUE INDEX posts_pkey ON public.posts USING btree (id)                                                                                  |
| public     | promotion_claims      | promotion_claims_pkey                               | CREATE UNIQUE INDEX promotion_claims_pkey ON public.promotion_claims USING btree (id)                                                            |
| public     | promotion_claims      | promotion_claims_promotion_id_user_id_key           | CREATE UNIQUE INDEX promotion_claims_promotion_id_user_id_key ON public.promotion_claims USING btree (promotion_id, user_id)                     |
| public     | promotion_views       | promotion_views_pkey                                | CREATE UNIQUE INDEX promotion_views_pkey ON public.promotion_views USING btree (id)                                                              |
| public     | promotion_views       | promotion_views_promotion_id_user_id_key            | CREATE UNIQUE INDEX promotion_views_promotion_id_user_id_key ON public.promotion_views USING btree (promotion_id, user_id)                       |
| public     | promotions            | promotions_pkey                                     | CREATE UNIQUE INDEX promotions_pkey ON public.promotions USING btree (id)                                                                        |
| public     | reports               | reports_pkey                                        | CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id)                                                                              |
| public     | saved_posts           | saved_posts_pkey                                    | CREATE UNIQUE INDEX saved_posts_pkey ON public.saved_posts USING btree (id)                                                                      |
| public     | saved_posts           | saved_posts_user_id_post_id_key                     | CREATE UNIQUE INDEX saved_posts_user_id_post_id_key ON public.saved_posts USING btree (user_id, post_id)                                         |
| public     | simulated_investments | idx_invest_portfolio                                | CREATE INDEX idx_invest_portfolio ON public.simulated_investments USING btree (portfolio_id, fecha)                                              |
| public     | simulated_investments | simulated_investments_pkey                          | CREATE UNIQUE INDEX simulated_investments_pkey ON public.simulated_investments USING btree (id)                                                  |
| public     | simulated_portfolios  | simulated_portfolios_pkey                           | CREATE UNIQUE INDEX simulated_portfolios_pkey ON public.simulated_portfolios USING btree (id)                                                    |
| public     | simulated_portfolios  | simulated_portfolios_user_id_key                    | CREATE UNIQUE INDEX simulated_portfolios_user_id_key ON public.simulated_portfolios USING btree (user_id)                                        |
| public     | user_activity         | idx_activity_user                                   | CREATE INDEX idx_activity_user ON public.user_activity USING btree (user_id)                                                                     |
| public     | user_activity         | user_activity_pkey                                  | CREATE UNIQUE INDEX user_activity_pkey ON public.user_activity USING btree (id)                                                                  |
| public     | user_badges           | user_badges_pkey                                    | CREATE UNIQUE INDEX user_badges_pkey ON public.user_badges USING btree (id)                                                                      |
| public     | user_badges           | user_badges_user_id_badge_id_key                    | CREATE UNIQUE INDEX user_badges_user_id_badge_id_key ON public.user_badges USING btree (user_id, badge_id)                                       |
| public     | user_blocks           | user_blocks_pkey                                    | CREATE UNIQUE INDEX user_blocks_pkey ON public.user_blocks USING btree (id)                                                                      |
| public     | user_blocks           | user_blocks_user_id_blocked_user_id_key             | CREATE UNIQUE INDEX user_blocks_user_id_blocked_user_id_key ON public.user_blocks USING btree (user_id, blocked_user_id)                         |
| public     | user_communities      | user_communities_pkey                               | CREATE UNIQUE INDEX user_communities_pkey ON public.user_communities USING btree (id)                                                            |
| public     | user_communities      | user_communities_user_id_community_id_key           | CREATE UNIQUE INDEX user_communities_user_id_community_id_key ON public.user_communities USING btree (user_id, community_id)                     |
| public     | user_connections      | user_connections_from_user_id_to_user_id_key        | CREATE UNIQUE INDEX user_connections_from_user_id_to_user_id_key ON public.user_connections USING btree (from_user_id, to_user_id)               |
| public     | user_connections      | user_connections_pkey                               | CREATE UNIQUE INDEX user_connections_pkey ON public.user_connections USING btree (id)                                                            |
| public     | user_followers        | user_followers_follower_id_following_id_key         | CREATE UNIQUE INDEX user_followers_follower_id_following_id_key ON public.user_followers USING btree (follower_id, following_id)                 |
| public     | user_followers        | user_followers_pkey                                 | CREATE UNIQUE INDEX user_followers_pkey ON public.user_followers USING btree (id)                                                                |
| public     | user_follows          | user_follows_follower_id_following_id_key           | CREATE UNIQUE INDEX user_follows_follower_id_following_id_key ON public.user_follows USING btree (follower_id, following_id)                     |
| public     | user_follows          | user_follows_pkey                                   | CREATE UNIQUE INDEX user_follows_pkey ON public.user_follows USING btree (id)                                                                    |
| public     | user_preferences      | user_preferences_pkey                               | CREATE UNIQUE INDEX user_preferences_pkey ON public.user_preferences USING btree (id)                                                            |
| public     | user_preferences      | user_preferences_user_id_key                        | CREATE UNIQUE INDEX user_preferences_user_id_key ON public.user_preferences USING btree (user_id)                                                |
| public     | user_settings         | user_settings_pkey                                  | CREATE UNIQUE INDEX user_settings_pkey ON public.user_settings USING btree (id)                                                                  |
| public     | user_settings         | user_settings_user_id_key                           | CREATE UNIQUE INDEX user_settings_user_id_key ON public.user_settings USING btree (user_id)                                                      |
| public     | users                 | users_pkey                                          | CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id)                                                                                  |
| public     | users                 | users_username_key                                  | CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username)                                                                    |








-- Obtener todos los triggers  
| trigger_name                   | event_manipulation | event_object_table | action_statement                                     | action_timing |
| ------------------------------ | ------------------ | ------------------ | ---------------------------------------------------- | ------------- |
| trg_post_comments              | INSERT             | comments           | EXECUTE FUNCTION update_post_comments()              | AFTER         |
| trg_comment_del                | DELETE             | comments           | EXECUTE FUNCTION update_post_comments_after_delete() | AFTER         |
| community_member_count_trigger | INSERT             | community_members  | EXECUTE FUNCTION update_community_member_count()     | AFTER         |
| community_member_count_trigger | DELETE             | community_members  | EXECUTE FUNCTION update_community_member_count()     | AFTER         |
| trg_like_del                   | DELETE             | post_likes         | EXECUTE FUNCTION update_post_likes_after_delete()    | AFTER         |
| trg_post_likes                 | DELETE             | post_likes         | EXECUTE FUNCTION update_post_likes()                 | AFTER         |
| trg_post_likes                 | INSERT             | post_likes         | EXECUTE FUNCTION update_post_likes()                 | AFTER         |
| trg_badge_first_post           | INSERT             | posts              | EXECUTE FUNCTION badge_first_post()                  | AFTER         |
| sync_user_columns_trigger      | UPDATE             | users              | EXECUTE FUNCTION sync_user_columns()                 | BEFORE        |







  -- Obtener políticas de Row Level Security  
| schemaname | tablename           | policyname                                   | permissive | roles    | cmd    | qual                                                                                                                                                                                                                                                                             | with_check               |
| ---------- | ------------------- | -------------------------------------------- | ---------- | -------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| public     | chats               | chats_rw                                     | PERMISSIVE | {public} | ALL    | ((auth.uid() = user1_id) OR (auth.uid() = user2_id))                                                                                                                                                                                                                             | null                     |
| public     | comments            | comments_read                                | PERMISSIVE | {public} | SELECT | (post_id IN ( SELECT posts.id
   FROM posts
  WHERE ((posts.community_id IS NULL) OR (posts.community_id IN ( SELECT user_communities.community_id
           FROM user_communities
          WHERE (user_communities.user_id = auth.uid()))) OR (posts.user_id = auth.uid())))) | null                     |
| public     | comments            | comments_crud                                | PERMISSIVE | {public} | ALL    | (user_id = auth.uid())                                                                                                                                                                                                                                                           | (user_id = auth.uid())   |
| public     | community_media     | Community members can view community content | PERMISSIVE | {public} | SELECT | (EXISTS ( SELECT 1
   FROM community_members
  WHERE ((community_members.community_id = community_media.community_id) AND (community_members.user_id = auth.uid()))))                                                                                                            | null                     |
| public     | formularios_landing | Allow insert for all                         | PERMISSIVE | {public} | INSERT | null                                                                                                                                                                                                                                                                             | true                     |
| public     | formularios_landing | Allow read for all                           | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | goals               | goals_read                                   | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | interests           | interests_read                               | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | knowledge_levels    | knowledge_levels_read                        | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | lesson_progress     | lp_owner                                     | PERMISSIVE | {public} | ALL    | (user_id = auth.uid())                                                                                                                                                                                                                                                           | (user_id = auth.uid())   |
| public     | lessons             | lessons_read                                 | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | messages            | messages_rw                                  | PERMISSIVE | {public} | ALL    | (chat_id IN ( SELECT chats.id
   FROM chats
  WHERE ((auth.uid() = chats.user1_id) OR (auth.uid() = chats.user2_id))))                                                                                                                                                           | null                     |
| public     | notifications       | notif_owner                                  | PERMISSIVE | {public} | ALL    | (user_id = auth.uid())                                                                                                                                                                                                                                                           | (user_id = auth.uid())   |
| public     | post_comments       | Users can view all comments                  | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | post_comments       | Users can edit their own comments            | PERMISSIVE | {public} | UPDATE | (auth.uid() = user_id)                                                                                                                                                                                                                                                           | null                     |
| public     | post_comments       | Users can create comments                    | PERMISSIVE | {public} | INSERT | null                                                                                                                                                                                                                                                                             | (auth.uid() = user_id)   |
| public     | post_likes          | likes_crud                                   | PERMISSIVE | {public} | ALL    | (user_id = auth.uid())                                                                                                                                                                                                                                                           | (user_id = auth.uid())   |
| public     | post_saves          | Users can manage their own saved posts       | PERMISSIVE | {public} | ALL    | (auth.uid() = user_id)                                                                                                                                                                                                                                                           | null                     |
| public     | posts               | posts_read                                   | PERMISSIVE | {public} | SELECT | ((user_id = auth.uid()) OR (community_id IS NULL) OR (community_id IN ( SELECT user_communities.community_id
   FROM user_communities
  WHERE (user_communities.user_id = auth.uid()))))                                                                                         | null                     |
| public     | posts               | Posts are publicly readable                  | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | posts               | Users can create posts                       | PERMISSIVE | {public} | INSERT | null                                                                                                                                                                                                                                                                             | (auth.uid() IS NOT NULL) |
| public     | posts               | posts_crud                                   | PERMISSIVE | {public} | ALL    | (user_id = auth.uid())                                                                                                                                                                                                                                                           | (user_id = auth.uid())   |
| public     | promotion_views     | Users can view their own promotion views     | PERMISSIVE | {public} | ALL    | (auth.uid() = user_id)                                                                                                                                                                                                                                                           | null                     |
| public     | promotions          | promotions_read                              | PERMISSIVE | {public} | SELECT | (active = true)                                                                                                                                                                                                                                                                  | null                     |
| public     | reports             | reports_owner                                | PERMISSIVE | {public} | ALL    | (reporter = auth.uid())                                                                                                                                                                                                                                                          | (reporter = auth.uid())  |
| public     | user_badges         | system_can_award_badges                      | PERMISSIVE | {public} | INSERT | null                                                                                                                                                                                                                                                                             | true                     |
| public     | user_badges         | ub_read                                      | PERMISSIVE | {public} | SELECT | (user_id = auth.uid())                                                                                                                                                                                                                                                           | null                     |
| public     | user_blocks         | ub_crud                                      | PERMISSIVE | {public} | ALL    | (auth.uid() = user_id)                                                                                                                                                                                                                                                           | (auth.uid() = user_id)   |
| public     | user_blocks         | ub_read                                      | PERMISSIVE | {public} | SELECT | (auth.uid() = user_id)                                                                                                                                                                                                                                                           | null                     |
| public     | user_communities    | users_can_join_communities                   | PERMISSIVE | {public} | INSERT | null                                                                                                                                                                                                                                                                             | (auth.uid() = user_id)   |
| public     | user_connections    | Users can manage their connections           | PERMISSIVE | {public} | ALL    | ((auth.uid() = from_user_id) OR (auth.uid() = to_user_id))                                                                                                                                                                                                                       | null                     |
| public     | user_follows        | Users can view all follows                   | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | user_follows        | Users can manage their own follows           | PERMISSIVE | {public} | ALL    | (auth.uid() = follower_id)                                                                                                                                                                                                                                                       | null                     |
| public     | user_preferences    | Users can manage their own preferences       | PERMISSIVE | {public} | ALL    | (auth.uid() = user_id)                                                                                                                                                                                                                                                           | null                     |
| public     | users               | users_update                                 | PERMISSIVE | {public} | UPDATE | (auth.uid() = id)                                                                                                                                                                                                                                                                | null                     |
| public     | users               | users_read                                   | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | users               | Users can update their own profile           | PERMISSIVE | {public} | UPDATE | (auth.uid() = id)                                                                                                                                                                                                                                                                | null                     |
| public     | users               | Users can read their own profile             | PERMISSIVE | {public} | SELECT | (auth.uid() = id)                                                                                                                                                                                                                                                                | null                     |
| public     | users               | Users can insert their own profile           | PERMISSIVE | {public} | INSERT | null                                                                                                                                                                                                                                                                             | (auth.uid() = id)        |







-- Obtener todas las funciones del esquema público  
| routine_name                      | routine_type | data_type    | routine_definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------- | ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| add_comment                       | FUNCTION     | uuid         |  DECLARE comment_id uuid; BEGIN INSERT INTO comments (post_id, user_id, contenido) VALUES (p_post_id, p_user_id, p_content) RETURNING id INTO comment_id; UPDATE posts SET comment_count = comment_count + 1 WHERE id = p_post_id; RETURN comment_id; END;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| after_like_delete                 | FUNCTION     | trigger      | 
begin
  perform public.update_post_likes();
  return null;
end                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| badge_first_post                  | FUNCTION     | trigger      | 
declare v_badge uuid;
begin
  if (select count(*) from public.posts where user_id = new.user_id) = 1 then
    select id into v_badge from public.badges where codigo = 'first_post';
    insert into public.user_badges(user_id,badge_id)
    values (new.user_id,v_badge)
    on conflict do nothing;
  end if;
  return null;
end;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| get_community_stats               | FUNCTION     | json         |   
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
                           |
| get_personalized_feed             | FUNCTION     | USER-DEFINED |   
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| get_personalized_feed             | FUNCTION     | record       |   
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| get_recommended_communities       | FUNCTION     | USER-DEFINED |   
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| get_recommended_users             | FUNCTION     | record       | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| get_suggested_communities         | FUNCTION     | record       |   
BEGIN  
    RETURN QUERY  
    SELECT   
        c.id,  
        COALESCE(c.nombre, c.name) as name,  
        COALESCE(c.avatar_url, c.icono_url, c.image_url) as imageUrl,  
        COALESCE(c.member_count, 0::BIGINT) as memberCount,  
        EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_id = c.id AND cm.user_id = p_user_id) as isMember  
    FROM communities c  
    WHERE NOT EXISTS(  
        SELECT 1 FROM community_members cm   
        WHERE cm.community_id = c.id AND cm.user_id = p_user_id  
    )  
    ORDER BY COALESCE(c.member_count, 0) DESC  
    LIMIT p_limit;  
END;  
                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| get_suggested_people              | FUNCTION     | record       |   
BEGIN  
    RETURN QUERY  
    SELECT u.id, u.nombre, u.full_name, u.photo_url, u.avatar_url, u.role, u.intereses  
    FROM users u  
    WHERE u.id != p_user_id  
    AND u.id NOT IN (  
        SELECT dismissed_user_id FROM dismissed_suggestions   
        WHERE user_id = p_user_id  
    )  
    AND u.id NOT IN (  
        SELECT to_user_id FROM user_connections   
        WHERE from_user_id = p_user_id  
    )  
    ORDER BY RANDOM()  
    LIMIT p_limit;  
END;  
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| get_user_communities              | FUNCTION     | record       |   
BEGIN  
  RETURN QUERY  
  SELECT c.id, c.nombre, c.icono_url  
  FROM communities c  
  INNER JOIN user_communities uc ON c.id = uc.community_id  
  WHERE uc.user_id = p_user_id;  
END;  
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| get_user_stats                    | FUNCTION     | record       |   
BEGIN  
  RETURN QUERY  
  SELECT   
    (SELECT COUNT(*)::INTEGER FROM user_follows WHERE following_id = user_id) as followers_count,  
    (SELECT COUNT(*)::INTEGER FROM user_follows WHERE follower_id = user_id) as following_count,  
    (SELECT COUNT(*)::INTEGER FROM posts WHERE posts.user_id = get_user_stats.user_id) as posts_count;  
END;  
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| getuserquickstats                 | FUNCTION     | record       |   
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| handle_new_user                   | FUNCTION     | trigger      |   
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| increment_post_comments           | FUNCTION     | void         |   
BEGIN  
    UPDATE posts   
    SET comment_count = COALESCE(comment_count, 0) + 1,  
        updated_at = NOW()  
    WHERE id = post_id;  
END;  
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| search_all                        | FUNCTION     | record       |   
BEGIN  
  RETURN QUERY  
  -- Buscar usuarios  
  SELECT   
    'user'::TEXT as type,  
    u.id,  
    u.nombre as title,  
    u.bio as content,  
    u.photo_url as image_url,  
    u.fecha_registro as created_at  
  FROM users u  
  WHERE u.nombre ILIKE '%' || search_term || '%'  
     OR u.username ILIKE '%' || search_term || '%'  
    
  UNION ALL  
    
  -- Buscar posts  
  SELECT   
    'post'::TEXT as type,  
    p.id,  
    LEFT(p.contenido, 100) as title,  
    p.contenido as content,  
    NULL::TEXT as image_url,  
    p.created_at  
  FROM posts p  
  WHERE p.contenido ILIKE '%' || search_term || '%'  
    
  UNION ALL  
    
  -- Buscar comunidades  
  SELECT   
    'community'::TEXT as type,  
    c.id,  
    c.name as title,  
    c.description as content,  
    c.image_url,  
    c.created_at  
  FROM communities c  
  WHERE c.name ILIKE '%' || search_term || '%'  
     OR c.description ILIKE '%' || search_term || '%'  
    
  ORDER BY created_at DESC  
  LIMIT 50;  
END;  
 |
| share_post                        | FUNCTION     | void         |  BEGIN INSERT INTO post_shares (post_id, user_id) VALUES (p_post_id, p_user_id); UPDATE posts SET shares_count = shares_count + 1 WHERE id = p_post_id; END;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| sync_user_columns                 | FUNCTION     | trigger      |   
BEGIN  
  -- Sincronizar full_name con nombre  
  IF NEW.full_name IS DISTINCT FROM OLD.full_name THEN  
    NEW.nombre = COALESCE(NEW.full_name, NEW.nombre);  
  END IF;  
    
  IF NEW.nombre IS DISTINCT FROM OLD.nombre THEN  
    NEW.full_name = COALESCE(NEW.nombre, NEW.full_name);  
  END IF;  
    
  -- Sincronizar avatar_url con photo_url  
  IF NEW.avatar_url IS DISTINCT FROM OLD.avatar_url THEN  
    NEW.photo_url = COALESCE(NEW.avatar_url, NEW.photo_url);  
  END IF;  
    
  IF NEW.photo_url IS DISTINCT FROM OLD.photo_url THEN  
    NEW.avatar_url = COALESCE(NEW.photo_url, NEW.avatar_url);  
  END IF;  
    
  RETURN NEW;  
END;  
                                                                                                                                                                                                                                                                                                                                                                                               |
| update_community_member_count     | FUNCTION     | trigger      |   
BEGIN  
    IF TG_OP = 'INSERT' THEN  
        UPDATE communities   
        SET member_count = COALESCE(member_count, 0) + 1  
        WHERE id = NEW.community_id;  
        RETURN NEW;  
    ELSIF TG_OP = 'DELETE' THEN  
        UPDATE communities   
        SET member_count = GREATEST(COALESCE(member_count, 0) - 1, 0)  
        WHERE id = OLD.community_id;  
        RETURN OLD;  
    END IF;  
    RETURN NULL;  
END;  
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| update_post_comments              | FUNCTION     | trigger      | 
begin
  update public.posts
  set   comment_count = (select count(*) from public.comments where post_id = new.post_id)
  where id = new.post_id;
  return null;
end;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| update_post_comments_after_delete | FUNCTION     | trigger      | 
begin
  update public.posts
  set   comment_count = comment_count - 1
  where id = old.post_id;
  return null;
end                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| update_post_likes                 | FUNCTION     | trigger      | 
begin
  update public.posts
  set   likes_count    = (select count(*) from public.post_likes where post_id = new.post_id and is_like),
        dislikes_count = (select count(*) from public.post_likes where post_id = new.post_id and not is_like)
  where id = new.post_id;
  return null;
end;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| update_post_likes_after_delete    | FUNCTION     | trigger      | 
begin
  perform public.update_post_likes();
  return null;
end                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| update_user_interests             | FUNCTION     | void         |   
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |







-- Obtener información de buckets de storage  
| id               | name             | public | created_at                    | updated_at                    |
| ---------------- | ---------------- | ------ | ----------------------------- | ----------------------------- |
| community-media  | community-media  | true   | 2025-09-08 21:27:55.429343+00 | 2025-09-08 21:27:55.429343+00 |
| Images_Intereses | Images_Intereses | false  | 2025-09-19 15:12:19.563953+00 | 2025-09-19 15:12:19.563953+00 |




-- Usuarios (primeros 20 registros)
| id                                   | nombre         | username           | email                               | pais      | nivel_finanzas | reputacion | is_online | fecha_registro                | preferences                                             | stats                                                  |
| ------------------------------------ | -------------- | ------------------ | ----------------------------------- | --------- | -------------- | ---------- | --------- | ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| 11b85677-cc3b-46dd-9687-04227ecf8a5b | Usuario        | testuser_g2w1l4    | testuser_1757635658248@example.com  | null      | none           | 0          | false     | 2025-09-12 00:07:38.307935+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| c7a86e69-c90b-4409-a845-973596cab33f | Usuario        | user_c7a86e69      | testuser1_1757635557570@example.com | null      | none           | 0          | false     | 2025-09-12 00:05:57.822801+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| 411e16db-fd78-48b6-a1aa-849de7b13624 | Usuario        | testuser_bsrryo    | testuser_1757376798288@example.com  | null      | none           | 0          | false     | 2025-09-09 00:13:13.818939+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| 6284005b-e0c3-4864-bfa7-caa7e54b2741 | Usuario        | testuser_bsn52i    | testuser_1757376581994@example.com  | null      | none           | 0          | false     | 2025-09-09 00:09:39.056667+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| fa84c0cb-27c2-4f81-9f5b-5a4c77be9844 | ABCDE          | abcde              | abcde@gmail.com                     |           | none           | 0          | false     | 2025-09-08 18:51:10.799+00    | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| db96e748-9bfa-4d79-bfcc-a5a92f5daf98 | SEBASTIAN 22   | sebastian33        | sebastian33@gmail.com               |           | none           | 0          | false     | 2025-09-08 17:24:37.092+00    | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| e4c64fb0-56ff-4c52-9504-0368f8afa298 | adonas         | damda              | ndasd@gmail.com                     |           | none           | 0          | false     | 2025-09-08 17:23:26.844+00    | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| 871d0db8-d289-4218-9a30-cd2aa7bb04d7 | Usuario        | user_1757351677872 | abc@gmail.com                       |           | none           | 0          | false     | 2025-09-08 17:14:37.872+00    | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| c8a3feee-18bf-4ea9-bf0d-3f5ae22fea81 | abede          | abede              | abede@gmail.com                     |           | none           | 0          | false     | 2025-09-08 17:13:35.932+00    | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| 7eadd2a3-1d62-4534-a6ec-cf96fb076422 | ABC2           | abc2               | abc2@gmail.com                      |           | none           | 0          | false     | 2025-09-08 17:11:02.133+00    | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| d7a4a6a3-7e5c-4e47-99d8-c7869fdddc37 | SEBASTIAN2     | SEBASTIAN2         | sebas23@gmail.com                   |           | none           | 0          | false     | 2025-09-08 17:08:32.475+00    | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| aa28c564-af36-4fa9-9951-8a15725bd606 | Usuario        | SEBAS              | sebas22@gmail.com                   | null      | none           | 0          | false     | 2025-09-08 17:02:48.584215+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| f9e38085-2759-4142-9adb-7e8f00290411 | Usuario        | Gabriel11          | gabriel@gmail.com                   | null      | none           | 0          | false     | 2025-09-08 16:59:57.613142+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| 9f20c2fe-bb6d-4b8b-ab3d-b3907ed72282 | Test Auth User | testauth_mfbc7o7b  | testauth_1757348986439@investi.com  | Nicaragua | intermediate   | 0          | false     | 2025-09-08 16:29:42.152314+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| 3b944fd2-1a38-4e20-9fb3-63fa3572c051 | Test Auth User | testauth_mfbacxiy  | testauth_1757345872570@investi.com  | Nicaragua | intermediate   | 0          | false     | 2025-09-08 15:37:47.205731+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| 930f6088-3f7e-4a02-aefa-cf664633da55 | Test Auth User | testauth_mfba8a4e  | testauth_1757345655614@investi.com  | Nicaragua | none           | 0          | false     | 2025-09-08 15:34:10.364242+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| 5fe2cf58-6be0-4f2d-8d11-78bf40985771 | Usuario        | testauth_mfba4e70  | testauth_1757345474267@investi.com  | null      | none           | 0          | false     | 2025-09-08 15:31:09.476785+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| 36d98a94-54ac-4cea-9e50-d1410b43a576 | Usuario        | testuser_mfb3rebj  | test_1757334790207@investi.com      | null      | none           | 0          | false     | 2025-09-08 12:33:04.754701+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| eb50fabd-6c90-4f3d-ab1a-cfc8f42c9564 | Usuario        | testuser_mfb3r322  | test_1757334775610@investi.com      | null      | none           | 0          | false     | 2025-09-08 12:32:50.16057+00  | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |
| 1afd7d97-df6f-4bc1-840f-67f86ee0594c | Usuario        | testuser_mfb3qo5j  | test_1757334756295@investi.com      | null      | none           | 0          | false     | 2025-09-08 12:32:30.861888+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} |








-- Posts con información de usuario (primeros 20)  
| id                                   | contenido                                                                                                                                                                       | likes_count | comment_count | created_at                    | nombre  | username | avatar_url | community_name |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------- | ----------------------------- | ------- | -------- | ---------- | -------------- |
| b0150eb7-8d24-4486-8447-e91937ce38fd | Invertir en la bolsa puede ser una excelente manera de hacer crecer tu patrimonio a largo plazo. La clave está en la diversificación y en mantener una estrategia disciplinada. | 100         | 15            | 2025-08-17 16:08:01.220564+00 | user  1 | user  1  | null       | null           |
| bf827ee9-78cd-4c51-94a9-997f16a90fc2 | La importancia de diversificar en inversiones no puede ser subestimada. Nunca pongas todos tus huevos en una sola canasta, especialmente en mercados volátiles.                 | 55          | 8             | 2025-08-17 16:08:01.220564+00 | user  2 | user  2  | null       | null           |
| 90c53bf1-99b7-443a-b0f9-c7863cd0d48f | Invertir en la bolsa puede ser una excelente manera de hacer crecer tu patrimonio a largo plazo. La clave está en la diversificación y en mantener una estrategia disciplinada. | 100         | 15            | 2025-08-17 16:01:50.652263+00 | null    | null     | null       | null           |
| 2087bffa-379d-475b-a892-69f2e2365656 | La importancia de diversificar en inversiones no puede ser subestimada. Nunca pongas todos tus huevos en una sola canasta, especialmente en mercados volátiles.                 | 55          | 8             | 2025-08-17 16:01:50.652263+00 | null    | null     | null       | null           |
| 00881e9b-5398-465f-ac02-7ce873c17966 | Invertir en la bolsa puede ser una excelente manera de hacer crecer tu patrimonio a largo plazo. La clave está en la diversificación y en mantener una estrategia disciplinada. | 100         | 15            | 2025-08-17 16:01:23.849041+00 | user  1 | user  1  | null       | null           |
| 042df4e9-16c3-4a5a-bd8c-22f64db5d8e2 | Post demo de user 99                                                                                                                                                            | 1           | 20            | 2025-08-08 06:48:21.182897+00 | user 99 | user 99  | null       | null           |
| 049b3759-2381-463c-b96c-5b9badca0f3b | Post demo de user 43                                                                                                                                                            | 0           | 18            | 2025-08-08 06:48:21.182897+00 | user 43 | user 43  | null       | null           |
| 0c1ff051-c216-4036-a096-16bdfd1f7d3e | Post demo de user 91                                                                                                                                                            | 1           | 16            | 2025-08-08 06:48:21.182897+00 | user 91 | user 91  | null       | null           |
| 10d398b7-c77a-4c8e-9875-dfa8b9c7cd21 | Post demo de user 94                                                                                                                                                            | 0           | 18            | 2025-08-08 06:48:21.182897+00 | user 94 | user 94  | null       | null           |
| 12115658-bb07-41af-b91f-7b8df1afde94 | Post demo de user 63                                                                                                                                                            | 0           | 24            | 2025-08-08 06:48:21.182897+00 | user 63 | user 63  | null       | null           |
| 1376c81d-d12c-4603-a8c7-cd31b7cdd5a7 | Post demo de user 96                                                                                                                                                            | 1           | 18            | 2025-08-08 06:48:21.182897+00 | user 96 | user 96  | null       | null           |
| 1379e39a-3a6f-472c-ad3f-eefe1b6d83f6 | Post demo de user 26                                                                                                                                                            | 0           | 18            | 2025-08-08 06:48:21.182897+00 | user 26 | user 26  | null       | null           |
| 139af62b-fa57-417f-ba6f-b54ae8eea871 | Post demo de user 52                                                                                                                                                            | 0           | 22            | 2025-08-08 06:48:21.182897+00 | user 52 | user 52  | null       | null           |
| 13a6004e-5142-4d88-8fc9-18f159fb2b10 | Post demo de user 20                                                                                                                                                            | 0           | 24            | 2025-08-08 06:48:21.182897+00 | user 20 | user 20  | null       | null           |
| 15395efe-d8e3-42a9-bf53-d62b2b5365da | Post demo de user 90                                                                                                                                                            | 0           | 24            | 2025-08-08 06:48:21.182897+00 | user 90 | user 90  | null       | null           |
| 18a469d3-b5e9-4708-b25f-0526129a5931 | Post demo de user 14                                                                                                                                                            | 1           | 23            | 2025-08-08 06:48:21.182897+00 | user 14 | user 14  | null       | null           |
| 1998ad4d-2bef-44d7-9dab-b0df3a1461d0 | Post demo de user 45                                                                                                                                                            | 0           | 14            | 2025-08-08 06:48:21.182897+00 | user 45 | user 45  | null       | null           |
| 1b99d382-f0d5-4a53-971e-e965054e0712 | Post demo de user 22                                                                                                                                                            | 1           | 22            | 2025-08-08 06:48:21.182897+00 | user 22 | user 22  | null       | null           |
| 1c933bcb-0ae4-42e2-a2f7-be4eb271942c | Post demo de user 80                                                                                                                                                            | 0           | 19            | 2025-08-08 06:48:21.182897+00 | user 80 | user 80  | null       | null           |
| 1da3dfcd-fa44-469b-a8a2-acda3673df2e | Post demo de user 59                                                                                                                                                            | 1           | 15            | 2025-08-08 06:48:21.182897+00 | user 59 | user 59  | null       | null           |





-- Comunidades con estadísticas
| id                                   | nombre                         | descripcion                                                                    | tipo   | member_count | created_at                    | created_by |
| ------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------ | ------ | ------------ | ----------------------------- | ---------- |
| 4993f354-fb56-4036-b6f6-36a373a6057a | Nueva comunidad                | demo                                                                           | public | 0            | 2025-08-08 06:11:35.148631+00 | null       |
| c4b807db-bb51-4ff3-8ef8-94d093563d37 | Futuros                        | Trading en futuros                                                             | public | 0            | 2025-08-08 06:14:58.049299+00 | null       |
| ed0e8636-8bc5-4789-a1c2-6cb93cd9bb8b | IA y Finanzas                  | Aplicaciones de IA                                                             | public | 0            | 2025-08-08 06:14:58.049299+00 | null       |
| f9aac7d5-3050-4dd7-ad8e-19044ca9d9df | Fondos Indexados               | Comunidad Boglehead                                                            | public | 0            | 2025-08-08 06:14:58.049299+00 | null       |
| 4fcbed7d-fa27-4f0a-aa7f-80d779282ccd | Economía Global                | Noticias macro y geopolítica                                                   | public | 0            | 2025-08-08 06:14:58.049299+00 | null       |
| f6f91a89-6240-4f53-8e15-fac747ab4649 | Finanzas Personales            | Ahorro y presupuestos                                                          | public | 0            | 2025-08-08 06:14:58.049299+00 | null       |
| e31e6bf1-00b2-4221-a58a-f615f351f435 | Inversiones para principiantes | Comunidad para aprender sobre inversiones básicas y estrategias de mercado     | public | 0            | 2025-08-18 04:18:47.966554+00 | null       |
| ef9df0b1-9513-451e-a5c7-02710b6e9790 | Finanzas Personales            | Tips y estrategias para manejar tus finanzas personales y presupuesto familiar | public | 0            | 2025-08-18 04:18:47.966554+00 | null       |
| 0683be87-5499-4ea7-b04b-523714c6af38 | Inversiones para principiantes | Comunidad para aprender sobre inversiones básicas                              | public | 0            | 2025-08-18 05:09:18.944872+00 | null       |
| 4da4e3e3-11c9-490d-a2c8-65f45e52ca3a | Criptomonedas Nicaragua        | Discusión sobre Bitcoin y criptomonedas                                        | public | 0            | 2025-08-18 05:09:18.944872+00 | null       |
| a26a76f3-0c8f-417e-b3ea-b8e116642126 | Finanzas Personales            | Tips para manejar finanzas personales                                          | public | 0            | 2025-08-18 05:09:18.944872+00 | null       |



-- Notificaciones recientes
| id                                   | type    | payload                        | is_read | created_at                    | user_name |
| ------------------------------------ | ------- | ------------------------------ | ------- | ----------------------------- | --------- |
| 1ef5a22b-175e-47c4-9480-2fc8c85ad1c5 | welcome | {"msg":"Bienvenido a Investï"} | false   | 2025-08-08 06:29:20.405468+00 | Admin     |



-- Top posts por likes  
| id                                   | contenido                                                                                                                                                                       | likes_count | nombre  | username |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------- | -------- |
| b0150eb7-8d24-4486-8447-e91937ce38fd | Invertir en la bolsa puede ser una excelente manera de hacer crecer tu patrimonio a largo plazo. La clave está en la diversificación y en mantener una estrategia disciplinada. | 100         | user  1 | user  1  |
| 00881e9b-5398-465f-ac02-7ce873c17966 | Invertir en la bolsa puede ser una excelente manera de hacer crecer tu patrimonio a largo plazo. La clave está en la diversificación y en mantener una estrategia disciplinada. | 100         | user  1 | user  1  |
| bf827ee9-78cd-4c51-94a9-997f16a90fc2 | La importancia de diversificar en inversiones no puede ser subestimada. Nunca pongas todos tus huevos en una sola canasta, especialmente en mercados volátiles.                 | 55          | user  2 | user  2  |
| 863ce465-4f62-4ea7-959a-723776009768 | Post demo de user 98                                                                                                                                                            | 2           | user 98 | user 98  |
| 36af2e05-ec04-4027-845e-97a992a06078 | Post demo de user 72                                                                                                                                                            | 2           | user 72 | user 72  |
| 8586a79c-366f-43d8-b810-cc9c844a4398 | Post demo de user 28                                                                                                                                                            | 2           | user 28 | user 28  |
| 5443c409-89d0-4e57-beb4-be9c088f4663 | Post demo de user 43                                                                                                                                                            | 2           | user 43 | user 43  |
| 726af4e6-03d2-4136-8abd-9a0eba0c463c | Post demo de user 19                                                                                                                                                            | 2           | user 19 | user 19  |
| 7460020b-3ec3-454a-bbcc-f23a13179b90 | Post demo de user 85                                                                                                                                                            | 2           | user 85 | user 85  |
| 9b8a0926-dca3-4519-8272-190530fab7c7 | Post demo de user 71                                                                                                                                                            | 2           | user 71 | user 71  |




-- Usuarios más activos

| id                                   | nombre  | username | reputacion | posts_count |
| ------------------------------------ | ------- | -------- | ---------- | ----------- |
| 94a06e04-b6d6-4414-a6d7-4b87a756f9f9 | user  1 | user  1  | 0          | 4           |
| f0532d69-71bc-46a2-80dd-c7096295a3e3 | user  2 | user  2  | 0          | 3           |
| b6d622d8-53f5-47b0-876e-ca7995df2f97 | user 87 | user 87  | 0          | 2           |
| 4ccc839f-d5e8-44b5-a5dd-7c2da0f25dc1 | user 33 | user 33  | 0          | 2           |
| 66241782-b5ed-4a09-8f68-1d53e4f3f8e5 | user 54 | user 54  | 0          | 2           |
| d99f1b9f-1260-435e-8a6d-43589f96745b | user 23 | user 23  | 0          | 2           |
| 043733c7-e17d-40b8-bfa3-83b1809dfd99 | user 68 | user 68  | 0          | 2           |
| 98d1a003-b5af-4fb1-aae5-b4d4532f7186 | user 94 | user 94  | 0          | 2           |
| 919e81a1-60d9-41a5-9541-7a47d23246c1 | user 72 | user 72  | 0          | 2           |
| 2cdc4d7a-4ba7-4d47-b725-10028cb708f4 | user 40 | user 40  | 0          | 2           |



-- Cursos con lecciones
Success. No rows returned




-- Market data actual
| symbol | company_name       | current_price | price_change | price_change_percent | is_featured | last_updated                  |
| ------ | ------------------ | ------------- | ------------ | -------------------- | ----------- | ----------------------------- |
| AAPL   | Apple Inc.         | 198.24        | 4.85         | 2.50                 | true        | 2025-08-18 13:34:44.789435+00 |
| LYFT   | Lyft Inc.          | 410.01        | 10.01        | 2.50                 | true        | 2025-08-18 13:34:44.789435+00 |
| MSFT   | Microsoft Corp.    | 213.10        | 5.21         | 2.50                 | false       | 2025-08-18 13:34:44.789435+00 |
| GOOGL  | Alphabet Inc.      | 213.10        | 2.31         | 1.10                 | false       | 2025-08-18 13:34:44.789435+00 |
| SPOT   | Spotify Technology | 213.10        | -5.45        | -2.50                | false       | 2025-08-18 13:34:44.789435+00 |






-- Promociones activas
| id                                   | title                    | description                                         | category    | discount | valid_until | location | active |
| ------------------------------------ | ------------------------ | --------------------------------------------------- | ----------- | -------- | ----------- | -------- | ------ |
| 70c9d0e6-f73c-4995-adc3-9ad8f908c40e | Descuento en Inversiones | Obtén un descuento especial en tu primera inversión | Inversiones | 20% OFF  | 2024-12-31  | Online   | true   |
| 0030f1af-d44e-4500-9e04-1e96fb469f74 | Descuento en Inversiones | Obtén un descuento especial en tu primera inversión | Inversiones | 20% OFF  | 2024-12-31  | Online   | true   |



-- Todas las tablas con detalles completos
| table_name            | table_type | table_comment                                                                   | table_size | inserts | updates | deletes | live_tuples |
| --------------------- | ---------- | ------------------------------------------------------------------------------- | ---------- | ------- | ------- | ------- | ----------- |
| comments              | BASE TABLE | null                                                                            | 1168 kB    | 4       | 0       | 3       | 0           |
| posts                 | BASE TABLE | null                                                                            | 632 kB     | 17      | 6       | 6       | 5           |
| users                 | BASE TABLE | Auth: Stores user login data within a secure schema.                            | 216 kB     | 31      | 274     | 0       | 127         |
| users                 | BASE TABLE | null                                                                            | 152 kB     | 25      | 322     | 0       | 124         |
| simulated_investments | BASE TABLE | null                                                                            | 128 kB     | 0       | 0       | 0       | 0           |
| formularios_landing   | BASE TABLE | Almacena los datos de los formularios enviados desde la landing page de Investi | 112 kB     | 50      | 0       | 0       | 50          |
| post_likes            | BASE TABLE | null                                                                            | 88 kB      | 21      | 0       | 0       | 3           |
| user_communities      | BASE TABLE | null                                                                            | 80 kB      | 9       | 0       | 0       | 4           |
| user_settings         | BASE TABLE | null                                                                            | 80 kB      | 101     | 0       | 0       | 101         |
| user_badges           | BASE TABLE | null                                                                            | 72 kB      | 7       | 0       | 0       | 6           |
| news_categories       | BASE TABLE | null                                                                            | 48 kB      | 4       | 0       | 0       | 4           |
| badges                | BASE TABLE | null                                                                            | 48 kB      | 0       | 0       | 0       | 0           |
| market_data           | BASE TABLE | null                                                                            | 48 kB      | 5       | 0       | 0       | 5           |
| lesson_progress       | BASE TABLE | null                                                                            | 40 kB      | 0       | 0       | 0       | 0           |
| messages              | BASE TABLE | null                                                                            | 40 kB      | 0       | 0       | 0       | 0           |
| user_blocks           | BASE TABLE | null                                                                            | 40 kB      | 0       | 0       | 0       | 0           |
| simulated_portfolios  | BASE TABLE | null                                                                            | 40 kB      | 0       | 0       | 0       | 0           |
| glossary              | BASE TABLE | null                                                                            | 32 kB      | 0       | 0       | 0       | 0           |
| faqs                  | BASE TABLE | null                                                                            | 32 kB      | 0       | 0       | 0       | 0           |
| interests             | BASE TABLE | null                                                                            | 32 kB      | 24      | 12      | 16      | 8           |
| knowledge_levels      | BASE TABLE | null                                                                            | 32 kB      | 8       | 0       | 0       | 8           |
| goals                 | BASE TABLE | null                                                                            | 32 kB      | 20      | 0       | 10      | 10          |
| news                  | BASE TABLE | null                                                                            | 32 kB      | 2       | 0       | 0       | 2           |
| community_channels    | BASE TABLE | null                                                                            | 32 kB      | 2       | 0       | 0       | 2           |
| chat_messages         | BASE TABLE | null                                                                            | 32 kB      | 0       | 0       | 0       | 0           |
| notifications         | BASE TABLE | null                                                                            | 32 kB      | 0       | 0       | 0       | 0           |
| communities           | BASE TABLE | null                                                                            | 32 kB      | 6       | 0       | 1       | 5           |
| promotions            | BASE TABLE | null                                                                            | 32 kB      | 2       | 0       | 0       | 2           |
| community_members     | BASE TABLE | null                                                                            | 24 kB      | 0       | 0       | 0       | 0           |
| course_modules        | BASE TABLE | null                                                                            | 24 kB      | 0       | 0       | 0       | 0           |
| lessons               | BASE TABLE | null                                                                            | 24 kB      | 0       | 0       | 0       | 0           |
| promotion_claims      | BASE TABLE | null                                                                            | 24 kB      | 0       | 0       | 0       | 0           |
| user_connections      | BASE TABLE | null                                                                            | 24 kB      | 0       | 0       | 0       | 0           |
| user_preferences      | BASE TABLE | null                                                                            | 24 kB      | 0       | 0       | 0       | 0           |
| saved_posts           | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| community_messages    | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| community_files       | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| user_activity         | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| user_followers        | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| community_chats       | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| chat_participants     | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| courses               | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| promotion_views       | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| reports               | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| post_comments         | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| channel_messages      | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| dismissed_suggestions | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| user_follows          | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| community_invitations | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| community_media       | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| post_saves            | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| chats                 | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| community_photos      | BASE TABLE | null                                                                            | 16 kB      | 0       | 0       | 0       | 0           |
| messages              | BASE TABLE | null                                                                            | 0 bytes    | 0       | 0       | 0       | 0           |





-- Información detallada de TODAS las columnas
| table_name            | column_name           | ordinal_position | column_default                                                        | is_nullable | data_type                | character_maximum_length | numeric_precision | numeric_scale | datetime_precision | udt_name          | column_comment                                |
| --------------------- | --------------------- | ---------------- | --------------------------------------------------------------------- | ----------- | ------------------------ | ------------------------ | ----------------- | ------------- | ------------------ | ----------------- | --------------------------------------------- |
| badges                | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| badges                | codigo                | 2                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| badges                | nombre                | 3                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| badges                | descripcion           | 4                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| badges                | icono_url             | 5                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| channel_messages      | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| channel_messages      | channel_id            | 2                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| channel_messages      | user_id               | 3                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| channel_messages      | content               | 4                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| channel_messages      | message_type          | 5                | 'text'::text                                                          | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| channel_messages      | created_at            | 6                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| channel_messages      | updated_at            | 7                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| chat_messages         | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| chat_messages         | chat_id               | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| chat_messages         | sender_id             | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| chat_messages         | content               | 4                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| chat_messages         | created_at            | 5                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| chat_messages         | read_at               | 6                | null                                                                  | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| chat_participants     | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| chat_participants     | chat_id               | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| chat_participants     | user_id               | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| chat_participants     | joined_at             | 4                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| chats                 | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| chats                 | user1_id              | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| chats                 | user2_id              | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| chats                 | created_at            | 4                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| chats                 | community_id          | 5                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| comments              | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| comments              | post_id               | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| comments              | user_id               | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| comments              | parent_id             | 4                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| comments              | contenido             | 5                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| comments              | created_at            | 6                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| communities           | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| communities           | nombre                | 2                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| communities           | descripcion           | 3                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| communities           | tipo                  | 4                | 'public'::community_privacy                                           | YES         | USER-DEFINED             | null                     | null              | null          | null               | community_privacy | null                                          |
| communities           | icono_url             | 5                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| communities           | created_at            | 6                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| communities           | created_by            | 7                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| communities           | member_count          | 8                | 0                                                                     | YES         | integer                  | null                     | 32                | 0             | null               | int4              | null                                          |
| communities           | name                  | 9                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| communities           | image_url             | 10               | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| community_channels    | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_channels    | community_id          | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_channels    | name                  | 3                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| community_channels    | description           | 4                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| community_channels    | type                  | 5                | 'text'::text                                                          | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| community_channels    | created_at            | 6                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| community_chats       | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_chats       | community_id          | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_chats       | name                  | 3                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| community_chats       | created_by            | 4                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_chats       | created_at            | 5                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| community_chats       | updated_at            | 6                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| community_files       | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_files       | community_id          | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_files       | user_id               | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_files       | file_name             | 4                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| community_files       | file_url              | 5                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| community_files       | file_type             | 6                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| community_files       | file_size             | 7                | null                                                                  | YES         | integer                  | null                     | 32                | 0             | null               | int4              | null                                          |
| community_files       | created_at            | 8                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| community_invitations | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_invitations | community_id          | 2                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_invitations | from_user_id          | 3                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_invitations | to_user_id            | 4                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_invitations | status                | 5                | 'pending'::text                                                       | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| community_invitations | created_at            | 6                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| community_invitations | updated_at            | 7                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| community_media       | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_media       | community_id          | 2                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_media       | user_id               | 3                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_media       | media_type            | 4                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| community_media       | media_url             | 5                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| community_media       | file_name             | 6                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| community_media       | file_size             | 7                | null                                                                  | YES         | bigint                   | null                     | 64                | 0             | null               | int8              | null                                          |
| community_media       | created_at            | 8                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| community_members     | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_members     | community_id          | 2                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_members     | user_id               | 3                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_members     | role                  | 4                | 'member'::text                                                        | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| community_members     | joined_at             | 5                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| community_messages    | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_messages    | channel_id            | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_messages    | user_id               | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_messages    | content               | 4                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| community_messages    | created_at            | 5                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| community_photos      | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_photos      | community_id          | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_photos      | user_id               | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| community_photos      | image_url             | 4                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| community_photos      | caption               | 5                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| community_photos      | created_at            | 6                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| course_modules        | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| course_modules        | course_id             | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| course_modules        | titulo                | 3                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| course_modules        | orden                 | 4                | null                                                                  | YES         | integer                  | null                     | 32                | 0             | null               | int4              | null                                          |
| courses               | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| courses               | titulo                | 2                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| courses               | descripcion           | 3                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| courses               | nivel                 | 4                | null                                                                  | YES         | USER-DEFINED             | null                     | null              | null          | null               | finance_level     | null                                          |
| courses               | created_at            | 5                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| courses               | imagen_url            | 6                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| dismissed_suggestions | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| dismissed_suggestions | user_id               | 2                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| dismissed_suggestions | dismissed_user_id     | 3                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| dismissed_suggestions | dismissed_at          | 4                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| faqs                  | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| faqs                  | pregunta              | 2                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| faqs                  | respuesta_md          | 3                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| formularios_landing   | id                    | 1                | nextval('formularios_landing_id_seq'::regclass)                       | NO          | integer                  | null                     | 32                | 0             | null               | int4              | null                                          |
| formularios_landing   | name                  | 2                | null                                                                  | NO          | character varying        | 255                      | null              | null          | null               | varchar           | Nombre completo del usuario                   |
| formularios_landing   | email                 | 3                | null                                                                  | NO          | character varying        | 255                      | null              | null          | null               | varchar           | Email del usuario                             |
| formularios_landing   | phone                 | 4                | null                                                                  | YES         | character varying        | 20                       | null              | null          | null               | varchar           | Número de teléfono del usuario (opcional)     |
| formularios_landing   | age                   | 5                | null                                                                  | YES         | character varying        | 20                       | null              | null          | null               | varchar           | Rango de edad seleccionado                    |
| formularios_landing   | goals                 | 6                | null                                                                  | YES         | ARRAY                    | null                     | null              | null          | null               | _text             | Array de objetivos financieros seleccionados  |
| formularios_landing   | interests             | 7                | null                                                                  | YES         | ARRAY                    | null                     | null              | null          | null               | _text             | Array de intereses de inversión seleccionados |
| formularios_landing   | timestamp             | 8                | null                                                                  | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | Timestamp enviado desde el frontend           |
| formularios_landing   | created_at            | 9                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | Fecha y hora de creación del registro         |
| formularios_landing   | updated_at            | 10               | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | Fecha y hora de última actualización          |
| glossary              | termino               | 1                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| glossary              | definicion_md         | 2                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| goals                 | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| goals                 | name                  | 2                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| goals                 | description           | 3                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| goals                 | created_at            | 4                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| goals                 | icon                  | 5                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| interests             | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| interests             | name                  | 2                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| interests             | icon                  | 3                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| interests             | category              | 4                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| interests             | created_at            | 5                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| knowledge_levels      | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| knowledge_levels      | name                  | 2                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| knowledge_levels      | description           | 3                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| knowledge_levels      | level_order           | 4                | null                                                                  | YES         | integer                  | null                     | 32                | 0             | null               | int4              | null                                          |
| knowledge_levels      | created_at            | 5                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| lesson_progress       | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| lesson_progress       | user_id               | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| lesson_progress       | lesson_id             | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| lesson_progress       | completed_at          | 4                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| lessons               | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| lessons               | module_id             | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| lessons               | titulo                | 3                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| lessons               | contenido_md          | 4                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| lessons               | orden                 | 5                | null                                                                  | YES         | integer                  | null                     | 32                | 0             | null               | int4              | null                                          |
| lessons               | descripcion           | 6                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| market_data           | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| market_data           | symbol                | 2                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| market_data           | company_name          | 3                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| market_data           | current_price         | 4                | null                                                                  | NO          | numeric                  | null                     | 10                | 2             | null               | numeric           | null                                          |
| market_data           | price_change          | 5                | null                                                                  | NO          | numeric                  | null                     | 10                | 2             | null               | numeric           | null                                          |
| market_data           | price_change_percent  | 6                | null                                                                  | NO          | numeric                  | null                     | 5                 | 2             | null               | numeric           | null                                          |
| market_data           | color                 | 7                | '#111'::text                                                          | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| market_data           | is_featured           | 8                | false                                                                 | YES         | boolean                  | null                     | null              | null          | null               | bool              | null                                          |
| market_data           | last_updated          | 9                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| messages              | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| messages              | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| messages              | chat_id               | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| messages              | chat_id               | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| messages              | sender_id             | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| messages              | sender_id             | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| messages              | contenido             | 4                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| messages              | contenido             | 4                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| messages              | created_at            | 5                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| messages              | created_at            | 5                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| news                  | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| news                  | title                 | 2                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| news                  | content               | 3                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| news                  | excerpt               | 4                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| news                  | image_url             | 5                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| news                  | author_id             | 6                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| news                  | category              | 7                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| news                  | published_at          | 8                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| news                  | created_at            | 9                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| news_categories       | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| news_categories       | name                  | 2                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| news_categories       | description           | 3                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| news_categories       | created_at            | 4                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| notifications         | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| notifications         | user_id               | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| notifications         | type                  | 3                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| notifications         | payload               | 4                | null                                                                  | YES         | jsonb                    | null                     | null              | null          | null               | jsonb             | null                                          |
| notifications         | read                  | 5                | false                                                                 | YES         | boolean                  | null                     | null              | null          | null               | bool              | null                                          |
| notifications         | created_at            | 6                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| notifications         | community_id          | 7                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| notifications         | is_read               | 8                | false                                                                 | YES         | boolean                  | null                     | null              | null          | null               | bool              | null                                          |
| notifications         | read_at               | 9                | null                                                                  | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| notifications         | post_id               | 10               | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| notifications         | from_user_id          | 11               | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| post_comments         | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| post_comments         | post_id               | 2                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| post_comments         | user_id               | 3                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| post_comments         | contenido             | 4                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| post_comments         | parent_id             | 5                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| post_comments         | created_at            | 6                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| post_comments         | updated_at            | 7                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| post_likes            | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| post_likes            | post_id               | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| post_likes            | user_id               | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| post_likes            | is_like               | 4                | null                                                                  | NO          | boolean                  | null                     | null              | null          | null               | bool              | null                                          |
| post_likes            | created_at            | 5                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| post_saves            | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| post_saves            | post_id               | 2                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| post_saves            | user_id               | 3                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| post_saves            | created_at            | 4                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| posts                 | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| posts                 | user_id               | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| posts                 | community_id          | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| posts                 | contenido             | 4                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| posts                 | media_url             | 5                | '{}'::text[]                                                          | YES         | ARRAY                    | null                     | null              | null          | null               | _text             | null                                          |
| posts                 | likes_count           | 6                | 0                                                                     | YES         | integer                  | null                     | 32                | 0             | null               | int4              | null                                          |
| posts                 | dislikes_count        | 7                | 0                                                                     | YES         | integer                  | null                     | 32                | 0             | null               | int4              | null                                          |
| posts                 | comment_count         | 8                | 0                                                                     | YES         | integer                  | null                     | 32                | 0             | null               | int4              | null                                          |
| posts                 | created_at            | 9                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| posts                 | user_name             | 10               | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| posts                 | user_avatar           | 11               | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| posts                 | role                  | 12               | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| posts                 | content               | 13               | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| posts                 | image_url             | 14               | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| posts                 | likes                 | 15               | 0                                                                     | YES         | integer                  | null                     | 32                | 0             | null               | int4              | null                                          |
| posts                 | comments              | 16               | 0                                                                     | YES         | integer                  | null                     | 32                | 0             | null               | int4              | null                                          |
| posts                 | shares                | 17               | 0                                                                     | YES         | integer                  | null                     | 32                | 0             | null               | int4              | null                                          |
| posts                 | is_pinned             | 18               | false                                                                 | YES         | boolean                  | null                     | null              | null          | null               | bool              | null                                          |
| posts                 | pinned_by             | 19               | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| posts                 | pinned_at             | 20               | null                                                                  | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| posts                 | is_edited             | 21               | false                                                                 | YES         | boolean                  | null                     | null              | null          | null               | bool              | null                                          |
| posts                 | updated_at            | 22               | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| promotion_claims      | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| promotion_claims      | promotion_id          | 2                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| promotion_claims      | user_id               | 3                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| promotion_claims      | claimed_at            | 4                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| promotion_claims      | status                | 5                | 'claimed'::text                                                       | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| promotion_views       | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| promotion_views       | promotion_id          | 2                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| promotion_views       | user_id               | 3                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| promotion_views       | viewed_at             | 4                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| promotions            | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| promotions            | title                 | 2                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| promotions            | description           | 3                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| promotions            | category              | 4                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| promotions            | discount              | 5                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| promotions            | image_url             | 6                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| promotions            | valid_until           | 7                | null                                                                  | YES         | date                     | null                     | null              | null          | 0                  | date              | null                                          |
| promotions            | location              | 8                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| promotions            | terms                 | 9                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| promotions            | active                | 10               | true                                                                  | YES         | boolean                  | null                     | null              | null          | null               | bool              | null                                          |
| promotions            | created_at            | 11               | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| reports               | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| reports               | reporter              | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| reports               | post_id               | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| reports               | reason                | 4                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| reports               | created_at            | 5                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| saved_posts           | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| saved_posts           | user_id               | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| saved_posts           | post_id               | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| saved_posts           | created_at            | 4                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| simulated_investments | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| simulated_investments | portfolio_id          | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| simulated_investments | tipo_activo           | 3                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| simulated_investments | monto                 | 4                | null                                                                  | YES         | numeric                  | null                     | 18                | 2             | null               | numeric           | null                                          |
| simulated_investments | rendimiento           | 5                | null                                                                  | YES         | numeric                  | null                     | 6                 | 2             | null               | numeric           | null                                          |
| simulated_investments | fecha                 | 6                | null                                                                  | YES         | date                     | null                     | null              | null          | 0                  | date              | null                                          |
| simulated_investments | created_at            | 7                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| simulated_portfolios  | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| simulated_portfolios  | user_id               | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| simulated_portfolios  | created_at            | 3                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| user_activity         | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_activity         | user_id               | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_activity         | activity_type         | 3                | null                                                                  | YES         | USER-DEFINED             | null                     | null              | null          | null               | activity_type     | null                                          |
| user_activity         | entity_id             | 4                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_activity         | created_at            | 5                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| user_badges           | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_badges           | user_id               | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_badges           | badge_id              | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_badges           | granted_at            | 4                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| user_blocks           | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_blocks           | user_id               | 2                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_blocks           | blocked_user_id       | 3                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_blocks           | created_at            | 4                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| user_communities      | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_communities      | user_id               | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_communities      | community_id          | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_communities      | joined_at             | 4                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| user_connections      | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_connections      | from_user_id          | 2                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_connections      | to_user_id            | 3                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_connections      | status                | 4                | 'pending'::text                                                       | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| user_connections      | created_at            | 5                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| user_connections      | updated_at            | 6                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| user_followers        | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_followers        | follower_id           | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_followers        | following_id          | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_followers        | created_at            | 4                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| user_follows          | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_follows          | follower_id           | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_follows          | following_id          | 3                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_follows          | created_at            | 4                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| user_preferences      | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_preferences      | user_id               | 2                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_preferences      | language              | 3                | 'es'::text                                                            | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| user_preferences      | notifications         | 4                | true                                                                  | YES         | boolean                  | null                     | null              | null          | null               | bool              | null                                          |
| user_preferences      | theme                 | 5                | 'system'::text                                                        | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| user_preferences      | email_notifications   | 6                | true                                                                  | YES         | boolean                  | null                     | null              | null          | null               | bool              | null                                          |
| user_preferences      | push_notifications    | 7                | true                                                                  | YES         | boolean                  | null                     | null              | null          | null               | bool              | null                                          |
| user_preferences      | privacy_level         | 8                | 'public'::text                                                        | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| user_preferences      | created_at            | 9                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| user_preferences      | updated_at            | 10               | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| user_settings         | id                    | 1                | gen_random_uuid()                                                     | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_settings         | user_id               | 2                | null                                                                  | YES         | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| user_settings         | notifications_enabled | 3                | true                                                                  | YES         | boolean                  | null                     | null              | null          | null               | bool              | null                                          |
| user_settings         | email_notifications   | 4                | true                                                                  | YES         | boolean                  | null                     | null              | null          | null               | bool              | null                                          |
| user_settings         | push_notifications    | 5                | true                                                                  | YES         | boolean                  | null                     | null              | null          | null               | bool              | null                                          |
| user_settings         | privacy_level         | 6                | 'public'::text                                                        | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| user_settings         | language              | 7                | 'es'::text                                                            | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| user_settings         | theme                 | 8                | 'system'::text                                                        | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| user_settings         | created_at            | 9                | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| user_settings         | updated_at            | 10               | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| users                 | id                    | 1                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| users                 | id                    | 1                | null                                                                  | NO          | uuid                     | null                     | null              | null          | null               | uuid              | null                                          |
| users                 | nombre                | 2                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | nombre                | 2                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | username              | 3                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | username              | 3                | null                                                                  | NO          | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | bio                   | 4                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | bio                   | 4                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | photo_url             | 5                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | photo_url             | 5                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | pais                  | 6                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | pais                  | 6                | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | metas                 | 7                | '{}'::text[]                                                          | YES         | ARRAY                    | null                     | null              | null          | null               | _text             | null                                          |
| users                 | metas                 | 7                | '{}'::text[]                                                          | YES         | ARRAY                    | null                     | null              | null          | null               | _text             | null                                          |
| users                 | intereses             | 8                | '{}'::text[]                                                          | YES         | ARRAY                    | null                     | null              | null          | null               | _text             | null                                          |
| users                 | intereses             | 8                | '{}'::text[]                                                          | YES         | ARRAY                    | null                     | null              | null          | null               | _text             | null                                          |
| users                 | nivel_finanzas        | 9                | 'none'::finance_level                                                 | YES         | USER-DEFINED             | null                     | null              | null          | null               | finance_level     | null                                          |
| users                 | nivel_finanzas        | 9                | 'none'::finance_level                                                 | YES         | USER-DEFINED             | null                     | null              | null          | null               | finance_level     | null                                          |
| users                 | reputacion            | 10               | 0                                                                     | YES         | integer                  | null                     | 32                | 0             | null               | int4              | null                                          |
| users                 | reputacion            | 10               | 0                                                                     | YES         | integer                  | null                     | 32                | 0             | null               | int4              | null                                          |
| users                 | fecha_registro        | 11               | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| users                 | fecha_registro        | 11               | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| users                 | email                 | 12               | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | email                 | 12               | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | preferences           | 13               | '{"theme": "system", "language": "es", "notifications": true}'::jsonb | YES         | jsonb                    | null                     | null              | null          | null               | jsonb             | null                                          |
| users                 | preferences           | 13               | '{"theme": "system", "language": "es", "notifications": true}'::jsonb | YES         | jsonb                    | null                     | null              | null          | null               | jsonb             | null                                          |
| users                 | stats                 | 14               | '{"postsCount": 0, "followersCount": 0, "followingCount": 0}'::jsonb  | YES         | jsonb                    | null                     | null              | null          | null               | jsonb             | null                                          |
| users                 | stats                 | 14               | '{"postsCount": 0, "followersCount": 0, "followingCount": 0}'::jsonb  | YES         | jsonb                    | null                     | null              | null          | null               | jsonb             | null                                          |
| users                 | full_name             | 15               | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | full_name             | 15               | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | avatar_url            | 16               | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | avatar_url            | 16               | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | role                  | 17               | 'Usuario'::text                                                       | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | role                  | 17               | 'Usuario'::text                                                       | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | is_online             | 18               | false                                                                 | YES         | boolean                  | null                     | null              | null          | null               | bool              | null                                          |
| users                 | is_online             | 18               | false                                                                 | YES         | boolean                  | null                     | null              | null          | null               | bool              | null                                          |
| users                 | last_seen_at          | 19               | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| users                 | last_seen_at          | 19               | now()                                                                 | YES         | timestamp with time zone | null                     | null              | null          | 6                  | timestamptz       | null                                          |
| users                 | location              | 20               | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | location              | 20               | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | banner_url            | 21               | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | banner_url            | 21               | null                                                                  | YES         | text                     | null                     | null              | null          | null               | text              | null                                          |
| users                 | is_verified           | 22               | false                                                                 | YES         | boolean                  | null                     | null              | null          | null               | bool              | null                                          |
| users                 | is_verified           | 22               | false                                                                 | YES         | boolean                  | null                     | null              | null          | null               | bool              | null                                          |




-- Estado de RLS por tabla
| schemaname | tablename             | rls_enabled |
| ---------- | --------------------- | ----------- |
| public     | badges                | false       |
| public     | channel_messages      | true        |
| public     | chat_messages         | false       |
| public     | chat_participants     | false       |
| public     | chats                 | true        |
| public     | comments              | true        |
| public     | communities           | false       |
| public     | community_channels    | true        |
| public     | community_chats       | false       |
| public     | community_files       | false       |
| public     | community_invitations | true        |
| public     | community_media       | true        |
| public     | community_members     | true        |
| public     | community_messages    | false       |
| public     | community_photos      | false       |
| public     | course_modules        | false       |
| public     | courses               | false       |
| public     | dismissed_suggestions | true        |
| public     | faqs                  | false       |
| public     | formularios_landing   | true        |
| public     | glossary              | false       |
| public     | goals                 | true        |
| public     | interests             | true        |
| public     | knowledge_levels      | true        |
| public     | lesson_progress       | true        |
| public     | lessons               | true        |
| public     | market_data           | false       |
| public     | messages              | true        |
| public     | news                  | false       |
| public     | news_categories       | false       |
| public     | notifications         | true        |
| public     | post_comments         | true        |
| public     | post_likes            | true        |
| public     | post_saves            | true        |
| public     | posts                 | true        |
| public     | promotion_claims      | true        |
| public     | promotion_views       | true        |
| public     | promotions            | true        |
| public     | reports               | true        |
| public     | saved_posts           | false       |
| public     | simulated_investments | true        |
| public     | simulated_portfolios  | true        |
| public     | user_activity         | false       |
| public     | user_badges           | true        |
| public     | user_blocks           | true        |
| public     | user_communities      | true        |
| public     | user_connections      | true        |
| public     | user_followers        | false       |
| public     | user_follows          | true        |
| public     | user_preferences      | true        |
| public     | user_settings         | false       |
| public     | users                 | true        |




-- Todas las funciones con código fuente
| function_name                     | return_type                                                                                                                                    | arguments                                               | source_code                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | language | volatility | strict_mode |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------- | ----------- |
| add_comment                       | uuid                                                                                                                                           | p_post_id uuid, p_user_id uuid, p_content text          |  DECLARE comment_id uuid; BEGIN INSERT INTO comments (post_id, user_id, contenido) VALUES (p_post_id, p_user_id, p_content) RETURNING id INTO comment_id; UPDATE posts SET comment_count = comment_count + 1 WHERE id = p_post_id; RETURN comment_id; END;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | plpgsql  | v          | false       |
| after_like_delete                 | trigger                                                                                                                                        |                                                         | 
begin
  perform public.update_post_likes();
  return null;
end                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | plpgsql  | v          | false       |
| badge_first_post                  | trigger                                                                                                                                        |                                                         | 
declare v_badge uuid;
begin
  if (select count(*) from public.posts where user_id = new.user_id) = 1 then
    select id into v_badge from public.badges where codigo = 'first_post';
    insert into public.user_badges(user_id,badge_id)
    values (new.user_id,v_badge)
    on conflict do nothing;
  end if;
  return null;
end;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | plpgsql  | v          | false       |
| get_community_stats               | json                                                                                                                                           | p_community_id uuid                                     |   
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
                           | plpgsql  | v          | false       |
| get_personalized_feed             | SETOF posts                                                                                                                                    | p_user uuid, p_interests text[], p_communities uuid[]   |   
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | plpgsql  | v          | false       |
| get_personalized_feed             | TABLE(id uuid, contenido text, created_at timestamp with time zone, user_id uuid, full_name text, avatar_url text, role text)                  | p_user_id uuid, p_limit integer DEFAULT 20              |   
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | plpgsql  | v          | false       |
| get_recommended_communities       | SETOF communities                                                                                                                              | p_user uuid, p_interests text[], p_knowledge_level text |   
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | plpgsql  | v          | false       |
| get_recommended_users             | TABLE(id uuid, nombre text, username text, photo_url text)                                                                                     | p_user uuid, p_count integer DEFAULT 10                 | 
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | sql      | s          | false       |
| get_suggested_communities         | TABLE(id uuid, name text, imageurl text, membercount bigint, ismember boolean)                                                                 | p_user_id uuid, p_limit integer DEFAULT 10              |   
BEGIN  
    RETURN QUERY  
    SELECT   
        c.id,  
        COALESCE(c.nombre, c.name) as name,  
        COALESCE(c.avatar_url, c.icono_url, c.image_url) as imageUrl,  
        COALESCE(c.member_count, 0::BIGINT) as memberCount,  
        EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_id = c.id AND cm.user_id = p_user_id) as isMember  
    FROM communities c  
    WHERE NOT EXISTS(  
        SELECT 1 FROM community_members cm   
        WHERE cm.community_id = c.id AND cm.user_id = p_user_id  
    )  
    ORDER BY COALESCE(c.member_count, 0) DESC  
    LIMIT p_limit;  
END;  
                                                                                                                                                                                                                                                                                                                                                                                                                                                  | plpgsql  | v          | false       |
| get_suggested_people              | TABLE(id uuid, nombre text, full_name text, photo_url text, avatar_url text, role text, intereses text[])                                      | p_user_id uuid, p_limit integer DEFAULT 10              |   
BEGIN  
    RETURN QUERY  
    SELECT u.id, u.nombre, u.full_name, u.photo_url, u.avatar_url, u.role, u.intereses  
    FROM users u  
    WHERE u.id != p_user_id  
    AND u.id NOT IN (  
        SELECT dismissed_user_id FROM dismissed_suggestions   
        WHERE user_id = p_user_id  
    )  
    AND u.id NOT IN (  
        SELECT to_user_id FROM user_connections   
        WHERE from_user_id = p_user_id  
    )  
    ORDER BY RANDOM()  
    LIMIT p_limit;  
END;  
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | plpgsql  | v          | false       |
| get_user_communities              | TABLE(id uuid, nombre text, icono_url text)                                                                                                    | p_user_id uuid                                          |   
BEGIN  
  RETURN QUERY  
  SELECT c.id, c.nombre, c.icono_url  
  FROM communities c  
  INNER JOIN user_communities uc ON c.id = uc.community_id  
  WHERE uc.user_id = p_user_id;  
END;  
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | plpgsql  | v          | false       |
| get_user_stats                    | TABLE(followers_count integer, following_count integer, posts_count integer)                                                                   | user_id uuid                                            |   
BEGIN  
  RETURN QUERY  
  SELECT   
    (SELECT COUNT(*)::INTEGER FROM user_follows WHERE following_id = user_id) as followers_count,  
    (SELECT COUNT(*)::INTEGER FROM user_follows WHERE follower_id = user_id) as following_count,  
    (SELECT COUNT(*)::INTEGER FROM posts WHERE posts.user_id = get_user_stats.user_id) as posts_count;  
END;  
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | plpgsql  | v          | false       |
| getuserquickstats                 | TABLE(postscount bigint, followerscount bigint, followingcount bigint, communitiescount bigint, likesreceived bigint, commentsreceived bigint) | p_user_id uuid                                          |   
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | plpgsql  | v          | false       |
| handle_new_user                   | trigger                                                                                                                                        |                                                         |   
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | plpgsql  | v          | false       |
| increment_post_comments           | void                                                                                                                                           | post_id uuid                                            |   
BEGIN  
    UPDATE posts   
    SET comment_count = COALESCE(comment_count, 0) + 1,  
        updated_at = NOW()  
    WHERE id = post_id;  
END;  
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | plpgsql  | v          | false       |
| search_all                        | TABLE(type text, id uuid, title text, content text, image_url text, created_at timestamp with time zone)                                       | search_term text, current_user_id uuid                  |   
BEGIN  
  RETURN QUERY  
  -- Buscar usuarios  
  SELECT   
    'user'::TEXT as type,  
    u.id,  
    u.nombre as title,  
    u.bio as content,  
    u.photo_url as image_url,  
    u.fecha_registro as created_at  
  FROM users u  
  WHERE u.nombre ILIKE '%' || search_term || '%'  
     OR u.username ILIKE '%' || search_term || '%'  
    
  UNION ALL  
    
  -- Buscar posts  
  SELECT   
    'post'::TEXT as type,  
    p.id,  
    LEFT(p.contenido, 100) as title,  
    p.contenido as content,  
    NULL::TEXT as image_url,  
    p.created_at  
  FROM posts p  
  WHERE p.contenido ILIKE '%' || search_term || '%'  
    
  UNION ALL  
    
  -- Buscar comunidades  
  SELECT   
    'community'::TEXT as type,  
    c.id,  
    c.name as title,  
    c.description as content,  
    c.image_url,  
    c.created_at  
  FROM communities c  
  WHERE c.name ILIKE '%' || search_term || '%'  
     OR c.description ILIKE '%' || search_term || '%'  
    
  ORDER BY created_at DESC  
  LIMIT 50;  
END;  
 | plpgsql  | v          | false       |
| share_post                        | void                                                                                                                                           | p_post_id uuid, p_user_id uuid                          |  BEGIN INSERT INTO post_shares (post_id, user_id) VALUES (p_post_id, p_user_id); UPDATE posts SET shares_count = shares_count + 1 WHERE id = p_post_id; END;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | plpgsql  | v          | false       |
| sync_user_columns                 | trigger                                                                                                                                        |                                                         |   
BEGIN  
  -- Sincronizar full_name con nombre  
  IF NEW.full_name IS DISTINCT FROM OLD.full_name THEN  
    NEW.nombre = COALESCE(NEW.full_name, NEW.nombre);  
  END IF;  
    
  IF NEW.nombre IS DISTINCT FROM OLD.nombre THEN  
    NEW.full_name = COALESCE(NEW.nombre, NEW.full_name);  
  END IF;  
    
  -- Sincronizar avatar_url con photo_url  
  IF NEW.avatar_url IS DISTINCT FROM OLD.avatar_url THEN  
    NEW.photo_url = COALESCE(NEW.avatar_url, NEW.photo_url);  
  END IF;  
    
  IF NEW.photo_url IS DISTINCT FROM OLD.photo_url THEN  
    NEW.avatar_url = COALESCE(NEW.photo_url, NEW.avatar_url);  
  END IF;  
    
  RETURN NEW;  
END;  
                                                                                                                                                                                                                                                                                                                                                                                               | plpgsql  | v          | false       |
| update_community_member_count     | trigger                                                                                                                                        |                                                         |   
BEGIN  
    IF TG_OP = 'INSERT' THEN  
        UPDATE communities   
        SET member_count = COALESCE(member_count, 0) + 1  
        WHERE id = NEW.community_id;  
        RETURN NEW;  
    ELSIF TG_OP = 'DELETE' THEN  
        UPDATE communities   
        SET member_count = GREATEST(COALESCE(member_count, 0) - 1, 0)  
        WHERE id = OLD.community_id;  
        RETURN OLD;  
    END IF;  
    RETURN NULL;  
END;  
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | plpgsql  | v          | false       |
| update_post_comments              | trigger                                                                                                                                        |                                                         | 
begin
  update public.posts
  set   comment_count = (select count(*) from public.comments where post_id = new.post_id)
  where id = new.post_id;
  return null;
end;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | plpgsql  | v          | false       |
| update_post_comments_after_delete | trigger                                                                                                                                        |                                                         | 
begin
  update public.posts
  set   comment_count = comment_count - 1
  where id = old.post_id;
  return null;
end                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | plpgsql  | v          | false       |
| update_post_likes                 | trigger                                                                                                                                        |                                                         | 
begin
  update public.posts
  set   likes_count    = (select count(*) from public.post_likes where post_id = new.post_id and is_like),
        dislikes_count = (select count(*) from public.post_likes where post_id = new.post_id and not is_like)
  where id = new.post_id;
  return null;
end;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | plpgsql  | v          | false       |
| update_post_likes_after_delete    | trigger                                                                                                                                        |                                                         | 
begin
  perform public.update_post_likes();
  return null;
end                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | plpgsql  | v          | false       |
| update_user_interests             | void                                                                                                                                           | user_id uuid, new_interests text[]                      |   
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | plpgsql  | v          | false       |







-- Usuarios con datos completos
| id                                   | nombre         | username           | email                               | pais      | nivel_finanzas | reputacion | is_online | fecha_registro                | preferences                                             | stats                                                  | posts_count | followers_count | following_count |
| ------------------------------------ | -------------- | ------------------ | ----------------------------------- | --------- | -------------- | ---------- | --------- | ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------ | ----------- | --------------- | --------------- |
| 11b85677-cc3b-46dd-9687-04227ecf8a5b | Usuario        | testuser_g2w1l4    | testuser_1757635658248@example.com  | null      | none           | 0          | false     | 2025-09-12 00:07:38.307935+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| c7a86e69-c90b-4409-a845-973596cab33f | Usuario        | user_c7a86e69      | testuser1_1757635557570@example.com | null      | none           | 0          | false     | 2025-09-12 00:05:57.822801+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| 411e16db-fd78-48b6-a1aa-849de7b13624 | Usuario        | testuser_bsrryo    | testuser_1757376798288@example.com  | null      | none           | 0          | false     | 2025-09-09 00:13:13.818939+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| 6284005b-e0c3-4864-bfa7-caa7e54b2741 | Usuario        | testuser_bsn52i    | testuser_1757376581994@example.com  | null      | none           | 0          | false     | 2025-09-09 00:09:39.056667+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| fa84c0cb-27c2-4f81-9f5b-5a4c77be9844 | ABCDE          | abcde              | abcde@gmail.com                     |           | none           | 0          | false     | 2025-09-08 18:51:10.799+00    | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| db96e748-9bfa-4d79-bfcc-a5a92f5daf98 | SEBASTIAN 22   | sebastian33        | sebastian33@gmail.com               |           | none           | 0          | false     | 2025-09-08 17:24:37.092+00    | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| e4c64fb0-56ff-4c52-9504-0368f8afa298 | adonas         | damda              | ndasd@gmail.com                     |           | none           | 0          | false     | 2025-09-08 17:23:26.844+00    | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| 871d0db8-d289-4218-9a30-cd2aa7bb04d7 | Usuario        | user_1757351677872 | abc@gmail.com                       |           | none           | 0          | false     | 2025-09-08 17:14:37.872+00    | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| c8a3feee-18bf-4ea9-bf0d-3f5ae22fea81 | abede          | abede              | abede@gmail.com                     |           | none           | 0          | false     | 2025-09-08 17:13:35.932+00    | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| 7eadd2a3-1d62-4534-a6ec-cf96fb076422 | ABC2           | abc2               | abc2@gmail.com                      |           | none           | 0          | false     | 2025-09-08 17:11:02.133+00    | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| d7a4a6a3-7e5c-4e47-99d8-c7869fdddc37 | SEBASTIAN2     | SEBASTIAN2         | sebas23@gmail.com                   |           | none           | 0          | false     | 2025-09-08 17:08:32.475+00    | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| aa28c564-af36-4fa9-9951-8a15725bd606 | Usuario        | SEBAS              | sebas22@gmail.com                   | null      | none           | 0          | false     | 2025-09-08 17:02:48.584215+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| f9e38085-2759-4142-9adb-7e8f00290411 | Usuario        | Gabriel11          | gabriel@gmail.com                   | null      | none           | 0          | false     | 2025-09-08 16:59:57.613142+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| 9f20c2fe-bb6d-4b8b-ab3d-b3907ed72282 | Test Auth User | testauth_mfbc7o7b  | testauth_1757348986439@investi.com  | Nicaragua | intermediate   | 0          | false     | 2025-09-08 16:29:42.152314+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| 3b944fd2-1a38-4e20-9fb3-63fa3572c051 | Test Auth User | testauth_mfbacxiy  | testauth_1757345872570@investi.com  | Nicaragua | intermediate   | 0          | false     | 2025-09-08 15:37:47.205731+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| 930f6088-3f7e-4a02-aefa-cf664633da55 | Test Auth User | testauth_mfba8a4e  | testauth_1757345655614@investi.com  | Nicaragua | none           | 0          | false     | 2025-09-08 15:34:10.364242+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| 5fe2cf58-6be0-4f2d-8d11-78bf40985771 | Usuario        | testauth_mfba4e70  | testauth_1757345474267@investi.com  | null      | none           | 0          | false     | 2025-09-08 15:31:09.476785+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| 36d98a94-54ac-4cea-9e50-d1410b43a576 | Usuario        | testuser_mfb3rebj  | test_1757334790207@investi.com      | null      | none           | 0          | false     | 2025-09-08 12:33:04.754701+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| eb50fabd-6c90-4f3d-ab1a-cfc8f42c9564 | Usuario        | testuser_mfb3r322  | test_1757334775610@investi.com      | null      | none           | 0          | false     | 2025-09-08 12:32:50.16057+00  | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |
| 1afd7d97-df6f-4bc1-840f-67f86ee0594c | Usuario        | testuser_mfb3qo5j  | test_1757334756295@investi.com      | null      | none           | 0          | false     | 2025-09-08 12:32:30.861888+00 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | 0           | 0               | 0               |






-- Verificar integridad de foreign keys
| relationship           | orphaned_records |
| ---------------------- | ---------------- |
| posts -> users         | 2                |
| post_comments -> posts | 0                |
| post_likes -> posts    | 0                |
| communities -> users   | 0                |





-- Datos de inversión y finanzas
| table_name  | record_count | oldest_data                   | newest_data                   |
| ----------- | ------------ | ----------------------------- | ----------------------------- |
| market_data | 5            | 2025-08-18 13:34:44.789435+00 | 2025-08-18 13:34:44.789435+00 |
| promotions  | 2            | 2025-08-16 22:22:45.203568+00 | 2025-08-16 22:22:53.129642+00 |
| courses     | 0            | null                          | null                          |




-- 4. FOREIGN KEYS COMPLETAS CON DETALLES
| constraint_name                              | source_table          | source_column     | target_table         | target_column | update_rule | delete_rule | is_deferrable | initially_deferred |
| -------------------------------------------- | --------------------- | ----------------- | -------------------- | ------------- | ----------- | ----------- | ------------- | ------------------ |
| channel_messages_channel_id_fkey             | channel_messages      | channel_id        | community_channels   | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| channel_messages_user_id_fkey                | channel_messages      | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| chat_messages_chat_id_fkey                   | chat_messages         | chat_id           | chats                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| chat_messages_sender_id_fkey                 | chat_messages         | sender_id         | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| chat_participants_chat_id_fkey               | chat_participants     | chat_id           | chats                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| chat_participants_user_id_fkey               | chat_participants     | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| chats_community_id_fkey                      | chats                 | community_id      | communities          | id            | NO ACTION   | NO ACTION   | NO            | NO                 |
| chats_user1_id_fkey                          | chats                 | user1_id          | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| chats_user2_id_fkey                          | chats                 | user2_id          | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| comments_parent_id_fkey                      | comments              | parent_id         | comments             | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| comments_post_id_fkey                        | comments              | post_id           | posts                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| comments_user_id_fkey                        | comments              | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| communities_created_by_fkey                  | communities           | created_by        | users                | id            | NO ACTION   | SET NULL    | NO            | NO                 |
| community_channels_community_id_fkey         | community_channels    | community_id      | communities          | id            | NO ACTION   | NO ACTION   | NO            | NO                 |
| community_chats_community_id_fkey            | community_chats       | community_id      | communities          | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| community_chats_created_by_fkey              | community_chats       | created_by        | users                | id            | NO ACTION   | NO ACTION   | NO            | NO                 |
| community_files_community_id_fkey            | community_files       | community_id      | communities          | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| community_files_user_id_fkey                 | community_files       | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| community_invitations_community_id_fkey      | community_invitations | community_id      | communities          | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| community_invitations_from_user_id_fkey      | community_invitations | from_user_id      | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| community_invitations_to_user_id_fkey        | community_invitations | to_user_id        | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| community_media_community_id_fkey            | community_media       | community_id      | communities          | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| community_media_user_id_fkey                 | community_media       | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| community_members_community_id_fkey          | community_members     | community_id      | communities          | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| community_members_user_id_fkey               | community_members     | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| community_messages_channel_id_fkey           | community_messages    | channel_id        | community_channels   | id            | NO ACTION   | NO ACTION   | NO            | NO                 |
| community_messages_user_id_fkey              | community_messages    | user_id           | users                | id            | NO ACTION   | NO ACTION   | NO            | NO                 |
| community_photos_community_id_fkey           | community_photos      | community_id      | communities          | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| community_photos_user_id_fkey                | community_photos      | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| course_modules_course_id_fkey                | course_modules        | course_id         | courses              | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| dismissed_suggestions_dismissed_user_id_fkey | dismissed_suggestions | dismissed_user_id | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| dismissed_suggestions_user_id_fkey           | dismissed_suggestions | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| lesson_progress_lesson_id_fkey               | lesson_progress       | lesson_id         | lessons              | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| lesson_progress_user_id_fkey                 | lesson_progress       | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| lessons_module_id_fkey                       | lessons               | module_id         | course_modules       | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| messages_chat_id_fkey                        | messages              | chat_id           | chats                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| messages_sender_id_fkey                      | messages              | sender_id         | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| news_author_id_fkey                          | news                  | author_id         | users                | id            | NO ACTION   | NO ACTION   | NO            | NO                 |
| notifications_community_id_fkey              | notifications         | community_id      | communities          | id            | NO ACTION   | NO ACTION   | NO            | NO                 |
| notifications_from_user_id_fkey              | notifications         | from_user_id      | users                | id            | NO ACTION   | NO ACTION   | NO            | NO                 |
| notifications_post_id_fkey                   | notifications         | post_id           | posts                | id            | NO ACTION   | NO ACTION   | NO            | NO                 |
| notifications_user_id_fkey                   | notifications         | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| post_comments_parent_id_fkey                 | post_comments         | parent_id         | post_comments        | id            | NO ACTION   | NO ACTION   | NO            | NO                 |
| post_comments_post_id_fkey                   | post_comments         | post_id           | posts                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| post_comments_user_id_fkey                   | post_comments         | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| post_likes_post_id_fkey                      | post_likes            | post_id           | posts                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| post_likes_user_id_fkey                      | post_likes            | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| post_saves_post_id_fkey                      | post_saves            | post_id           | posts                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| post_saves_user_id_fkey                      | post_saves            | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| posts_community_id_fkey                      | posts                 | community_id      | communities          | id            | NO ACTION   | SET NULL    | NO            | NO                 |
| posts_pinned_by_fkey                         | posts                 | pinned_by         | users                | id            | NO ACTION   | NO ACTION   | NO            | NO                 |
| posts_user_id_fkey                           | posts                 | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| promotion_claims_promotion_id_fkey           | promotion_claims      | promotion_id      | promotions           | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| promotion_claims_user_id_fkey                | promotion_claims      | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| promotion_views_promotion_id_fkey            | promotion_views       | promotion_id      | promotions           | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| promotion_views_user_id_fkey                 | promotion_views       | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| reports_post_id_fkey                         | reports               | post_id           | posts                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| reports_reporter_fkey                        | reports               | reporter          | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| saved_posts_post_id_fkey                     | saved_posts           | post_id           | posts                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| saved_posts_user_id_fkey                     | saved_posts           | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| simulated_investments_portfolio_id_fkey      | simulated_investments | portfolio_id      | simulated_portfolios | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| simulated_portfolios_user_id_fkey            | simulated_portfolios  | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| user_activity_user_id_fkey                   | user_activity         | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| user_badges_badge_id_fkey                    | user_badges           | badge_id          | badges               | id            | NO ACTION   | NO ACTION   | NO            | NO                 |
| user_badges_user_id_fkey                     | user_badges           | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| user_blocks_blocked_user_id_fkey             | user_blocks           | blocked_user_id   | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| user_blocks_user_id_fkey                     | user_blocks           | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| user_communities_community_id_fkey           | user_communities      | community_id      | communities          | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| user_communities_user_id_fkey                | user_communities      | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| user_connections_from_user_id_fkey           | user_connections      | from_user_id      | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| user_connections_to_user_id_fkey             | user_connections      | to_user_id        | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| user_followers_follower_id_fkey              | user_followers        | follower_id       | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| user_followers_following_id_fkey             | user_followers        | following_id      | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| user_follows_follower_id_fkey                | user_follows          | follower_id       | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| user_follows_following_id_fkey               | user_follows          | following_id      | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| user_preferences_user_id_fkey                | user_preferences      | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |
| user_settings_user_id_fkey                   | user_settings         | user_id           | users                | id            | NO ACTION   | CASCADE     | NO            | NO                 |




-- 5. TRIGGERS COMPLETOS CON FUNCIONES
| trigger_name                   | table_name        | action_timing | event_manipulation | action_statement                                     | function_source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------ | ----------------- | ------------- | ------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| trg_comment_del                | comments          | AFTER         | DELETE             | EXECUTE FUNCTION update_post_comments_after_delete() | 
begin
  update public.posts
  set   comment_count = comment_count - 1
  where id = old.post_id;
  return null;
end                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| trg_post_comments              | comments          | AFTER         | INSERT             | EXECUTE FUNCTION update_post_comments()              | 
begin
  update public.posts
  set   comment_count = (select count(*) from public.comments where post_id = new.post_id)
  where id = new.post_id;
  return null;
end;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| community_member_count_trigger | community_members | AFTER         | DELETE             | EXECUTE FUNCTION update_community_member_count()     |   
BEGIN  
    IF TG_OP = 'INSERT' THEN  
        UPDATE communities   
        SET member_count = COALESCE(member_count, 0) + 1  
        WHERE id = NEW.community_id;  
        RETURN NEW;  
    ELSIF TG_OP = 'DELETE' THEN  
        UPDATE communities   
        SET member_count = GREATEST(COALESCE(member_count, 0) - 1, 0)  
        WHERE id = OLD.community_id;  
        RETURN OLD;  
    END IF;  
    RETURN NULL;  
END;  
                                                                                                                                                                                                                                       |
| community_member_count_trigger | community_members | AFTER         | INSERT             | EXECUTE FUNCTION update_community_member_count()     |   
BEGIN  
    IF TG_OP = 'INSERT' THEN  
        UPDATE communities   
        SET member_count = COALESCE(member_count, 0) + 1  
        WHERE id = NEW.community_id;  
        RETURN NEW;  
    ELSIF TG_OP = 'DELETE' THEN  
        UPDATE communities   
        SET member_count = GREATEST(COALESCE(member_count, 0) - 1, 0)  
        WHERE id = OLD.community_id;  
        RETURN OLD;  
    END IF;  
    RETURN NULL;  
END;  
                                                                                                                                                                                                                                       |
| trg_like_del                   | post_likes        | AFTER         | DELETE             | EXECUTE FUNCTION update_post_likes_after_delete()    | 
begin
  perform public.update_post_likes();
  return null;
end                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| trg_post_likes                 | post_likes        | AFTER         | INSERT             | EXECUTE FUNCTION update_post_likes()                 | 
begin
  update public.posts
  set   likes_count    = (select count(*) from public.post_likes where post_id = new.post_id and is_like),
        dislikes_count = (select count(*) from public.post_likes where post_id = new.post_id and not is_like)
  where id = new.post_id;
  return null;
end;                                                                                                                                                                                                                                                                                                                                                                                         |
| trg_post_likes                 | post_likes        | AFTER         | DELETE             | EXECUTE FUNCTION update_post_likes()                 | 
begin
  update public.posts
  set   likes_count    = (select count(*) from public.post_likes where post_id = new.post_id and is_like),
        dislikes_count = (select count(*) from public.post_likes where post_id = new.post_id and not is_like)
  where id = new.post_id;
  return null;
end;                                                                                                                                                                                                                                                                                                                                                                                         |
| trg_badge_first_post           | posts             | AFTER         | INSERT             | EXECUTE FUNCTION badge_first_post()                  | 
declare v_badge uuid;
begin
  if (select count(*) from public.posts where user_id = new.user_id) = 1 then
    select id into v_badge from public.badges where codigo = 'first_post';
    insert into public.user_badges(user_id,badge_id)
    values (new.user_id,v_badge)
    on conflict do nothing;
  end if;
  return null;
end;                                                                                                                                                                                                                                                                                                                                                    |
| sync_user_columns_trigger      | users             | BEFORE        | UPDATE             | EXECUTE FUNCTION sync_user_columns()                 |   
BEGIN  
  -- Sincronizar full_name con nombre  
  IF NEW.full_name IS DISTINCT FROM OLD.full_name THEN  
    NEW.nombre = COALESCE(NEW.full_name, NEW.nombre);  
  END IF;  
    
  IF NEW.nombre IS DISTINCT FROM OLD.nombre THEN  
    NEW.full_name = COALESCE(NEW.nombre, NEW.full_name);  
  END IF;  
    
  -- Sincronizar avatar_url con photo_url  
  IF NEW.avatar_url IS DISTINCT FROM OLD.avatar_url THEN  
    NEW.photo_url = COALESCE(NEW.avatar_url, NEW.photo_url);  
  END IF;  
    
  IF NEW.photo_url IS DISTINCT FROM OLD.photo_url THEN  
    NEW.avatar_url = COALESCE(NEW.photo_url, NEW.avatar_url);  
  END IF;  
    
  RETURN NEW;  
END;  
 |




-- 6. POLÍTICAS RLS COMPLETAS
| schemaname | tablename           | policyname                                   | permissive | roles    | cmd    | condition_check                                                                                                                                                                                                                                                                  | with_check_condition     |
| ---------- | ------------------- | -------------------------------------------- | ---------- | -------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| public     | chats               | chats_rw                                     | PERMISSIVE | {public} | ALL    | ((auth.uid() = user1_id) OR (auth.uid() = user2_id))                                                                                                                                                                                                                             | null                     |
| public     | comments            | comments_crud                                | PERMISSIVE | {public} | ALL    | (user_id = auth.uid())                                                                                                                                                                                                                                                           | (user_id = auth.uid())   |
| public     | comments            | comments_read                                | PERMISSIVE | {public} | SELECT | (post_id IN ( SELECT posts.id
   FROM posts
  WHERE ((posts.community_id IS NULL) OR (posts.community_id IN ( SELECT user_communities.community_id
           FROM user_communities
          WHERE (user_communities.user_id = auth.uid()))) OR (posts.user_id = auth.uid())))) | null                     |
| public     | community_media     | Community members can view community content | PERMISSIVE | {public} | SELECT | (EXISTS ( SELECT 1
   FROM community_members
  WHERE ((community_members.community_id = community_media.community_id) AND (community_members.user_id = auth.uid()))))                                                                                                            | null                     |
| public     | formularios_landing | Allow insert for all                         | PERMISSIVE | {public} | INSERT | null                                                                                                                                                                                                                                                                             | true                     |
| public     | formularios_landing | Allow read for all                           | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | goals               | goals_read                                   | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | interests           | interests_read                               | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | knowledge_levels    | knowledge_levels_read                        | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | lesson_progress     | lp_owner                                     | PERMISSIVE | {public} | ALL    | (user_id = auth.uid())                                                                                                                                                                                                                                                           | (user_id = auth.uid())   |
| public     | lessons             | lessons_read                                 | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | messages            | messages_rw                                  | PERMISSIVE | {public} | ALL    | (chat_id IN ( SELECT chats.id
   FROM chats
  WHERE ((auth.uid() = chats.user1_id) OR (auth.uid() = chats.user2_id))))                                                                                                                                                           | null                     |
| public     | notifications       | notif_owner                                  | PERMISSIVE | {public} | ALL    | (user_id = auth.uid())                                                                                                                                                                                                                                                           | (user_id = auth.uid())   |
| public     | post_comments       | Users can create comments                    | PERMISSIVE | {public} | INSERT | null                                                                                                                                                                                                                                                                             | (auth.uid() = user_id)   |
| public     | post_comments       | Users can edit their own comments            | PERMISSIVE | {public} | UPDATE | (auth.uid() = user_id)                                                                                                                                                                                                                                                           | null                     |
| public     | post_comments       | Users can view all comments                  | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | post_likes          | likes_crud                                   | PERMISSIVE | {public} | ALL    | (user_id = auth.uid())                                                                                                                                                                                                                                                           | (user_id = auth.uid())   |
| public     | post_saves          | Users can manage their own saved posts       | PERMISSIVE | {public} | ALL    | (auth.uid() = user_id)                                                                                                                                                                                                                                                           | null                     |
| public     | posts               | Posts are publicly readable                  | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | posts               | Users can create posts                       | PERMISSIVE | {public} | INSERT | null                                                                                                                                                                                                                                                                             | (auth.uid() IS NOT NULL) |
| public     | posts               | posts_crud                                   | PERMISSIVE | {public} | ALL    | (user_id = auth.uid())                                                                                                                                                                                                                                                           | (user_id = auth.uid())   |
| public     | posts               | posts_read                                   | PERMISSIVE | {public} | SELECT | ((user_id = auth.uid()) OR (community_id IS NULL) OR (community_id IN ( SELECT user_communities.community_id
   FROM user_communities
  WHERE (user_communities.user_id = auth.uid()))))                                                                                         | null                     |
| public     | promotion_views     | Users can view their own promotion views     | PERMISSIVE | {public} | ALL    | (auth.uid() = user_id)                                                                                                                                                                                                                                                           | null                     |
| public     | promotions          | promotions_read                              | PERMISSIVE | {public} | SELECT | (active = true)                                                                                                                                                                                                                                                                  | null                     |
| public     | reports             | reports_owner                                | PERMISSIVE | {public} | ALL    | (reporter = auth.uid())                                                                                                                                                                                                                                                          | (reporter = auth.uid())  |
| public     | user_badges         | system_can_award_badges                      | PERMISSIVE | {public} | INSERT | null                                                                                                                                                                                                                                                                             | true                     |
| public     | user_badges         | ub_read                                      | PERMISSIVE | {public} | SELECT | (user_id = auth.uid())                                                                                                                                                                                                                                                           | null                     |
| public     | user_blocks         | ub_crud                                      | PERMISSIVE | {public} | ALL    | (auth.uid() = user_id)                                                                                                                                                                                                                                                           | (auth.uid() = user_id)   |
| public     | user_blocks         | ub_read                                      | PERMISSIVE | {public} | SELECT | (auth.uid() = user_id)                                                                                                                                                                                                                                                           | null                     |
| public     | user_communities    | users_can_join_communities                   | PERMISSIVE | {public} | INSERT | null                                                                                                                                                                                                                                                                             | (auth.uid() = user_id)   |
| public     | user_connections    | Users can manage their connections           | PERMISSIVE | {public} | ALL    | ((auth.uid() = from_user_id) OR (auth.uid() = to_user_id))                                                                                                                                                                                                                       | null                     |
| public     | user_follows        | Users can manage their own follows           | PERMISSIVE | {public} | ALL    | (auth.uid() = follower_id)                                                                                                                                                                                                                                                       | null                     |
| public     | user_follows        | Users can view all follows                   | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | user_preferences    | Users can manage their own preferences       | PERMISSIVE | {public} | ALL    | (auth.uid() = user_id)                                                                                                                                                                                                                                                           | null                     |
| public     | users               | Users can insert their own profile           | PERMISSIVE | {public} | INSERT | null                                                                                                                                                                                                                                                                             | (auth.uid() = id)        |
| public     | users               | Users can read their own profile             | PERMISSIVE | {public} | SELECT | (auth.uid() = id)                                                                                                                                                                                                                                                                | null                     |
| public     | users               | Users can update their own profile           | PERMISSIVE | {public} | UPDATE | (auth.uid() = id)                                                                                                                                                                                                                                                                | null                     |
| public     | users               | users_read                                   | PERMISSIVE | {public} | SELECT | true                                                                                                                                                                                                                                                                             | null                     |
| public     | users               | users_update                                 | PERMISSIVE | {public} | UPDATE | (auth.uid() = id)                                                                                                                                                                                                                                                                | null                     |





-- Estado de RLS por tabla

| schemaname | tablename             | rls_enabled |
| ---------- | --------------------- | ----------- |
| public     | badges                | false       |
| public     | channel_messages      | true        |
| public     | chat_messages         | false       |
| public     | chat_participants     | false       |
| public     | chats                 | true        |
| public     | comments              | true        |
| public     | communities           | false       |
| public     | community_channels    | true        |
| public     | community_chats       | false       |
| public     | community_files       | false       |
| public     | community_invitations | true        |
| public     | community_media       | true        |
| public     | community_members     | true        |
| public     | community_messages    | false       |
| public     | community_photos      | false       |
| public     | course_modules        | false       |
| public     | courses               | false       |
| public     | dismissed_suggestions | true        |
| public     | faqs                  | false       |
| public     | formularios_landing   | true        |
| public     | glossary              | false       |
| public     | goals                 | true        |
| public     | interests             | true        |
| public     | knowledge_levels      | true        |
| public     | lesson_progress       | true        |
| public     | lessons               | true        |
| public     | market_data           | false       |
| public     | messages              | true        |
| public     | news                  | false       |
| public     | news_categories       | false       |
| public     | notifications         | true        |
| public     | post_comments         | true        |
| public     | post_likes            | true        |
| public     | post_saves            | true        |
| public     | posts                 | true        |
| public     | promotion_claims      | true        |
| public     | promotion_views       | true        |
| public     | promotions            | true        |
| public     | reports               | true        |
| public     | saved_posts           | false       |
| public     | simulated_investments | true        |
| public     | simulated_portfolios  | true        |
| public     | user_activity         | false       |
| public     | user_badges           | true        |
| public     | user_blocks           | true        |
| public     | user_communities      | true        |
| public     | user_connections      | true        |
| public     | user_followers        | false       |
| public     | user_follows          | true        |
| public     | user_preferences      | true        |
| public     | user_settings         | false       |
| public     | users                 | true        |




-- 7. FUNCIONES Y PROCEDIMIENTOS COMPLETOS
| function_name | return_type | arguments | source_code | language | volatility | strict_mode || --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------- | ----------- || add_comment | uuid | p_post_id uuid, p_user_id uuid, p_content text | DECLARE comment_id uuid; BEGIN INSERT INTO comments (post_id, user_id, contenido) VALUES (p_post_id, p_user_id, p_content) RETURNING id INTO comment_id; UPDATE posts SET comment_count = comment_count + 1 WHERE id = p_post_id; RETURN comment_id; END; | plpgsql | v | false || after_like_delete | trigger | |beginperform public.update_post_likes();return null;end | plpgsql | v | false || badge_first_post | trigger | |declare v_badge uuid;beginif (select count(*) from public.posts where user_id = new.user_id) = 1 thenselect id into v_badge from public.badges where codigo = 'first_post';insert into public.user_badges(user_id,badge_id)values (new.user_id,v_badge)on conflict do nothing;end if;return null;end; | plpgsql | v | false || get_community_stats | json | p_community_id uuid |DECLAREresult JSON;BEGINSELECT json_build_object('total_members', (SELECT COUNT(*) FROM community_members WHERE community_id = p_community_id),'active_members', (SELECT COUNT(*) FROM community_members cmJOIN users u ON cm.user_id = u.idWHERE cm.community_id = p_community_idAND u.last_seen_at > NOW() - INTERVAL '7 days'),'total_posts', (SELECT COUNT(*) FROM posts WHERE community_id = p_community_id),'posts_this_week', (SELECT COUNT(*) FROM postsWHERE community_id = p_community_idAND created_at > NOW() - INTERVAL '7 days'),'engagement_rate', COALESCE((SELECT AVG(likes_count + comment_count)FROM postsWHERE community_id = p_community_id), 0)) INTO result;RETURN result;END;| plpgsql | v | false || get_personalized_feed | SETOF posts | p_user uuid, p_interests text[], p_communities uuid[] |BEGINRETURN QUERYSELECT * FROM postsWHERE (community_id = ANY(p_communities) ORuser_id IN (SELECT user_id FROM user_communitiesWHERE community_id = ANY(p_communities)))ORDER BY created_at DESC;END;| plpgsql | v | false || get_personalized_feed | TABLE(id uuid, contenido text, created_at timestamp with time zone, user_id uuid, full_name text, avatar_url text, role text) | p_user_id uuid, p_limit integer DEFAULT 20 |BEGINRETURN QUERYSELECTp.id,p.contenido,p.created_at,p.user_id,u.full_name,u.avatar_url,u.roleFROM posts pJOIN users u ON p.user_id = u.idORDER BY p.created_at DESCLIMIT p_limit;END;| plpgsql | v | false || get_recommended_communities | SETOF communities | p_user uuid, p_interests text[], p_knowledge_level text |BEGINRETURN QUERYSELECT * FROM communities cWHERE c.id NOT IN (SELECT community_id FROM user_communitiesWHERE user_id = p_user)-- Lógica de recomendación basada en interesesORDER BY created_at DESCLIMIT 10;END;| plpgsql | v | false || get_recommended_users | TABLE(id uuid, nombre text, username text, photo_url text) | p_user uuid, p_count integer DEFAULT 10 |select u.id, u.nombre, u.username, u.photo_urlfrom public.users uwhere u.id <> p_userand cardinality(array(select unnest(u.intereses)intersectselect unnest((select intereses from public.users where id = p_user)))) > 0order by random()limit p_count;| sql | s | false || get_suggested_communities | TABLE(id uuid, name text, imageurl text, membercount bigint, ismember boolean) | p_user_id uuid, p_limit integer DEFAULT 10 |BEGINRETURN QUERYSELECTc.id,COALESCE(c.nombre, c.name) as name,COALESCE(c.avatar_url, c.icono_url, c.image_url) as imageUrl,COALESCE(c.member_count, 0::BIGINT) as memberCount,EXISTS(SELECT 1 FROM community_members cm WHERE cm.community_id = c.id AND cm.user_id = p_user_id) as isMemberFROM communities cWHERE NOT EXISTS(SELECT 1 FROM community_members cmWHERE cm.community_id = c.id AND cm.user_id = p_user_id)ORDER BY COALESCE(c.member_count, 0) DESCLIMIT p_limit;END;| plpgsql | v | false || get_suggested_people | TABLE(id uuid, nombre text, full_name text, photo_url text, avatar_url text, role text, intereses text[]) | p_user_id uuid, p_limit integer DEFAULT 10 |BEGINRETURN QUERYSELECT u.id, u.nombre, u.full_name, u.photo_url, u.avatar_url, u.role, u.interesesFROM users uWHERE u.id != p_user_idAND u.id NOT IN (SELECT dismissed_user_id FROM dismissed_suggestionsWHERE user_id = p_user_id)AND u.id NOT IN (SELECT to_user_id FROM user_connectionsWHERE from_user_id = p_user_id)ORDER BY RANDOM()LIMIT p_limit;END;| plpgsql | v | false || get_user_communities | TABLE(id uuid, nombre text, icono_url text) | p_user_id uuid |BEGINRETURN QUERYSELECT c.id, c.nombre, c.icono_urlFROM communities cINNER JOIN user_communities uc ON c.id = uc.community_idWHERE uc.user_id = p_user_id;END;| plpgsql | v | false || get_user_stats | TABLE(followers_count integer, following_count integer, posts_count integer) | user_id uuid |BEGINRETURN QUERYSELECT(SELECT COUNT(*)::INTEGER FROM user_follows WHERE following_id = user_id) as followers_count,(SELECT COUNT(*)::INTEGER FROM user_follows WHERE follower_id = user_id) as following_count,(SELECT COUNT(*)::INTEGER FROM posts WHERE posts.user_id = get_user_stats.user_id) as posts_count;END;| plpgsql | v | false || getuserquickstats | TABLE(postscount bigint, followerscount bigint, followingcount bigint, communitiescount bigint, likesreceived bigint, commentsreceived bigint) | p_user_id uuid |BEGINRETURN QUERYSELECT(SELECT COUNT(*) FROM posts WHERE user_id = p_user_id),(SELECT COUNT(*) FROM user_follows WHERE following_id = p_user_id),(SELECT COUNT(*) FROM user_follows WHERE follower_id = p_user_id),(SELECT COUNT(*) FROM community_members WHERE user_id = p_user_id),(SELECT COALESCE(SUM(likes_count), 0) FROM posts WHERE user_id = p_user_id),(SELECT COALESCE(SUM(comment_count), 0) FROM posts WHERE user_id = p_user_id);END;| plpgsql | v | false || handle_new_user | trigger | |BEGININSERT INTO public.users (id, email, fecha_registro, nombre, username)VALUES (new.id,new.email,new.created_at,COALESCE(new.raw_user_meta_data->>'nombre', 'Usuario'),COALESCE(new.raw_user_meta_data->>'username', 'user_' || substring(new.id::text, 1, 8)));RETURN new;END;| plpgsql | v | false || increment_post_comments | void | post_id uuid |BEGINUPDATE postsSET comment_count = COALESCE(comment_count, 0) + 1,updated_at = NOW()WHERE id = post_id;END;| plpgsql | v | false || search_all | TABLE(type text, id uuid, title text, content text, image_url text, created_at timestamp with time zone) | search_term text, current_user_id uuid |BEGINRETURN QUERY-- Buscar usuariosSELECT'user'::TEXT as type,u.id,u.nombre as title,u.bio as content,u.photo_url as image_url,u.fecha_registro as created_atFROM users uWHERE u.nombre ILIKE '%' || search_term || '%'OR u.username ILIKE '%' || search_term || '%'UNION ALL-- Buscar postsSELECT'post'::TEXT as type,p.id,LEFT(p.contenido, 100) as title,p.contenido as content,NULL::TEXT as image_url,p.created_atFROM posts pWHERE p.contenido ILIKE '%' || search_term || '%'UNION ALL-- Buscar comunidadesSELECT'community'::TEXT as type,c.id,c.name as title,c.description as content,c.image_url,c.created_atFROM communities cWHERE c.name ILIKE '%' || search_term || '%'OR c.description ILIKE '%' || search_term || '%'ORDER BY created_at DESCLIMIT 50;END;| plpgsql | v | false || share_post | void | p_post_id uuid, p_user_id uuid | BEGIN INSERT INTO post_shares (post_id, user_id) VALUES (p_post_id, p_user_id); UPDATE posts SET shares_count = shares_count + 1 WHERE id = p_post_id; END; | plpgsql | v | false || sync_user_columns | trigger | |BEGIN-- Sincronizar full_name con nombreIF NEW.full_name IS DISTINCT FROM OLD.full_name THENNEW.nombre = COALESCE(NEW.full_name, NEW.nombre);END IF;IF NEW.nombre IS DISTINCT FROM OLD.nombre THENNEW.full_name = COALESCE(NEW.nombre, NEW.full_name);END IF;-- Sincronizar avatar_url con photo_urlIF NEW.avatar_url IS DISTINCT FROM OLD.avatar_url THENNEW.photo_url = COALESCE(NEW.avatar_url, NEW.photo_url);END IF;IF NEW.photo_url IS DISTINCT FROM OLD.photo_url THENNEW.avatar_url = COALESCE(NEW.photo_url, NEW.avatar_url);END IF;RETURN NEW;END;| plpgsql | v | false || update_community_member_count | trigger | |BEGINIF TG_OP = 'INSERT' THENUPDATE communitiesSET member_count = COALESCE(member_count, 0) + 1WHERE id = NEW.community_id;RETURN NEW;ELSIF TG_OP = 'DELETE' THENUPDATE communitiesSET member_count = GREATEST(COALESCE(member_count, 0) - 1, 0)WHERE id = OLD.community_id;RETURN OLD;END IF;RETURN NULL;END;| plpgsql | v | false || update_post_comments | trigger | |beginupdate public.postsset comment_count = (select count(*) from public.comments where post_id = new.post_id)where id = new.post_id;return null;end; | plpgsql | v | false || update_post_comments_after_delete | trigger | |beginupdate public.postsset comment_count = comment_count - 1where id = old.post_id;return null;end | plpgsql | v | false || update_post_likes | trigger | |beginupdate public.postsset likes_count = (select count(*) from public.post_likes where post_id = new.post_id and is_like),dislikes_count = (select count(*) from public.post_likes where post_id = new.post_id and not is_like)where id = new.post_id;return null;end; | plpgsql | v | false || update_post_likes_after_delete | trigger | |beginperform public.update_post_likes();return null;end | plpgsql | v | false || update_user_interests | void | user_id uuid, new_interests text[] |BEGINUPDATE usersSET intereses = new_interestsWHERE id = user_id;IF NOT FOUND THENINSERT INTO users (id, intereses)VALUES (user_id, new_interests)ON CONFLICT (id) DO UPDATE SET intereses = new_interests;END IF;END;| plpgsql | v | false |




-- Información completa de buckets (CORREGIDO)
| id               | name             | public | created_at                    | updated_at                    |
| ---------------- | ---------------- | ------ | ----------------------------- | ----------------------------- |
| community-media  | community-media  | true   | 2025-09-08 21:27:55.429343+00 | 2025-09-08 21:27:55.429343+00 |
| Images_Intereses | Images_Intereses | false  | 2025-09-19 15:12:19.563953+00 | 2025-09-19 15:12:19.563953+00 |




-- Políticas de storage (ALTERNATIVA - usando pg_policies)
| schemaname | tablename | policyname                            | cmd    | qual                                                                                        |
| ---------- | --------- | ------------------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| storage    | objects   | Avatar images are publicly accessible | SELECT | (bucket_id = 'post-media'::text)                                                            |
| storage    | objects   | Users can delete their own avatar     | DELETE | ((bucket_id = 'post-media'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])) |
| storage    | objects   | Users can update their own avatar     | UPDATE | ((bucket_id = 'post-media'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])) |
| storage    | objects   | Users can upload their own avatar     | INSERT | null                                                                                        |
| storage    | objects   | media_owner                           | SELECT | ((bucket_id = 'post-media'::text) AND (owner = auth.uid()))                                 |
| storage    | objects   | media_owner_write                     | INSERT | null                                                                                        |




-- Posts con todas las relaciones (primeros 15)
| id                                   | contenido                                                                                                                                                                       | likes_count | comment_count | created_at                    | author_name | author_username | community_name |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------- | ----------------------------- | ----------- | --------------- | -------------- |
| b0150eb7-8d24-4486-8447-e91937ce38fd | Invertir en la bolsa puede ser una excelente manera de hacer crecer tu patrimonio a largo plazo. La clave está en la diversificación y en mantener una estrategia disciplinada. | 100         | 15            | 2025-08-17 16:08:01.220564+00 | user  1     | user  1         | null           |
| bf827ee9-78cd-4c51-94a9-997f16a90fc2 | La importancia de diversificar en inversiones no puede ser subestimada. Nunca pongas todos tus huevos en una sola canasta, especialmente en mercados volátiles.                 | 55          | 8             | 2025-08-17 16:08:01.220564+00 | user  2     | user  2         | null           |
| 90c53bf1-99b7-443a-b0f9-c7863cd0d48f | Invertir en la bolsa puede ser una excelente manera de hacer crecer tu patrimonio a largo plazo. La clave está en la diversificación y en mantener una estrategia disciplinada. | 100         | 15            | 2025-08-17 16:01:50.652263+00 | null        | null            | null           |
| 2087bffa-379d-475b-a892-69f2e2365656 | La importancia de diversificar en inversiones no puede ser subestimada. Nunca pongas todos tus huevos en una sola canasta, especialmente en mercados volátiles.                 | 55          | 8             | 2025-08-17 16:01:50.652263+00 | null        | null            | null           |
| 00881e9b-5398-465f-ac02-7ce873c17966 | Invertir en la bolsa puede ser una excelente manera de hacer crecer tu patrimonio a largo plazo. La clave está en la diversificación y en mantener una estrategia disciplinada. | 100         | 15            | 2025-08-17 16:01:23.849041+00 | user  1     | user  1         | null           |
| 042df4e9-16c3-4a5a-bd8c-22f64db5d8e2 | Post demo de user 99                                                                                                                                                            | 1           | 20            | 2025-08-08 06:48:21.182897+00 | user 99     | user 99         | null           |
| 049b3759-2381-463c-b96c-5b9badca0f3b | Post demo de user 43                                                                                                                                                            | 0           | 18            | 2025-08-08 06:48:21.182897+00 | user 43     | user 43         | null           |
| 0c1ff051-c216-4036-a096-16bdfd1f7d3e | Post demo de user 91                                                                                                                                                            | 1           | 16            | 2025-08-08 06:48:21.182897+00 | user 91     | user 91         | null           |
| 10d398b7-c77a-4c8e-9875-dfa8b9c7cd21 | Post demo de user 94                                                                                                                                                            | 0           | 18            | 2025-08-08 06:48:21.182897+00 | user 94     | user 94         | null           |
| 12115658-bb07-41af-b91f-7b8df1afde94 | Post demo de user 63                                                                                                                                                            | 0           | 24            | 2025-08-08 06:48:21.182897+00 | user 63     | user 63         | null           |
| 1376c81d-d12c-4603-a8c7-cd31b7cdd5a7 | Post demo de user 96                                                                                                                                                            | 1           | 18            | 2025-08-08 06:48:21.182897+00 | user 96     | user 96         | null           |
| 1379e39a-3a6f-472c-ad3f-eefe1b6d83f6 | Post demo de user 26                                                                                                                                                            | 0           | 18            | 2025-08-08 06:48:21.182897+00 | user 26     | user 26         | null           |
| 139af62b-fa57-417f-ba6f-b54ae8eea871 | Post demo de user 52                                                                                                                                                            | 0           | 22            | 2025-08-08 06:48:21.182897+00 | user 52     | user 52         | null           |
| 13a6004e-5142-4d88-8fc9-18f159fb2b10 | Post demo de user 20                                                                                                                                                            | 0           | 24            | 2025-08-08 06:48:21.182897+00 | user 20     | user 20         | null           |
| 15395efe-d8e3-42a9-bf53-d62b2b5365da | Post demo de user 90                                                                                                                                                            | 0           | 24            | 2025-08-08 06:48:21.182897+00 | user 90     | user 90         | null           |





-- Comunidades con estadísticas completas
| id                                   | nombre                         | descripcion                                                                    | tipo   | member_count | actual_members | posts_count | created_at                    |
| ------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------ | ------ | ------------ | -------------- | ----------- | ----------------------------- |
| 0683be87-5499-4ea7-b04b-523714c6af38 | Inversiones para principiantes | Comunidad para aprender sobre inversiones básicas                              | public | 0            | 0              | 0           | 2025-08-18 05:09:18.944872+00 |
| 4993f354-fb56-4036-b6f6-36a373a6057a | Nueva comunidad                | demo                                                                           | public | 0            | 0              | 1           | 2025-08-08 06:11:35.148631+00 |
| 4da4e3e3-11c9-490d-a2c8-65f45e52ca3a | Criptomonedas Nicaragua        | Discusión sobre Bitcoin y criptomonedas                                        | public | 0            | 0              | 0           | 2025-08-18 05:09:18.944872+00 |
| 4fcbed7d-fa27-4f0a-aa7f-80d779282ccd | Economía Global                | Noticias macro y geopolítica                                                   | public | 0            | 0              | 0           | 2025-08-08 06:14:58.049299+00 |
| a26a76f3-0c8f-417e-b3ea-b8e116642126 | Finanzas Personales            | Tips para manejar finanzas personales                                          | public | 0            | 0              | 0           | 2025-08-18 05:09:18.944872+00 |
| c4b807db-bb51-4ff3-8ef8-94d093563d37 | Futuros                        | Trading en futuros                                                             | public | 0            | 0              | 0           | 2025-08-08 06:14:58.049299+00 |
| e31e6bf1-00b2-4221-a58a-f615f351f435 | Inversiones para principiantes | Comunidad para aprender sobre inversiones básicas y estrategias de mercado     | public | 0            | 0              | 0           | 2025-08-18 04:18:47.966554+00 |
| ed0e8636-8bc5-4789-a1c2-6cb93cd9bb8b | IA y Finanzas                  | Aplicaciones de IA                                                             | public | 0            | 0              | 1           | 2025-08-08 06:14:58.049299+00 |
| ef9df0b1-9513-451e-a5c7-02710b6e9790 | Finanzas Personales            | Tips y estrategias para manejar tus finanzas personales y presupuesto familiar | public | 0            | 0              | 0           | 2025-08-18 04:18:47.966554+00 |
| f6f91a89-6240-4f53-8e15-fac747ab4649 | Finanzas Personales            | Ahorro y presupuestos                                                          | public | 0            | 0              | 0           | 2025-08-08 06:14:58.049299+00 |
| f9aac7d5-3050-4dd7-ad8e-19044ca9d9df | Fondos Indexados               | Comunidad Boglehead                                                            | public | 0            | 0              | 0           | 2025-08-08 06:14:58.049299+00 |





-- 11. ANÁLISIS DE INTEGRIDAD REFERENCIAL
| id                                   | nombre                         | descripcion                                                                    | tipo   | member_count | actual_members | posts_count | created_at                    |
| ------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------ | ------ | ------------ | -------------- | ----------- | ----------------------------- |
| 0683be87-5499-4ea7-b04b-523714c6af38 | Inversiones para principiantes | Comunidad para aprender sobre inversiones básicas                              | public | 0            | 0              | 0           | 2025-08-18 05:09:18.944872+00 |
| 4993f354-fb56-4036-b6f6-36a373a6057a | Nueva comunidad                | demo                                                                           | public | 0            | 0              | 1           | 2025-08-08 06:11:35.148631+00 |
| 4da4e3e3-11c9-490d-a2c8-65f45e52ca3a | Criptomonedas Nicaragua        | Discusión sobre Bitcoin y criptomonedas                                        | public | 0            | 0              | 0           | 2025-08-18 05:09:18.944872+00 |
| 4fcbed7d-fa27-4f0a-aa7f-80d779282ccd | Economía Global                | Noticias macro y geopolítica                                                   | public | 0            | 0              | 0           | 2025-08-08 06:14:58.049299+00 |
| a26a76f3-0c8f-417e-b3ea-b8e116642126 | Finanzas Personales            | Tips para manejar finanzas personales                                          | public | 0            | 0              | 0           | 2025-08-18 05:09:18.944872+00 |
| c4b807db-bb51-4ff3-8ef8-94d093563d37 | Futuros                        | Trading en futuros                                                             | public | 0            | 0              | 0           | 2025-08-08 06:14:58.049299+00 |
| e31e6bf1-00b2-4221-a58a-f615f351f435 | Inversiones para principiantes | Comunidad para aprender sobre inversiones básicas y estrategias de mercado     | public | 0            | 0              | 0           | 2025-08-18 04:18:47.966554+00 |
| ed0e8636-8bc5-4789-a1c2-6cb93cd9bb8b | IA y Finanzas                  | Aplicaciones de IA                                                             | public | 0            | 0              | 1           | 2025-08-08 06:14:58.049299+00 |
| ef9df0b1-9513-451e-a5c7-02710b6e9790 | Finanzas Personales            | Tips y estrategias para manejar tus finanzas personales y presupuesto familiar | public | 0            | 0              | 0           | 2025-08-18 04:18:47.966554+00 |
| f6f91a89-6240-4f53-8e15-fac747ab4649 | Finanzas Personales            | Ahorro y presupuestos                                                          | public | 0            | 0              | 0           | 2025-08-08 06:14:58.049299+00 |
| f9aac7d5-3050-4dd7-ad8e-19044ca9d9df | Fondos Indexados               | Comunidad Boglehead                                                            | public | 0            | 0              | 0           | 2025-08-08 06:14:58.049299+00 |




-- Verificar integridad de foreign keys
| relationship           | orphaned_records |
| ---------------------- | ---------------- |
| posts -> users         | 2                |
| post_comments -> posts | 0                |
| post_likes -> posts    | 0                |




-- 1. DATOS DE USUARIOS
| id                                   | nombre         | username           | bio                           | photo_url                                             | pais      | metas                                                             | intereses                                           | nivel_finanzas | reputacion | fecha_registro                | email                               | preferences                                             | stats                                                  | full_name      | avatar_url                                            | role    | is_online | last_seen_at                  | location | banner_url | is_verified |
| ------------------------------------ | -------------- | ------------------ | ----------------------------- | ----------------------------------------------------- | --------- | ----------------------------------------------------------------- | --------------------------------------------------- | -------------- | ---------- | ----------------------------- | ----------------------------------- | ------------------------------------------------------- | ------------------------------------------------------ | -------------- | ----------------------------------------------------- | ------- | --------- | ----------------------------- | -------- | ---------- | ----------- |
| 11b85677-cc3b-46dd-9687-04227ecf8a5b | Usuario        | testuser_g2w1l4    | null                          | null                                                  | null      | []                                                                | []                                                  | none           | 0          | 2025-09-12 00:07:38.307935+00 | testuser_1757635658248@example.com  | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | null           | null                                                  | Usuario | false     | 2025-09-12 00:07:38.306932+00 | null     | null       | false       |
| c7a86e69-c90b-4409-a845-973596cab33f | Usuario        | user_c7a86e69      | null                          | null                                                  | null      | []                                                                | []                                                  | none           | 0          | 2025-09-12 00:05:57.822801+00 | testuser1_1757635557570@example.com | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | null           | null                                                  | Usuario | false     | 2025-09-12 00:05:57.820439+00 | null     | null       | false       |
| 411e16db-fd78-48b6-a1aa-849de7b13624 | Usuario        | testuser_bsrryo    | null                          | null                                                  | null      | []                                                                | []                                                  | none           | 0          | 2025-09-09 00:13:13.818939+00 | testuser_1757376798288@example.com  | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | null           | null                                                  | Usuario | false     | 2025-09-09 00:13:13.818582+00 | null     | null       | false       |
| 6284005b-e0c3-4864-bfa7-caa7e54b2741 | Usuario        | testuser_bsn52i    | null                          | null                                                  | null      | []                                                                | []                                                  | none           | 0          | 2025-09-09 00:09:39.056667+00 | testuser_1757376581994@example.com  | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | null           | null                                                  | Usuario | false     | 2025-09-09 00:09:39.053913+00 | null     | null       | false       |
| fa84c0cb-27c2-4f81-9f5b-5a4c77be9844 | ABCDE          | abcde              |                               | null                                                  |           | ["house","travel","investment"]                                   | ["crypto","realestate","funds"]                     | none           | 0          | 2025-09-08 18:51:10.799+00    | abcde@gmail.com                     | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | ABCDE          | null                                                  | usuario | false     | 2025-09-08 18:51:04.614376+00 | null     | null       | false       |
| db96e748-9bfa-4d79-bfcc-a5a92f5daf98 | SEBASTIAN 22   | sebastian33        |                               | null                                                  |           | ["house","pet"]                                                   | ["crypto","foreign","education"]                    | none           | 0          | 2025-09-08 17:24:37.092+00    | sebastian33@gmail.com               | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | SEBASTIAN 22   | null                                                  | usuario | false     | 2025-09-08 17:24:31.114559+00 | null     | null       | false       |
| e4c64fb0-56ff-4c52-9504-0368f8afa298 | adonas         | damda              |                               | null                                                  |           | []                                                                | []                                                  | none           | 0          | 2025-09-08 17:23:26.844+00    | ndasd@gmail.com                     | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | adonas         | null                                                  | usuario | false     | 2025-09-08 17:23:20.924265+00 | null     | null       | false       |
| 871d0db8-d289-4218-9a30-cd2aa7bb04d7 | Usuario        | user_1757351677872 |                               | null                                                  |           | []                                                                | []                                                  | none           | 0          | 2025-09-08 17:14:37.872+00    | abc@gmail.com                       | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | Usuario        | null                                                  | usuario | false     | 2025-09-08 17:14:32.242222+00 | null     | null       | false       |
| c8a3feee-18bf-4ea9-bf0d-3f5ae22fea81 | abede          | abede              |                               | null                                                  |           | []                                                                | []                                                  | none           | 0          | 2025-09-08 17:13:35.932+00    | abede@gmail.com                     | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | abede          | null                                                  | usuario | false     | 2025-09-08 17:13:29.907574+00 | null     | null       | false       |
| 7eadd2a3-1d62-4534-a6ec-cf96fb076422 | ABC2           | abc2               |                               | null                                                  |           | []                                                                | []                                                  | none           | 0          | 2025-09-08 17:11:02.133+00    | abc2@gmail.com                      | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | ABC2           | null                                                  | usuario | false     | 2025-09-08 17:10:56.246393+00 | null     | null       | false       |
| d7a4a6a3-7e5c-4e47-99d8-c7869fdddc37 | SEBASTIAN2     | SEBASTIAN2         |                               | null                                                  |           | []                                                                | []                                                  | none           | 0          | 2025-09-08 17:08:32.475+00    | sebas23@gmail.com                   | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | SEBASTIAN2     | null                                                  | usuario | false     | 2025-09-08 17:08:26.595516+00 | null     | null       | false       |
| aa28c564-af36-4fa9-9951-8a15725bd606 | Usuario        | SEBAS              | null                          | null                                                  | null      | []                                                                | []                                                  | none           | 0          | 2025-09-08 17:02:48.584215+00 | sebas22@gmail.com                   | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | null           | null                                                  | Usuario | false     | 2025-09-08 17:02:48.581945+00 | null     | null       | false       |
| f9e38085-2759-4142-9adb-7e8f00290411 | Usuario        | Gabriel11          | null                          | null                                                  | null      | []                                                                | []                                                  | none           | 0          | 2025-09-08 16:59:57.613142+00 | gabriel@gmail.com                   | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | null           | null                                                  | Usuario | false     | 2025-09-08 16:59:57.611494+00 | null     | null       | false       |
| 9f20c2fe-bb6d-4b8b-ab3d-b3907ed72282 | Test Auth User | testauth_mfbc7o7b  | Perfil de prueba automatizada | https://www.investiiapp.com/investi-logo-new-main.png | Nicaragua | ["aprender_invertir","generar_ingresos_pasivos","ahorrar_retiro"] | ["mercado_valores","criptomonedas","bienes_raices"] | intermediate   | 0          | 2025-09-08 16:29:42.152314+00 | testauth_1757348986439@investi.com  | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | Test Auth User | https://www.investiiapp.com/investi-logo-new-main.png | usuario | false     | 2025-09-08 16:29:42.150764+00 | null     | null       | false       |
| 3b944fd2-1a38-4e20-9fb3-63fa3572c051 | Test Auth User | testauth_mfbacxiy  | Perfil de prueba automatizada | https://www.investiiapp.com/investi-logo-new-main.png | Nicaragua | ["aprender_invertir","generar_ingresos_pasivos","ahorrar_retiro"] | ["mercado_valores","criptomonedas","bienes_raices"] | intermediate   | 0          | 2025-09-08 15:37:47.205731+00 | testauth_1757345872570@investi.com  | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | Test Auth User | https://www.investiiapp.com/investi-logo-new-main.png | usuario | false     | 2025-09-08 15:37:47.205367+00 | null     | null       | false       |
| 930f6088-3f7e-4a02-aefa-cf664633da55 | Test Auth User | testauth_mfba8a4e  | Perfil de prueba automatizada | https://www.investiiapp.com/investi-logo-new-main.png | Nicaragua | []                                                                | []                                                  | none           | 0          | 2025-09-08 15:34:10.364242+00 | testauth_1757345655614@investi.com  | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | Test Auth User | https://www.investiiapp.com/investi-logo-new-main.png | usuario | false     | 2025-09-08 15:34:10.361441+00 | null     | null       | false       |
| 5fe2cf58-6be0-4f2d-8d11-78bf40985771 | Usuario        | testauth_mfba4e70  | null                          | null                                                  | null      | []                                                                | []                                                  | none           | 0          | 2025-09-08 15:31:09.476785+00 | testauth_1757345474267@investi.com  | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | null           | null                                                  | Usuario | false     | 2025-09-08 15:31:09.467685+00 | null     | null       | false       |
| 36d98a94-54ac-4cea-9e50-d1410b43a576 | Usuario        | testuser_mfb3rebj  | null                          | null                                                  | null      | []                                                                | []                                                  | none           | 0          | 2025-09-08 12:33:04.754701+00 | test_1757334790207@investi.com      | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | null           | null                                                  | Usuario | false     | 2025-09-08 12:33:04.753751+00 | null     | null       | false       |
| eb50fabd-6c90-4f3d-ab1a-cfc8f42c9564 | Usuario        | testuser_mfb3r322  | null                          | null                                                  | null      | []                                                                | []                                                  | none           | 0          | 2025-09-08 12:32:50.16057+00  | test_1757334775610@investi.com      | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | null           | null                                                  | Usuario | false     | 2025-09-08 12:32:50.160211+00 | null     | null       | false       |
| 1afd7d97-df6f-4bc1-840f-67f86ee0594c | Usuario        | testuser_mfb3qo5j  | null                          | null                                                  | null      | []                                                                | []                                                  | none           | 0          | 2025-09-08 12:32:30.861888+00 | test_1757334756295@investi.com      | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | null           | null                                                  | Usuario | false     | 2025-09-08 12:32:30.861551+00 | null     | null       | false       |
| 5a5e5cac-29d3-4bb3-8333-0ef1580ffd25 | Usuario        | testuser_b3kmrr    | null                          | null                                                  | null      | []                                                                | []                                                  | none           | 0          | 2025-09-08 12:27:49.893395+00 | testuser_1757334474567@example.com  | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | null           | null                                                  | Usuario | false     | 2025-09-08 12:27:49.89237+00  | null     | null       | false       |
| c0038c97-97a0-49bf-962f-587f611f5f72 | Usuario        | testuser_b3jlev    | null                          | null                                                  | null      | []                                                                | []                                                  | none           | 0          | 2025-09-08 12:27:02.766867+00 | testuser_1757334426151@example.com  | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | null           | null                                                  | Usuario | false     | 2025-09-08 12:27:02.764506+00 | null     | null       | false       |
| f9c20493-15f9-4278-8b64-e73222ed3de8 | Usuario        | sebastianramirez   | null                          | null                                                  | null      | []                                                                | []                                                  | none           | 0          | 2025-09-02 18:29:44.804743+00 | sebastian@gmail.com                 | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | null           | null                                                  | Usuario | false     | 2025-09-02 18:29:44.804373+00 | null     | null       | false       |
| 4993f354-fb56-4036-b6f6-36a373a6057a | Admin          | admin              | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones"]                               | none           | 0          | 2025-08-08 06:19:51.623853+00 | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | Admin          | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 02de0208-6d2a-45c6-a381-5dbf2adf6a55 | user 32        | user 32            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 32        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 4ccc839f-d5e8-44b5-a5dd-7c2da0f25dc1 | user 33        | user 33            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 33        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| efe362e7-6029-44a8-85d2-bebe4d165949 | user 34        | user 34            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 34        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 356fa732-aa31-496b-a14f-1e499cd02fd6 | user 35        | user 35            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 35        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 299d875d-ff7f-4a86-80c0-6948929d1d78 | user 36        | user 36            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 36        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| f06d15ed-91e0-4544-bfd2-7204688a6177 | user 37        | user 37            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 37        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 04596a15-c5eb-41b5-b1b7-fe10543495c5 | user 38        | user 38            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 38        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| dd86887a-e77e-4078-879a-54f6d8dd941b | user 39        | user 39            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 39        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 2cdc4d7a-4ba7-4d47-b725-10028cb708f4 | user 40        | user 40            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 40        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 55bd1ca7-6729-4d47-b65e-a17b872f0c29 | user 41        | user 41            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 41        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| b310725e-d2d2-4b61-a836-7eb214883334 | user 42        | user 42            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 42        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| b1aaabb6-3e9e-4c7b-bac6-a49ff5d8936d | user 43        | user 43            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 43        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| f0a03e31-e129-49d7-86e7-81d2e4aee50f | user 44        | user 44            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 44        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| fb7a0c1f-1bd2-4e49-b291-0862f340bcc7 | user 45        | user 45            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 45        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 1f6200e5-1158-44b8-b983-e94442808b98 | user 46        | user 46            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 46        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 81d59132-559c-4fba-a5b1-2d1cef9cd4a5 | user 47        | user 47            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 47        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 39d79569-36f5-4fe2-ab10-517b1594703e | user 48        | user 48            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 48        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 3fe721bb-7ce2-41fd-a16a-a64b5d161282 | user 49        | user 49            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 49        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 574482d8-b950-49f5-bea6-407f64ddd515 | user 50        | user 50            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 50        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 14812879-96cd-486c-b3f0-aee57f918ffa | user 51        | user 51            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 51        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| f10dc0e6-7cab-45fa-8811-d504cac87683 | user 52        | user 52            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 52        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 94a06e04-b6d6-4414-a6d7-4b87a756f9f9 | user  1        | user  1            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user  1        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| f0532d69-71bc-46a2-80dd-c7096295a3e3 | user  2        | user  2            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user  2        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 3125aa61-d3d4-4002-a987-958f780a325b | user  3        | user  3            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user  3        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 54b0e944-2937-4a64-a321-6be9950c8a82 | user  4        | user  4            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user  4        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 43f30a87-30a6-48ce-a5c0-63f6cbe0738b | user  5        | user  5            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user  5        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 5f556435-09d1-4bc9-a139-05dfa2a5dd3d | user  6        | user  6            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user  6        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| f2fd9861-d0ec-483c-801c-96aa807da361 | user  7        | user  7            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user  7        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| eeac70a1-9970-45ed-92e0-0d604395fc70 | user  8        | user  8            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user  8        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 66241782-b5ed-4a09-8f68-1d53e4f3f8e5 | user 54        | user 54            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 54        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| e4456eb4-b906-4d8a-9216-06e6844b12af | user 55        | user 55            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 55        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| fb5a50c3-4639-497f-892c-33bde342bcad | user 56        | user 56            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 56        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| fdb11614-1164-4805-a332-6165fb3f0f6c | user 57        | user 57            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 57        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 64118d6d-d35f-46c7-8915-482d109e012a | user 58        | user 58            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 58        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| a697c7fc-7ac6-4cf6-8bd0-176d2f45f6e2 | user 59        | user 59            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 59        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 279548cd-c8a0-4561-a563-d3a71ab93f38 | user 60        | user 60            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 60        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 19d12d9d-bbbb-4443-bdcc-3aa0c924f70e | user 61        | user 61            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 61        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 03f0b0ad-72cd-491f-9012-ce958332688c | user 62        | user 62            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 62        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 216eacd7-63c6-4d03-9d44-df6833d109d0 | user 63        | user 63            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 63        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| c3afd606-5699-4e4b-b478-d018cd6e1cce | user 64        | user 64            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 64        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 12f8abe3-9dfd-49e8-9a0a-69feec8f3fb0 | user 65        | user 65            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 65        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| b67a4534-ae5c-4ad7-adf5-e9c03a89bfab | user 66        | user 66            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 66        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| b89d6919-9560-4e91-8e6e-e1f1b609e4a4 | user 67        | user 67            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 67        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 043733c7-e17d-40b8-bfa3-83b1809dfd99 | user 68        | user 68            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 68        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 6084eaa9-08f2-48fa-93f9-77557a864466 | user 69        | user 69            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 69        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 22d38629-d1a5-4384-92aa-da9130b14d76 | user 70        | user 70            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 70        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| f6a761b1-2c10-444f-9702-d786fec54d25 | user 71        | user 71            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 71        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 919e81a1-60d9-41a5-9541-7a47d23246c1 | user 72        | user 72            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 72        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| b83c640d-4ab4-4217-afe9-b10b242f784a | user 73        | user 73            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 73        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 93fb520e-a238-42ac-aeae-e681cf43c75e | user 74        | user 74            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 74        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 0e0599c4-ded4-4f22-9289-5fc57c2430e4 | user 75        | user 75            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 75        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| f68fccaa-3e57-4aa1-9edd-7eeadf96bc5f | user 76        | user 76            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 76        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| b42d9f3d-657f-4db5-a560-d56cf7e021e0 | user 77        | user 77            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 77        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 87d0280f-726f-4bee-b73e-b410c1f56090 | user 78        | user 78            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 78        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 8a922fd0-cc92-41b1-8285-c77283d63be2 | user 79        | user 79            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 79        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 7a5840f4-d5f9-4c84-96cb-55faa6022d20 | user 80        | user 80            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 80        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| afbde775-8889-4a5f-a6ac-3d52a9e9507c | user 81        | user 81            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 81        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 52de8e1e-17dc-4636-8f28-494a2aed3df9 | user 53        | user 53            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 53        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 288ee850-e0c0-4a16-b4f9-71c70cd52062 | user 82        | user 82            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 82        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| c4b89bae-e39d-465c-a560-40d6d3ebe36e | user 83        | user 83            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 83        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| ce732357-10d3-4475-8a96-9fee171ef0e1 | user 84        | user 84            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 84        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| fa920bd9-c3f8-429f-9976-d6d25691fcf6 | user 85        | user 85            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 85        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| ccfe3e94-d6ac-4023-9231-f4c7ea7a79c4 | user 86        | user 86            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 86        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| b6d622d8-53f5-47b0-876e-ca7995df2f97 | user 87        | user 87            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 87        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 00a09d72-a43b-4ae6-972d-47021569bd48 | user 88        | user 88            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 88        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 9f5128d5-3450-4ba7-bbcc-cb91c18c1095 | user 89        | user 89            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 89        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 9e28815c-35f7-4e35-9262-8447acf09ae4 | user 90        | user 90            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 90        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| f1a55fa2-3f27-47a4-b402-3d1728442ed8 | user 91        | user 91            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 91        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 089a267f-a842-4067-b95a-f65f1e7d9c35 | user 92        | user 92            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 92        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| e0eae48b-9a18-49c2-b3d6-0b6805dfc696 | user 93        | user 93            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 93        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 98d1a003-b5af-4fb1-aae5-b4d4532f7186 | user 94        | user 94            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 94        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| d4fb92dd-2049-4ac9-b323-63ba02c2cfa8 | user 95        | user 95            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 95        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 91c8a9d1-98ef-405a-8835-577bb60797bb | user 96        | user 96            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 96        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 4fbffd2a-e7af-4a02-8724-7b97bcbb15cf | user 98        | user 98            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 98        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| f1498268-3974-4373-ad2d-48c49f3c5eca | user 99        | user 99            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 99        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| b494451d-9f7f-4918-9239-c24a0ccad942 | user100        | user100            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user100        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 0e5607cc-65c6-48ed-9560-f560d4244280 | user 97        | user 97            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 97        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| c36e7fb5-91b5-446e-8e5b-a2a37a637da8 | user  9        | user  9            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user  9        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| bf69d25e-b8fe-4cde-84f4-89a0e7c1bd4f | user 10        | user 10            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 10        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| a571a16b-2580-4e70-b3ee-327fc2333f6c | user 11        | user 11            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 11        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 33d414cb-476d-45cf-9893-178598be49ff | user 12        | user 12            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 12        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| fa57c7d6-883d-4787-a3dc-4501e3dd16b4 | user 13        | user 13            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 13        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| a5a0d041-13d6-4666-8be7-be5b1b9606d5 | user 14        | user 14            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 14        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 96b2659e-7610-4935-aeb8-c1085a131352 | user 15        | user 15            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 15        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 71e7f5fe-eb8f-4fe5-86f8-d2f33ddfd465 | user 16        | user 16            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 16        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| fa97c16d-26d2-4abb-88fc-f006dffaf7fb | user 17        | user 17            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 17        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 92ad925a-5b38-47be-8e68-8ea67079edad | user 18        | user 18            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 18        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 837f4b44-54fc-44b2-8d1e-ce7e570c34e6 | user 19        | user 19            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 19        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 88ad3c22-361e-4205-8aa9-22a85053ed4e | user 20        | user 20            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 20        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| d3051ca8-c864-4f38-9bc1-9a1b81d31a32 | user 21        | user 21            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 21        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| b789dc94-23a9-44ae-ba9e-6eb686276c40 | user 22        | user 22            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 22        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| d99f1b9f-1260-435e-8a6d-43589f96745b | user 23        | user 23            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 23        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 363cc478-01d0-4349-bfde-a0366f988aa9 | user 24        | user 24            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 24        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| e4a4195a-ed61-4dd1-be7c-745c2691455f | user 25        | user 25            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 25        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 4b5e1731-376f-4414-9653-e37782adcdbe | user 26        | user 26            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 26        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 7f255c74-f672-456b-8c3a-1b8db5294bec | user 27        | user 27            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 27        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| ed8f5f0d-f70d-4ff4-9b24-dc7855bed902 | user 28        | user 28            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 28        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 74cacc35-66bf-4524-aa51-defd51daea13 | user 29        | user 29            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 29        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| d4e60ce5-7d43-41ac-9a28-d3090cf0db78 | user 30        | user 30            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 30        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |
| 9ac2e120-9b1a-4e5c-8c03-92d847ba1a1c | user 31        | user 31            | null                          | null                                                  | NI        | ["libertad financiera"]                                           | ["cripto","acciones","etf"]                         | none           | 0          | 2025-08-08 06:15:10.71612+00  | null                                | {"theme":"system","language":"es","notifications":true} | {"postsCount":0,"followersCount":0,"followingCount":0} | user 31        | null                                                  | Usuario | false     | 2025-08-18 14:22:30.768535+00 | null     | null       | false       |




-- 2. DATOS DE POSTS Y CONTENIDO
| id                                   | post_id                              | user_id                              | is_like | created_at                    |
| ------------------------------------ | ------------------------------------ | ------------------------------------ | ------- | ----------------------------- |
| 50cd53fa-339b-4f53-b25f-ce2968df8ce6 | 1da3dfcd-fa44-469b-a8a2-acda3673df2e | 871d0db8-d289-4218-9a30-cd2aa7bb04d7 | true    | 2025-09-19 15:31:10.908173+00 |
| 0c2131df-a979-4a02-9067-4b988e3e9d78 | 241fc885-7ebf-4d02-92ff-1dd8e6dfbd07 | 871d0db8-d289-4218-9a30-cd2aa7bb04d7 | true    | 2025-09-19 15:31:09.965116+00 |
| 72f78a01-b742-478b-8e29-08ed9f247e4a | 274a046b-9a7a-4ccf-a702-f8e06408af57 | 871d0db8-d289-4218-9a30-cd2aa7bb04d7 | true    | 2025-09-19 15:31:05.624988+00 |
| b4784785-8ba1-4d12-92eb-fe44119f0ced | c73ac8ff-8147-4116-b134-c874fb37639d | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 0e8511b9-5a80-4dad-89c5-0860aa2d14ed | 89b45d56-9acb-44f0-8a1c-7be72d1645b3 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| d8309d4f-ebad-4a70-8b37-2be3f16bc8ee | 8a5e875c-3911-4790-a713-970b3c2d2471 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 6b51af80-a29c-4ec8-8dce-318cf0baca6f | 8bc94cbf-3939-4f94-979b-bc8619dd867e | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 0f8dd0d0-caa2-4544-94ad-905bc7358af2 | 9079ce94-406c-4511-b695-e08d61c5b7f4 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| ae855747-7c3f-4538-84fd-b5dfe6152dd1 | 923e27dd-b9d7-49ee-8499-fd3983a9ef24 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | false   | 2025-08-08 06:48:21.182897+00 |
| 850c3588-3764-4afc-98d8-bca25b14d163 | 9b8a0926-dca3-4519-8272-190530fab7c7 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 2a7584d8-e7fd-4860-870b-fbdbb0271705 | a03326cc-d681-4a7f-b31b-b09660587e4c | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| cb0b5fd9-f8d5-4585-b675-e16cc02c6217 | a067c818-7d36-4341-9251-4222ac86c7f4 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| f856efb9-a302-438e-9361-4539c713f2b5 | a0b91297-246e-413c-a580-695698cbbd20 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 6526ad9d-75e6-4cba-9af6-c87ab587c0c8 | a1f356e6-b48c-4afc-a39b-92b9964e78b9 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 252f822c-c729-43e9-9505-cf549bfcb5b8 | a203b6e1-1a48-4bd0-b01e-09dec0660fe6 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| beadd6ca-c0ec-40be-86e5-5b51ac22175e | a355a390-0f12-4ff7-a773-ad5ae7524af4 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | false   | 2025-08-08 06:48:21.182897+00 |
| de6a3b3d-e618-4e5d-af1c-92a2b717fe76 | a3da5632-ba15-48f8-b074-7837ae8aa746 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 1b64fb45-bdff-4f48-a45e-4a8d8d726925 | a437cd2a-798e-4848-a484-09710507e1fa | 356fa732-aa31-496b-a14f-1e499cd02fd6 | false   | 2025-08-08 06:48:21.182897+00 |
| cdfb4ef5-4344-46cf-bd4a-6584af77076a | a6d7dd8b-7d2a-44f2-9dd2-23b32f564ebf | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 04c29c8b-2c7a-4726-b33f-7d8d6d828182 | a9862b7a-3bdb-4998-92c4-edaf28ab3813 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 972df43c-f626-4857-92c1-2815e37d2351 | aa7a5012-68ac-4c67-8bbe-44d5df2d51cf | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 2b8f8c7b-6892-47f2-b421-7c774982686c | af27a2cf-4811-4db6-bcf5-b94e5973de49 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 33d34c4b-5edf-4378-bf56-a5e86728efa2 | afb85945-1e39-4311-851a-4b6f9a2b14f3 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| f59285c9-1469-403d-9545-2039395747b6 | b084584c-2c5f-4718-a43c-15bba66474b4 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | false   | 2025-08-08 06:48:21.182897+00 |
| 449f44ad-87d3-41d2-bf55-1c34644b93ca | b1526c94-4554-4879-8d6d-174d86266f1a | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| f79ee40e-305a-45b1-b2c2-5f25e199a9f4 | b16b9396-1740-4cd5-a156-d5a4b193bd56 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 809b932f-7753-42e6-bd5b-7a93cc083bd6 | b420a708-7b16-4e70-aab9-db78e3d54b32 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 4fc10487-c74a-4f32-b0ed-93eefe12a0c7 | b61d2768-844b-4d15-bbc1-4c319ec6c5ee | 356fa732-aa31-496b-a14f-1e499cd02fd6 | false   | 2025-08-08 06:48:21.182897+00 |
| 77a5075f-b94e-4794-bc38-4e29d4b65a04 | bcab0904-8dc3-42e4-bff0-5f976efa25b8 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| f7076755-e278-4bb9-a09d-739a6a2c2c11 | bda51edc-4183-492d-b0fd-4f255217c8cf | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 8a25dac5-5c15-430c-95e4-3d9312c417c5 | c1491d04-57ea-4643-b48c-0f2ddced39a6 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 2d497f09-3f6a-4b8e-84dd-2d645b90962e | c2892768-e5bb-4c1d-87f2-ec8803185412 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 3ca85c8c-461f-4fb3-8259-4d01a4fd4a31 | c3134915-b62c-4c2f-a2d4-75fff7827a4c | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| bc0030e6-26ab-4d5e-8d88-12a1cce75605 | c3d4885b-f479-4cf5-8b6b-89ff03d7233c | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| ea264232-f6af-4e91-b6b4-3223069614b0 | d030fab8-0f6e-4804-8b98-30703c7cf190 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 54c7d97f-0bf2-47b3-982c-2b9d759a6f06 | d21c9371-1a0d-42aa-8167-5c22baa06813 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 153d2a00-569e-4b6f-b9cf-8d680cb9a534 | d283aabc-a6d7-4042-9379-f1bc4202ff8c | 356fa732-aa31-496b-a14f-1e499cd02fd6 | false   | 2025-08-08 06:48:21.182897+00 |
| b70cfb3c-9a49-40c4-9867-869a88a54b05 | d83b6885-4e49-4242-a18c-3ed34f5592d1 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 8b86fc4b-16bb-421c-9e95-a041dc2352e2 | d91c68cf-87d7-4a84-944b-6f88a2b7fe1b | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 5db2605e-9b7c-4dba-ba6e-065addf50f7b | d96c5553-19a6-4c69-875d-ce85162a215e | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 8632e4e6-95cd-4069-a123-256c91b86339 | db167250-7191-4e1f-8b0a-46e78b919bf6 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 1d20cd54-5811-4f72-871f-8d4d49a8ec00 | dd3e1266-0655-4110-8ddc-d134e621458e | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| a0839f7d-6431-4349-b055-98107958417c | ea2764ae-e18f-4cbb-9b77-ccb633925c3c | 356fa732-aa31-496b-a14f-1e499cd02fd6 | false   | 2025-08-08 06:48:21.182897+00 |
| e108d157-76bf-4a9a-9ad3-9b4417f67357 | f06fa14c-1f00-42da-977b-0e399e8914cf | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 6eae29d6-57ac-469d-9c53-3c1f78cded69 | f1c06368-e2b2-484c-a7c9-d97c42360260 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| b7f2c885-9752-4b59-abd7-3519523f36ce | f76d725f-d496-4de8-ac8e-e3e4bbe784fd | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 1b0dfcad-a561-4490-b8d4-3ccd3512b5eb | fe325c2d-71de-4d61-92f2-c071972b6e73 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | false   | 2025-08-08 06:48:21.182897+00 |
| 9050c1f7-6185-4f47-9d8b-8ce52ee9b2f1 | ff5806f4-cdd9-451e-af52-b90ec4e4d4f4 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 0bfdbdae-2297-4d30-8a09-aea7f0600aca | 042df4e9-16c3-4a5a-bd8c-22f64db5d8e2 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 29e3144a-1355-4a1b-991b-6c0ac3e64aab | 07baf750-2d5f-4ce1-a080-e24720b837a2 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | false   | 2025-08-08 06:48:21.182897+00 |
| bb46732b-75fc-48e6-adac-1f51f419082b | 08bbf724-186f-4fdf-b522-06596189974b | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 30fe4bb2-60da-450b-919f-cb9275fe34d2 | 0be8fff4-7ae7-42d8-aac1-a4d6d9148140 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | false   | 2025-08-08 06:48:21.182897+00 |
| 2ac45939-0500-4fac-8ae4-a56da1379e55 | 0c1ff051-c216-4036-a096-16bdfd1f7d3e | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 4d5f0a85-0ac4-458e-8ad8-b431776cf2d2 | 1376c81d-d12c-4603-a8c7-cd31b7cdd5a7 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 2f09dc22-81fe-4847-b3a7-fcfb202d5ab0 | 18a469d3-b5e9-4708-b25f-0526129a5931 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 6ad8ffa7-50f7-444d-99a0-75d9d64376a6 | 19442a4b-92ae-4678-9d30-a007dde255bf | 356fa732-aa31-496b-a14f-1e499cd02fd6 | false   | 2025-08-08 06:48:21.182897+00 |
| 1cdf6371-fd81-49dc-96b8-f3fd32f54c3d | 1998ad4d-2bef-44d7-9dab-b0df3a1461d0 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | false   | 2025-08-08 06:48:21.182897+00 |
| e3c916f2-ae27-4606-aa8d-9cc4343c6454 | 1b99d382-f0d5-4a53-971e-e965054e0712 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 5315be46-d8e0-43d4-9fb5-16dbb07039ae | 1da3dfcd-fa44-469b-a8a2-acda3673df2e | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| f38bbfa0-0230-4aa9-a662-590af0591a53 | 21d2e84e-bb9c-43b6-9181-4301d5a68c08 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | false   | 2025-08-08 06:48:21.182897+00 |
| 4552cc69-00f4-4fd0-b9ce-088c5aaec4e5 | 241fc885-7ebf-4d02-92ff-1dd8e6dfbd07 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 557e22b4-4019-4214-8465-77b835b9b9ce | 26bc2ea1-b4ee-488a-b921-9226531da902 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 802cd732-7f3f-4f3b-8841-730814eab8e4 | 274a046b-9a7a-4ccf-a702-f8e06408af57 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| a49aacd7-cd43-437b-b8e6-badba82afd2f | 29c23b39-e9bf-4c98-a26d-7149ac4ddd36 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 1db80124-c21d-4380-bacb-5b97349c95f5 | 2bcc019b-9646-4cf9-a933-43d80980ba1f | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| b5b597b3-c2be-4f87-982c-fe00dcad807b | 2bdc81c1-0c57-4916-bf3d-49841ca2e1e6 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| f1c21fc5-335b-4f0c-8771-4fc972a334d9 | 2dd80905-0cd1-4195-bd22-aa37ba2615d4 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 95cb6a28-a507-45f8-8042-a099d2dc580f | 322773ca-71a5-4671-ab97-8fe6c4517fbc | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 578970f0-7762-4248-94fa-493e05013ea5 | 336ceb5c-1ad6-4485-a35d-6b16c870624d | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 9dd04d0d-0a29-4aa5-bc33-7802117f9324 | 36af2e05-ec04-4027-845e-97a992a06078 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| e0ebafa3-baa6-4faa-aad2-ce94ba60d484 | 417146bb-8737-4734-9893-0f1975db17d0 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | false   | 2025-08-08 06:48:21.182897+00 |
| f3934126-3ccc-4d54-89d4-d3564441330c | 41c0db0c-f126-445d-918c-a071157a1b72 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 63c081a0-b60f-4f6f-b6df-722e724d1926 | 42edd3d1-3490-4af0-aadc-74f066cb26d2 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 452f8826-beb6-476b-9f04-5c5c85795d83 | 4507c230-389e-44c2-ac73-dd92fa57794a | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 3a37b4eb-e3df-4f77-9be1-68900f181974 | 4b8268c0-d714-4c9e-88ed-acc670d62c06 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 67474e20-b896-4e02-b4be-fbf249387ac1 | 4d8362e7-2c97-4a88-addb-ea034b348647 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 5847a94b-3c1d-413d-ac02-947eeda40732 | 5443c409-89d0-4e57-beb4-be9c088f4663 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| bd40fbd3-c640-4144-b77b-a46c23864726 | 58e7fc89-86be-4cb1-8f2c-053eae7ca974 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 71fc2550-296c-4f43-aba3-6a8a0227db84 | 61e2b224-8651-461f-b4e8-3691cbe71714 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 0110ff53-6e5f-4e43-879f-5f9c87161be6 | 6302eb16-8fa0-473f-a6b9-b95184475094 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | false   | 2025-08-08 06:48:21.182897+00 |
| 353c94f3-0a43-484a-9a1b-13c4eb125767 | 65cce0ef-98f4-4713-9e46-83b999813e46 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| aaed1a82-73c4-45c8-b794-4f57d418ba43 | 665b7f14-1f75-41ae-9212-39ef8e1bbe0b | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| ce38d01f-452c-46ac-9010-6fba4c4d2844 | 6755cab6-801b-4924-8367-ed4e839317dd | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| c71e405f-4a0e-49fe-9a4b-1f83b35153de | 6ce1b253-fa5e-4221-813f-8e522785d1aa | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 4cc4344c-8000-4e5f-bf79-bcc39dc6ef60 | 726af4e6-03d2-4136-8abd-9a0eba0c463c | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| c8978f9f-4506-4091-8060-5d95801007c7 | 73a39d6b-6ed9-44f4-b70b-1fab39e15c5c | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 27230883-2e3a-4fbc-8f12-333734fde94c | 7460020b-3ec3-454a-bbcc-f23a13179b90 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 7b3d20fb-0f06-4981-b3c1-2637dca0c2bf | 77cfaba6-4fa3-4fa8-bc02-9eb13cedad2a | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| dbdf5552-3b9e-41c8-99b4-2b7e56becbe2 | 7a2f4624-2f35-46a5-a5b1-2e43e84cc4af | 356fa732-aa31-496b-a14f-1e499cd02fd6 | false   | 2025-08-08 06:48:21.182897+00 |
| b9de743d-d2bd-462b-ade8-8573a3bc4107 | 7f9c98ef-d0d9-4950-bbf8-302e8f13ba9d | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 14a1481d-b421-4a89-9a00-80936d938cab | 81289ec6-2500-4f67-97a9-bac57f6d95b4 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 344bfbf4-5575-4a39-a0b2-73997e7d8235 | 8586a79c-366f-43d8-b810-cc9c844a4398 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| 1263ddf9-c3ab-4110-be83-5c1608b78433 | 863ce465-4f62-4ea7-959a-723776009768 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| abc8ca96-ed84-4fbb-b489-572b8759fbd3 | 873d13c2-5858-47c0-853c-ecbca9eb34a6 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true    | 2025-08-08 06:48:21.182897+00 |
| f2c575b1-7246-4e40-a946-20ba6bb9dd62 | 2e01fbe3-e0d5-4ca5-934b-b00135e62aa6 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 2fc14db5-1091-4267-8470-9f9101c0443a | 985f65e7-a184-4e02-bd20-7144d0cb0313 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 280e8115-c5b3-4b09-ab74-25d5a45a2864 | 9776fe22-8e30-4eaf-b7de-17bbff431aa9 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 2b0b5f6b-4407-4449-8480-548d1ec4ca80 | 651040f6-2250-44d0-8ad4-e0543a980730 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| f003081f-f09b-401f-8c0e-678095a70752 | 19442a4b-92ae-4678-9d30-a007dde255bf | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 4102e51e-c4ea-42ce-a62b-0669dc6ce5e7 | 726af4e6-03d2-4136-8abd-9a0eba0c463c | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 431d257f-3a91-44c5-801b-ca5e2f6a6267 | a203b6e1-1a48-4bd0-b01e-09dec0660fe6 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 4c5080b9-832a-44b4-ba09-77722e8c29da | 45dd038b-0d64-4f75-8e98-ca9fe2afe28e | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 129f7fdd-61b3-4386-a3bc-80eeb50b08a4 | 7fdf7c52-c40b-4efe-b842-93345dde3992 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | false   | 2025-08-08 06:20:33.691583+00 |
| 4d0c90ee-6747-4d68-94c3-b3b5d92431f3 | 863ce465-4f62-4ea7-959a-723776009768 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 67ada823-6c7a-4dfc-ad04-3e64a436dbc5 | 5443c409-89d0-4e57-beb4-be9c088f4663 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 0fb7b3be-bd95-4cfa-b21f-006534984d0b | 276daec7-931f-417f-803f-2bd42d8a95d1 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| a4441c9d-d950-48f0-8101-7abaf3048370 | 21d2e84e-bb9c-43b6-9181-4301d5a68c08 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 58a16864-577b-4d1c-9963-db0c6397b3b1 | 87afabd6-dedf-4f58-a88c-0d6c248a174f | 279548cd-c8a0-4561-a563-d3a71ab93f38 | false   | 2025-08-08 06:20:33.691583+00 |
| 987fb40f-7129-4028-ba00-b6713b94e295 | b61d2768-844b-4d15-bbc1-4c319ec6c5ee | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 27d7fa18-80a3-4005-88f3-18b63522bd06 | 2c5c1632-38be-4c76-a550-356f7d1ed5cc | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| a966f20e-80f2-432a-b00f-251a04ef4c57 | d1c47ef7-1395-4fc6-bf16-9a48af145e30 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| b8102b76-50f7-406f-8d6a-6943f71acb4e | d030fab8-0f6e-4804-8b98-30703c7cf190 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| caf3c84b-6d20-4e58-88a3-a7809cc65069 | 3d715c45-5439-4aa8-8e38-71980498247f | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 49104df9-86e8-4729-9bee-25017e2cda2a | e9099f3e-0b1e-4d5e-8851-ceaa17dc9b59 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| ff55626e-4f0d-48c7-81a4-d6ea819c582c | 1c5731f7-5fb6-4877-a4b3-830bc01465dd | 279548cd-c8a0-4561-a563-d3a71ab93f38 | false   | 2025-08-08 06:20:33.691583+00 |
| f0a049ae-1be8-4c58-8aeb-53deae9951c6 | a9862b7a-3bdb-4998-92c4-edaf28ab3813 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | false   | 2025-08-08 06:20:33.691583+00 |
| 8b01cc6b-a9f4-4dbc-b5be-8b82723cd60c | 063a8265-8596-4e6a-bc95-9bb5a9596401 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 56465e30-6c29-405f-b23e-ec639c8434ea | 04c7bf62-69f1-419d-95dc-306c791300d2 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 4acd947d-46da-4681-bf76-363ed8add49b | 1abe7da5-95ba-46ee-9335-026481d189ad | 279548cd-c8a0-4561-a563-d3a71ab93f38 | false   | 2025-08-08 06:20:33.691583+00 |
| 9a9287cf-ac01-497a-bed2-590dbc041a7a | 11ecdea4-96f5-48c7-8227-efc49c08d400 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 8007b67a-8d66-4fae-88ae-29176ef089e1 | 08fd1822-149f-44b5-b10d-545d14f7d385 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 4334dab1-20a1-491e-999e-1c553e832ffb | af27a2cf-4811-4db6-bcf5-b94e5973de49 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | false   | 2025-08-08 06:20:33.691583+00 |
| 969962be-6557-4296-aa9c-f116102ee2d3 | 8b2a02b3-ad68-4fe0-a511-82c283351ca8 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | false   | 2025-08-08 06:20:33.691583+00 |
| bdb3cd40-4727-418a-9de6-254a11d234dd | 2a1158f0-9d91-4da8-84a5-1a83b39ea51e | 279548cd-c8a0-4561-a563-d3a71ab93f38 | false   | 2025-08-08 06:20:33.691583+00 |
| b2b88b0d-5bc9-4bab-b5cd-a12c54756cf1 | 36af2e05-ec04-4027-845e-97a992a06078 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 0298a9ed-7066-467d-9bed-a32787959cb1 | 8586a79c-366f-43d8-b810-cc9c844a4398 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 78ff2d9a-9f23-4a6d-bde5-0018804b262a | 8422f0a6-780d-4280-9891-79ffdfcaddb2 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 2427085f-1d03-4c8b-b51b-eef866caa56b | 5db66944-cacd-4238-b094-633250aa5580 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| ff93ca25-238c-426d-99a7-4ced3d942c19 | 160d594a-5d48-4102-bee4-f65e6ad68365 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 663a04ae-23b9-4e7c-a197-1dd360ac94fd | a03326cc-d681-4a7f-b31b-b09660587e4c | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 8d06d463-957b-446b-af40-b8cffb8f922f | b241d447-7acb-440f-a340-2c09717f386f | 279548cd-c8a0-4561-a563-d3a71ab93f38 | false   | 2025-08-08 06:20:33.691583+00 |
| 9ac4b977-8d80-4377-8545-a04987ded2e4 | 2bcc019b-9646-4cf9-a933-43d80980ba1f | 279548cd-c8a0-4561-a563-d3a71ab93f38 | false   | 2025-08-08 06:20:33.691583+00 |
| b2f72eb6-5167-46f2-8640-98beea953537 | c3134915-b62c-4c2f-a2d4-75fff7827a4c | 279548cd-c8a0-4561-a563-d3a71ab93f38 | false   | 2025-08-08 06:20:33.691583+00 |
| 70d61d4d-bc22-4f43-9d0b-a2362ebce1fc | f7015659-e734-4e74-a944-776455a8a6c6 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 0f122356-b70b-47b6-b06a-f47456901b20 | 17ca55ae-e48e-4cf6-9e3c-416754d4384c | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 5c3cc6c5-79f1-4c51-9485-1d3f2b7ba950 | 9b8a0926-dca3-4519-8272-190530fab7c7 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| aba83c8c-6e8e-439d-82f5-67cbda4b059f | 5d5d083d-01d6-4242-a316-31cb864bde7d | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |
| 8a1e5095-7502-4a00-a304-71b6bd6209e3 | 7460020b-3ec3-454a-bbcc-f23a13179b90 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true    | 2025-08-08 06:20:33.691583+00 |




-- 3. DATOS DE COMUNIDADES
| id                                   | community_id                         | name                 | description                          | type | created_at                    |
| ------------------------------------ | ------------------------------------ | -------------------- | ------------------------------------ | ---- | ----------------------------- |
| 9d9f277b-424c-4d01-90a3-fdb15c2b006c | e31e6bf1-00b2-4221-a58a-f615f351f435 | Chat general         | Conversación general de la comunidad | text | 2025-08-18 04:44:59.556678+00 |
| c976237c-03f3-4d46-b376-2285967030c0 | e31e6bf1-00b2-4221-a58a-f615f351f435 | Hablemos de finanzas | Discusión sobre temas financieros    | text | 2025-08-18 04:44:59.556678+00 |




-- 4. DATOS DE CHAT Y MENSAJERÍA
Success. No rows returned




-- 5. DATOS EDUCATIVOS
| id                                   | user_id                              | lesson_id | completed_at                  |
| ------------------------------------ | ------------------------------------ | --------- | ----------------------------- |
| b9152083-0943-466d-91b0-d3f98b4eea08 | 33d414cb-476d-45cf-9893-178598be49ff | null      | 2025-08-08 06:29:20.405468+00 |
| 3e7a693c-3d99-4ee4-ae14-ac82e7beb664 | a697c7fc-7ac6-4cf6-8bd0-176d2f45f6e2 | null      | 2025-08-08 06:29:20.405468+00 |
| e1bebd66-6557-4761-bab0-6f3fd6d0fbf3 | 363cc478-01d0-4349-bfde-a0366f988aa9 | null      | 2025-08-08 06:29:20.405468+00 |
| 5fa2e005-330e-4085-bfac-23e08cde002b | d3051ca8-c864-4f38-9bc1-9a1b81d31a32 | null      | 2025-08-08 06:29:20.405468+00 |
| ddc58d71-6b78-4482-9274-b65d84770c1f | b789dc94-23a9-44ae-ba9e-6eb686276c40 | null      | 2025-08-08 06:29:20.405468+00 |
| 6d9d5225-ba98-4b56-9532-b034a9d959fa | 4ccc839f-d5e8-44b5-a5dd-7c2da0f25dc1 | null      | 2025-08-08 06:29:20.405468+00 |
| a1b74cc7-3da1-418d-b609-7e6cce91fd92 | 3fe721bb-7ce2-41fd-a16a-a64b5d161282 | null      | 2025-08-08 06:29:20.405468+00 |
| 1fd382c6-2d03-49e4-9db4-49ffaf19e7f3 | 3125aa61-d3d4-4002-a987-958f780a325b | null      | 2025-08-08 06:29:20.405468+00 |
| 8bac177c-6c80-4630-bb7f-568aa2576ecc | d4fb92dd-2049-4ac9-b323-63ba02c2cfa8 | null      | 2025-08-08 06:29:20.405468+00 |
| d3a01313-8922-408a-b815-1df63d66ab43 | 81d59132-559c-4fba-a5b1-2d1cef9cd4a5 | null      | 2025-08-08 06:29:20.405468+00 |




-- 6. DATOS FINANCIEROS
| id                                   | title                    | description                                         | category    | discount | image_url                           | valid_until | location | terms                          | active | created_at                    |
| ------------------------------------ | ------------------------ | --------------------------------------------------- | ----------- | -------- | ----------------------------------- | ----------- | -------- | ------------------------------ | ------ | ----------------------------- |
| 70c9d0e6-f73c-4995-adc3-9ad8f908c40e | Descuento en Inversiones | Obtén un descuento especial en tu primera inversión | Inversiones | 20% OFF  | https://via.placeholder.com/300x160 | 2024-12-31  | Online   | Términos y condiciones aplican | true   | 2025-08-16 22:22:53.129642+00 |
| 0030f1af-d44e-4500-9e04-1e96fb469f74 | Descuento en Inversiones | Obtén un descuento especial en tu primera inversión | Inversiones | 20% OFF  | https://via.placeholder.com/300x160 | 2024-12-31  | Online   | Términos y condiciones aplican | true   | 2025-08-16 22:22:45.203568+00 |




-- 7. DATOS DE NOTICIAS
| id                                   | name        | description                         | created_at                    |
| ------------------------------------ | ----------- | ----------------------------------- | ----------------------------- |
| 66b9a548-f840-4494-8c50-8893c2ee7493 | Educación   | Contenido educativo financiero      | 2025-08-17 21:37:10.600905+00 |
| 233289ef-24e1-44a7-aac0-d9c9c69b9546 | Finanzas    | Noticias sobre mercados financieros | 2025-08-17 21:37:10.600905+00 |
| fc009b72-cc5f-4ac5-8e4b-fcd91c86ad86 | Inversiones | Guías y consejos de inversión       | 2025-08-17 21:37:10.600905+00 |
| c7d53f18-0227-4862-92fb-57a1af159120 | Tecnología  | Innovaciones en fintech             | 2025-08-17 21:37:10.600905+00 |



-- 8. DATOS DE NOTIFICACIONES
| id                                   | user_id                              | type    | payload                        | read  | created_at                    | community_id | is_read | read_at | post_id | from_user_id |
| ------------------------------------ | ------------------------------------ | ------- | ------------------------------ | ----- | ----------------------------- | ------------ | ------- | ------- | ------- | ------------ |
| 1ef5a22b-175e-47c4-9480-2fc8c85ad1c5 | 4993f354-fb56-4036-b6f6-36a373a6057a | welcome | {"msg":"Bienvenido a Investï"} | false | 2025-08-08 06:29:20.405468+00 | null         | false   | null    | null    | null         |




-- 9. DATOS DE CONFIGURACIÓN
| id                                   | user_id                              | notifications_enabled | email_notifications | push_notifications | privacy_level | language | theme  | created_at                    | updated_at                    |
| ------------------------------------ | ------------------------------------ | --------------------- | ------------------- | ------------------ | ------------- | -------- | ------ | ----------------------------- | ----------------------------- |
| f1efaa7d-d552-4a64-bb19-389c6e70f858 | 94a06e04-b6d6-4414-a6d7-4b87a756f9f9 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 2e9f1a67-7ce5-4e50-afb7-f22604f4565f | f0532d69-71bc-46a2-80dd-c7096295a3e3 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| eac4252d-7b83-4c2e-84b2-cde21fb1fffa | 3125aa61-d3d4-4002-a987-958f780a325b | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| e6060e71-7325-4d64-9a96-683b87cc5808 | 54b0e944-2937-4a64-a321-6be9950c8a82 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 40d81b9c-10e1-41e6-8063-a2ccf5b034bf | 43f30a87-30a6-48ce-a5c0-63f6cbe0738b | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| af76bb83-cfb1-4132-a869-120184c0aa83 | 5f556435-09d1-4bc9-a139-05dfa2a5dd3d | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| a4d62232-b1b5-400c-adec-8a868dac39e9 | f2fd9861-d0ec-483c-801c-96aa807da361 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| e5e29424-a742-43d5-a3de-03cde12aa779 | eeac70a1-9970-45ed-92e0-0d604395fc70 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| e492e81c-e6fc-409d-9b9a-867a1dcf72ca | c36e7fb5-91b5-446e-8e5b-a2a37a637da8 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 600bcfbb-274e-4673-a273-c9dc919517cf | bf69d25e-b8fe-4cde-84f4-89a0e7c1bd4f | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 36f4c488-ad2a-4da0-a870-755523845112 | a571a16b-2580-4e70-b3ee-327fc2333f6c | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 3c4e22f0-8bcf-4df6-81ac-148c07e4c0f9 | 33d414cb-476d-45cf-9893-178598be49ff | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 85c5bfe6-418e-4d5a-80f9-60dbe254e3b5 | fa57c7d6-883d-4787-a3dc-4501e3dd16b4 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 881522f3-7f76-4829-ba36-27179891bed8 | a5a0d041-13d6-4666-8be7-be5b1b9606d5 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 43df6fae-7beb-422a-ac1b-bc26157f0ab0 | 96b2659e-7610-4935-aeb8-c1085a131352 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 82eff81d-5a65-4ccc-b973-50ddb4a4998a | 71e7f5fe-eb8f-4fe5-86f8-d2f33ddfd465 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 59a89640-5488-4cce-9b62-ab18a17d38df | fa97c16d-26d2-4abb-88fc-f006dffaf7fb | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 9f55db43-73b9-4594-a202-1d93702975ce | 92ad925a-5b38-47be-8e68-8ea67079edad | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 9b265595-7c86-4b79-9ff5-9befe13eac9f | 837f4b44-54fc-44b2-8d1e-ce7e570c34e6 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 366b3efa-7453-43b9-af52-98b90b567d6d | 88ad3c22-361e-4205-8aa9-22a85053ed4e | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| e66f4a49-f025-4d91-8cd1-66b2728f31e5 | d3051ca8-c864-4f38-9bc1-9a1b81d31a32 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| b6284af2-53a8-4dea-bea3-4fca57f500e2 | b789dc94-23a9-44ae-ba9e-6eb686276c40 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| a9f37d60-d0f5-4a1b-befa-2641dacc3519 | d99f1b9f-1260-435e-8a6d-43589f96745b | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 09577e3a-d6bb-4701-bf52-6f356ed6af20 | 363cc478-01d0-4349-bfde-a0366f988aa9 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| fb2bd376-4d72-496c-b067-1ad78e1c9506 | e4a4195a-ed61-4dd1-be7c-745c2691455f | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 0939205b-13af-4a75-972a-b9496a5cba42 | 4b5e1731-376f-4414-9653-e37782adcdbe | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 051a3673-8894-47e0-9d4b-0f0eb69f29bf | 7f255c74-f672-456b-8c3a-1b8db5294bec | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 3eedaae7-fceb-49c2-a3c4-58287a7ffb21 | ed8f5f0d-f70d-4ff4-9b24-dc7855bed902 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 0feede79-dff8-4073-9f50-124613755f58 | 74cacc35-66bf-4524-aa51-defd51daea13 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 6959ca50-ecea-4c8e-8ab1-901bea68c9a5 | d4e60ce5-7d43-41ac-9a28-d3090cf0db78 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| b49953bf-445b-4b25-9171-6b2ac3117185 | 9ac2e120-9b1a-4e5c-8c03-92d847ba1a1c | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 189852f2-284e-4d15-999a-ef9f8a96270b | 02de0208-6d2a-45c6-a381-5dbf2adf6a55 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 2813bfba-cd28-455c-9092-5aff841ac01d | 4ccc839f-d5e8-44b5-a5dd-7c2da0f25dc1 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 1f3c90a3-c4bc-4d09-9b70-04022401dae9 | efe362e7-6029-44a8-85d2-bebe4d165949 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 6d5fe18a-69aa-465a-afad-d9bfd4177d37 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| f7ccd478-0d45-4984-b206-05280b630095 | 299d875d-ff7f-4a86-80c0-6948929d1d78 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 471ca24f-ed17-4f54-9e84-bb9302b305c9 | f06d15ed-91e0-4544-bfd2-7204688a6177 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| c78e0bb4-7217-471e-a766-5a2b5125cce5 | 04596a15-c5eb-41b5-b1b7-fe10543495c5 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 1247c173-ca99-4578-887a-4629bb24ac44 | dd86887a-e77e-4078-879a-54f6d8dd941b | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 8de5214c-d593-4a42-abab-5709e139c7ef | 2cdc4d7a-4ba7-4d47-b725-10028cb708f4 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| bcc5a9a4-9cbc-4139-a08e-13cddd30808b | 55bd1ca7-6729-4d47-b65e-a17b872f0c29 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 99906545-200e-4b3b-8cb7-fc0c37d7c313 | b310725e-d2d2-4b61-a836-7eb214883334 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 0b7dfd1a-a802-4a52-939a-93166e1de0a5 | b1aaabb6-3e9e-4c7b-bac6-a49ff5d8936d | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| ba50ecfb-cf53-4dd1-a518-187d63aeeac3 | f0a03e31-e129-49d7-86e7-81d2e4aee50f | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 597b45b3-b6b0-4e3e-bd27-4acb8cd9504a | fb7a0c1f-1bd2-4e49-b291-0862f340bcc7 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 3044d2e6-ef1a-422a-8adc-5cc1f9dac468 | 1f6200e5-1158-44b8-b983-e94442808b98 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 25720c4f-5f26-4cc5-87d8-0bf5f3f1ef87 | 81d59132-559c-4fba-a5b1-2d1cef9cd4a5 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 5d8d3364-a1ab-40ee-8d18-19985655ec7b | 39d79569-36f5-4fe2-ab10-517b1594703e | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| b710adc2-2afb-424c-8c36-b14029ca867a | 3fe721bb-7ce2-41fd-a16a-a64b5d161282 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| b2013a39-db16-44c4-949a-4fcc7dd74467 | 574482d8-b950-49f5-bea6-407f64ddd515 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 5a6cec79-0762-4f6d-994c-b557489ae99f | 14812879-96cd-486c-b3f0-aee57f918ffa | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 52d0fa95-f830-4f15-b133-b74b4b98c9e8 | f10dc0e6-7cab-45fa-8811-d504cac87683 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| f844219a-06e5-46a3-87ad-ee970adacc15 | 52de8e1e-17dc-4636-8f28-494a2aed3df9 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 11cfb77f-7895-47c6-8e32-aeb7de10b086 | 66241782-b5ed-4a09-8f68-1d53e4f3f8e5 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 72c9aec0-cffd-4160-94eb-621aab8c30e8 | e4456eb4-b906-4d8a-9216-06e6844b12af | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| a0efed53-4fcc-4d1b-bf66-5d6af59c6abd | fb5a50c3-4639-497f-892c-33bde342bcad | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| bebea5d8-b1a8-4d46-9926-19b624862838 | fdb11614-1164-4805-a332-6165fb3f0f6c | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| bcb1c1f2-1566-4349-88cf-2255beaeeee1 | 64118d6d-d35f-46c7-8915-482d109e012a | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| d7102590-04fb-4dce-976a-6e890b8deebf | a697c7fc-7ac6-4cf6-8bd0-176d2f45f6e2 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| fe9c2392-d894-45c1-aaea-5bc5e4e945ba | 279548cd-c8a0-4561-a563-d3a71ab93f38 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| e2cb4f89-ad36-43d6-a2c7-997806a2b60d | 19d12d9d-bbbb-4443-bdcc-3aa0c924f70e | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 92aa9b85-488d-439e-a496-839dfecbbdb1 | 03f0b0ad-72cd-491f-9012-ce958332688c | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| d3635a23-0f69-43ec-8b0c-44efb17d2ada | 216eacd7-63c6-4d03-9d44-df6833d109d0 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| ee0585c0-65c0-42fa-8e7f-bfb690bda56f | c3afd606-5699-4e4b-b478-d018cd6e1cce | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| ed994ca6-6e11-4a5a-a896-4dc788ce9666 | 12f8abe3-9dfd-49e8-9a0a-69feec8f3fb0 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| f5710c6a-978b-4339-ab32-2beaa0312e48 | b67a4534-ae5c-4ad7-adf5-e9c03a89bfab | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 0b251f4f-97ed-4e53-aca2-da87697638e4 | b89d6919-9560-4e91-8e6e-e1f1b609e4a4 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 904ecf4d-d7d2-421d-8b00-22449d122831 | 043733c7-e17d-40b8-bfa3-83b1809dfd99 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| dd254901-691d-4e4f-8878-e71660f8dbab | 6084eaa9-08f2-48fa-93f9-77557a864466 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| a68f5e3a-8c32-4818-99e7-3acaf945d96d | 22d38629-d1a5-4384-92aa-da9130b14d76 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 948e88b0-0292-4bcc-941a-845ba1953170 | f6a761b1-2c10-444f-9702-d786fec54d25 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 1820530b-1dd5-48ec-a849-a0b1fc2766e7 | 919e81a1-60d9-41a5-9541-7a47d23246c1 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 12fac38c-b081-4be4-9e60-7ec4f01b56c6 | b83c640d-4ab4-4217-afe9-b10b242f784a | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 23d86c99-7631-433b-99bd-1e627e065699 | 93fb520e-a238-42ac-aeae-e681cf43c75e | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 5a29309e-0dc5-4f93-9e06-dc9c12264774 | 0e0599c4-ded4-4f22-9289-5fc57c2430e4 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 01ee018b-21fd-40c7-884d-5c01b98aefe3 | f68fccaa-3e57-4aa1-9edd-7eeadf96bc5f | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| ab3812d5-661a-44b1-8a0e-ca41116236ab | b42d9f3d-657f-4db5-a560-d56cf7e021e0 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| e56fe655-d67a-43ed-aa34-88e84ded569e | 87d0280f-726f-4bee-b73e-b410c1f56090 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 08074b17-2dc2-4e06-95e6-b8a6d3220cc9 | 8a922fd0-cc92-41b1-8285-c77283d63be2 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| b991eba3-4884-435a-a60c-021b1ae411bc | 7a5840f4-d5f9-4c84-96cb-55faa6022d20 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 1b1d912a-e1a6-46c0-909c-3c2430c9a280 | afbde775-8889-4a5f-a6ac-3d52a9e9507c | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 27241b7b-bac3-4368-8ee3-1b018365f9ec | 288ee850-e0c0-4a16-b4f9-71c70cd52062 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| dc20da03-890c-4be5-9867-2eebe041a345 | c4b89bae-e39d-465c-a560-40d6d3ebe36e | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| efdab60f-fd6c-41ef-b7b4-39eed3598558 | ce732357-10d3-4475-8a96-9fee171ef0e1 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 8a7d2101-c701-43d8-a40d-8b67a3454156 | fa920bd9-c3f8-429f-9976-d6d25691fcf6 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 1538d5ea-b433-4f8a-b15f-4abf34e53cf6 | ccfe3e94-d6ac-4023-9231-f4c7ea7a79c4 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 3113242e-8428-4f58-840c-c0ddf51f0512 | b6d622d8-53f5-47b0-876e-ca7995df2f97 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| e4e40d63-8d00-4f54-916a-8cfa1ccc7031 | 00a09d72-a43b-4ae6-972d-47021569bd48 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 43cf8b58-9521-42fe-9453-cad615fd8309 | 9f5128d5-3450-4ba7-bbcc-cb91c18c1095 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 8f9bcc01-adef-4b9b-935e-341e8a652ef4 | 9e28815c-35f7-4e35-9262-8447acf09ae4 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| ce0515e7-3398-40e2-80af-b4498dc00138 | f1a55fa2-3f27-47a4-b402-3d1728442ed8 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 4325eeb9-4981-4f63-93ac-8d42ed0f9e61 | 089a267f-a842-4067-b95a-f65f1e7d9c35 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| cdd8a7eb-1150-476c-a8a3-3a4982e8ff9d | e0eae48b-9a18-49c2-b3d6-0b6805dfc696 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 0cdbc198-5129-4a9a-8baf-0e3a912de851 | 98d1a003-b5af-4fb1-aae5-b4d4532f7186 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 006b1393-e877-4380-9d59-d558ca31b39e | d4fb92dd-2049-4ac9-b323-63ba02c2cfa8 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 198c3964-781c-45b8-937d-3e6bc639efda | 91c8a9d1-98ef-405a-8835-577bb60797bb | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 70d734cf-675c-4dd1-b19d-9f703bf3e1da | 0e5607cc-65c6-48ed-9560-f560d4244280 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 92790eae-d207-4227-b72c-6b0b2fea0855 | 4fbffd2a-e7af-4a02-8724-7b97bcbb15cf | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| f015a8a9-9ae6-406e-b0b8-63eab1c75b93 | f1498268-3974-4373-ad2d-48c49f3c5eca | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| 6e54a725-ccab-4a31-a0f4-710addbbbe43 | b494451d-9f7f-4918-9239-c24a0ccad942 | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |
| fa7a7e84-a8ca-40d0-b8a6-3cfa0e5a4bef | 4993f354-fb56-4036-b6f6-36a373a6057a | true                  | true                | true               | public        | es       | system | 2025-08-17 21:37:16.801796+00 | 2025-08-17 21:37:16.801796+00 |




-- 10. DATOS DE RELACIONES SOCIALES
| id                                   | user_id                              | blocked_user_id                      | created_at                    |
| ------------------------------------ | ------------------------------------ | ------------------------------------ | ----------------------------- |
| 1d1af807-615a-45c9-9bed-2fd76a92159e | 4993f354-fb56-4036-b6f6-36a373a6057a | 6084eaa9-08f2-48fa-93f9-77557a864466 | 2025-08-08 06:46:25.444997+00 |




-- 11. DATOS DE ONBOARDING
| id | name                                | email                          | phone          | age   | goals                                                                                                                                                          | interests                                                                                                                 | timestamp                  | created_at                    | updated_at                    |
| -- | ----------------------------------- | ------------------------------ | -------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------------- | ----------------------------- |
| 50 | Juan Pablo Bascuñán Fuentealba      | jpbascu11@gmail.com            | +56950237792   | 18-25 | ["Viajes"]                                                                                                                                                     | ["Depósitos a plazo"]                                                                                                     | 2025-09-12 17:40:19.077+00 | 2025-09-12 17:40:21.263626+00 | 2025-09-12 17:40:21.263626+00 |
| 49 | Edxel Gabriel Vargas Altamirano     | dxgabalt284@gmail.com          | null           | 46-55 | ["Invertir en mi mascota"]                                                                                                                                     | ["Acciones (general)"]                                                                                                    | 2025-09-12 12:22:32.304+00 | 2025-09-12 12:22:32.012262+00 | 2025-09-12 12:22:32.012262+00 |
| 48 | Matrix                              | nicolort20@gmail.com           | 86921636       | 65+   | ["Comprar una casa"]                                                                                                                                           | ["Educarse financieramente"]                                                                                              | 2025-09-11 22:48:49.194+00 | 2025-09-11 22:48:50.706942+00 | 2025-09-11 22:48:50.706942+00 |
| 47 | Matrix                              | nicolort20@gmail.com           | 86921636       | 65+   | ["Comprar una casa"]                                                                                                                                           | ["Educarse financieramente"]                                                                                              | 2025-09-11 22:44:36.228+00 | 2025-09-11 22:44:46.058371+00 | 2025-09-11 22:44:46.058371+00 |
| 46 | Sebastian Ramirez                   | sramirezku@gmail.com           | +56984242776   | 18-25 | ["Comprar una casa","Diversificar inversiones","Pagar estudios"]                                                                                               | ["Acciones (general)"]                                                                                                    | 2025-09-11 20:57:16.303+00 | 2025-09-11 20:57:17.950948+00 | 2025-09-11 20:57:17.950948+00 |
| 45 | Daniela González Aguilar            | daniela.gonzalez.a.a@gmail.com | +56945575933   | 18-25 | ["Comprar una casa"]                                                                                                                                           | ["Depósitos a plazo","Educarse financieramente"]                                                                          | 2025-09-10 15:11:37.315+00 | 2025-09-10 15:11:37.89486+00  | 2025-09-10 15:11:37.89486+00  |
| 44 | Gabriel                             | estudios22aprende@gmail.com    | null           | 36-45 | ["Para mis hijos"]                                                                                                                                             | ["Inversión inmobiliaria"]                                                                                                | 2025-09-10 14:54:01.623+00 | 2025-09-10 14:54:00.876593+00 | 2025-09-10 14:54:00.876593+00 |
| 43 | Gabriel                             | dxgabal4t4@gmail.com           | null           | 26-35 | ["Comprar una casa"]                                                                                                                                           | ["Acciones (general)"]                                                                                                    | 2025-09-10 14:52:59.395+00 | 2025-09-10 14:52:59.875176+00 | 2025-09-10 14:52:59.875176+00 |
| 42 | Martin Pivcevic                     | mcpa93@gmail.com               | +56961907215   | 26-35 | ["Ahorrar para el retiro","Diversificar inversiones"]                                                                                                          | ["Acciones (general)","Inversión inmobiliaria","Startups","Educarse financieramente","Criptomonedas"]                     | 2025-09-10 14:46:14.509+00 | 2025-09-10 14:46:16.279788+00 | 2025-09-10 14:46:16.279788+00 |
| 41 | Daniela González                    | daniela.gonzalez.a.a@gmail.com | +56945575933   | 18-25 | ["Pagar estudios","Comprar una casa"]                                                                                                                          | ["Criptomonedas","Depósitos a plazo"]                                                                                     | 2025-09-10 12:18:05.232+00 | 2025-09-10 12:18:05.54973+00  | 2025-09-10 12:18:05.54973+00  |
| 40 | Daniela González                    | daniela.gonzalez.a.a@gmail.com | +56945575933   | 18-25 | ["Comprar un auto","Pagar estudios","Comprar una casa","Invertir en mi mascota","Diversificar inversiones","Ahorrar para el retiro","Viajes"]                  | ["Inversión inmobiliaria","Acciones (general)","Depósitos a plazo","Educarse financieramente","Criptomonedas"]            | 2025-09-10 12:17:17.626+00 | 2025-09-10 12:17:17.940871+00 | 2025-09-10 12:17:17.940871+00 |
| 39 | Daniela González Aguilar            | daniela.gonzalez.a.a@gmail.com | +56945575933   | 18-25 | ["Comprar una casa","Pagar estudios","Viajes","Ahorrar para el retiro","Diversificar inversiones","Invertir en mi mascota","Comprar un auto"]                  | ["Inversión inmobiliaria","Acciones (general)","Depósitos a plazo","Criptomonedas","Educarse financieramente"]            | 2025-09-10 12:16:27.16+00  | 2025-09-10 12:16:29.441132+00 | 2025-09-10 12:16:29.441132+00 |
| 38 | Josefina Contador                   | josefina.contador@gmail.com    | +56977488689   | 26-35 | ["Viajes","Ahorrar para el retiro","Diversificar inversiones"]                                                                                                 | ["Acciones (general)","Inversión inmobiliaria","Educarse financieramente"]                                                | 2025-09-10 02:45:57.042+00 | 2025-09-10 02:45:57.67928+00  | 2025-09-10 02:45:57.67928+00  |
| 37 | Martin Pivcevic                     | mcpa93@gmail.com               | +56961907215   | 26-35 | ["Ahorrar para el retiro","Diversificar inversiones"]                                                                                                          | ["Acciones (general)","Inversión inmobiliaria","Startups","Educarse financieramente","Criptomonedas"]                     | 2025-09-10 02:44:12.104+00 | 2025-09-10 02:44:14.576018+00 | 2025-09-10 02:44:14.576018+00 |
| 36 | Edxel Gabriel Vargas Altamirano     | estudiosapr21ende@gmail.com    | null           | 56-65 | ["Comprar una casa"]                                                                                                                                           | ["Inversión inmobiliaria"]                                                                                                | 2025-09-09 23:31:27.286+00 | 2025-09-09 23:31:24.508258+00 | 2025-09-09 23:31:24.508258+00 |
| 35 | Pejota                              | estudiosaprende@gmail.com      | null           | 36-45 | ["Comprar una casa","Pagar estudios"]                                                                                                                          | ["Criptomonedas","Startups"]                                                                                              | 2025-09-09 22:01:47.962+00 | 2025-09-09 22:01:43.440832+00 | 2025-09-09 22:01:43.440832+00 |
| 34 | Daniela Anais González Aguilar      | daniela.gonzalez.a.a@gmail.com | +945575933     | 18-25 | ["Diversificar inversiones"]                                                                                                                                   | ["Depósitos a plazo","Acciones (general)","Inversión inmobiliaria","Startups","Educarse financieramente","Criptomonedas"] | 2025-09-09 20:17:16.838+00 | 2025-09-09 20:17:17.119061+00 | 2025-09-09 20:17:17.119061+00 |
| 33 | Daniela Anais González Aguilar      | daniela.gonzalez.a.a@gmail.com | +945575933     | 18-25 | ["Comprar una casa","Pagar estudios","Comprar un auto","Invertir en mi mascota","Diversificar inversiones","Ahorrar para el retiro"]                           | ["Depósitos a plazo","Acciones (general)","Inversión inmobiliaria","Startups","Educarse financieramente","Criptomonedas"] | 2025-09-09 20:17:04.486+00 | 2025-09-09 20:17:04.721934+00 | 2025-09-09 20:17:04.721934+00 |
| 32 | Daniela Anaís Gonzalez Aguilar      | daniela.gonzalez.a.a@gmail.com | +945575933     | 18-25 | ["Comprar una casa","Pagar estudios","Comprar un auto","Invertir en mi mascota","Diversificar inversiones","Ahorrar para el retiro"]                           | ["Depósitos a plazo","Acciones (general)","Inversión inmobiliaria","Startups","Educarse financieramente","Criptomonedas"] | 2025-09-09 20:16:45.288+00 | 2025-09-09 20:16:45.534744+00 | 2025-09-09 20:16:45.534744+00 |
| 31 | Daniela Gonzalez Aguilar            | daniela.gonzalez.a.a@gmail.com | +56945575933   | 18-25 | ["Comprar una casa","Pagar estudios","Comprar un auto","Invertir en mi mascota","Diversificar inversiones","Ahorrar para el retiro"]                           | ["Depósitos a plazo","Acciones (general)","Inversión inmobiliaria","Startups","Educarse financieramente","Criptomonedas"] | 2025-09-09 20:16:22.596+00 | 2025-09-09 20:16:22.749092+00 | 2025-09-09 20:16:22.749092+00 |
| 30 | Daniela Gonzalez Aguilar            | daniela.gonzalez.a.a@gmail.com | +56945575933   | 18-25 | ["Comprar una casa","Pagar estudios","Comprar un auto","Invertir en mi mascota","Diversificar inversiones","Ahorrar para el retiro"]                           | ["Depósitos a plazo","Acciones (general)","Inversión inmobiliaria","Startups","Educarse financieramente","Criptomonedas"] | 2025-09-09 20:16:19.179+00 | 2025-09-09 20:16:19.49779+00  | 2025-09-09 20:16:19.49779+00  |
| 29 | Daniela González Aguilar            | daniela.gonzalez.a.a@gmail.com | +56945575933   | 18-25 | ["Comprar una casa","Pagar estudios","Comprar un auto","Invertir en mi mascota","Diversificar inversiones","Ahorrar para el retiro"]                           | ["Depósitos a plazo","Acciones (general)","Inversión inmobiliaria","Startups","Educarse financieramente","Criptomonedas"] | 2025-09-09 20:15:50.225+00 | 2025-09-09 20:15:50.472437+00 | 2025-09-09 20:15:50.472437+00 |
| 28 | Daniela González Aguilar            | daniela.gonzalez.a.a@gmail.com | +56945575933   | 18-25 | ["Comprar una casa","Pagar estudios","Comprar un auto","Invertir en mi mascota","Viajes","Diversificar inversiones","Ahorrar para el retiro","Para mis hijos"] | ["Depósitos a plazo","Acciones (general)","Inversión inmobiliaria","Startups","Educarse financieramente","Criptomonedas"] | 2025-09-09 20:15:12.892+00 | 2025-09-09 20:15:13.108507+00 | 2025-09-09 20:15:13.108507+00 |
| 27 | Daniela González Aguilar            | daniela.gonzalez.a.a@gmail.com | +56945575933   | 18-25 | ["Comprar una casa","Pagar estudios","Comprar un auto","Ahorrar para el retiro"]                                                                               | ["Depósitos a plazo","Acciones (general)","Inversión inmobiliaria","Startups","Educarse financieramente","Criptomonedas"] | 2025-09-09 20:14:55.827+00 | 2025-09-09 20:14:56.066599+00 | 2025-09-09 20:14:56.066599+00 |
| 26 | Daniela González Aguilar            | daniela.gonzalez.a.a@gmail.com | +56945575933   | 18-25 | ["Comprar una casa","Pagar estudios","Comprar un auto","Ahorrar para el retiro"]                                                                               | ["Depósitos a plazo","Acciones (general)","Inversión inmobiliaria","Startups","Educarse financieramente","Criptomonedas"] | 2025-09-09 20:14:52.672+00 | 2025-09-09 20:14:52.946724+00 | 2025-09-09 20:14:52.946724+00 |
| 25 | Daniela González Aguilar            | daniela.gonzalez.a.a@gmail.com | +56945575933   | 18-25 | ["Comprar una casa","Pagar estudios","Comprar un auto","Ahorrar para el retiro"]                                                                               | ["Depósitos a plazo","Acciones (general)","Inversión inmobiliaria","Startups","Educarse financieramente","Criptomonedas"] | 2025-09-09 20:14:31.864+00 | 2025-09-09 20:14:34.130532+00 | 2025-09-09 20:14:34.130532+00 |
| 24 | Pejota                              | estudiosapren21de@gmail.com    | null           | 65+   | ["Comprar una casa"]                                                                                                                                           | ["Startups"]                                                                                                              | 2025-09-09 14:47:54.547+00 | 2025-09-09 14:47:50.335457+00 | 2025-09-09 14:47:50.335457+00 |
| 23 | Prueba                              | dxgabalt4@gmail.com            | 85357778       | 56-65 | ["Comprar una casa"]                                                                                                                                           | ["Inversión inmobiliaria"]                                                                                                | 2025-09-09 13:47:55.095+00 | 2025-09-09 13:47:50.84934+00  | 2025-09-09 13:47:50.84934+00  |
| 22 | Cristóbal Manzor                    | cristobaledumanzor.a@gmail.com | +56947399067   | 18-25 | ["Comprar una casa","Pagar estudios","Comprar un auto","Viajes","Ahorrar para el retiro"]                                                                      | ["Depósitos a plazo","Acciones (general)","Inversión inmobiliaria","Educarse financieramente"]                            | 2025-09-09 13:34:58.262+00 | 2025-09-09 13:34:59.939342+00 | 2025-09-09 13:34:59.939342+00 |
| 21 | Martin Pivcevic                     | mcpa93@gmail.com               | +56961907215   | 26-35 | ["Diversificar inversiones"]                                                                                                                                   | ["Startups","Educarse financieramente","Inversión inmobiliaria","Acciones (general)","Criptomonedas"]                     | 2025-09-08 19:20:29.911+00 | 2025-09-08 19:20:31.840843+00 | 2025-09-08 19:20:31.840843+00 |
| 20 | Alejandro soto                      | ale.guitarpro161@gmail.com     | +56930648368   | 18-25 | ["Ahorrar para el retiro"]                                                                                                                                     | ["Educarse financieramente"]                                                                                              | 2025-09-07 17:51:10.648+00 | 2025-09-07 17:51:12.513442+00 | 2025-09-07 17:51:12.513442+00 |
| 19 | Francisco Flores                    | cloud_fran_14@hotmail.com      | +56984216685   | 26-35 | ["Comprar una casa"]                                                                                                                                           | ["Educarse financieramente"]                                                                                              | 2025-09-07 14:38:53.47+00  | 2025-09-07 14:38:55.461953+00 | 2025-09-07 14:38:55.461953+00 |
| 18 | Rodrigo Gutierrez                   | rdgo.gutierrez@gmail.com       | +56999005284   | 26-35 | ["Comprar una casa"]                                                                                                                                           | ["Educarse financieramente"]                                                                                              | 2025-09-07 13:51:55.037+00 | 2025-09-07 13:51:57.04363+00  | 2025-09-07 13:51:57.04363+00  |
| 17 | Elias Figueroa                      | ignaciofigueroaelias@gmail.com | +56946972680   | 18-25 | ["Ahorrar para el retiro"]                                                                                                                                     | ["Acciones (general)","Inversión inmobiliaria","Criptomonedas"]                                                           | 2025-09-07 00:47:45.569+00 | 2025-09-07 00:47:45.858407+00 | 2025-09-07 00:47:45.858407+00 |
| 16 | Daniel aguilera                     | aguilerad14@gmail.com          | +56941727064   | 26-35 | ["Ahorrar para el retiro"]                                                                                                                                     | ["Educarse financieramente"]                                                                                              | 2025-09-06 20:17:16.392+00 | 2025-09-06 20:17:16.433863+00 | 2025-09-06 20:17:16.433863+00 |
| 15 | Tamara Bascur                       | tamybascur@gmail.com           | +569932615592  | 26-35 | ["Ahorrar para el retiro","Viajes"]                                                                                                                            | ["Educarse financieramente"]                                                                                              | 2025-09-06 18:59:07.035+00 | 2025-09-06 18:59:07.309065+00 | 2025-09-06 18:59:07.309065+00 |
| 14 | Thomas Houttekier                   | houttek02@gmail.com            | +56967592427   | 18-25 | ["Ahorrar para el retiro","Viajes","Diversificar inversiones"]                                                                                                 | ["Educarse financieramente","Inversión inmobiliaria"]                                                                     | 2025-09-06 16:47:33.334+00 | 2025-09-06 16:47:33.176713+00 | 2025-09-06 16:47:33.176713+00 |
| 13 | Felipe lara                         | linkubus60@gmail.com           | +56987398907   | 26-35 | ["Viajes","Pagar estudios"]                                                                                                                                    | ["Educarse financieramente"]                                                                                              | 2025-09-06 16:16:23.477+00 | 2025-09-06 16:16:22.193578+00 | 2025-09-06 16:16:22.193578+00 |
| 12 | Martina estrada                     | martina.estrada.z@gmail.com    | +56972910406   | 18-25 | ["Viajes"]                                                                                                                                                     | ["Educarse financieramente"]                                                                                              | 2025-09-06 16:11:38.925+00 | 2025-09-06 16:11:38.938593+00 | 2025-09-06 16:11:38.938593+00 |
| 11 | Sebastián Lagos                     | sebastian.lagos0108@gmail.com  | +56951443662   | 18-25 | ["Comprar una casa"]                                                                                                                                           | ["Educarse financieramente","Inversión inmobiliaria"]                                                                     | 2025-09-06 14:55:06.46+00  | 2025-09-06 14:55:06.439571+00 | 2025-09-06 14:55:06.439571+00 |
| 10 | Paula Valentina Maldonado carvajal  | paumaldonadoc@icloud.com       | +56972785421   | 26-35 | ["Ahorrar para el retiro"]                                                                                                                                     | ["Educarse financieramente"]                                                                                              | 2025-09-06 14:41:03.652+00 | 2025-09-06 14:41:04.131654+00 | 2025-09-06 14:41:04.131654+00 |
| 9  | Camila Estefani Romero Torres       | camiromero096@gmail.com        | +569 4552 8710 | 18-25 | ["Diversificar inversiones","Comprar una casa","Viajes"]                                                                                                       | ["Acciones (general)","Educarse financieramente","Inversión inmobiliaria"]                                                | 2025-09-04 23:28:42.096+00 | 2025-09-04 23:28:43.656064+00 | 2025-09-04 23:28:43.656064+00 |
| 8  | Matias Alejandro Escobar Salamanca  | matiasescobar977@gmail.com     | +56991415010   | 18-25 | ["Comprar un auto"]                                                                                                                                            | ["Educarse financieramente"]                                                                                              | 2025-09-04 21:46:38.558+00 | 2025-09-04 21:46:40.411279+00 | 2025-09-04 21:46:40.411279+00 |
| 7  | Demis Cristian Olivares Olivares    | dolivaresolivares451@gmail.com | +56938826151   | 18-25 | ["Ahorrar para el retiro"]                                                                                                                                     | ["Acciones (general)","Educarse financieramente","Criptomonedas","Startups","Inversión inmobiliaria","Depósitos a plazo"] | 2025-09-04 20:25:59.192+00 | 2025-09-04 20:26:00.599743+00 | 2025-09-04 20:26:00.599743+00 |
| 6  | Matías Trabucco                     | matiastrabuccoc@gmail.com      | +56962599849   | 18-25 | ["Comprar una casa","Viajes","Ahorrar para el retiro","Para mis hijos"]                                                                                        | ["Acciones (general)","Startups","Educarse financieramente"]                                                              | 2025-09-04 20:22:55.885+00 | 2025-09-04 20:22:56.066988+00 | 2025-09-04 20:22:56.066988+00 |
| 5  | Cristóbal Manzor                    | cristobalmanzor576@gmail.com   | +56947399067   | 18-25 | ["Comprar una casa","Comprar un auto","Ahorrar para el retiro","Diversificar inversiones","Pagar estudios"]                                                    | ["Depósitos a plazo","Inversión inmobiliaria","Educarse financieramente","Acciones (general)"]                            | 2025-09-04 20:19:37.131+00 | 2025-09-04 20:19:39.476898+00 | 2025-09-04 20:19:39.476898+00 |
| 4  | Jaasiel Zavala Garcia               | zavalagarciajaasiel@gmail.com  | +52 4451109334 | 18-25 | ["Viajes","Ahorrar para el retiro","Diversificar inversiones"]                                                                                                 | ["Depósitos a plazo","Acciones (general)","Inversión inmobiliaria","Startups","Educarse financieramente"]                 | 2025-09-04 20:17:25.139+00 | 2025-09-04 20:17:27.679461+00 | 2025-09-04 20:17:27.679461+00 |
| 3  | matias  andres sepulveda  silva     | sepulvedamatias735@gmail.com   | null           | 26-35 | ["Comprar una casa"]                                                                                                                                           | ["Startups"]                                                                                                              | 2025-08-29 22:09:07.465+00 | 2025-08-29 22:09:09.022401+00 | 2025-08-29 22:09:09.022401+00 |
| 2  | Prueba 26 Agosto 11:43 PM           | dxgabb@gmail.com               | null           | 26-35 | ["Comprar una casa","Pagar estudios"]                                                                                                                          | ["Depósitos a plazo","Inversión inmobiliaria","Startups"]                                                                 | 2025-08-27 03:42:37.765+00 | 2025-08-27 03:42:38.130325+00 | 2025-08-27 03:42:38.130325+00 |
| 1  | Prueba 26 Agosto 11:39 PM           | dxgabalt41@gmail.com           | null           | 26-35 | ["Comprar una casa","Comprar un auto","Viajes"]                                                                                                                | ["Depósitos a plazo","Inversión inmobiliaria","Startups","Criptomonedas"]                                                 | 2025-08-27 03:39:15.186+00 | 2025-08-27 03:39:16.236903+00 | 2025-08-27 03:39:16.236903+00 |





-- 12. DATOS DE GAMIFICACIÓN
| id                                   | user_id                              | badge_id                             | granted_at                    |
| ------------------------------------ | ------------------------------------ | ------------------------------------ | ----------------------------- |
| 98c352b8-753f-47cb-88e1-5163cae51108 | 6284005b-e0c3-4864-bfa7-caa7e54b2741 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-09-09 00:09:39.823647+00 |
| 16020298-65b8-4432-bcc3-5c6602de0679 | 36d98a94-54ac-4cea-9e50-d1410b43a576 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-09-08 12:33:05.030993+00 |
| af41aabd-268d-460e-b58d-99002d8b4d60 | eb50fabd-6c90-4f3d-ab1a-cfc8f42c9564 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-09-08 12:32:50.429582+00 |
| 21ea2c5c-5a7d-47fa-9285-6c3afc2d2811 | 1afd7d97-df6f-4bc1-840f-67f86ee0594c | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-09-08 12:32:31.136043+00 |
| 5da88d53-6afe-4ab3-8b27-c6d5bfa17691 | 5a5e5cac-29d3-4bb3-8333-0ef1580ffd25 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-09-08 12:27:50.191725+00 |
| 49025ada-5af9-4aea-a42f-925cbf533e8f | c0038c97-97a0-49bf-962f-587f611f5f72 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-09-08 12:27:03.570184+00 |
| 4f44e814-0274-4933-bc72-6801743f7f07 | 43f30a87-30a6-48ce-a5c0-63f6cbe0738b | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| e94332cf-2258-424f-8f29-6a8ba5159ddf | 043733c7-e17d-40b8-bfa3-83b1809dfd99 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 3a68e53d-e366-44ad-9a0a-6892e8a6098c | ce732357-10d3-4475-8a96-9fee171ef0e1 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 0307c615-930b-4907-92c7-c1f547aaf80b | f0532d69-71bc-46a2-80dd-c7096295a3e3 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 80b77cc4-68e6-4c8f-b620-f2c7ae6221ae | fa97c16d-26d2-4abb-88fc-f006dffaf7fb | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 81e55feb-9426-4208-9d99-d50b4e3b781d | 299d875d-ff7f-4a86-80c0-6948929d1d78 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| d89afd3c-48ba-4f1f-9b64-bd92babf15c9 | f06d15ed-91e0-4544-bfd2-7204688a6177 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 35b664b4-2f4e-4e10-9786-8eea51ca7f72 | 91c8a9d1-98ef-405a-8835-577bb60797bb | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| a54c41fb-c8de-48b9-9d1f-0cf24c15bc0d | 356fa732-aa31-496b-a14f-1e499cd02fd6 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 26cec7ee-5bb4-4be7-b697-b339d76c303a | 216eacd7-63c6-4d03-9d44-df6833d109d0 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 2760b550-3480-4678-9503-f0358603772f | 33d414cb-476d-45cf-9893-178598be49ff | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 1ef9da52-77fc-421a-940b-e6f08e471258 | eeac70a1-9970-45ed-92e0-0d604395fc70 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| acd7b48c-7ec5-4083-b922-34a3de8a2726 | 837f4b44-54fc-44b2-8d1e-ce7e570c34e6 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 25f771a0-6464-414a-8022-6d942b819b19 | 8a922fd0-cc92-41b1-8285-c77283d63be2 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 58962c61-db74-4419-8a12-440a661a739d | 5f556435-09d1-4bc9-a139-05dfa2a5dd3d | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| a5dc89a3-e17d-4d36-b128-a179ce2bb972 | a571a16b-2580-4e70-b3ee-327fc2333f6c | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 89ac79fa-f580-4f9a-89f6-70b6b3d39a6b | f1a55fa2-3f27-47a4-b402-3d1728442ed8 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 2a95e5b9-75f7-47b1-b663-711066207622 | a697c7fc-7ac6-4cf6-8bd0-176d2f45f6e2 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| bda705bc-c651-4f80-b1b9-47ce03ef3436 | c36e7fb5-91b5-446e-8e5b-a2a37a637da8 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 662173d4-d365-4af4-9d31-0d56e81f06ef | e4a4195a-ed61-4dd1-be7c-745c2691455f | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 4a24b29c-0df7-4000-9641-210b96c3e077 | 14812879-96cd-486c-b3f0-aee57f918ffa | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 7e8e9556-8bf1-4815-88ee-2d289f04fd14 | c3afd606-5699-4e4b-b478-d018cd6e1cce | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| bb741580-8d90-433b-8139-047dbd964613 | 4fbffd2a-e7af-4a02-8724-7b97bcbb15cf | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 009981c8-e40e-48d7-a437-82c8da0c1c48 | b1aaabb6-3e9e-4c7b-bac6-a49ff5d8936d | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| e5796ef4-b329-464a-b360-0b398baa4d45 | 39d79569-36f5-4fe2-ab10-517b1594703e | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| de3bd905-2028-4719-92cf-33ed42e0f6f5 | d4fb92dd-2049-4ac9-b323-63ba02c2cfa8 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 6b8b2b18-2197-4d4d-9196-a7d63af69f15 | b494451d-9f7f-4918-9239-c24a0ccad942 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| ed5fcdf1-54b1-4f97-8107-283a0c9ae8aa | 04596a15-c5eb-41b5-b1b7-fe10543495c5 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 82f296ec-c96e-458c-99e4-db97ac8662f5 | 574482d8-b950-49f5-bea6-407f64ddd515 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 337f7052-93b7-4ff2-bd3c-89650e84d659 | fb7a0c1f-1bd2-4e49-b291-0862f340bcc7 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| f12830f5-5f61-48db-a08a-9d6110feb5fe | 22d38629-d1a5-4384-92aa-da9130b14d76 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 49abe962-b314-4a32-9a10-439d184b9934 | 288ee850-e0c0-4a16-b4f9-71c70cd52062 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 6098ea66-5e3d-4b70-86f5-35b629c41c44 | 03f0b0ad-72cd-491f-9012-ce958332688c | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| ddddd2da-5578-4a6f-ab48-247465004c74 | 02de0208-6d2a-45c6-a381-5dbf2adf6a55 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 6b0f312c-e2e4-4182-a9c8-733356756219 | dd86887a-e77e-4078-879a-54f6d8dd941b | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 46013f2c-5b6c-498b-a3da-15d491511e5a | 55bd1ca7-6729-4d47-b65e-a17b872f0c29 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| df53d5d6-669d-4536-bb07-f8be7deb08b6 | 66241782-b5ed-4a09-8f68-1d53e4f3f8e5 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 533caea2-d534-49cf-b696-34667df2cf8d | 74cacc35-66bf-4524-aa51-defd51daea13 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| e084dc34-f1b2-4be9-a30f-ff18841541f8 | e0eae48b-9a18-49c2-b3d6-0b6805dfc696 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 448b4752-ad72-423a-bcd3-895e2b5ece7c | 87d0280f-726f-4bee-b73e-b410c1f56090 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 6e5c3009-a4dd-44eb-ab0b-4fba7c8e3812 | d99f1b9f-1260-435e-8a6d-43589f96745b | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| c8b2af7b-941a-4a9d-9198-f90111d9bddb | 3fe721bb-7ce2-41fd-a16a-a64b5d161282 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| b2b9971a-4622-4bb9-8d08-360f6c45c779 | b789dc94-23a9-44ae-ba9e-6eb686276c40 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 3bc33d9c-9e67-48e6-98a9-b75302243ab4 | b6d622d8-53f5-47b0-876e-ca7995df2f97 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 99f9a6e2-ece7-4ccf-847c-6479406ec756 | 4b5e1731-376f-4414-9653-e37782adcdbe | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| bb7bf87e-c408-4e55-a347-b9791f4b467b | 54b0e944-2937-4a64-a321-6be9950c8a82 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 831b2862-74f4-41f4-a8f7-ff98176ff430 | 2cdc4d7a-4ba7-4d47-b725-10028cb708f4 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| b8be35a6-307a-4eff-8764-d86613fae3b7 | ccfe3e94-d6ac-4023-9231-f4c7ea7a79c4 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 68a0b1d8-dc47-49e0-bfb9-26518f055a5a | d4e60ce5-7d43-41ac-9a28-d3090cf0db78 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 90efd830-eec0-484e-aa1c-c0d363127f08 | 9e28815c-35f7-4e35-9262-8447acf09ae4 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| ef05e548-cf8f-442f-8e87-d8e3e35054b8 | 4ccc839f-d5e8-44b5-a5dd-7c2da0f25dc1 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 2b06b6e2-eeea-415e-a569-30892530f859 | 0e5607cc-65c6-48ed-9560-f560d4244280 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 45fdd3b2-c3f7-4eb8-86a6-6ea88b5b3ee8 | a5a0d041-13d6-4666-8be7-be5b1b9606d5 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| acb63a20-c723-4715-94b4-6ef08b9bb853 | 94a06e04-b6d6-4414-a6d7-4b87a756f9f9 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 0367c2e2-f4f1-436e-91f2-937800f7b36f | b83c640d-4ab4-4217-afe9-b10b242f784a | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| d7b07932-b783-489e-9f8b-09ae696a8907 | fdb11614-1164-4805-a332-6165fb3f0f6c | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 34ff7737-35cf-4e64-b719-d8552e533bac | 1f6200e5-1158-44b8-b983-e94442808b98 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| da89dc94-4478-42da-94e1-15bdd6e85f6a | 6084eaa9-08f2-48fa-93f9-77557a864466 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 2e7864cc-24fa-4b02-9b61-64c786ac7306 | 52de8e1e-17dc-4636-8f28-494a2aed3df9 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 1295b732-2a22-4722-b63c-74c8346c7f7f | f2fd9861-d0ec-483c-801c-96aa807da361 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 17b378ed-5aa6-46e5-bf03-1db3b3dcbbc2 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| dd066be0-77e2-4d06-b133-20bed7c1fd60 | afbde775-8889-4a5f-a6ac-3d52a9e9507c | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| e183b1f1-574e-4ccb-b44f-1b229b6e3d5b | 19d12d9d-bbbb-4443-bdcc-3aa0c924f70e | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| e71a6ce0-7692-4752-9a5a-eaf62f1ba9a2 | 919e81a1-60d9-41a5-9541-7a47d23246c1 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 9697b535-bf4f-4105-9746-3f206ef43a67 | ed8f5f0d-f70d-4ff4-9b24-dc7855bed902 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| af390755-a6eb-44f6-b49c-ad7193a28f4b | f68fccaa-3e57-4aa1-9edd-7eeadf96bc5f | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 052a12ab-9d44-4e03-8053-04a010d0cab3 | 9ac2e120-9b1a-4e5c-8c03-92d847ba1a1c | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 03ad96b9-7a38-41d7-a4c9-bbcddb78e273 | 7a5840f4-d5f9-4c84-96cb-55faa6022d20 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 76382750-f706-4994-8b42-3e85107280db | 9f5128d5-3450-4ba7-bbcc-cb91c18c1095 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 59259e20-470c-4f9d-b0ee-87d08577fc66 | 96b2659e-7610-4935-aeb8-c1085a131352 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 203eb244-0f28-41b2-88d5-1767f0ce1a8b | 71e7f5fe-eb8f-4fe5-86f8-d2f33ddfd465 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 0ccec07d-ccb7-40f0-b2f9-82743b063469 | d3051ca8-c864-4f38-9bc1-9a1b81d31a32 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 8a526e74-51eb-439b-8d00-31f72c7e492c | 089a267f-a842-4067-b95a-f65f1e7d9c35 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 83aa2dce-67eb-4a20-8f8e-4dce2289967e | 12f8abe3-9dfd-49e8-9a0a-69feec8f3fb0 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 1884fb77-8828-4395-a12b-95268d1f87a3 | f1498268-3974-4373-ad2d-48c49f3c5eca | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| dceeace5-f8ec-405b-b48f-10c979dbac60 | bf69d25e-b8fe-4cde-84f4-89a0e7c1bd4f | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 5e13ccf2-90c3-4c6b-9815-640b894d4bd8 | efe362e7-6029-44a8-85d2-bebe4d165949 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 1b403bfe-7698-4655-b283-ee8a4ba13ab5 | 88ad3c22-361e-4205-8aa9-22a85053ed4e | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 0fd6bda2-4ea4-4abe-a736-963a3f589e39 | 98d1a003-b5af-4fb1-aae5-b4d4532f7186 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 753746f5-3982-43e0-a006-23d08ed11e80 | 93fb520e-a238-42ac-aeae-e681cf43c75e | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 8e0447f0-869f-4ec8-b290-b3e994957a77 | 0e0599c4-ded4-4f22-9289-5fc57c2430e4 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 900e9918-edb3-49e4-a8fb-c825c6000d99 | b310725e-d2d2-4b61-a836-7eb214883334 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 5ae28660-14ae-4084-985e-ea50f5199806 | 81d59132-559c-4fba-a5b1-2d1cef9cd4a5 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| ad903652-c4d2-49b2-aed4-22027b9cddfc | b89d6919-9560-4e91-8e6e-e1f1b609e4a4 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| dc4f63ea-cde4-4a79-af09-a3eafea4a71c | fa57c7d6-883d-4787-a3dc-4501e3dd16b4 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 0b07f5ec-40fd-4952-9522-cbadbc6a659a | 92ad925a-5b38-47be-8e68-8ea67079edad | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 28fc1160-a81b-44b8-9c2a-decde11c1c58 | f10dc0e6-7cab-45fa-8811-d504cac87683 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 247b688b-3d85-4296-8212-1b7cea71ded5 | 00a09d72-a43b-4ae6-972d-47021569bd48 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 64675449-1be3-4ef4-a078-074bfbc16a2d | f0a03e31-e129-49d7-86e7-81d2e4aee50f | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| b5f5a0eb-a458-4dde-9d26-0b9f93e55b28 | b67a4534-ae5c-4ad7-adf5-e9c03a89bfab | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| e182c172-b7d9-476d-b269-2f7a3d14a212 | 3125aa61-d3d4-4002-a987-958f780a325b | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 0b850080-1b41-4e84-8795-25133f44c352 | 64118d6d-d35f-46c7-8915-482d109e012a | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 9f4311d7-9243-4766-a86a-210d09f02287 | fb5a50c3-4639-497f-892c-33bde342bcad | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 2f13d83f-7e45-497e-a2c9-aae79f4d6e03 | 363cc478-01d0-4349-bfde-a0366f988aa9 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| a94b18a5-ff8d-41d0-8429-dadf3513f638 | 7f255c74-f672-456b-8c3a-1b8db5294bec | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 4de8181d-4418-4750-8a93-1c2b03c404ac | b42d9f3d-657f-4db5-a560-d56cf7e021e0 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 01d9b541-6fbf-471e-b6bc-ba5180cbed10 | 4993f354-fb56-4036-b6f6-36a373a6057a | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| bcf45ab5-2bb5-42fc-8609-2f9d6a56db22 | f6a761b1-2c10-444f-9702-d786fec54d25 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 6e1995b3-3988-4a10-bef3-7ba7234b57eb | fa920bd9-c3f8-429f-9976-d6d25691fcf6 | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 8f4fff14-4ed7-4cf4-bb7e-e8d01670bf16 | c4b89bae-e39d-465c-a560-40d6d3ebe36e | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |
| 8da215ce-2821-4cdf-80a5-09bbb606738b | e4456eb4-b906-4d8a-9216-06e6844b12af | c2ecc2f7-8ed7-43e7-b774-d3070320ef82 | 2025-08-08 06:20:33.691583+00 |




-- 13. DATOS DE CONTENIDO ADICIONAL
| termino | definicion_md || ------- | -------------------------------------------------------------------- || DCA | Dollar Cost Averaging: invertir cantidades fijas de forma periódica. || Futuros | Contrato para comprar o vender un activo en el futuro. || Riesgo | Posibilidad de que el rendimiento real difiera del esperado. |




-- 15. CONTEOS Y ESTADÍSTICAS POR TABLA
| tabla       | total_registros | primer_registro               | ultimo_registro               |
| ----------- | --------------- | ----------------------------- | ----------------------------- |
| communities | 11              | 2025-08-08 06:11:35.148631+00 | 2025-08-18 05:09:18.944872+00 |
| market_data | 5               | 2025-08-18 13:34:44.789435+00 | 2025-08-18 13:34:44.789435+00 |
| posts       | 207             | 2025-08-08 06:20:33.691583+00 | 2025-08-17 16:08:01.220564+00 |
| promotions  | 2               | 2025-08-16 22:22:45.203568+00 | 2025-08-16 22:22:53.129642+00 |
| users       | 124             | 2025-08-08 06:15:10.71612+00  | 2025-09-12 00:07:38.307935+00 |




-- Posts con información completa del usuario y comunidad
| id                                   | user_id                              | community_id                         | contenido                                                                                                                                                                       | media_url | likes_count | dislikes_count | comment_count | created_at                    | user_name | user_avatar                     | role                     | content | image_url | likes | comments | shares | is_pinned | pinned_by | pinned_at | is_edited | updated_at                    | username | avatar_url | community_name  |
| ------------------------------------ | ------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- | -------------- | ------------- | ----------------------------- | --------- | ------------------------------- | ------------------------ | ------- | --------- | ----- | -------- | ------ | --------- | --------- | --------- | --------- | ----------------------------- | -------- | ---------- | --------------- |
| b0150eb7-8d24-4486-8447-e91937ce38fd | 94a06e04-b6d6-4414-a6d7-4b87a756f9f9 | null                                 | Invertir en la bolsa puede ser una excelente manera de hacer crecer tu patrimonio a largo plazo. La clave está en la diversificación y en mantener una estrategia disciplinada. | []        | 100         | 0              | 15            | 2025-08-17 16:08:01.220564+00 | user  1   | https://i.pravatar.cc/100?img=3 | Financiero               | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  1  | null       | null            |
| bf827ee9-78cd-4c51-94a9-997f16a90fc2 | f0532d69-71bc-46a2-80dd-c7096295a3e3 | null                                 | La importancia de diversificar en inversiones no puede ser subestimada. Nunca pongas todos tus huevos en una sola canasta, especialmente en mercados volátiles.                 | []        | 55          | 0              | 8             | 2025-08-17 16:08:01.220564+00 | user  2   | https://i.pravatar.cc/100?img=5 | Mercadólogo y financista | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  2  | null       | null            |
| 2087bffa-379d-475b-a892-69f2e2365656 | null                                 | null                                 | La importancia de diversificar en inversiones no puede ser subestimada. Nunca pongas todos tus huevos en una sola canasta, especialmente en mercados volátiles.                 | []        | 55          | 0              | 8             | 2025-08-17 16:01:50.652263+00 | null      | https://i.pravatar.cc/100?img=5 | Mercadólogo y financista | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | null     | null       | null            |
| 90c53bf1-99b7-443a-b0f9-c7863cd0d48f | null                                 | null                                 | Invertir en la bolsa puede ser una excelente manera de hacer crecer tu patrimonio a largo plazo. La clave está en la diversificación y en mantener una estrategia disciplinada. | []        | 100         | 0              | 15            | 2025-08-17 16:01:50.652263+00 | null      | https://i.pravatar.cc/100?img=3 | Financiero               | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | null     | null       | null            |
| 00881e9b-5398-465f-ac02-7ce873c17966 | 94a06e04-b6d6-4414-a6d7-4b87a756f9f9 | null                                 | Invertir en la bolsa puede ser una excelente manera de hacer crecer tu patrimonio a largo plazo. La clave está en la diversificación y en mantener una estrategia disciplinada. | []        | 100         | 0              | 15            | 2025-08-17 16:01:23.849041+00 | user  1   | https://i.pravatar.cc/100?img=3 | Financiero               | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  1  | null       | null            |
| 12115658-bb07-41af-b91f-7b8df1afde94 | 216eacd7-63c6-4d03-9d44-df6833d109d0 | null                                 | Post demo de user 63                                                                                                                                                            | []        | 0           | 0              | 24            | 2025-08-08 06:48:21.182897+00 | user 63   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 63  | null       | null            |
| 1376c81d-d12c-4603-a8c7-cd31b7cdd5a7 | 91c8a9d1-98ef-405a-8835-577bb60797bb | null                                 | Post demo de user 96                                                                                                                                                            | []        | 1           | 0              | 18            | 2025-08-08 06:48:21.182897+00 | user 96   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 96  | null       | null            |
| 1379e39a-3a6f-472c-ad3f-eefe1b6d83f6 | 4b5e1731-376f-4414-9653-e37782adcdbe | null                                 | Post demo de user 26                                                                                                                                                            | []        | 0           | 0              | 18            | 2025-08-08 06:48:21.182897+00 | user 26   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 26  | null       | null            |
| 139af62b-fa57-417f-ba6f-b54ae8eea871 | f10dc0e6-7cab-45fa-8811-d504cac87683 | null                                 | Post demo de user 52                                                                                                                                                            | []        | 0           | 0              | 22            | 2025-08-08 06:48:21.182897+00 | user 52   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 52  | null       | null            |
| 13a6004e-5142-4d88-8fc9-18f159fb2b10 | 88ad3c22-361e-4205-8aa9-22a85053ed4e | null                                 | Post demo de user 20                                                                                                                                                            | []        | 0           | 0              | 24            | 2025-08-08 06:48:21.182897+00 | user 20   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 20  | null       | null            |
| 15395efe-d8e3-42a9-bf53-d62b2b5365da | 9e28815c-35f7-4e35-9262-8447acf09ae4 | null                                 | Post demo de user 90                                                                                                                                                            | []        | 0           | 0              | 24            | 2025-08-08 06:48:21.182897+00 | user 90   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 90  | null       | null            |
| 18a469d3-b5e9-4708-b25f-0526129a5931 | a5a0d041-13d6-4666-8be7-be5b1b9606d5 | null                                 | Post demo de user 14                                                                                                                                                            | []        | 1           | 0              | 23            | 2025-08-08 06:48:21.182897+00 | user 14   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 14  | null       | null            |
| 1998ad4d-2bef-44d7-9dab-b0df3a1461d0 | fb7a0c1f-1bd2-4e49-b291-0862f340bcc7 | null                                 | Post demo de user 45                                                                                                                                                            | []        | 0           | 1              | 14            | 2025-08-08 06:48:21.182897+00 | user 45   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 45  | null       | null            |
| 1b99d382-f0d5-4a53-971e-e965054e0712 | b789dc94-23a9-44ae-ba9e-6eb686276c40 | null                                 | Post demo de user 22                                                                                                                                                            | []        | 1           | 0              | 22            | 2025-08-08 06:48:21.182897+00 | user 22   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 22  | null       | null            |
| 4d8362e7-2c97-4a88-addb-ea034b348647 | fa57c7d6-883d-4787-a3dc-4501e3dd16b4 | null                                 | Post demo de user 13                                                                                                                                                            | []        | 1           | 0              | 15            | 2025-08-08 06:48:21.182897+00 | user 13   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 13  | null       | null            |
| 042df4e9-16c3-4a5a-bd8c-22f64db5d8e2 | f1498268-3974-4373-ad2d-48c49f3c5eca | null                                 | Post demo de user 99                                                                                                                                                            | []        | 1           | 0              | 20            | 2025-08-08 06:48:21.182897+00 | user 99   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 99  | null       | null            |
| 049b3759-2381-463c-b96c-5b9badca0f3b | b1aaabb6-3e9e-4c7b-bac6-a49ff5d8936d | null                                 | Post demo de user 43                                                                                                                                                            | []        | 0           | 0              | 18            | 2025-08-08 06:48:21.182897+00 | user 43   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 43  | null       | null            |
| 0c1ff051-c216-4036-a096-16bdfd1f7d3e | f1a55fa2-3f27-47a4-b402-3d1728442ed8 | null                                 | Post demo de user 91                                                                                                                                                            | []        | 1           | 0              | 16            | 2025-08-08 06:48:21.182897+00 | user 91   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 91  | null       | null            |
| 10d398b7-c77a-4c8e-9875-dfa8b9c7cd21 | 98d1a003-b5af-4fb1-aae5-b4d4532f7186 | null                                 | Post demo de user 94                                                                                                                                                            | []        | 0           | 0              | 18            | 2025-08-08 06:48:21.182897+00 | user 94   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 94  | null       | null            |
| 1c933bcb-0ae4-42e2-a2f7-be4eb271942c | 7a5840f4-d5f9-4c84-96cb-55faa6022d20 | null                                 | Post demo de user 80                                                                                                                                                            | []        | 0           | 0              | 19            | 2025-08-08 06:48:21.182897+00 | user 80   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 80  | null       | null            |
| 1da3dfcd-fa44-469b-a8a2-acda3673df2e | a697c7fc-7ac6-4cf6-8bd0-176d2f45f6e2 | null                                 | Post demo de user 59                                                                                                                                                            | []        | 1           | 0              | 15            | 2025-08-08 06:48:21.182897+00 | user 59   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 59  | null       | null            |
| 241fc885-7ebf-4d02-92ff-1dd8e6dfbd07 | f0532d69-71bc-46a2-80dd-c7096295a3e3 | null                                 | Post demo de user  2                                                                                                                                                            | []        | 1           | 0              | 15            | 2025-08-08 06:48:21.182897+00 | user  2   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  2  | null       | null            |
| 274a046b-9a7a-4ccf-a702-f8e06408af57 | 02de0208-6d2a-45c6-a381-5dbf2adf6a55 | null                                 | Post demo de user 32                                                                                                                                                            | []        | 1           | 0              | 21            | 2025-08-08 06:48:21.182897+00 | user 32   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 32  | null       | null            |
| 2e4557bd-ea1c-4456-bc39-9b3c63ade8fe | 0e0599c4-ded4-4f22-9289-5fc57c2430e4 | null                                 | Post demo de user 75                                                                                                                                                            | []        | 0           | 0              | 20            | 2025-08-08 06:48:21.182897+00 | user 75   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 75  | null       | null            |
| 2f3432a5-d046-4420-b178-c5182e4ed52b | c36e7fb5-91b5-446e-8e5b-a2a37a637da8 | null                                 | Post demo de user  9                                                                                                                                                            | []        | 0           | 0              | 24            | 2025-08-08 06:48:21.182897+00 | user  9   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  9  | null       | null            |
| 329228be-0ddc-490c-9b2d-7f391c0cfd68 | 363cc478-01d0-4349-bfde-a0366f988aa9 | null                                 | Post demo de user 24                                                                                                                                                            | []        | 0           | 0              | 29            | 2025-08-08 06:48:21.182897+00 | user 24   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 24  | null       | null            |
| 38998fde-8724-4bdf-b4b7-e9f2d3769aec | fa920bd9-c3f8-429f-9976-d6d25691fcf6 | null                                 | Post demo de user 85                                                                                                                                                            | []        | 0           | 0              | 19            | 2025-08-08 06:48:21.182897+00 | user 85   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 85  | null       | null            |
| 3a8b6821-59c6-407a-9317-81ff27eb8f9a | d99f1b9f-1260-435e-8a6d-43589f96745b | null                                 | Post demo de user 23                                                                                                                                                            | []        | 0           | 0              | 17            | 2025-08-08 06:48:21.182897+00 | user 23   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 23  | null       | null            |
| 3d50b60e-fc74-4b72-bf21-9520056026a4 | f68fccaa-3e57-4aa1-9edd-7eeadf96bc5f | null                                 | Post demo de user 76                                                                                                                                                            | []        | 0           | 0              | 11            | 2025-08-08 06:48:21.182897+00 | user 76   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 76  | null       | null            |
| 3da48488-3d17-4235-8694-5c4014aa742a | fdb11614-1164-4805-a332-6165fb3f0f6c | null                                 | Post demo de user 57                                                                                                                                                            | []        | 0           | 0              | 18            | 2025-08-08 06:48:21.182897+00 | user 57   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 57  | null       | null            |
| 3dbb5ca1-645e-4878-be2c-cfd3f6574d0e | 279548cd-c8a0-4561-a563-d3a71ab93f38 | null                                 | Post demo de user 60                                                                                                                                                            | []        | 0           | 0              | 18            | 2025-08-08 06:48:21.182897+00 | user 60   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 60  | null       | null            |
| 416d8c32-9ee6-46ed-8701-2661bebc104d | 19d12d9d-bbbb-4443-bdcc-3aa0c924f70e | null                                 | Post demo de user 61                                                                                                                                                            | []        | 0           | 0              | 21            | 2025-08-08 06:48:21.182897+00 | user 61   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 61  | null       | null            |
| 417146bb-8737-4734-9893-0f1975db17d0 | ce732357-10d3-4475-8a96-9fee171ef0e1 | null                                 | Post demo de user 84                                                                                                                                                            | []        | 0           | 1              | 26            | 2025-08-08 06:48:21.182897+00 | user 84   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 84  | null       | null            |
| 42edd3d1-3490-4af0-aadc-74f066cb26d2 | efe362e7-6029-44a8-85d2-bebe4d165949 | null                                 | Post demo de user 34                                                                                                                                                            | []        | 1           | 0              | 21            | 2025-08-08 06:48:21.182897+00 | user 34   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 34  | null       | null            |
| 4507c230-389e-44c2-ac73-dd92fa57794a | 919e81a1-60d9-41a5-9541-7a47d23246c1 | null                                 | Post demo de user 72                                                                                                                                                            | []        | 1           | 0              | 20            | 2025-08-08 06:48:21.182897+00 | user 72   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 72  | null       | null            |
| 485ea874-d883-4d9d-a732-06723999a431 | 14812879-96cd-486c-b3f0-aee57f918ffa | null                                 | Post demo de user 51                                                                                                                                                            | []        | 0           | 0              | 16            | 2025-08-08 06:48:21.182897+00 | user 51   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 51  | null       | null            |
| 4b8268c0-d714-4c9e-88ed-acc670d62c06 | 54b0e944-2937-4a64-a321-6be9950c8a82 | null                                 | Post demo de user  4                                                                                                                                                            | []        | 1           | 0              | 16            | 2025-08-08 06:48:21.182897+00 | user  4   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  4  | null       | null            |
| 546b838a-c81b-494d-a7b4-0b74e61d25ca | eeac70a1-9970-45ed-92e0-0d604395fc70 | null                                 | Post demo de user  8                                                                                                                                                            | []        | 0           | 0              | 15            | 2025-08-08 06:48:21.182897+00 | user  8   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  8  | null       | null            |
| 5642e5fb-eecb-4142-b532-34d12543f888 | 2cdc4d7a-4ba7-4d47-b725-10028cb708f4 | null                                 | Post demo de user 40                                                                                                                                                            | []        | 0           | 0              | 20            | 2025-08-08 06:48:21.182897+00 | user 40   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 40  | null       | null            |
| 58e7fc89-86be-4cb1-8f2c-053eae7ca974 | 93fb520e-a238-42ac-aeae-e681cf43c75e | null                                 | Post demo de user 74                                                                                                                                                            | []        | 1           | 0              | 21            | 2025-08-08 06:48:21.182897+00 | user 74   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 74  | null       | null            |
| 6302eb16-8fa0-473f-a6b9-b95184475094 | 574482d8-b950-49f5-bea6-407f64ddd515 | null                                 | Post demo de user 50                                                                                                                                                            | []        | 0           | 1              | 24            | 2025-08-08 06:48:21.182897+00 | user 50   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 50  | null       | null            |
| 6755cab6-801b-4924-8367-ed4e839317dd | f2fd9861-d0ec-483c-801c-96aa807da361 | null                                 | Post demo de user  7                                                                                                                                                            | []        | 1           | 0              | 20            | 2025-08-08 06:48:21.182897+00 | user  7   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  7  | null       | null            |
| 6c0dc70a-ba65-4d67-888f-25e1df3654fc | 837f4b44-54fc-44b2-8d1e-ce7e570c34e6 | null                                 | Post demo de user 19                                                                                                                                                            | []        | 0           | 0              | 19            | 2025-08-08 06:48:21.182897+00 | user 19   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 19  | null       | null            |
| 6ce1b253-fa5e-4221-813f-8e522785d1aa | dd86887a-e77e-4078-879a-54f6d8dd941b | null                                 | Post demo de user 39                                                                                                                                                            | []        | 1           | 0              | 16            | 2025-08-08 06:48:21.182897+00 | user 39   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 39  | null       | null            |
| 72f1eaa9-ce98-47c0-bc1d-d98e918e4f50 | 92ad925a-5b38-47be-8e68-8ea67079edad | null                                 | Post demo de user 18                                                                                                                                                            | []        | 0           | 0              | 12            | 2025-08-08 06:48:21.182897+00 | user 18   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 18  | null       | null            |
| 73a39d6b-6ed9-44f4-b70b-1fab39e15c5c | e4a4195a-ed61-4dd1-be7c-745c2691455f | null                                 | Post demo de user 25                                                                                                                                                            | []        | 1           | 0              | 23            | 2025-08-08 06:48:21.182897+00 | user 25   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 25  | null       | null            |
| 73e3a75c-5fa6-4cbb-8a33-7f41b2943858 | 81d59132-559c-4fba-a5b1-2d1cef9cd4a5 | null                                 | Post demo de user 47                                                                                                                                                            | []        | 0           | 0              | 23            | 2025-08-08 06:48:21.182897+00 | user 47   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 47  | null       | null            |
| 755ec345-f0c9-4bb8-95c2-733474837c3d | f6a761b1-2c10-444f-9702-d786fec54d25 | null                                 | Post demo de user 71                                                                                                                                                            | []        | 0           | 0              | 24            | 2025-08-08 06:48:21.182897+00 | user 71   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 71  | null       | null            |
| 7a2f4624-2f35-46a5-a5b1-2e43e84cc4af | b89d6919-9560-4e91-8e6e-e1f1b609e4a4 | null                                 | Post demo de user 67                                                                                                                                                            | []        | 0           | 1              | 21            | 2025-08-08 06:48:21.182897+00 | user 67   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 67  | null       | null            |
| 7c515c30-c7a3-464a-8139-f9d2f2b2d176 | b494451d-9f7f-4918-9239-c24a0ccad942 | null                                 | Post demo de user100                                                                                                                                                            | []        | 0           | 0              | 18            | 2025-08-08 06:48:21.182897+00 | user100   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user100  | null       | null            |
| 7f9c98ef-d0d9-4950-bbf8-302e8f13ba9d | 52de8e1e-17dc-4636-8f28-494a2aed3df9 | null                                 | Post demo de user 53                                                                                                                                                            | []        | 1           | 0              | 14            | 2025-08-08 06:48:21.182897+00 | user 53   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 53  | null       | null            |
| 81289ec6-2500-4f67-97a9-bac57f6d95b4 | 4fbffd2a-e7af-4a02-8724-7b97bcbb15cf | null                                 | Post demo de user 98                                                                                                                                                            | []        | 1           | 0              | 17            | 2025-08-08 06:48:21.182897+00 | user 98   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 98  | null       | null            |
| 820b22f0-4342-4db6-8fb5-40f238e5214c | b42d9f3d-657f-4db5-a560-d56cf7e021e0 | null                                 | Post demo de user 77                                                                                                                                                            | []        | 0           | 0              | 20            | 2025-08-08 06:48:21.182897+00 | user 77   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 77  | null       | null            |
| 833de5ff-7a5c-44df-8243-4d5c3e6632c3 | 5f556435-09d1-4bc9-a139-05dfa2a5dd3d | null                                 | Post demo de user  6                                                                                                                                                            | []        | 0           | 0              | 13            | 2025-08-08 06:48:21.182897+00 | user  6   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  6  | null       | null            |
| 873d13c2-5858-47c0-853c-ecbca9eb34a6 | ccfe3e94-d6ac-4023-9231-f4c7ea7a79c4 | null                                 | Post demo de user 86                                                                                                                                                            | []        | 1           | 0              | 20            | 2025-08-08 06:48:21.182897+00 | user 86   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 86  | null       | null            |
| 87d286de-3d96-49e2-8b39-b5099c7d4862 | 96b2659e-7610-4935-aeb8-c1085a131352 | null                                 | Post demo de user 15                                                                                                                                                            | []        | 0           | 0              | 18            | 2025-08-08 06:48:21.182897+00 | user 15   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 15  | null       | null            |
| 8a5e875c-3911-4790-a713-970b3c2d2471 | bf69d25e-b8fe-4cde-84f4-89a0e7c1bd4f | null                                 | Post demo de user 10                                                                                                                                                            | []        | 1           | 0              | 12            | 2025-08-08 06:48:21.182897+00 | user 10   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 10  | null       | null            |
| 8bc94cbf-3939-4f94-979b-bc8619dd867e | 299d875d-ff7f-4a86-80c0-6948929d1d78 | null                                 | Post demo de user 36                                                                                                                                                            | []        | 1           | 0              | 24            | 2025-08-08 06:48:21.182897+00 | user 36   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 36  | null       | null            |
| 8c7dc587-0c3d-42e3-80d7-18d01b32e88d | 74cacc35-66bf-4524-aa51-defd51daea13 | null                                 | Post demo de user 29                                                                                                                                                            | []        | 0           | 0              | 19            | 2025-08-08 06:48:21.182897+00 | user 29   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 29  | null       | null            |
| 8c874436-39eb-48ee-95d1-79e623756832 | c4b89bae-e39d-465c-a560-40d6d3ebe36e | null                                 | Post demo de user 83                                                                                                                                                            | []        | 0           | 0              | 25            | 2025-08-08 06:48:21.182897+00 | user 83   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 83  | null       | null            |
| 8ff6e728-458d-411a-800f-acfccde1964e | 87d0280f-726f-4bee-b73e-b410c1f56090 | null                                 | Post demo de user 78                                                                                                                                                            | []        | 0           | 0              | 20            | 2025-08-08 06:48:21.182897+00 | user 78   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 78  | null       | null            |
| 9079ce94-406c-4511-b695-e08d61c5b7f4 | c3afd606-5699-4e4b-b478-d018cd6e1cce | null                                 | Post demo de user 64                                                                                                                                                            | []        | 1           | 0              | 17            | 2025-08-08 06:48:21.182897+00 | user 64   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 64  | null       | null            |
| 92195b7c-c534-4cc5-96a7-f5e434f616f2 | 22d38629-d1a5-4384-92aa-da9130b14d76 | null                                 | Post demo de user 70                                                                                                                                                            | []        | 0           | 0              | 21            | 2025-08-08 06:48:21.182897+00 | user 70   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 70  | null       | null            |
| 923e27dd-b9d7-49ee-8499-fd3983a9ef24 | 12f8abe3-9dfd-49e8-9a0a-69feec8f3fb0 | null                                 | Post demo de user 65                                                                                                                                                            | []        | 0           | 1              | 22            | 2025-08-08 06:48:21.182897+00 | user 65   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 65  | null       | null            |
| a067c818-7d36-4341-9251-4222ac86c7f4 | d4fb92dd-2049-4ac9-b323-63ba02c2cfa8 | null                                 | Post demo de user 95                                                                                                                                                            | []        | 1           | 0              | 23            | 2025-08-08 06:48:21.182897+00 | user 95   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 95  | null       | null            |
| a1f356e6-b48c-4afc-a39b-92b9964e78b9 | 33d414cb-476d-45cf-9893-178598be49ff | null                                 | Post demo de user 12                                                                                                                                                            | []        | 1           | 0              | 17            | 2025-08-08 06:48:21.182897+00 | user 12   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 12  | null       | null            |
| a355a390-0f12-4ff7-a773-ad5ae7524af4 | e0eae48b-9a18-49c2-b3d6-0b6805dfc696 | null                                 | Post demo de user 93                                                                                                                                                            | []        | 0           | 1              | 22            | 2025-08-08 06:48:21.182897+00 | user 93   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 93  | null       | null            |
| a3d79abd-9f7b-41c2-b859-15055391b0f4 | 043733c7-e17d-40b8-bfa3-83b1809dfd99 | null                                 | Post demo de user 68                                                                                                                                                            | []        | 0           | 0              | 20            | 2025-08-08 06:48:21.182897+00 | user 68   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 68  | null       | null            |
| a437cd2a-798e-4848-a484-09710507e1fa | 43f30a87-30a6-48ce-a5c0-63f6cbe0738b | null                                 | Post demo de user  5                                                                                                                                                            | []        | 0           | 1              | 18            | 2025-08-08 06:48:21.182897+00 | user  5   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  5  | null       | null            |
| a4dc6a53-436d-472e-9a16-4b445077f85f | b6d622d8-53f5-47b0-876e-ca7995df2f97 | null                                 | Post demo de user 87                                                                                                                                                            | []        | 0           | 0              | 19            | 2025-08-08 06:48:21.182897+00 | user 87   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 87  | null       | null            |
| a6d7dd8b-7d2a-44f2-9dd2-23b32f564ebf | e4456eb4-b906-4d8a-9216-06e6844b12af | null                                 | Post demo de user 55                                                                                                                                                            | []        | 1           | 0              | 16            | 2025-08-08 06:48:21.182897+00 | user 55   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 55  | null       | null            |
| a808a023-7d3e-4ed4-b968-640eda907470 | 0e5607cc-65c6-48ed-9560-f560d4244280 | null                                 | Post demo de user 97                                                                                                                                                            | []        | 0           | 0              | 17            | 2025-08-08 06:48:21.182897+00 | user 97   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 97  | null       | null            |
| aa7a5012-68ac-4c67-8bbe-44d5df2d51cf | 04596a15-c5eb-41b5-b1b7-fe10543495c5 | null                                 | Post demo de user 38                                                                                                                                                            | []        | 1           | 0              | 18            | 2025-08-08 06:48:21.182897+00 | user 38   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 38  | null       | null            |
| afb85945-1e39-4311-851a-4b6f9a2b14f3 | 4ccc839f-d5e8-44b5-a5dd-7c2da0f25dc1 | null                                 | Post demo de user 33                                                                                                                                                            | []        | 1           | 0              | 15            | 2025-08-08 06:48:21.182897+00 | user 33   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 33  | null       | null            |
| b0e14c6f-ad18-4e43-9e06-77946989f2ca | 9f5128d5-3450-4ba7-bbcc-cb91c18c1095 | null                                 | Post demo de user 89                                                                                                                                                            | []        | 0           | 0              | 20            | 2025-08-08 06:48:21.182897+00 | user 89   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 89  | null       | null            |
| b16b9396-1740-4cd5-a156-d5a4b193bd56 | 7f255c74-f672-456b-8c3a-1b8db5294bec | null                                 | Post demo de user 27                                                                                                                                                            | []        | 1           | 0              | 14            | 2025-08-08 06:48:21.182897+00 | user 27   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 27  | null       | null            |
| b2a635ad-e459-41df-ae63-e80519cede93 | d4e60ce5-7d43-41ac-9a28-d3090cf0db78 | null                                 | Post demo de user 30                                                                                                                                                            | []        | 0           | 0              | 18            | 2025-08-08 06:48:21.182897+00 | user 30   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 30  | null       | null            |
| b2f5f423-e121-4746-ba44-ec48036eab6d | 8a922fd0-cc92-41b1-8285-c77283d63be2 | null                                 | Post demo de user 79                                                                                                                                                            | []        | 0           | 0              | 19            | 2025-08-08 06:48:21.182897+00 | user 79   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 79  | null       | null            |
| b3bf0916-6bcc-4136-a31d-823340e3ab40 | f0a03e31-e129-49d7-86e7-81d2e4aee50f | null                                 | Post demo de user 44                                                                                                                                                            | []        | 0           | 0              | 12            | 2025-08-08 06:48:21.182897+00 | user 44   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 44  | null       | null            |
| b411d55f-1a61-4cc4-8530-abd5c15a1d54 | afbde775-8889-4a5f-a6ac-3d52a9e9507c | null                                 | Post demo de user 81                                                                                                                                                            | []        | 0           | 0              | 18            | 2025-08-08 06:48:21.182897+00 | user 81   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 81  | null       | null            |
| b420a708-7b16-4e70-aab9-db78e3d54b32 | d3051ca8-c864-4f38-9bc1-9a1b81d31a32 | null                                 | Post demo de user 21                                                                                                                                                            | []        | 1           | 0              | 21            | 2025-08-08 06:48:21.182897+00 | user 21   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 21  | null       | null            |
| b48fd6eb-6273-4fd1-9f2c-cbcc192e6ede | 6084eaa9-08f2-48fa-93f9-77557a864466 | null                                 | Post demo de user 69                                                                                                                                                            | []        | 0           | 0              | 22            | 2025-08-08 06:48:21.182897+00 | user 69   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 69  | null       | null            |
| b9fea394-c932-4d0f-987e-591a0fc79ac6 | 39d79569-36f5-4fe2-ab10-517b1594703e | null                                 | Post demo de user 48                                                                                                                                                            | []        | 0           | 0              | 18            | 2025-08-08 06:48:21.182897+00 | user 48   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 48  | null       | null            |
| bcab0904-8dc3-42e4-bff0-5f976efa25b8 | 55bd1ca7-6729-4d47-b65e-a17b872f0c29 | null                                 | Post demo de user 41                                                                                                                                                            | []        | 1           | 0              | 13            | 2025-08-08 06:48:21.182897+00 | user 41   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 41  | null       | null            |
| c1491d04-57ea-4643-b48c-0f2ddced39a6 | f06d15ed-91e0-4544-bfd2-7204688a6177 | null                                 | Post demo de user 37                                                                                                                                                            | []        | 1           | 0              | 23            | 2025-08-08 06:48:21.182897+00 | user 37   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 37  | null       | null            |
| c2892768-e5bb-4c1d-87f2-ec8803185412 | 4993f354-fb56-4036-b6f6-36a373a6057a | ed0e8636-8bc5-4789-a1c2-6cb93cd9bb8b | Post demo de admin                                                                                                                                                              | []        | 1           | 0              | 16            | 2025-08-08 06:48:21.182897+00 | Admin     | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | admin    | null       | IA y Finanzas   |
| c2e64778-a5e4-4b58-9a95-6f4301cedb91 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | null                                 | Post demo de user 35                                                                                                                                                            | []        | 0           | 0              | 23            | 2025-08-08 06:48:21.182897+00 | user 35   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 35  | null       | null            |
| c3d4885b-f479-4cf5-8b6b-89ff03d7233c | ed8f5f0d-f70d-4ff4-9b24-dc7855bed902 | null                                 | Post demo de user 28                                                                                                                                                            | []        | 1           | 0              | 15            | 2025-08-08 06:48:21.182897+00 | user 28   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 28  | null       | null            |
| c73ac8ff-8147-4116-b134-c874fb37639d | 3125aa61-d3d4-4002-a987-958f780a325b | null                                 | Post demo de user  3                                                                                                                                                            | []        | 1           | 0              | 16            | 2025-08-08 06:48:21.182897+00 | user  3   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  3  | null       | null            |
| d21c9371-1a0d-42aa-8167-5c22baa06813 | a571a16b-2580-4e70-b3ee-327fc2333f6c | null                                 | Post demo de user 11                                                                                                                                                            | []        | 1           | 0              | 27            | 2025-08-08 06:48:21.182897+00 | user 11   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 11  | null       | null            |
| d283aabc-a6d7-4042-9379-f1bc4202ff8c | fa97c16d-26d2-4abb-88fc-f006dffaf7fb | null                                 | Post demo de user 17                                                                                                                                                            | []        | 0           | 1              | 18            | 2025-08-08 06:48:21.182897+00 | user 17   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 17  | null       | null            |
| d83b6885-4e49-4242-a18c-3ed34f5592d1 | fb5a50c3-4639-497f-892c-33bde342bcad | null                                 | Post demo de user 56                                                                                                                                                            | []        | 1           | 0              | 22            | 2025-08-08 06:48:21.182897+00 | user 56   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 56  | null       | null            |
| d91220e4-11eb-459f-9251-fcfcc7886f62 | 66241782-b5ed-4a09-8f68-1d53e4f3f8e5 | null                                 | Post demo de user 54                                                                                                                                                            | []        | 0           | 0              | 22            | 2025-08-08 06:48:21.182897+00 | user 54   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 54  | null       | null            |
| d96c5553-19a6-4c69-875d-ce85162a215e | 089a267f-a842-4067-b95a-f65f1e7d9c35 | null                                 | Post demo de user 92                                                                                                                                                            | []        | 1           | 0              | 14            | 2025-08-08 06:48:21.182897+00 | user 92   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 92  | null       | null            |
| db1bfd6c-2ec4-4369-80d1-8a417c38e11e | 71e7f5fe-eb8f-4fe5-86f8-d2f33ddfd465 | null                                 | Post demo de user 16                                                                                                                                                            | []        | 0           | 0              | 19            | 2025-08-08 06:48:21.182897+00 | user 16   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 16  | null       | null            |
| dcc2c97b-79fe-47a8-9eee-fce55396a1a7 | 288ee850-e0c0-4a16-b4f9-71c70cd52062 | null                                 | Post demo de user 82                                                                                                                                                            | []        | 0           | 0              | 12            | 2025-08-08 06:48:21.182897+00 | user 82   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 82  | null       | null            |
| dd3e1266-0655-4110-8ddc-d134e621458e | b67a4534-ae5c-4ad7-adf5-e9c03a89bfab | null                                 | Post demo de user 66                                                                                                                                                            | []        | 1           | 0              | 18            | 2025-08-08 06:48:21.182897+00 | user 66   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 66  | null       | null            |
| de017456-4f02-4e84-bde2-a0c8a016fc1b | 9ac2e120-9b1a-4e5c-8c03-92d847ba1a1c | null                                 | Post demo de user 31                                                                                                                                                            | []        | 0           | 0              | 25            | 2025-08-08 06:48:21.182897+00 | user 31   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 31  | null       | null            |
| e2fcf1eb-7fd4-4af7-b4db-58edc76bb7e5 | b310725e-d2d2-4b61-a836-7eb214883334 | null                                 | Post demo de user 42                                                                                                                                                            | []        | 0           | 0              | 19            | 2025-08-08 06:48:21.182897+00 | user 42   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 42  | null       | null            |
| e36e73f6-4ff8-467d-8cec-c4909ee6fa56 | 00a09d72-a43b-4ae6-972d-47021569bd48 | null                                 | Post demo de user 88                                                                                                                                                            | []        | 0           | 0              | 14            | 2025-08-08 06:48:21.182897+00 | user 88   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 88  | null       | null            |
| ea2764ae-e18f-4cbb-9b77-ccb633925c3c | 94a06e04-b6d6-4414-a6d7-4b87a756f9f9 | null                                 | Post demo de user  1                                                                                                                                                            | []        | 0           | 1              | 22            | 2025-08-08 06:48:21.182897+00 | user  1   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  1  | null       | null            |
| ee04713e-469d-436a-8299-5111694031dc | 64118d6d-d35f-46c7-8915-482d109e012a | null                                 | Post demo de user 58                                                                                                                                                            | []        | 0           | 0              | 25            | 2025-08-08 06:48:21.182897+00 | user 58   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 58  | null       | null            |
| f1c06368-e2b2-484c-a7c9-d97c42360260 | 1f6200e5-1158-44b8-b983-e94442808b98 | null                                 | Post demo de user 46                                                                                                                                                            | []        | 1           | 0              | 22            | 2025-08-08 06:48:21.182897+00 | user 46   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 46  | null       | null            |
| f8e46564-2046-4829-9428-806ac366eb18 | 03f0b0ad-72cd-491f-9012-ce958332688c | null                                 | Post demo de user 62                                                                                                                                                            | []        | 0           | 0              | 15            | 2025-08-08 06:48:21.182897+00 | user 62   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 62  | null       | null            |
| fbc76384-400c-425b-837e-9d154718180b | b83c640d-4ab4-4217-afe9-b10b242f784a | null                                 | Post demo de user 73                                                                                                                                                            | []        | 0           | 0              | 23            | 2025-08-08 06:48:21.182897+00 | user 73   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 73  | null       | null            |
| ff5806f4-cdd9-451e-af52-b90ec4e4d4f4 | 3fe721bb-7ce2-41fd-a16a-a64b5d161282 | null                                 | Post demo de user 49                                                                                                                                                            | []        | 1           | 0              | 20            | 2025-08-08 06:48:21.182897+00 | user 49   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 49  | null       | null            |
| 7fdf7c52-c40b-4efe-b842-93345dde3992 | 14812879-96cd-486c-b3f0-aee57f918ffa | null                                 | Post demo de user 51                                                                                                                                                            | []        | 0           | 1              | 43            | 2025-08-08 06:20:33.691583+00 | user 51   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 51  | null       | null            |
| 80e7473c-55ae-424b-b513-08b513f08792 | 5f556435-09d1-4bc9-a139-05dfa2a5dd3d | null                                 | Post demo de user  6                                                                                                                                                            | []        | 0           | 0              | 50            | 2025-08-08 06:20:33.691583+00 | user  6   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  6  | null       | null            |
| d030fab8-0f6e-4804-8b98-30703c7cf190 | e0eae48b-9a18-49c2-b3d6-0b6805dfc696 | null                                 | Post demo de user 93                                                                                                                                                            | []        | 2           | 0              | 41            | 2025-08-08 06:20:33.691583+00 | user 93   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 93  | null       | null            |
| b1526c94-4554-4879-8d6d-174d86266f1a | 7f255c74-f672-456b-8c3a-1b8db5294bec | null                                 | Post demo de user 27                                                                                                                                                            | []        | 1           | 0              | 41            | 2025-08-08 06:20:33.691583+00 | user 27   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 27  | null       | null            |
| d1c47ef7-1395-4fc6-bf16-9a48af145e30 | 66241782-b5ed-4a09-8f68-1d53e4f3f8e5 | null                                 | Post demo de user 54                                                                                                                                                            | []        | 1           | 0              | 36            | 2025-08-08 06:20:33.691583+00 | user 54   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 54  | null       | null            |
| 8422f0a6-780d-4280-9891-79ffdfcaddb2 | 9ac2e120-9b1a-4e5c-8c03-92d847ba1a1c | null                                 | Post demo de user 31                                                                                                                                                            | []        | 1           | 0              | 42            | 2025-08-08 06:20:33.691583+00 | user 31   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 31  | null       | null            |
| 8433b33d-3466-4e0b-9ceb-517a79b34973 | 356fa732-aa31-496b-a14f-1e499cd02fd6 | null                                 | Post demo de user 35                                                                                                                                                            | []        | 0           | 0              | 44            | 2025-08-08 06:20:33.691583+00 | user 35   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 35  | null       | null            |
| 8586a79c-366f-43d8-b810-cc9c844a4398 | ed8f5f0d-f70d-4ff4-9b24-dc7855bed902 | null                                 | Post demo de user 28                                                                                                                                                            | []        | 2           | 0              | 40            | 2025-08-08 06:20:33.691583+00 | user 28   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 28  | null       | null            |
| 863ce465-4f62-4ea7-959a-723776009768 | 4fbffd2a-e7af-4a02-8724-7b97bcbb15cf | null                                 | Post demo de user 98                                                                                                                                                            | []        | 2           | 0              | 41            | 2025-08-08 06:20:33.691583+00 | user 98   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 98  | null       | null            |
| b241d447-7acb-440f-a340-2c09717f386f | 0e0599c4-ded4-4f22-9289-5fc57c2430e4 | null                                 | Post demo de user 75                                                                                                                                                            | []        | 0           | 1              | 44            | 2025-08-08 06:20:33.691583+00 | user 75   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 75  | null       | null            |
| 87afabd6-dedf-4f58-a88c-0d6c248a174f | 574482d8-b950-49f5-bea6-407f64ddd515 | null                                 | Post demo de user 50                                                                                                                                                            | []        | 0           | 1              | 43            | 2025-08-08 06:20:33.691583+00 | user 50   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 50  | null       | null            |
| f7015659-e734-4e74-a944-776455a8a6c6 | fb5a50c3-4639-497f-892c-33bde342bcad | null                                 | Post demo de user 56                                                                                                                                                            | []        | 1           | 0              | 40            | 2025-08-08 06:20:33.691583+00 | user 56   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 56  | null       | null            |
| 8915b410-5f02-4852-bde2-a8bf23c3e299 | 98d1a003-b5af-4fb1-aae5-b4d4532f7186 | null                                 | Post demo de user 94                                                                                                                                                            | []        | 0           | 0              | 37            | 2025-08-08 06:20:33.691583+00 | user 94   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 94  | null       | null            |
| 89b45d56-9acb-44f0-8a1c-7be72d1645b3 | f68fccaa-3e57-4aa1-9edd-7eeadf96bc5f | null                                 | Post demo de user 76                                                                                                                                                            | []        | 1           | 0              | 40            | 2025-08-08 06:20:33.691583+00 | user 76   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 76  | null       | null            |
| 1bb31bd4-e117-4e09-9876-ce5eeb12e16c | 043733c7-e17d-40b8-bfa3-83b1809dfd99 | null                                 | Post demo de user 68                                                                                                                                                            | []        | 0           | 0              | 42            | 2025-08-08 06:20:33.691583+00 | user 68   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 68  | null       | null            |
| b2ac8bd4-cdc4-4f67-b2ee-baec73098905 | bf69d25e-b8fe-4cde-84f4-89a0e7c1bd4f | null                                 | Post demo de user 10                                                                                                                                                            | []        | 0           | 0              | 40            | 2025-08-08 06:20:33.691583+00 | user 10   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 10  | null       | null            |
| 8b2a02b3-ad68-4fe0-a511-82c283351ca8 | afbde775-8889-4a5f-a6ac-3d52a9e9507c | null                                 | Post demo de user 81                                                                                                                                                            | []        | 0           | 1              | 37            | 2025-08-08 06:20:33.691583+00 | user 81   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 81  | null       | null            |
| 1d9e73ef-190d-4f39-bcc5-3ff72f2aead6 | 03f0b0ad-72cd-491f-9012-ce958332688c | null                                 | Post demo de user 62                                                                                                                                                            | []        | 0           | 0              | 40            | 2025-08-08 06:20:33.691583+00 | user 62   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 62  | null       | null            |
| 239407c0-1861-4f00-99a4-585696ae1be7 | 8a922fd0-cc92-41b1-8285-c77283d63be2 | null                                 | Post demo de user 79                                                                                                                                                            | []        | 0           | 0              | 44            | 2025-08-08 06:20:33.691583+00 | user 79   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 79  | null       | null            |
| f76d725f-d496-4de8-ac8e-e3e4bbe784fd | 55bd1ca7-6729-4d47-b65e-a17b872f0c29 | null                                 | Post demo de user 41                                                                                                                                                            | []        | 1           | 0              | 43            | 2025-08-08 06:20:33.691583+00 | user 41   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 41  | null       | null            |
| 26bc2ea1-b4ee-488a-b921-9226531da902 | 04596a15-c5eb-41b5-b1b7-fe10543495c5 | null                                 | Post demo de user 38                                                                                                                                                            | []        | 1           | 0              | 41            | 2025-08-08 06:20:33.691583+00 | user 38   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 38  | null       | null            |
| d4eac7a1-1420-42af-9227-3e6d587b0fc4 | 363cc478-01d0-4349-bfde-a0366f988aa9 | null                                 | Post demo de user 24                                                                                                                                                            | []        | 0           | 0              | 37            | 2025-08-08 06:20:33.691583+00 | user 24   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 24  | null       | null            |
| 2bdc81c1-0c57-4916-bf3d-49841ca2e1e6 | fb7a0c1f-1bd2-4e49-b291-0862f340bcc7 | null                                 | Post demo de user 45                                                                                                                                                            | []        | 1           | 0              | 30            | 2025-08-08 06:20:33.691583+00 | user 45   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 45  | null       | null            |
| e5ca7756-dd68-40d7-a151-93f1639766cb | 81d59132-559c-4fba-a5b1-2d1cef9cd4a5 | null                                 | Post demo de user 47                                                                                                                                                            | []        | 0           | 0              | 39            | 2025-08-08 06:20:33.691583+00 | user 47   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 47  | null       | null            |
| 8ef326a3-65d8-4aa6-afcc-efb2d4eda69f | a571a16b-2580-4e70-b3ee-327fc2333f6c | null                                 | Post demo de user 11                                                                                                                                                            | []        | 0           | 0              | 35            | 2025-08-08 06:20:33.691583+00 | user 11   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 11  | null       | null            |
| 0be8fff4-7ae7-42d8-aac1-a4d6d9148140 | ccfe3e94-d6ac-4023-9231-f4c7ea7a79c4 | null                                 | Post demo de user 86                                                                                                                                                            | []        | 0           | 1              | 43            | 2025-08-08 06:20:33.691583+00 | user 86   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 86  | null       | null            |
| 2f530300-4ed6-463f-9ca1-1ebe8b265e5f | 216eacd7-63c6-4d03-9d44-df6833d109d0 | null                                 | Post demo de user 63                                                                                                                                                            | []        | 0           | 0              | 41            | 2025-08-08 06:20:33.691583+00 | user 63   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 63  | null       | null            |
| 322773ca-71a5-4671-ab97-8fe6c4517fbc | eeac70a1-9970-45ed-92e0-0d604395fc70 | null                                 | Post demo de user  8                                                                                                                                                            | []        | 1           | 0              | 45            | 2025-08-08 06:20:33.691583+00 | user  8   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  8  | null       | null            |
| 2dd80905-0cd1-4195-bd22-aa37ba2615d4 | 0e5607cc-65c6-48ed-9560-f560d4244280 | null                                 | Post demo de user 97                                                                                                                                                            | []        | 1           | 0              | 43            | 2025-08-08 06:20:33.691583+00 | user 97   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 97  | null       | null            |
| e9099f3e-0b1e-4d5e-8851-ceaa17dc9b59 | b6d622d8-53f5-47b0-876e-ca7995df2f97 | null                                 | Post demo de user 87                                                                                                                                                            | []        | 1           | 0              | 38            | 2025-08-08 06:20:33.691583+00 | user 87   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 87  | null       | null            |
| 336ceb5c-1ad6-4485-a35d-6b16c870624d | c3afd606-5699-4e4b-b478-d018cd6e1cce | null                                 | Post demo de user 64                                                                                                                                                            | []        | 1           | 0              | 52            | 2025-08-08 06:20:33.691583+00 | user 64   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 64  | null       | null            |
| d91c68cf-87d7-4a84-944b-6f88a2b7fe1b | 3fe721bb-7ce2-41fd-a16a-a64b5d161282 | null                                 | Post demo de user 49                                                                                                                                                            | []        | 1           | 0              | 53            | 2025-08-08 06:20:33.691583+00 | user 49   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 49  | null       | null            |
| 91f4b5c0-3a4e-4fff-8e38-abafc3f89540 | e4a4195a-ed61-4dd1-be7c-745c2691455f | null                                 | Post demo de user 25                                                                                                                                                            | []        | 0           | 0              | 48            | 2025-08-08 06:20:33.691583+00 | user 25   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 25  | null       | null            |
| b5b5b49e-c732-483c-8526-f2514b2fb2e6 | efe362e7-6029-44a8-85d2-bebe4d165949 | null                                 | Post demo de user 34                                                                                                                                                            | []        | 0           | 0              | 42            | 2025-08-08 06:20:33.691583+00 | user 34   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 34  | null       | null            |
| 0bb129c6-a71e-4a6b-ae2a-237fe2235eaf | 7a5840f4-d5f9-4c84-96cb-55faa6022d20 | null                                 | Post demo de user 80                                                                                                                                                            | []        | 0           | 0              | 35            | 2025-08-08 06:20:33.691583+00 | user 80   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 80  | null       | null            |
| b61d2768-844b-4d15-bbc1-4c319ec6c5ee | 288ee850-e0c0-4a16-b4f9-71c70cd52062 | null                                 | Post demo de user 82                                                                                                                                                            | []        | 1           | 1              | 30            | 2025-08-08 06:20:33.691583+00 | user 82   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 82  | null       | null            |
| 9776fe22-8e30-4eaf-b7de-17bbff431aa9 | f06d15ed-91e0-4544-bfd2-7204688a6177 | null                                 | Post demo de user 37                                                                                                                                                            | []        | 1           | 0              | 42            | 2025-08-08 06:20:33.691583+00 | user 37   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 37  | null       | null            |
| 29c23b39-e9bf-4c98-a26d-7149ac4ddd36 | 12f8abe3-9dfd-49e8-9a0a-69feec8f3fb0 | null                                 | Post demo de user 65                                                                                                                                                            | []        | 1           | 0              | 41            | 2025-08-08 06:20:33.691583+00 | user 65   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 65  | null       | null            |
| 985f65e7-a184-4e02-bd20-7144d0cb0313 | 299d875d-ff7f-4a86-80c0-6948929d1d78 | null                                 | Post demo de user 36                                                                                                                                                            | []        | 1           | 0              | 41            | 2025-08-08 06:20:33.691583+00 | user 36   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 36  | null       | null            |
| 9947f833-2f1e-4899-a356-f9bd030ecc90 | 1f6200e5-1158-44b8-b983-e94442808b98 | null                                 | Post demo de user 46                                                                                                                                                            | []        | 0           | 0              | 40            | 2025-08-08 06:20:33.691583+00 | user 46   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 46  | null       | null            |
| 41c0db0c-f126-445d-918c-a071157a1b72 | 74cacc35-66bf-4524-aa51-defd51daea13 | null                                 | Post demo de user 29                                                                                                                                                            | []        | 1           | 0              | 42            | 2025-08-08 06:20:33.691583+00 | user 29   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 29  | null       | null            |
| 9b8a0926-dca3-4519-8272-190530fab7c7 | f6a761b1-2c10-444f-9702-d786fec54d25 | null                                 | Post demo de user 71                                                                                                                                                            | []        | 2           | 0              | 35            | 2025-08-08 06:20:33.691583+00 | user 71   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 71  | null       | null            |
| a03326cc-d681-4a7f-b31b-b09660587e4c | 93fb520e-a238-42ac-aeae-e681cf43c75e | null                                 | Post demo de user 74                                                                                                                                                            | []        | 2           | 0              | 40            | 2025-08-08 06:20:33.691583+00 | user 74   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 74  | null       | null            |
| fe325c2d-71de-4d61-92f2-c071972b6e73 | 22d38629-d1a5-4384-92aa-da9130b14d76 | null                                 | Post demo de user 70                                                                                                                                                            | []        | 0           | 1              | 42            | 2025-08-08 06:20:33.691583+00 | user 70   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 70  | null       | null            |
| a0b91297-246e-413c-a580-695698cbbd20 | fdb11614-1164-4805-a332-6165fb3f0f6c | null                                 | Post demo de user 57                                                                                                                                                            | []        | 1           | 0              | 42            | 2025-08-08 06:20:33.691583+00 | user 57   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 57  | null       | null            |
| 07baf750-2d5f-4ce1-a080-e24720b837a2 | e4456eb4-b906-4d8a-9216-06e6844b12af | null                                 | Post demo de user 55                                                                                                                                                            | []        | 0           | 1              | 40            | 2025-08-08 06:20:33.691583+00 | user 55   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 55  | null       | null            |
| 513d7ce3-e504-4eb0-9c98-8f1a8eab65f9 | 88ad3c22-361e-4205-8aa9-22a85053ed4e | null                                 | Post demo de user 20                                                                                                                                                            | []        | 0           | 0              | 36            | 2025-08-08 06:20:33.691583+00 | user 20   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 20  | null       | null            |
| db167250-7191-4e1f-8b0a-46e78b919bf6 | f0a03e31-e129-49d7-86e7-81d2e4aee50f | null                                 | Post demo de user 44                                                                                                                                                            | []        | 1           | 0              | 42            | 2025-08-08 06:20:33.691583+00 | user 44   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 44  | null       | null            |
| 057af3ba-1253-49a0-bcac-ffe98a261609 | b42d9f3d-657f-4db5-a560-d56cf7e021e0 | null                                 | Post demo de user 77                                                                                                                                                            | []        | 0           | 0              | 44            | 2025-08-08 06:20:33.691583+00 | user 77   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 77  | null       | null            |
| 08bbf724-186f-4fdf-b522-06596189974b | fa57c7d6-883d-4787-a3dc-4501e3dd16b4 | null                                 | Post demo de user 13                                                                                                                                                            | []        | 1           | 0              | 35            | 2025-08-08 06:20:33.691583+00 | user 13   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 13  | null       | null            |
| 343a4e2e-465c-422f-9865-09ae42c2e44d | 92ad925a-5b38-47be-8e68-8ea67079edad | null                                 | Post demo de user 18                                                                                                                                                            | []        | 0           | 0              | 39            | 2025-08-08 06:20:33.691583+00 | user 18   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 18  | null       | null            |
| a203b6e1-1a48-4bd0-b01e-09dec0660fe6 | f1a55fa2-3f27-47a4-b402-3d1728442ed8 | null                                 | Post demo de user 91                                                                                                                                                            | []        | 2           | 0              | 37            | 2025-08-08 06:20:33.691583+00 | user 91   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 91  | null       | null            |
| bda51edc-4183-492d-b0fd-4f255217c8cf | 4b5e1731-376f-4414-9653-e37782adcdbe | null                                 | Post demo de user 26                                                                                                                                                            | []        | 1           | 0              | 47            | 2025-08-08 06:20:33.691583+00 | user 26   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 26  | null       | null            |
| 5c8bd9e9-d996-4f3c-a6cf-cb8474565029 | f0532d69-71bc-46a2-80dd-c7096295a3e3 | null                                 | Post demo de user  2                                                                                                                                                            | []        | 0           | 0              | 44            | 2025-08-08 06:20:33.691583+00 | user  2   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  2  | null       | null            |
| 17ca55ae-e48e-4cf6-9e3c-416754d4384c | 00a09d72-a43b-4ae6-972d-47021569bd48 | null                                 | Post demo de user 88                                                                                                                                                            | []        | 1           | 0              | 31            | 2025-08-08 06:20:33.691583+00 | user 88   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 88  | null       | null            |
| 5d5d083d-01d6-4242-a316-31cb864bde7d | 4993f354-fb56-4036-b6f6-36a373a6057a | 4993f354-fb56-4036-b6f6-36a373a6057a | Post demo de admin                                                                                                                                                              | []        | 1           | 0              | 49            | 2025-08-08 06:20:33.691583+00 | Admin     | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | admin    | null       | Nueva comunidad |
| 61e2b224-8651-461f-b4e8-3691cbe71714 | 52de8e1e-17dc-4636-8f28-494a2aed3df9 | null                                 | Post demo de user 53                                                                                                                                                            | []        | 1           | 0              | 49            | 2025-08-08 06:20:33.691583+00 | user 53   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 53  | null       | null            |
| 2e01fbe3-e0d5-4ca5-934b-b00135e62aa6 | ce732357-10d3-4475-8a96-9fee171ef0e1 | null                                 | Post demo de user 84                                                                                                                                                            | []        | 1           | 0              | 45            | 2025-08-08 06:20:33.691583+00 | user 84   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 84  | null       | null            |
| fff00939-d049-4690-b66f-8bd80a4920a1 | 39d79569-36f5-4fe2-ab10-517b1594703e | null                                 | Post demo de user 48                                                                                                                                                            | []        | 0           | 0              | 41            | 2025-08-08 06:20:33.691583+00 | user 48   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 48  | null       | null            |
| 65cce0ef-98f4-4713-9e46-83b999813e46 | f2fd9861-d0ec-483c-801c-96aa807da361 | null                                 | Post demo de user  7                                                                                                                                                            | []        | 1           | 0              | 25            | 2025-08-08 06:20:33.691583+00 | user  7   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  7  | null       | null            |
| 651040f6-2250-44d0-8ad4-e0543a980730 | 91c8a9d1-98ef-405a-8835-577bb60797bb | null                                 | Post demo de user 96                                                                                                                                                            | []        | 1           | 0              | 39            | 2025-08-08 06:20:33.691583+00 | user 96   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 96  | null       | null            |
| 665b7f14-1f75-41ae-9212-39ef8e1bbe0b | 43f30a87-30a6-48ce-a5c0-63f6cbe0738b | null                                 | Post demo de user  5                                                                                                                                                            | []        | 1           | 0              | 39            | 2025-08-08 06:20:33.691583+00 | user  5   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  5  | null       | null            |
| a3da5632-ba15-48f8-b074-7837ae8aa746 | 9f5128d5-3450-4ba7-bbcc-cb91c18c1095 | null                                 | Post demo de user 89                                                                                                                                                            | []        | 1           | 0              | 49            | 2025-08-08 06:20:33.691583+00 | user 89   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 89  | null       | null            |
| 19442a4b-92ae-4678-9d30-a007dde255bf | 33d414cb-476d-45cf-9893-178598be49ff | null                                 | Post demo de user 12                                                                                                                                                            | []        | 1           | 1              | 44            | 2025-08-08 06:20:33.691583+00 | user 12   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 12  | null       | null            |
| 45dd038b-0d64-4f75-8e98-ca9fe2afe28e | a697c7fc-7ac6-4cf6-8bd0-176d2f45f6e2 | null                                 | Post demo de user 59                                                                                                                                                            | []        | 1           | 0              | 52            | 2025-08-08 06:20:33.691583+00 | user 59   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 59  | null       | null            |
| 5443c409-89d0-4e57-beb4-be9c088f4663 | b1aaabb6-3e9e-4c7b-bac6-a49ff5d8936d | null                                 | Post demo de user 43                                                                                                                                                            | []        | 2           | 0              | 42            | 2025-08-08 06:20:33.691583+00 | user 43   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 43  | null       | null            |
| 69951283-ba7b-43df-a0f7-acdb9f0bdc42 | d4e60ce5-7d43-41ac-9a28-d3090cf0db78 | null                                 | Post demo de user 30                                                                                                                                                            | []        | 0           | 0              | 40            | 2025-08-08 06:20:33.691583+00 | user 30   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 30  | null       | null            |
| db8c7f79-1b86-4bad-a149-93116b8e6273 | 96b2659e-7610-4935-aeb8-c1085a131352 | null                                 | Post demo de user 15                                                                                                                                                            | []        | 0           | 0              | 31            | 2025-08-08 06:20:33.691583+00 | user 15   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 15  | null       | null            |
| f06fa14c-1f00-42da-977b-0e399e8914cf | d99f1b9f-1260-435e-8a6d-43589f96745b | null                                 | Post demo de user 23                                                                                                                                                            | []        | 1           | 0              | 47            | 2025-08-08 06:20:33.691583+00 | user 23   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 23  | null       | null            |
| 21d2e84e-bb9c-43b6-9181-4301d5a68c08 | b494451d-9f7f-4918-9239-c24a0ccad942 | null                                 | Post demo de user100                                                                                                                                                            | []        | 1           | 1              | 44            | 2025-08-08 06:20:33.691583+00 | user100   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user100  | null       | null            |
| 276daec7-931f-417f-803f-2bd42d8a95d1 | d4fb92dd-2049-4ac9-b323-63ba02c2cfa8 | null                                 | Post demo de user 95                                                                                                                                                            | []        | 1           | 0              | 44            | 2025-08-08 06:20:33.691583+00 | user 95   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 95  | null       | null            |
| 6d6cf5ec-a758-4d70-a2d7-d1718c7d177d | c4b89bae-e39d-465c-a560-40d6d3ebe36e | null                                 | Post demo de user 83                                                                                                                                                            | []        | 0           | 0              | 38            | 2025-08-08 06:20:33.691583+00 | user 83   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 83  | null       | null            |
| 2c5c1632-38be-4c76-a550-356f7d1ed5cc | 02de0208-6d2a-45c6-a381-5dbf2adf6a55 | null                                 | Post demo de user 32                                                                                                                                                            | []        | 1           | 0              | 40            | 2025-08-08 06:20:33.691583+00 | user 32   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 32  | null       | null            |
| 6dd9f945-2f7e-404d-bdad-7e0877d2a409 | 87d0280f-726f-4bee-b73e-b410c1f56090 | null                                 | Post demo de user 78                                                                                                                                                            | []        | 0           | 0              | 35            | 2025-08-08 06:20:33.691583+00 | user 78   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 78  | null       | null            |
| 6f32dbc8-da15-46e6-afd5-737f3f699c36 | fa97c16d-26d2-4abb-88fc-f006dffaf7fb | null                                 | Post demo de user 17                                                                                                                                                            | []        | 0           | 0              | 36            | 2025-08-08 06:20:33.691583+00 | user 17   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 17  | null       | null            |
| 70ce0dd9-9779-4665-a391-98d1bb7655ce | 64118d6d-d35f-46c7-8915-482d109e012a | null                                 | Post demo de user 58                                                                                                                                                            | []        | 0           | 0              | 38            | 2025-08-08 06:20:33.691583+00 | user 58   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 58  | null       | null            |
| 1c5731f7-5fb6-4877-a4b3-830bc01465dd | 54b0e944-2937-4a64-a321-6be9950c8a82 | null                                 | Post demo de user  4                                                                                                                                                            | []        | 0           | 1              | 39            | 2025-08-08 06:20:33.691583+00 | user  4   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  4  | null       | null            |
| 3d715c45-5439-4aa8-8e38-71980498247f | b789dc94-23a9-44ae-ba9e-6eb686276c40 | null                                 | Post demo de user 22                                                                                                                                                            | []        | 1           | 0              | 31            | 2025-08-08 06:20:33.691583+00 | user 22   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 22  | null       | null            |
| 726af4e6-03d2-4136-8abd-9a0eba0c463c | 837f4b44-54fc-44b2-8d1e-ce7e570c34e6 | null                                 | Post demo de user 19                                                                                                                                                            | []        | 2           | 0              | 37            | 2025-08-08 06:20:33.691583+00 | user 19   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 19  | null       | null            |
| 04c7bf62-69f1-419d-95dc-306c791300d2 | a5a0d041-13d6-4666-8be7-be5b1b9606d5 | null                                 | Post demo de user 14                                                                                                                                                            | []        | 1           | 0              | 42            | 2025-08-08 06:20:33.691583+00 | user 14   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 14  | null       | null            |
| 063a8265-8596-4e6a-bc95-9bb5a9596401 | 4ccc839f-d5e8-44b5-a5dd-7c2da0f25dc1 | null                                 | Post demo de user 33                                                                                                                                                            | []        | 1           | 0              | 30            | 2025-08-08 06:20:33.691583+00 | user 33   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 33  | null       | null            |
| 1abe7da5-95ba-46ee-9335-026481d189ad | 94a06e04-b6d6-4414-a6d7-4b87a756f9f9 | null                                 | Post demo de user  1                                                                                                                                                            | []        | 0           | 1              | 32            | 2025-08-08 06:20:33.691583+00 | user  1   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  1  | null       | null            |
| 08fd1822-149f-44b5-b10d-545d14f7d385 | 6084eaa9-08f2-48fa-93f9-77557a864466 | null                                 | Post demo de user 69                                                                                                                                                            | []        | 1           | 0              | 43            | 2025-08-08 06:20:33.691583+00 | user 69   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 69  | null       | null            |
| 11ecdea4-96f5-48c7-8227-efc49c08d400 | b83c640d-4ab4-4217-afe9-b10b242f784a | null                                 | Post demo de user 73                                                                                                                                                            | []        | 1           | 0              | 37            | 2025-08-08 06:20:33.691583+00 | user 73   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 73  | null       | null            |
| 728b0d2e-ce80-4d59-873d-5289ebc9232d | f1498268-3974-4373-ad2d-48c49f3c5eca | null                                 | Post demo de user 99                                                                                                                                                            | []        | 0           | 0              | 46            | 2025-08-08 06:20:33.691583+00 | user 99   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 99  | null       | null            |
| 2a1158f0-9d91-4da8-84a5-1a83b39ea51e | 19d12d9d-bbbb-4443-bdcc-3aa0c924f70e | null                                 | Post demo de user 61                                                                                                                                                            | []        | 0           | 1              | 44            | 2025-08-08 06:20:33.691583+00 | user 61   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 61  | null       | null            |
| 36af2e05-ec04-4027-845e-97a992a06078 | 919e81a1-60d9-41a5-9541-7a47d23246c1 | null                                 | Post demo de user 72                                                                                                                                                            | []        | 2           | 0              | 29            | 2025-08-08 06:20:33.691583+00 | user 72   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 72  | null       | null            |
| c3134915-b62c-4c2f-a2d4-75fff7827a4c | b67a4534-ae5c-4ad7-adf5-e9c03a89bfab | null                                 | Post demo de user 66                                                                                                                                                            | []        | 1           | 1              | 39            | 2025-08-08 06:20:33.691583+00 | user 66   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 66  | null       | null            |
| 160d594a-5d48-4102-bee4-f65e6ad68365 | 089a267f-a842-4067-b95a-f65f1e7d9c35 | null                                 | Post demo de user 92                                                                                                                                                            | []        | 1           | 0              | 43            | 2025-08-08 06:20:33.691583+00 | user 92   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 92  | null       | null            |
| 5db66944-cacd-4238-b094-633250aa5580 | 71e7f5fe-eb8f-4fe5-86f8-d2f33ddfd465 | null                                 | Post demo de user 16                                                                                                                                                            | []        | 1           | 0              | 40            | 2025-08-08 06:20:33.691583+00 | user 16   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 16  | null       | null            |
| fcfee199-0e16-4b20-b2d4-16d38c885001 | b89d6919-9560-4e91-8e6e-e1f1b609e4a4 | null                                 | Post demo de user 67                                                                                                                                                            | []        | 0           | 0              | 30            | 2025-08-08 06:20:33.691583+00 | user 67   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 67  | null       | null            |
| a9862b7a-3bdb-4998-92c4-edaf28ab3813 | 9e28815c-35f7-4e35-9262-8447acf09ae4 | null                                 | Post demo de user 90                                                                                                                                                            | []        | 1           | 1              | 45            | 2025-08-08 06:20:33.691583+00 | user 90   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 90  | null       | null            |
| 7460020b-3ec3-454a-bbcc-f23a13179b90 | fa920bd9-c3f8-429f-9976-d6d25691fcf6 | null                                 | Post demo de user 85                                                                                                                                                            | []        | 2           | 0              | 45            | 2025-08-08 06:20:33.691583+00 | user 85   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 85  | null       | null            |
| f47ba3c0-e63a-4a1e-b610-378bc9ed1891 | d3051ca8-c864-4f38-9bc1-9a1b81d31a32 | null                                 | Post demo de user 21                                                                                                                                                            | []        | 0           | 0              | 32            | 2025-08-08 06:20:33.691583+00 | user 21   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 21  | null       | null            |
| 2bcc019b-9646-4cf9-a933-43d80980ba1f | f10dc0e6-7cab-45fa-8811-d504cac87683 | null                                 | Post demo de user 52                                                                                                                                                            | []        | 1           | 1              | 46            | 2025-08-08 06:20:33.691583+00 | user 52   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 52  | null       | null            |
| 77cfaba6-4fa3-4fa8-bc02-9eb13cedad2a | c36e7fb5-91b5-446e-8e5b-a2a37a637da8 | null                                 | Post demo de user  9                                                                                                                                                            | []        | 1           | 0              | 41            | 2025-08-08 06:20:33.691583+00 | user  9   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  9  | null       | null            |
| af27a2cf-4811-4db6-bcf5-b94e5973de49 | 279548cd-c8a0-4561-a563-d3a71ab93f38 | null                                 | Post demo de user 60                                                                                                                                                            | []        | 1           | 1              | 41            | 2025-08-08 06:20:33.691583+00 | user 60   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 60  | null       | null            |
| c90fb6be-296c-4071-b193-cb668be3c6ad | 2cdc4d7a-4ba7-4d47-b725-10028cb708f4 | null                                 | Post demo de user 40                                                                                                                                                            | []        | 0           | 0              | 49            | 2025-08-08 06:20:33.691583+00 | user 40   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 40  | null       | null            |
| 7d79a778-5809-411f-83f6-94b5e4b19384 | dd86887a-e77e-4078-879a-54f6d8dd941b | null                                 | Post demo de user 39                                                                                                                                                            | []        | 0           | 0              | 39            | 2025-08-08 06:20:33.691583+00 | user 39   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 39  | null       | null            |
| 7e3994b1-f12d-469e-b5d8-20c3be9a2f86 | 3125aa61-d3d4-4002-a987-958f780a325b | null                                 | Post demo de user  3                                                                                                                                                            | []        | 0           | 0              | 40            | 2025-08-08 06:20:33.691583+00 | user  3   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user  3  | null       | null            |
| b084584c-2c5f-4718-a43c-15bba66474b4 | b310725e-d2d2-4b61-a836-7eb214883334 | null                                 | Post demo de user 42                                                                                                                                                            | []        | 0           | 1              | 34            | 2025-08-08 06:20:33.691583+00 | user 42   | null                            | null                     | null    | null      | 0     | 0        | 0      | false     | null      | null      | false     | 2025-09-09 00:12:15.997179+00 | user 42  | null       | null            |




-- Comunidades con estadísticas de engagement
| id                                   | nombre                         | descripcion                                                                    | tipo   | icono_url                                                         | created_at                    | created_by | member_count | name | image_url | members_count | posts_count | avg_likes_per_post     |
| ------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------- | ----------------------------- | ---------- | ------------ | ---- | --------- | ------------- | ----------- | ---------------------- |
| 0683be87-5499-4ea7-b04b-523714c6af38 | Inversiones para principiantes | Comunidad para aprender sobre inversiones básicas                              | public | https://via.placeholder.com/100x100/2673f3/ffffff?text=Inv        | 2025-08-18 05:09:18.944872+00 | null       | 0            | null | null      | 0             | 0           | null                   |
| 4993f354-fb56-4036-b6f6-36a373a6057a | Nueva comunidad                | demo                                                                           | public | null                                                              | 2025-08-08 06:11:35.148631+00 | null       | 0            | null | null      | 0             | 1           | 1.00000000000000000000 |
| 4da4e3e3-11c9-490d-a2c8-65f45e52ca3a | Criptomonedas Nicaragua        | Discusión sobre Bitcoin y criptomonedas                                        | public | https://via.placeholder.com/100x100/f39c12/ffffff?text=Crypto     | 2025-08-18 05:09:18.944872+00 | null       | 0            | null | null      | 0             | 0           | null                   |
| 4fcbed7d-fa27-4f0a-aa7f-80d779282ccd | Economía Global                | Noticias macro y geopolítica                                                   | public | null                                                              | 2025-08-08 06:14:58.049299+00 | null       | 0            | null | null      | 0             | 0           | null                   |
| a26a76f3-0c8f-417e-b3ea-b8e116642126 | Finanzas Personales            | Tips para manejar finanzas personales                                          | public | https://via.placeholder.com/100x100/27ae60/ffffff?text=Fin        | 2025-08-18 05:09:18.944872+00 | null       | 0            | null | null      | 0             | 0           | null                   |
| c4b807db-bb51-4ff3-8ef8-94d093563d37 | Futuros                        | Trading en futuros                                                             | public | null                                                              | 2025-08-08 06:14:58.049299+00 | null       | 0            | null | null      | 0             | 0           | null                   |
| e31e6bf1-00b2-4221-a58a-f615f351f435 | Inversiones para principiantes | Comunidad para aprender sobre inversiones básicas y estrategias de mercado     | public | https://via.placeholder.com/100x60/2673f3/ffffff?text=Inversiones | 2025-08-18 04:18:47.966554+00 | null       | 0            | null | null      | 0             | 0           | null                   |
| ed0e8636-8bc5-4789-a1c2-6cb93cd9bb8b | IA y Finanzas                  | Aplicaciones de IA                                                             | public | null                                                              | 2025-08-08 06:14:58.049299+00 | null       | 0            | null | null      | 0             | 1           | 1.00000000000000000000 |
| ef9df0b1-9513-451e-a5c7-02710b6e9790 | Finanzas Personales            | Tips y estrategias para manejar tus finanzas personales y presupuesto familiar | public | https://via.placeholder.com/100x60/27ae60/ffffff?text=Finanzas    | 2025-08-18 04:18:47.966554+00 | null       | 0            | null | null      | 0             | 0           | null                   |
| f6f91a89-6240-4f53-8e15-fac747ab4649 | Finanzas Personales            | Ahorro y presupuestos                                                          | public | null                                                              | 2025-08-08 06:14:58.049299+00 | null       | 0            | null | null      | 0             | 0           | null                   |
| f9aac7d5-3050-4dd7-ad8e-19044ca9d9df | Fondos Indexados               | Comunidad Boglehead                                                            | public | null                                                              | 2025-08-08 06:14:58.049299+00 | null       | 0            | null | null      | 0             | 0           | null                   |



-- Verificar que no hay registros huérfanos en las relaciones principales
| issue | count || -------------------- | ----- || posts sin usuario | 2 || comentarios sin post | 0 || likes sin post | 0 |





-- Verificar que los contadores automáticos están sincronizados
| id                                   | stored_likes | actual_likes | stored_comments | actual_comments |
| ------------------------------------ | ------------ | ------------ | --------------- | --------------- |
| 00881e9b-5398-465f-ac02-7ce873c17966 | 100          | 0            | 15              | 0               |
| 042df4e9-16c3-4a5a-bd8c-22f64db5d8e2 | 1            | 1            | 20              | 0               |
| 049b3759-2381-463c-b96c-5b9badca0f3b | 0            | 0            | 18              | 0               |
| 04c7bf62-69f1-419d-95dc-306c791300d2 | 1            | 1            | 42              | 0               |
| 057af3ba-1253-49a0-bcac-ffe98a261609 | 0            | 0            | 44              | 0               |
| 063a8265-8596-4e6a-bc95-9bb5a9596401 | 1            | 1            | 30              | 0               |
| 07baf750-2d5f-4ce1-a080-e24720b837a2 | 0            | 0            | 40              | 0               |
| 08bbf724-186f-4fdf-b522-06596189974b | 1            | 1            | 35              | 0               |
| 08fd1822-149f-44b5-b10d-545d14f7d385 | 1            | 1            | 43              | 0               |
| 0bb129c6-a71e-4a6b-ae2a-237fe2235eaf | 0            | 0            | 35              | 0               |



-- 3. VERIFICAR STORAGE BUCKETS
| id               | name             | public | created_at                    |
| ---------------- | ---------------- | ------ | ----------------------------- |
| community-media  | community-media  | true   | 2025-09-08 21:27:55.429343+00 |
| Images_Intereses | Images_Intereses | false  | 2025-09-19 15:12:19.563953+00 |





-- Probar función de estadísticas de comunidad (si hay comunidades)
| stats                                                                                           |
| ----------------------------------------------------------------------------------------------- |
| {"total_members":0,"active_members":0,"total_posts":1,"posts_this_week":0,"engagement_rate":50} |




-- Verificar que los índices se están usando
| schemaname | tablename | attname        | n_distinct  | correlation |
| ---------- | --------- | -------------- | ----------- | ----------- |
| public     | posts     | comment_count  | -0.19802    | 0.0104513   |
| public     | posts     | community_id   | -0.00990099 | 1           |
| public     | posts     | contenido      | -0.5        | -0.017629   |
| public     | posts     | created_at     | 2           | 0.491843    |
| public     | posts     | dislikes_count | 2           | 0.803263    |
| public     | posts     | id             | -1          | 0.95062     |
| public     | posts     | likes_count    | 3           | 0.484057    |
| public     | posts     | media_url      | 1           | 1           |
| public     | posts     | user_id        | -0.5        | -0.0797968  |
| public     | users     | avatar_url     | 0           | null        |
| public     | users     | bio            | 0           | null        |
| public     | users     | email          | 0           | null        |
| public     | users     | fecha_registro | 2           | 1           |
| public     | users     | full_name      | -1          | 0.829843    |
| public     | users     | id             | -1          | -0.0447758  |
| public     | users     | intereses      | 2           | 0.941176    |
| public     | users     | metas          | 1           | 1           |
| public     | users     | nivel_finanzas | 1           | 1           |
| public     | users     | nombre         | -1          | 0.829843    |
| public     | users     | pais           | 1           | 1           |
| public     | users     | photo_url      | 0           | null        |
| public     | users     | preferences    | 1           | 1           |
| public     | users     | reputacion     | 1           | 1           |
| public     | users     | role           | 1           | 1           |
| public     | users     | stats          | 1           | 1           |
| public     | users     | username       | -1          | 0.829843    |




-- 1. VERIFICAR SISTEMA DE NOTIFICACIONES  
| total_notifications | unread_notifications | like_notifications | comment_notifications |
| ------------------- | -------------------- | ------------------ | --------------------- |
| 1                   | 1                    | 0                  | 0                     |

  
-- 2. VERIFICAR SISTEMA DE MENSAJES DIRECTOS  
| total_chats | unique_users_in_chats | avg_messages_per_chat |
| ----------- | --------------------- | --------------------- |
| 0           | 0                     | null                  |

  
-- 3. VERIFICAR DATOS FINANCIEROS  
| table_name  | records | featured_stocks |
| ----------- | ------- | --------------- |
| market_data | 5       | 2               |
| promotions  | 2       | 2               |

  
-- 4. VERIFICAR POSTS GUARDADOS  
| total_saved_posts | users_with_saved_posts |
| ----------------- | ---------------------- |
| 0                 | 0                      |

  
-- 5. VERIFICAR SISTEMA EDUCATIVO  
Success. No rows returned






-- Buscar funciones que podrían ser endpoints faltantes  
Success. No rows returned





-- =====================================================  
-- REPARAR PROBLEMAS DETECTADOS  
-- =====================================================  
  
-- 1. Limpiar posts huérfanos  
Success. No rows returned
  
  
-- 2. Recalcular contadores de comentarios  
Success. No rows returned

  
-- 3. Verificar qué tabla de comentarios se está usando  
| table_name    | count |
| ------------- | ----- |
| post_comments | 0     |
| comments      | 6011  |




- Migrar comentarios a la tabla correcta  
INSERT INTO post_comments (post_id, user_id, contenido, created_at)  
SELECT post_id, user_id, contenido, created_at   
FROM comments   
WHERE post_id IS NOT NULL;  
  
-- Recalcular contadores  
UPDATE posts SET comment_count = (  
    SELECT COUNT(*) FROM post_comments WHERE post_id = posts.id  
);




| tabla       | registros |
| ----------- | --------- |
| courses     | 0         |
| lessons     | 0         |
| market_data | 5         |
| promotions  | 2         |
| chats       | 0         |
| post_saves  | 0         |




ENDPOINTS CREADOS: -- Tablas para sistema financiero  
CREATE TABLE user_budgets (  
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),  
  user_id uuid REFERENCES users(id),  
  category text NOT NULL,  
  amount decimal(10,2),  
  period text DEFAULT 'monthly',  
  created_at timestamptz DEFAULT now()  
);  
 
CREATE TABLE user_transactions (  
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),  
  user_id uuid REFERENCES users(id),  
  amount decimal(10,2),  
  type text CHECK (type IN ('income', 'expense')),  
  category text,  
  description text,  
  created_at timestamptz DEFAULT now()  
);  
 
CREATE TABLE investment_portfolios (  
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),  
  user_id uuid REFERENCES users(id),  
  symbol text,  
  quantity decimal(10,4),  
  purchase_price decimal(10,2),  
  current_value decimal(10,2),  
  created_at timestamptz DEFAULT now()  
);  
 
-- Tablas para sistema educativo  
CREATE TABLE learning_paths (  
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),  
  title text NOT NULL,  
  description text,  
  difficulty_level text,  
  estimated_duration integer,  
  created_at timestamptz DEFAULT now()  
);  
 
CREATE TABLE video_content (  
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),  
  title text NOT NULL,  
  description text,  
  video_url text,  
  duration integer,  
  course_id uuid REFERENCES courses(id),  
  created_at timestamptz DEFAULT now()  
);



Datos poblados:
INSERT INTO courses (titulo, descripcion, nivel, imagen_url) VALUES  
('Introducción a las Inversiones', 'Aprende los conceptos básicos de inversión', 'basic', 'https://example.com/course1.jpg'),  
('Análisis Técnico Avanzado', 'Domina el análisis técnico de mercados', 'advanced', 'https://example.com/course2.jpg'),  
('Gestión de Portafolios', 'Estrategias para diversificar tu portafolio', 'intermediate', 'https://example.com/course3.jpg');


-- Datos para learning_paths  
INSERT INTO learning_paths (title, description, difficulty_level, estimated_duration) VALUES  
('Ruta del Inversionista Principiante', 'Camino completo para nuevos inversionistas', 'beginner', 30),  
('Ruta del Trader Profesional', 'Formación avanzada en trading', 'advanced', 60),  
('Ruta de Análisis Fundamental', 'Especialización en análisis de empresas', 'intermediate', 45);


INSERT INTO market_data (symbol, company_name, current_price, price_change, price_change_percent, color, is_featured)  
VALUES ('AAPL', 'Apple Inc.', 175.50, 2.30, 1.33, '#111', true)  
ON CONFLICT (symbol) DO UPDATE SET  
  current_price = EXCLUDED.current_price,  
  price_change = EXCLUDED.price_change,  
  price_change_percent = EXCLUDED.price_change_percent;

