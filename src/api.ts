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
  
// Save/unsave post endpoints
export const savePost = async (postId: string, userId: string) => {
  const { data, error } = await supabase
    .from('post_saves')
    .upsert([{ post_id: postId, user_id: userId }])
  
  if (error) throw error
  return data
}

export const unsavePost = async (postId: string, userId: string) => {
  const { data, error } = await supabase
    .from('post_saves')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)
  
  if (error) throw error
  return data
}

export const isPostSaved = async (postId: string, userId: string) => {
  const { data, error } = await supabase
    .from('post_saves')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// =====================================================
// ADDITIONAL PROFILE SCREEN ENDPOINTS
// =====================================================

// Check if current user is following another user
export const isFollowingUser = async (followerId: string, followingId: string) => {
  const { data, error } = await supabase
    .from('user_follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// Get user's followers list
export const getUserFollowers = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('user_follows')
    .select(`
      follower:users!follower_id(
        id,
        nombre,
        full_name,
        username,
        avatar_url,
        photo_url,
        bio,
        is_verified
      )
    `)
    .eq('following_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return (data || []).map((item: any) => ({
    ...item.follower,
    name: item.follower.full_name || item.follower.nombre || item.follower.username,
    avatarUrl: item.follower.avatar_url || item.follower.photo_url
  }))
}

// Get user's following list
export const getUserFollowing = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('user_follows')
    .select(`
      following:users!following_id(
        id,
        nombre,
        full_name,
        username,
        avatar_url,
        photo_url,
        bio,
        is_verified
      )
    `)
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return (data || []).map((item: any) => ({
    ...item.following,
    name: item.following.full_name || item.following.nombre || item.following.username,
    avatarUrl: item.following.avatar_url || item.following.photo_url
  }))
}

