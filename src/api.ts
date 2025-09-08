import { supabase } from "./supabase"  
  
// ===== AUTH FUNCTIONS =====  
export const signUp = async (email: string, password: string, userData?: any) => {  
  return signUpWithMetadata(email, password, userData)
}

export const signUpWithMetadata = async (email: string, password: string, userData?: any) => {  
  const { data, error } = await supabase.auth.signUp({  
    email,  
    password,  
    options: {
      data: {
        full_name: userData?.nombre || userData?.full_name || 'Usuario',
        username: userData?.username || `user_${Date.now()}`,
        avatar_url: userData?.avatar_url || userData?.photo_url,
      },
      emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'https://investi.app'}/auth/callback`,
    },
  })  
  
  if (error) throw error  
  
  if (data.user) {  
    const userPayload = {
      id: data.user.id,  
      email: data.user.email,
      nombre: userData?.nombre || userData?.full_name || 'Usuario',
      username: userData?.username || `user_${Date.now()}`,
      photo_url: userData?.photo_url || userData?.avatar_url,
      full_name: userData?.full_name || userData?.nombre || 'Usuario',
      avatar_url: userData?.avatar_url || userData?.photo_url,
      bio: userData?.bio || '',
      pais: userData?.pais || '',
      role: userData?.role || 'usuario',
      fecha_registro: new Date().toISOString()
    };

    const { error: profileError } = await supabase
      .from("users")
      .upsert(userPayload, { onConflict: 'id' });
  
    if (profileError) {
      console.error('Error creating user profile:', profileError);
      throw profileError;
    }

    // Note: investor_profiles table creation removed as it doesn't exist in current schema
  }  
  
  return data;  
}  
  
export const signIn = async (email: string, password: string) => {  
  const { data, error } = await supabase.auth.signInWithPassword({  
    email,  
    password,  
  })  
  
  if (error) throw error  
  return data  
}  
  
// ===== USER FUNCTIONS =====  
export const getUser = async (uid: string) => {  
  const { data, error } = await supabase.from("users").select("*").eq("id", uid).single()  
  if (error) throw error  
  return data  
}  
  
export const updateUser = async (uid: string, updates: any) => {  
  const { data, error } = await supabase.from("users").update(updates).eq("id", uid)  
  if (error) throw error  
  return data  
}  
  
export const getCurrentUserId = async () => {  
  const { data: { user } } = await supabase.auth.getUser()  
  return user?.id || null  
}  
  
export const getCurrentUser = async () => {  
  const { data: { user } } = await supabase.auth.getUser()  
  if (!user) return null  
  
  try {
    return await getUser(user.id)  
  } catch (error: any) {
    // If user profile doesn't exist, create it from auth metadata
    if (error.code === 'PGRST116') {
      console.log('User profile not found, creating from auth metadata...')
      const userPayload = {
        id: user.id,
        email: user.email,
        nombre: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuario',
        username: user.user_metadata?.username || `user_${Date.now()}`,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuario',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        photo_url: user.user_metadata?.picture || user.user_metadata?.avatar_url,
        bio: '',
        pais: '',
        role: 'usuario',
        fecha_registro: new Date().toISOString()
      }
      
      const { error: createError } = await supabase
        .from("users")
        .upsert(userPayload, { onConflict: 'id' })
      
      if (createError) {
        console.error('Error creating user profile:', createError)
        throw createError
      }
      
      return userPayload
    }
    throw error
  }
}  
  
// Función faltante que causa el error  
export const getUserComplete = async (uid: string) => {  
  try {  
    const user = await getUser(uid)  
    if (!user) return null  
  
    return {  
      id: user.id,  
      name: user.full_name || user.nombre,  
      email: user.email,  
      bio: user.bio,  
      location: user.pais,  
      avatarUrl: user.avatar_url || user.photo_url,  
      registrationDate: user.fecha_registro,  
      preferences: user.preferences || { language: "es", notifications: true, theme: "system" },  
      stats: user.stats || { postsCount: 0, followersCount: 0, followingCount: 0 },  
      onboarding: {  
        interests: user.intereses || [],  
        goals: user.metas || [],  
        knowledgeLevel: user.nivel_finanzas,  
        completed: !!(user.metas?.length && user.intereses?.length && user.nivel_finanzas !== 'none')  
      }  
    }  
  } catch (error) {  
    console.error('Error getting complete user:', error)  
    return null  
  }  
}  
  
// ===== FEED FUNCTIONS =====  
export const getUserFeed = async (userId: string, limit = 20) => {  
  try {  
    // Usar get_personalized_feed que ya tienes  
    const { data, error } = await supabase.rpc("get_personalized_feed", {  
      p_user_id: userId,  
      p_limit: limit,  
    })  
    if (error) throw error  
    return data || []  
  } catch (error) {  
    console.log("RPC failed, trying direct query:", error)  
    // Fallback usando nombres de columna correctos  
    const { data, error: fallbackError } = await supabase  
      .from("posts")  
      .select(`  
        *,  
        author:users(id, nombre, full_name, username, photo_url, avatar_url, role)  
      `)  
      .order("created_at", { ascending: false })  
      .limit(limit)  
  
    if (fallbackError) throw fallbackError  
    return (data || []).map((post: any) => ({  
      ...post,  
      user_data: {  
        name: post.author?.full_name || post.author?.nombre || 'Usuario',  
        avatar: post.author?.avatar_url || post.author?.photo_url,  
        role: post.author?.role || 'Usuario'  
      }  
    }))  
  }  
}  
  
// ===== COMMUNITY FUNCTIONS =====  
export const getCommunityList = async (limit?: number) => {  
  let query = supabase.from("communities").select("*")  
    
  if (limit) {  
    query = query.limit(limit).order("created_at", { ascending: false })  
  }  
    
  const { data, error } = await query  
  if (error) throw error  
  return data || []  
}  
  
export const joinCommunity = async (userId: string, communityId: string) => {  
  const { data, error } = await supabase  
    .from("user_communities")  
    .insert([{ user_id: userId, community_id: communityId }])  
  
  if (error) throw error  
  return data  
}  
  
// ===== POST FUNCTIONS =====  
export const createPost = async (postData: {  
  user_id: string  
  community_id?: string  
  contenido: string  
  media_url?: string[]  
}) => {  
  const { data, error } = await supabase.from("posts").insert([postData]).select()  
  if (error) throw error  
  return data?.[0]  
}  
  
export const getPostDetail = async (postId: string) => {  
  const { data, error } = await supabase  
    .from("posts")  
    .select(`  
      *,  
      author:users(id, nombre, full_name, username, photo_url, avatar_url, role),  
      comments(*)  
    `)  
    .eq("id", postId)  
    .single()  
  
  if (error) throw error  
  return data  
}  
  
export const likePost = async (postId: string, userId: string, isLike = true) => {  
  const { data, error } = await supabase  
    .from("post_likes")  
    .upsert([{ post_id: postId, user_id: userId, is_like: isLike }])  
  
  if (error) throw error  
  return data  
}  
  
export const commentPost = async (postId: string, userId: string, contenido: string, parentId?: string) => {  
  const { data, error } = await supabase  
    .from("comments")  
    .insert([{ post_id: postId, user_id: userId, contenido, parent_id: parentId }])  
  
  if (error) throw error  
  return data  
}  
  
// ===== SEARCH FUNCTIONS =====  
export const globalSearch = async (query: string, userId: string) => {  
  const { data, error } = await supabase.rpc("search_all", {  
    search_term: query,  
    current_user_id: userId  
  })  
  
  if (error) throw error  
  return data || []  
}  
  
// ===== NEWS FUNCTIONS =====  
export const getNewsList = async (category?: string) => {  
  let query = supabase  
    .from("news")  
    .select(`  
      *,  
      author:users(id, nombre, full_name, username, photo_url, avatar_url)  
    `)  
    .order("published_at", { ascending: false })  
  
  if (category) {  
    query = query.eq("category", category)  
  }  
  
  const { data, error } = await query  
  if (error) throw error  
  return data || []  
}  
  
export const getNewsDetail = async (newsId: string) => {  
  const { data, error } = await supabase  
    .from("news")  
    .select(`  
      *,  
      author:users(id, nombre, full_name, username, photo_url, avatar_url)  
    `)  
    .eq("id", newsId)  
    .single()  
  
  if (error) throw error  
  return data  
}  
  
// ===== STORAGE FUNCTIONS =====  
export const uploadAvatar = async (userId: string, file: any) => {  
  const fileExt = file.uri.split(".").pop()  
  const fileName = `${userId}/avatar.${fileExt}`  
  
  const { data, error } = await supabase.storage  
    .from("avatars")  
    .upload(fileName, file, { upsert: true })  
  
  if (error) throw error  
  
  const { data: { publicUrl } } = supabase.storage  
    .from("avatars")  
    .getPublicUrl(fileName)  
  
  return { url: publicUrl, path: fileName }  
}  
  
export const uploadPostMedia = async (userId: string, file: any) => {  
  const fileExt = file.uri.split(".").pop()  
  const fileName = `${userId}/${Date.now()}.${fileExt}`  
  
  const { data, error } = await supabase.storage  
    .from("post-media")  
    .upload(fileName, file)  
  
  if (error) throw error  
  
  const { data: { publicUrl } } = supabase.storage  
    .from("post-media")  
    .getPublicUrl(fileName)  
  
  return { url: publicUrl, path: fileName }  
}  
  
// ===== BLOCK USER =====  
export const blockUser = async (userId: string, blockedUserId: string) => {  
  const { data, error } = await supabase  
    .from("user_blocks")  
    .insert([{ user_id: userId, blocked_user_id: blockedUserId }])  
  
  if (error) throw error  
  return data  
}  
  
// ===== NOTIFICATIONS =====  
export const getNotifications = async (userId: string) => {  
  const { data, error } = await supabase  
    .from("notifications")  
    .select("*")  
    .eq("user_id", userId)  
    .order("created_at", { ascending: false })  
  
  if (error) throw error  
  return data || []  
}  
  
export const markNotificationAsRead = async (notificationId: string) => {  
  const { data, error } = await supabase  
    .from("notifications")  
    .update({ read: true, read_at: new Date().toISOString() })  
    .eq("id", notificationId)  
  
  if (error) throw error  
  return data  
}  
  
// ===== FAQ FUNCTIONS =====  
export const getFAQs = async () => {  
  const { data, error } = await supabase  
    .from("faqs")  
    .select("*")  
    .order("created_at", { ascending: true })  
  
  if (error) throw error  
  return data || []  
}  
  
// ===== GLOSSARY FUNCTIONS =====  
export const getGlossaryTerms = async () => {  
  const { data, error } = await supabase  
    .from("glossary")  
    .select("*")  
    .order("termino", { ascending: true })  
  
  if (error) throw error  
  return data || []  
}  
  
// ===== ONBOARDING FUNCTIONS =====  
export const getOnboardingData = async () => {  
  try {  
    const [interests, goals, knowledgeLevels] = await Promise.all([  
      supabase.from("interests").select("*").order("name", { ascending: true }),  
      supabase.from("goals").select("*").order("name", { ascending: true }),  
      supabase.from("knowledge_levels").select("*").order("level_order", { ascending: true })  
    ])  
  
    return {  
      interests: interests.data || [],  
      goals: goals.data || [],  
      knowledgeLevels: knowledgeLevels.data || []  
    }  
  } catch (error) {  
    console.error('Error loading onboarding data:', error)  
    return { interests: [], goals: [], knowledgeLevels: [] }  
  }  
}  
  
export const completeOnboarding = async (userId: string, onboardingData: {  
  interests: string[]  
  goals: string[]  
  knowledgeLevel: string  
}) => {  
  const { data, error } = await supabase  
    .from("users")  
    .update({  
      intereses: onboardingData.interests,  
      metas: onboardingData.goals,  
      nivel_finanzas: onboardingData.knowledgeLevel  
    })  
    .eq("id", userId)  
  
  if (error) throw error  
  return data  
}  
  
// ===== PROMOTIONS FUNCTIONS =====  
export const getPromotions = async (params?: { page?: number; limit?: number }) => {  
  try {  
    const limit = params?.limit || 10  
    const offset = ((params?.page || 1) - 1) * limit  
      
    const { data, error } = await supabase  
      .from("promotions")  
      .select("*")  
      .eq("active", true)  
      .order("created_at", { ascending: false })  
      .range(offset, offset + limit - 1)  
  
    if (error) throw error  
    return {  
      data: data || [],  
      meta: { hasMore: data?.length === limit }  
    }  
  } catch (error) {  
    console.error('Error loading promotions:', error)  
    return { data: [], meta: { hasMore: false } }  
  }  
}  
  
// ===== COURSES FUNCTIONS =====  
export const getCoursesWithLessons = async () => {  
  try {  
    const { data, error } = await supabase  
      .from("courses")  
      .select(`  
        *,  
        modules:course_modules(  
          *,  
          lessons(*)  
        )  
      `)  
      .order("created_at", { ascending: false })  
  
    if (error) throw error  
    return data || []  
  } catch (error) {  
    console.error('Error loading courses:', error)  
    return []  
  }  
}  
  
export const completeLesson = async (userId: string, lessonId: string) => {  
  const { data, error } = await supabase  
    .from("lesson_progress")  
    .insert([{ user_id: userId, lesson_id: lessonId }])  
  
  if (error) throw error  
  return data  
}  
  
// ===== PORTFOLIO FUNCTIONS =====  
export const getPortfolio = async (userId: string) => {  
  try {  
    const { data, error } = await supabase  
      .from("simulated_portfolios")  
      .select(`  
        *,  
        investments:simulated_investments(*)  
      `)  
      .eq("user_id", userId)  
      .single()  
  
    if (error) throw error  
    return data  
  } catch (error) {  
    console.error('Error loading portfolio:', error)  
    return null  
  }  
}  
  
export const addInvestment = async (investmentData: {  
  portfolio_id: string  
  tipo_activo: string  
  monto: number  
  rendimiento?: number  
  fecha: string  
}) => {  
  const { data, error } = await supabase  
    .from("simulated_investments")  
    .insert([investmentData])  
  
  if (error) throw error  
  return data  
}