// Get user's communities
export const getUserCommunities = async (userId: string, limit = 20) => {
  const { data, error } = await supabase
    .from('user_communities')
    .select(`
      role,
      status,
      joined_at,
      community:communities(
        id,
        nombre,
        name,
        descripcion,
        avatar_url,
        icono_url,
        image_url,
        member_count,
        type,
        category,
        is_verified
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('joined_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return (data || []).map((item: any) => ({
    ...item.community,
    name: item.community.nombre || item.community.name,
    imageUrl: item.community.avatar_url || item.community.icono_url || item.community.image_url,
    memberCount: item.community.member_count || 0,
    userRole: item.role,
    joinedAt: item.joined_at,
    isMember: true
  }))
}

// Block/unblock user
export const blockUser = async (userId: string, blockedUserId: string) => {
  const { data, error } = await supabase
    .from('user_blocks')
    .upsert([{
      user_id: userId,
      blocked_user_id: blockedUserId,
      reason: 'blocked_by_user'
    }])
  
  if (error) throw error
  return data
}

export const unblockUser = async (userId: string, blockedUserId: string) => {
  const { data, error } = await supabase
    .from('user_blocks')
    .delete()
    .eq('user_id', userId)
    .eq('blocked_user_id', blockedUserId)
  
  if (error) throw error
  return data
}

export const isUserBlocked = async (userId: string, blockedUserId: string) => {
  const { data, error } = await supabase
    .from('user_blocks')
    .select('id')
    .eq('user_id', userId)
    .eq('blocked_user_id', blockedUserId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// Report user
export const reportUser = async (reporterId: string, reportedUserId: string, reason: string, description?: string) => {
  const { data, error } = await supabase
    .from('user_reports')
    .insert([{
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      reason,
      description,
      status: 'pending'
    }])
  
  if (error) throw error
  return data
}

// Update user profile
export const updateUserProfile = async (userId: string, profileData: {
  nombre?: string
  full_name?: string
  bio?: string
  location?: string
  avatar_url?: string
  banner_url?: string
  website?: string
  phone?: string
}) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
  
  if (error) throw error
  return data
}

// Search users
export const searchUsers = async (query: string, currentUserId: string, limit = 20) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, nombre, full_name, username, avatar_url, photo_url, bio, is_verified')
    .or(`nombre.ilike.%${query}%,full_name.ilike.%${query}%,username.ilike.%${query}%`)
    .neq('id', currentUserId)
    .limit(limit)
  
  if (error) throw error
  return (data || []).map((user: any) => ({
    ...user,
    name: user.full_name || user.nombre || user.username,
    avatarUrl: user.avatar_url || user.photo_url
  }))
}

// Get mutual connections
export const getMutualConnections = async (userId1: string, userId2: string, limit = 10) => {
  const { data, error } = await supabase.rpc('get_mutual_connections', {
    user_id_1: userId1,
    user_id_2: userId2,
    p_limit: limit
  })
  
  if (error) {
    // Fallback query
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('user_follows')
      .select(`
        following:users!following_id(
          id,
          nombre,
          full_name,
          username,
          avatar_url,
          photo_url
        )
      `)
      .eq('follower_id', userId1)
      .in('following_id', 
        supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', userId2)
      )
      .limit(limit)
    
    if (fallbackError) throw fallbackError
    return (fallbackData || []).map((item: any) => ({
      ...item.following,
      name: item.following.full_name || item.following.nombre || item.following.username,
      avatarUrl: item.following.avatar_url || item.following.photo_url
    }))
  }
  
  return data || []
}

export const startConversationWithUser = async (currentUserId: string, targetUserId: string) => {
  try {
    const pairFilter = `and(participant_one.eq.${currentUserId},participant_two.eq.${targetUserId}),and(participant_one.eq.${targetUserId},participant_two.eq.${currentUserId})`
    const { data: convs, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .or(pairFilter)
      .limit(1)

    if (convError) throw convError

    if (convs && convs.length > 0) {
      return convs[0]
    }

    const { data: newConvArr, error: createError } = await supabase
      .from('conversations')
      .insert([{ type: 'direct', participant_one: currentUserId, participant_two: targetUserId, created_by: currentUserId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()

    if (createError) throw createError
    const newConv = Array.isArray(newConvArr) ? newConvArr[0] : newConvArr

    // Add participants records
    const participants = [
      { conversation_id: newConv.id, user_id: currentUserId, is_active: true, joined_at: new Date().toISOString() },
      { conversation_id: newConv.id, user_id: targetUserId, is_active: true, joined_at: new Date().toISOString() }
    ]

    /*const { error: participantsError } = await supabase.from('conversation_participants').insert(participants);
    if (participantsError) {
      console.warn('Failed to insert conversation_participants after creating conversation', participantsError);
    }*/

    return newConv
  } catch (error) {
    console.error('Error in startConversationWithUser:', error)
    throw error
  }
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

// ===== PROMOTIONS SCREEN ENDPOINTS =====
export const getPromotionsByCategory = async (category: string, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching promotions by category:', error)
    return []
  }
}

export const getPromotionsByLocation = async (location: string, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("location", location)
      .order("created_at", { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching promotions by location:', error)
    return []
  }
}

export const trackPromotionView = async (promotionId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("promotion_views")
      .insert([{ promotion_id: promotionId, user_id: userId, viewed_at: new Date().toISOString() }])
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error tracking promotion view:', error)
    return null
  }
}

export const claimPromotion = async (promotionId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("promotion_claims")
      .insert([{ promotion_id: promotionId, user_id: userId, claimed_at: new Date().toISOString() }])
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error claiming promotion:', error)
    throw error
  }
}

export const getSuggestedPeople = async (userId: string, limit = 10) => {
  try {
    const { data, error } = await supabase.rpc("get_suggested_people", {
      p_user_id: userId,
      p_limit: limit
    })
    
    if (error) throw error
    return data || []
  } catch (error) {
    // Fallback to basic user query
    const { data, error: fallbackError } = await supabase
      .from("users")
      .select("id, nombre, full_name, photo_url, avatar_url, role, intereses")
      .neq("id", userId)
      .limit(limit)
    
    if (fallbackError) throw fallbackError
    return (data || []).map((user: any) => ({
      ...user,
      photo_url: user.photo_url || user.avatar_url || 'https://i.pravatar.cc/100'
    }))
  }
}

export const connectWithUser = async (fromUserId: string, toUserId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_connections")
      .insert([{ 
        from_user_id: fromUserId, 
        to_user_id: toUserId, 
        status: 'pending',
        created_at: new Date().toISOString()
      }])
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error connecting with user:', error)
    throw error
  }
}

export const dismissPersonSuggestion = async (userId: string, dismissedUserId: string) => {
  try {
    const { data, error } = await supabase
      .from("dismissed_suggestions")
      .insert([{ 
        user_id: userId, 
        dismissed_user_id: dismissedUserId,
        dismissed_at: new Date().toISOString()
      }])
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error dismissing person suggestion:', error)
    return null
  }
}

export const getPersonProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        connections:user_connections!from_user_id(count),
        posts:posts(count)
      `)
      .eq("id", userId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching person profile:', error)
    return null
  }
}

export const getCommunityMembers = async (communityId: string, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from("community_members")
      .select(`
        *,
        user:users(id, nombre, full_name, photo_url, avatar_url, role, bio)
      `)
      .eq("community_id", communityId)
      .limit(limit)
    
    if (error) throw error
    return (data || []).map((member: any) => ({
      id: member.user.id,
      name: member.user.full_name || member.user.nombre,
      avatar: member.user.avatar_url || member.user.photo_url,
      role: member.user.role,
      bio: member.user.bio,
      joined_at: member.joined_at
    }))
  } catch (error) {
    console.error('Error fetching community members:', error)
    return []
  }
}

export const inviteToCommunity = async (communityId: string, fromUserId: string, toUserId: string) => {
  try {
    const { data, error } = await supabase
      .from("community_invitations")
      .insert([{
        community_id: communityId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error inviting to community:', error)
    throw error
  }
}

// ===== COMMUNITY DETAIL SCREEN ENDPOINTS =====
export const getCommunityPhotos = async (communityId: string, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from("community_media")
      .select(`
        *,
        user:users(id, nombre, full_name, photo_url, avatar_url)
      `)
      .eq("community_id", communityId)
      .eq("media_type", "image")
      .order("created_at", { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching community photos:', error)
    return []
  }
}

export const getCommunityFiles = async (communityId: string, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from("community_media")
      .select(`
        *,
        user:users(id, nombre, full_name, photo_url, avatar_url)
      `)
      .eq("community_id", communityId)
      .eq("media_type", "file")
      .order("created_at", { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching community files:', error)
    return []
  }
}

export const uploadCommunityPhoto = async (communityId: string, userId: string, photoFile: File) => {
  try {
    // Upload to Supabase Storage
    const fileName = `${communityId}/${Date.now()}_${photoFile.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("community-media")
      .upload(fileName, photoFile)
    
    if (uploadError) throw uploadError
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from("community-media")
      .getPublicUrl(fileName)
    
    // Save to database
    const { data, error } = await supabase
      .from("community_media")
      .insert([{
        community_id: communityId,
        user_id: userId,
        media_type: "image",
        media_url: urlData.publicUrl,
        file_name: photoFile.name,
        file_size: photoFile.size,
        created_at: new Date().toISOString()
      }])
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error uploading community photo:', error)
    throw error
  }
}

export const uploadCommunityFile = async (communityId: string, userId: string, file: File) => {
  try {
    // Upload to Supabase Storage
    const fileName = `${communityId}/files/${Date.now()}_${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("community-media")
      .upload(fileName, file)
    
    if (uploadError) throw uploadError
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from("community-media")
      .getPublicUrl(fileName)
    
    // Save to database
    const { data, error } = await supabase
      .from("community_media")
      .insert([{
        community_id: communityId,
        user_id: userId,
        media_type: "file",
        media_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        created_at: new Date().toISOString()
      }])
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error uploading community file:', error)
    throw error
  }
}

export const searchCommunityMembers = async (communityId: string, query: string) => {
  try {
    const { data, error } = await supabase
      .from("community_members")
      .select(`
        *,
        user:users(id, nombre, full_name, photo_url, avatar_url, role, bio)
      `)
      .eq("community_id", communityId)
      .or(`user.nombre.ilike.%${query}%,user.full_name.ilike.%${query}%,user.role.ilike.%${query}%`)
    
    if (error) throw error
    return (data || []).map((member: any) => ({
      id: member.user.id,
      name: member.user.full_name || member.user.nombre,
      avatar: member.user.avatar_url || member.user.photo_url,
      role: member.user.role,
      bio: member.user.bio
    }))
  } catch (error) {
    console.error('Error searching community members:', error)
    return []
  }
}

export const getCommunityPostsFiltered = async (communityId: string, filter: string, limit = 20) => {
  try {
    let query = supabase
      .from("posts")
      .select(`
        *,
        author:users(id, nombre, full_name, username, photo_url, avatar_url, role)
      `)
      .eq("community_id", communityId)
    
    // Apply time-based filters
    if (filter === "24h") {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      query = query.gte("created_at", yesterday.toISOString())
    } else if (filter === "week") {
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      query = query.gte("created_at", lastWeek.toISOString())
    }
    
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return (data || []).map((post: any) => ({
      ...post,
      author: {
        id: post.author?.id,
        name: post.author?.full_name || post.author?.nombre || 'Usuario',
        avatar: post.author?.avatar_url || post.author?.photo_url,
        role: post.author?.role || 'Usuario'
      }
    }))
  } catch (error) {
    console.error('Error fetching filtered community posts:', error)
    return []
  }
}

export const pinPost = async (postId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .update({ is_pinned: true, pinned_by: userId, pinned_at: new Date().toISOString() })
      .eq("id", postId)
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error pinning post:', error)
    throw error
  }
}

export const deletePost = async (postId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", userId) // Only author can delete
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error deleting post:', error)
    throw error
  }
}

export const editPost = async (postId: string, userId: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .update({ 
        contenido: content, 
        updated_at: new Date().toISOString(),
        is_edited: true
      })
      .eq("id", postId)
      .eq("user_id", userId) // Only author can edit
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error editing post:', error)
    throw error
  }
}

export const createChannel = async (communityId: string, userId: string, channelData: {
  name: string
  description: string
  type: string
}) => {
  try {
    const { data, error } = await supabase
      .from("community_channels")
      .insert([{
        community_id: communityId,
        created_by: userId,
        name: channelData.name,
        description: channelData.description,
        type: channelData.type,
        created_at: new Date().toISOString()
      }])
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating channel:', error)
    throw error
  }
}

export const deleteChannel = async (channelId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("community_channels")
      .delete()
      .eq("id", channelId)
      .eq("created_by", userId) // Only creator can delete
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error deleting channel:', error)
    throw error
  }
}

export const getChannelMessages = async (channelId: string, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from("channel_messages")
      .select(`
        *,
        user:users(id, nombre, full_name, photo_url, avatar_url, role)
      `)
      .eq("channel_id", channelId)
      .order("created_at", { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching channel messages:', error)
    return []
  }
}

export const getCommunityStats = async (communityId: string) => {
  try {
    const { data, error } = await supabase.rpc("get_community_stats", {
      p_community_id: communityId
    })
    
    if (error) throw error
    return data || {
      total_members: 0,
      active_members: 0,
      total_posts: 0,
      posts_this_week: 0,
      engagement_rate: 0
    }
  } catch (error) {
    console.error('Error fetching community stats:', error)
    return {
      total_members: 0,
      active_members: 0,
      total_posts: 0,
      posts_this_week: 0,
      engagement_rate: 0
    }
  }
}

export const getCommunityNotifications = async (userId: string, communityId: string) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("community_id", communityId)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching community notifications:', error)
    return []
  }
}

export const markCommunityNotificationRead = async (notificationId: string) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId)
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return null
  }
}

// ===== ENHANCED CREATE POST ENDPOINTS =====
export const uploadPostMedia = async (userId: string, mediaFile: File, mediaType: 'image' | 'video' | 'document') => {
  try {
    const fileExtension = mediaFile.name.split('.').pop()
    const fileName = `posts/${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("post-media")
      .upload(fileName, mediaFile)
    
    if (uploadError) throw uploadError
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from("post-media")
      .getPublicUrl(fileName)
    
    return {
      url: urlData.publicUrl,
      fileName: mediaFile.name,
      fileSize: mediaFile.size,
      mediaType
    }
  } catch (error) {
    console.error('Error uploading post media:', error)
    throw error
  }
}

export const createEnhancedPost = async (postData: {
  user_id: string
  contenido: string
  community_id?: string
  post_type?: 'text' | 'celebration' | 'poll' | 'partnership' | 'document'
  media_urls?: string[]
  poll_options?: string[]
  poll_duration?: number
  partnership_details?: {
    investment_amount?: string
    business_type?: string
    location?: string
    contact_info?: string
  }
  celebration_type?: 'milestone' | 'achievement' | 'success' | 'other'
  tags?: string[]
}) => {
  try {
    // Build the post object dynamically to avoid inserting null celebration_type for non-celebration posts
    const postObject: any = {
      user_id: postData.user_id,
      contenido: postData.contenido,
      community_id: postData.community_id,
      post_type: postData.post_type || 'text',
      media_urls: postData.media_urls || [],
      tags: postData.tags || [],
      created_at: new Date().toISOString()
    }

    // Only add celebration_type if it's a celebration post
    if (postData.post_type === 'celebration' && postData.celebration_type) {
      postObject.celebration_type = postData.celebration_type
    }

    // Only add poll fields if it's a poll post
    if (postData.post_type === 'poll') {
      postObject.poll_options = postData.poll_options
      postObject.poll_duration = postData.poll_duration
    }

    // Only add partnership details if it's a partnership post
    if (postData.post_type === 'partnership') {
      postObject.partnership_details = postData.partnership_details
    }

    const { data, error } = await supabase
      .from("posts")
      .insert([postObject])
      .select()
    
    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('Error creating enhanced post:', error)
    throw error
  }
}

export const createPoll = async (pollData: {
  user_id: string
  question: string
  options: string[]
  duration_hours: number
  community_id?: string
  allow_multiple_choices?: boolean
}) => {
  try {
    const { data, error } = await supabase
      .from("polls")
      .insert([{
        user_id: pollData.user_id,
        question: pollData.question,
        options: pollData.options,
        duration_hours: pollData.duration_hours,
        community_id: pollData.community_id,
        allow_multiple_choices: pollData.allow_multiple_choices || false,
        expires_at: new Date(Date.now() + pollData.duration_hours * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      }])
      .select()
    
    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('Error creating poll:', error)
    throw error
  }
}

export const votePoll = async (pollId: string, userId: string, optionIndex: number) => {
  try {
    const { data, error } = await supabase
      .from("poll_votes")
      .upsert([{
        poll_id: pollId,
        user_id: userId,
        option_index: optionIndex,
        voted_at: new Date().toISOString()
      }])
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error voting on poll:', error)
    throw error
  }
}

export const getPollResults = async (pollId: string) => {
  try {
    const { data, error } = await supabase
      .from("poll_votes")
      .select("option_index, user:users(id, nombre, full_name)")
      .eq("poll_id", pollId)
    
    if (error) throw error
    
    // Group votes by option
    const results = (data || []).reduce((acc: any, vote: any) => {
      const optionIndex = vote.option_index
      if (!acc[optionIndex]) {
        acc[optionIndex] = { count: 0, voters: [] }
      }
      acc[optionIndex].count++
      acc[optionIndex].voters.push(vote.user)
      return acc
    }, {})
    
    return results
  } catch (error) {
    console.error('Error getting poll results:', error)
    return {}
  }
}

export const createCelebrationPost = async (celebrationData: {
  user_id: string
  content: string
  celebration_type: 'milestone' | 'achievement' | 'success' | 'investment_win' | 'other'
  milestone_details?: {
    amount?: string
    percentage?: string
    description?: string
  }
  community_id?: string
  media_urls?: string[]
}) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .insert([{
        user_id: celebrationData.user_id,
        contenido: celebrationData.content,
        post_type: 'celebration',
        celebration_type: celebrationData.celebration_type,
        milestone_details: celebrationData.milestone_details,
        community_id: celebrationData.community_id,
        media_urls: celebrationData.media_urls || [],
        created_at: new Date().toISOString()
      }])
      .select()
    
    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('Error creating celebration post:', error)
    throw error
  }
}

export const createPartnershipPost = async (partnershipData: {
  user_id: string
  content: string
  business_type: string
  investment_amount: string
  location: string
  partnership_type: 'equity' | 'loan' | 'joint_venture' | 'other'
  requirements: string[]
  contact_preferences: string[]
  community_id?: string
}) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .insert([{
        user_id: partnershipData.user_id,
        contenido: partnershipData.content,
        post_type: 'partnership',
        partnership_details: {
          business_type: partnershipData.business_type,
          investment_amount: partnershipData.investment_amount,
          location: partnershipData.location,
          partnership_type: partnershipData.partnership_type,
          requirements: partnershipData.requirements,
          contact_preferences: partnershipData.contact_preferences
        },
        community_id: partnershipData.community_id,
        created_at: new Date().toISOString()
      }])
      .select()
    
    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('Error creating partnership post:', error)
    throw error
  }
}

// ===== CHAT SYSTEM ENDPOINTS =====
export const getUserConversations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        *,
        participants:conversation_participants(
          user:users(id, nombre, full_name, photo_url, avatar_url, role)
        ),
        last_message:messages(contenido, created_at, sender_id)
      `)
      .eq("conversation_participants.user_id", userId)
      .order("updated_at", { ascending: false })
    
    if (error) throw error
    
    return (data || []).map((conv: any) => ({
      ...conv,
      participants: conv.participants?.map((p: any) => p.user) || [],
      last_message: conv.last_message?.[0] || null
    }))
  } catch (error) {
    console.error('Error fetching user conversations:', error)
    return []
  }
}

export const getConversationMessages = async (conversationId: string, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, nombre, full_name, photo_url, avatar_url, role),
        receiver:users!messages_receiver_id_fkey(id, nombre, full_name, photo_url, avatar_url, role)
        `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(limit)
    
    if (error) throw error

    // Normalize DB fields to the UI shape: contenido -> content, sender -> user
    const normalized = (data || []).map((m: any) => ({
      ...m,
      content: m.content || m.contenido || '',
      user: m.sender || m.user || null
    }))

    return normalized.reverse()
  } catch (error) {
    console.error('Error fetching conversation messages:', error)
    return []
  }
}

export const sendMessage = async (messageData: {
  user_id: string
  conversation_id?: string,
  chat_id?: string,
  other_user_id: string,
  content: string
  message_type?: 'text' | 'image' | 'file' | 'voice'
  media_url?: string
}) => {
  try {
    const chatId = (messageData.chat_id || messageData.conversation_id) as string

    const insertPayload: any = {
      conversation_id: chatId,
      sender_id: messageData.user_id,
      receiver_id: messageData.other_user_id,
      contenido: messageData.content,
      content: messageData.content,
      message_type: messageData.message_type,
      created_at: new Date().toISOString()
    }

    if (messageData.media_url) insertPayload.media_url = messageData.media_url

    const { data, error } = await supabase
      .from("messages")
      .insert([insertPayload])
      .select()
    
    if (error) throw error
    
    // Update conversation's last activity (use chatId)
    try {
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString(), last_message: messageData.content })
        .eq("id", chatId)
    } catch (e) {
      // Non-fatal: log and continue
      console.warn('Failed updating conversation after message insert', e)
    }
    
    return data?.[0]
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

export const createConversation = async (participantIds: string[], conversationType: 'direct' | 'group' = 'direct') => {
  try {
    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert([{
        type: conversationType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (convError) throw convError
    
    // Add participants
    const participants = participantIds.map(userId => ({
      conversation_id: conversation.id,
      user_id: userId,
      joined_at: new Date().toISOString()
    }))
    
    const { error: participantsError } = await supabase
      .from("conversation_participants")
      .insert(participants)
    
    if (participantsError) throw participantsError
    
    return conversation
  } catch (error) {
    console.error('Error creating conversation:', error)
    throw error
  }
}

export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from("message_reads")
      .upsert([{
        conversation_id: conversationId,
        user_id: userId,
        last_read_at: new Date().toISOString()
      }])
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return null
  }
}

export const getUnreadMessageCount = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc("get_unread_message_count", {
      p_user_id: userId
    })
    
    if (error) throw error
    return data || 0
  } catch (error) {
    console.error('Error getting unread message count:', error)
    return 0
  }
}

export const searchConversations = async (userId: string, query: string) => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select(`
        *,
        participants:conversation_participants(
          user:users(id, nombre, full_name, photo_url, avatar_url)
        )
      `)
      .eq("conversation_participants.user_id", userId)
      .or(`participants.user.nombre.ilike.%${query}%,participants.user.full_name.ilike.%${query}%`)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error searching conversations:', error)
    return []
  }
}

// ===== GLOBAL SEARCH FUNCTION =====
interface SearchResult {
  id: string
  type: 'user' | 'post' | 'community'
  title: string
  subtitle: string
  avatar?: string
  role?: string
  created_at?: string
  member_count?: number
  data: any
}

export const globalSearch = async (query: string, userId: string, limit = 20): Promise<SearchResult[]> => {
  try {
    if (!query.trim()) return []
    
    // Search across multiple entities: users, posts, communities
    const [usersResults, postsResults, communitiesResults] = await Promise.all([
      // Search users
      supabase
        .from('users')
        .select('id, nombre, full_name, username, avatar_url, photo_url, bio, role')
        .or(`nombre.ilike.%${query}%,full_name.ilike.%${query}%,username.ilike.%${query}%,bio.ilike.%${query}%`)
        .neq('id', userId)
        .limit(Math.floor(limit / 3)),
      
      // Search posts
      supabase
        .from('posts')
        .select(`
          *,
          author:users(id, nombre, full_name, username, photo_url, avatar_url, role)
        `)
        .ilike('contenido', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(Math.floor(limit / 3)),
      
      // Search communities
      supabase
        .from('communities')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(Math.floor(limit / 3))
    ])

    const results: SearchResult[] = []

    // Format user results
    if (usersResults.data) {
      usersResults.data.forEach((user: any) => {
        results.push({
          id: user.id,
          type: 'user',
          title: user.full_name || user.nombre || user.username,
          subtitle: user.bio || `@${user.username}`,
          avatar: user.avatar_url || user.photo_url,
          role: user.role,
          data: user
        })
      })
    }

    // Format post results
    if (postsResults.data) {
      postsResults.data.forEach((post: any) => {
        results.push({
          id: post.id,
          type: 'post',
          title: post.contenido.substring(0, 100) + (post.contenido.length > 100 ? '...' : ''),
          subtitle: `Por ${post.author?.full_name || post.author?.nombre || 'Usuario'}`,
          avatar: post.author?.avatar_url || post.author?.photo_url,
          created_at: post.created_at,
          data: post
        })
      })
    }

    // Format community results
    if (communitiesResults.data) {
      communitiesResults.data.forEach((community: any) => {
        results.push({
          id: community.id,
          type: 'community',
          title: community.nombre || community.name,
          subtitle: community.description || 'Comunidad',
          avatar: community.avatar_url || community.icono_url || community.image_url,
          member_count: community.member_count,
          data: community
        })
      })
    }

    return results
  } catch (error) {
    console.error('Error in global search:', error)
    return []
  }
}