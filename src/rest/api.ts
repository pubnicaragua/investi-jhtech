import {  
  request,  
  authSignIn as clientSignIn,  
  authSignUp as clientSignUp,  
  authSignOut as clientSignOut,  
  urls,  
} from "./client"  
import * as SecureStore from "expo-secure-store"  
  
// Agregar la constante ANON_KEY que faltaba  
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o"  
  
// ===== INTERFACES =====  
export interface Promotion {  
  id: string  
  title: string  
  description: string  
  image_url: string  
  discount: string  
  valid_until: string  
  location: string  
  terms: string  
  category: string  
  created_at: string  
  updated_at: string  
}  
  
export interface Course {  
  id: string  
  title: string  
  description: string  
  duration: string  
  level: string  
  lessons: number  
  progress: number  
  image_url: string  
  created_at: string  
  updated_at: string  
}  
  
export interface Article {  
  id: string  
  title: string  
  content: string  
  read_time: string  
  category: string  
  image_url: string  
  created_at: string  
  updated_at: string  
}  
  
export interface EducationalContent {  
  id: string  
  title: string  
  description: string  
  content_type: 'video' | 'article' | 'course'  
  duration?: string  
  level?: string  
  image_url: string  
  created_at: string  
  updated_at: string  
}  
  
export interface News {  
  id: string  
  title: string  
  content: string  
  excerpt?: string  
  image_url?: string  
  author_id: string  
  category: string  
  published_at: string  
  created_at: string  
}  
  
// ===== AUTH =====  
export const authSignIn = clientSignIn  
export const authSignUp = clientSignUp  
export const authSignOut = clientSignOut  
  
// ===== USERS =====  
export async function getMe(uid: string) {  
  try {  
    const response = await request("GET", "/users", {  
      params: { select: "*", id: `eq.${uid}` },  
    })  
    return response?.[0] || null  
  } catch (error: any) {  
    if (error.code === "42P01") return null // Table doesn't exist  
    throw error  
  }  
}  
  
export async function updateUser(uid: string, data: any) {  
  try {  
    return await request("PATCH", "/users", {  
      params: { id: `eq.${uid}` },  
      body: data,  
      headers: { Prefer: "return=representation" },  
    })  
  } catch (error: any) {  
    if (error.code === "42P01") return null  
    throw error  
  }  
}  
  
export async function getUserProfile(userId: string) {  
  try {  
    const response = await request("GET", "/users", {  
      params: {  
        id: `eq.${userId}`,  
        select: "*,posts:posts(count),followers:user_followers!following_id(count),following:user_followers!follower_id(count)"  
      },  
    })  
    return response?.[0] || null  
  } catch (error: any) {  
    console.error('Error fetching user profile:', error)  
    return null  
  }  
}  
  
// ===== COMMUNITIES =====  
export async function listCommunities() {  
  try {  
    const response = await request("GET", "/communities", {  
      params: {   
        select: "id,nombre,descripcion,icono_url,tipo,created_at",   
        order: "created_at.desc"   
      },  
    })  
    // Mapear los nombres de columna españoles a ingleses para compatibilidad con el frontend  
    return (response || []).map((community: any) => ({  
      id: community.id,  
      name: community.nombre,  
      description: community.descripcion,  
      image_url: community.icono_url,  
      type: community.tipo,  
      created_at: community.created_at,  
      members_count: 0 // Esto se calculará con una query separada si es necesario  
    }))  
  } catch (error: any) {  
    if (error.code === "42P01") return []  
    throw error  
  }  
}  


  
export async function joinCommunity(uid: string, community_id: string) {  
  try {  
    return await request("POST", "/user_communities", {  
      body: { user_id: uid, community_id },  
    })  
  } catch (error: any) {  
    if (error.code === "23505") return null // Already joined  
    throw error  
  }  
}  
  
export async function getCommunityDetails(communityId: string) {  
  try {  
    const response = await request("GET", "/communities", {  
      params: {  
        id: `eq.${communityId}`,  
        select: "id,nombre,descripcion,icono_url,tipo,created_at,members:user_communities(count)",  
      },  
    })  
      
    if (!response?.[0]) return null  
      
    const community = response[0]  
    return {  
      id: community.id,  
      name: community.nombre,           // Mapear español → inglés  
      description: community.descripcion,  
      image_url: community.icono_url,  
      type: community.tipo,  
      created_at: community.created_at,  
      members_count: community.members?.[0]?.count || 0  
    }  
  } catch (error: any) {  
    console.error('Error fetching community details:', error)  
    return null  
  }  
}
  


// Función para obtener comunidades del usuario  
export async function getUserCommunities(userId: string) {  
  try {  
    const response = await request("GET", "/user_communities", {  
      params: {   
        user_id: `eq.${userId}`,  
        select: "community:communities(id,nombre,icono_url,descripcion)",  
      },  
    })  
      
    return (response || []).map((uc: any) => ({  
      id: uc.community?.id,  
      name: uc.community?.nombre,  
      nombre: uc.community?.nombre,  
      image_url: uc.community?.icono_url,  
      icono_url: uc.community?.icono_url,  
      descripcion: uc.community?.descripcion  
    })).filter((c: { id: string | undefined }) => c.id)  
  } catch (error: any) {  
    console.error('Error fetching user communities:', error)  
    return []  
  }  
}  
  
// Función para obtener canales de comunidad  
export async function getCommunityChannels(communityId: string) {  
  try {  
    const response = await request("GET", "/community_channels", {  
      params: {  
        community_id: `eq.${communityId}`,  
        select: "id,name,description,type,created_at",  
        order: "created_at.asc"  
      },  
    })  
    return response || []  
  } catch (error: any) {  
    console.error('Error fetching community channels:', error)  
    return []  
  }  
}

// Función para obtener posts de una comunidad específica  
export async function getCommunityPosts(communityId: string, limit = 20) {  
  try {  
    const response = await request("GET", "/posts", {  
      params: {  
        community_id: `eq.${communityId}`,  
        select: "id,contenido,created_at,likes_count,comment_count,user_id,users!inner(nombre,photo_url,role)",  
        order: "created_at.desc",  
        limit: String(limit),  
      },  
    })  
      
    return (response || []).map((post: any) => ({  
      id: post.id,  
      content: post.contenido,  
      created_at: post.created_at,  
      likes: post.likes_count || 0,  
      comments: post.comment_count || 0,  
      shares: 0,  
      author: {  
        id: post.user_id,  
        name: post.users?.nombre || 'Usuario',  
        avatar: post.users?.photo_url || 'https://i.pravatar.cc/100',  
        role: post.users?.role || 'Usuario'  
      }  
    }))  
  } catch (error: any) {  
    console.error('Error fetching community posts:', error)  
    return []  
  }  
}  

  
export async function getChannelMessages(chatId: string, limit = 50) {  
  try {  
    const response = await request("GET", "/chat_messages", {  
      params: {  
        chat_id: `eq.${chatId}`,  
        select: "id,content,created_at,user:users!sender_id(id,nombre,avatar_url)",  
        order: "created_at.asc",  
        limit: String(limit),  
      },  
    })  
    return (response || []).map((msg: any) => ({  
      id: msg.id,  
      content: msg.content,  
      created_at: msg.created_at,  
      user: {  
        id: msg.user?.id || '',  
        nombre: msg.user?.nombre || 'Usuario',  
        avatar: msg.user?.avatar_url || 'https://i.pravatar.cc/100'  
      }  
    }))  
  } catch (error: any) {  
    console.error('Error fetching messages:', error)  
    return []  
  }  
}
  
export async function sendMessage(chatId: string, userId: string, content: string) {  
  try {  
    const response = await request("POST", "/chat_messages", {  
      body: {  
        chat_id: chatId,  
        sender_id: userId,  
        content: content  
      }  
    })  
      
    await request("PATCH", "/chats", {  
      params: { id: `eq.${chatId}` },  
      body: {  
        last_message: content,  
        last_message_at: new Date().toISOString()  
      }  
    })  
      
    return response  
  } catch (error: any) {  
    console.error('Error sending message:', error)  
    throw error  
  }  
}  


// ===== FEED / POSTS =====  
export async function getUserFeed(uid: string, limit = 20) {  
  try {  
    // Intentar usar get_personalized_feed primero  
    const rpcResponse = await request("POST", "/rpc/get_personalized_feed", {  
      body: { p_user_id: uid, p_limit: limit },  
    })  
    return rpcResponse || []  
  } catch (rpcError: any) {  
    console.log("RPC failed, trying direct query:", rpcError)  
    // Fallback: consulta directa con nombres de columna correctos  
    try {  
      const directResponse = await request("GET", "/posts", {  
        params: {  
          select: "id,contenido,created_at,likes_count,comment_count,user_id,users!inner(nombre,full_name,username,photo_url,avatar_url,role)",  
          order: "created_at.desc",  
          limit: String(limit),  
        },  
      })  
        
      // Transformar los datos al formato esperado por el frontend  
      return (directResponse || []).map((post: any) => ({  
        id: post.id,  
        user_data: {  
          name: post.users?.full_name || post.users?.nombre || 'Usuario',  
          avatar: post.users?.avatar_url || post.users?.photo_url || 'https://i.pravatar.cc/100?img=1',  
          role: post.users?.role || 'Usuario'  
        },  
        content: post.contenido,  
        image: null,  
        post_time: new Date(post.created_at).toLocaleTimeString(),  
        likes: post.likes_count || 0,  
        comments: post.comment_count || 0,  
        shares: 0,  
        created_at: post.created_at,  
        user_id: post.user_id  
      }))  
    } catch (directError: any) {  
      console.error("Direct query also failed:", directError)  
      return []  
    }  
  }  
}  
  
export async function createPost(data: {  
  user_id: string  
  community_id?: string  
  contenido: string  
  media_url?: string[]  
}) {  
  return await request("POST", "/posts", { body: data })  
}  
  
export async function getPostDetail(postId: string) {  
  try {  
    const response = await request("GET", "/posts", {  
      params: {  
        id: `eq.${postId}`,  
        select: "id,contenido,created_at,likes_count,comment_count,user_id,users!inner(nombre,full_name,username,photo_url,avatar_url,role),comments(*)",  
      },  
    })  
    return response?.[0] || null  
  } catch (error) {  
    return null  
  }  
}  
  
export async function likePost(post_id: string, user_id: string, is_like = true) {  
  try {  
    return await request("POST", "/post_likes", {  
      body: { post_id, user_id, is_like },  
    })  
  } catch (error: any) {  
    if (error.code === "23505") return null // Already liked  
    return null  
  }  
}  
  
export async function commentPost(post_id: string, user_id: string, contenido: string, parent_id?: string) {  
  return await request("POST", "/comments", {  
    body: { post_id, user_id, contenido, parent_id: parent_id || null },  
  })  
}  
  
// ===== PROMOCIONES =====  
export async function fetchPromotions(params: { page: number; limit: number }) {  
  try {  
    const { page = 1, limit = 10 } = params  
    const response = await request("GET", "/promotions", {  
      params: {  
        select: "*",  
        order: "created_at.desc",  
        offset: String((page - 1) * limit),  
        limit: String(limit),  
      },  
    })  
    return {  
      data: response || [],  
      meta: {  
        currentPage: page,  
        totalItems: response?.length || 0,  
        hasMore: (response?.length || 0) >= limit,  
      },  
    }  
  } catch (error: any) {  
    console.error('Error fetching promotions:', error)  
    throw new Error(error.message || 'Error al cargar las promociones')  
  }  
}  
  
// ===== CURSOS =====  
export async function fetchCourses(userId: string, params: { page: number; limit: number }) {  
  try {  
    const { page = 1, limit = 10 } = params  
    const response = await request("POST", "/rpc/get_user_courses", {  
      body: {  
        p_user_id: userId,  
        p_page: page,  
        p_limit: limit,  
      },  
    })  
    return {  
      data: response || [],  
      meta: {  
        currentPage: page,  
        totalItems: response?.length || 0,  
        hasMore: (response?.length || 0) >= limit,  
      },  
    }  
  } catch (error: any) {  
    console.error('Error fetching courses:', error)  
    throw new Error(error.message || 'Error al cargar los cursos')  
  }  
}  
  
// ===== ARTÍCULOS =====  
export async function fetchArticles(params: {  
  page: number;  
  limit: number;  
  category?: string  
}) {  
  try {  
    const { page = 1, limit = 10, category } = params  
    const query: Record<string, string> = {  
      select: "*",  
      order: "created_at.desc",  
      offset: String((page - 1) * limit),  
      limit: String(limit),  
    }  
    if (category) {  
      query.category = `eq.${category}`  
    }  
    const response = await request("GET", "/articles", { params: query })  
    return {  
      data: response || [],  
      meta: {  
        currentPage: page,  
        totalItems: response?.length || 0,  
        hasMore: (response?.length || 0) >= limit,  
      },  
    }  
  } catch (error: any) {  
    console.error('Error fetching articles:', error)  
    throw new Error(error.message || 'Error al cargar los artículos')  
  }  
}  
  
// ===== CONTENIDO EDUCATIVO =====  
export async function fetchEducationalContent(params: {  
  page: number;  
  limit: number;  
  contentType?: 'video' | 'article' | 'course'  
}) {  
  try {  
    const { page = 1, limit = 10, contentType } = params  
    const query: Record<string, string> = {  
      select: "*",  
      order: "created_at.desc",  
      offset: String((page - 1) * limit),  
      limit: String(limit),  
    }  
    if (contentType) {  
      query.content_type = `eq.${contentType}`  
    }  
    const response = await request("GET", "/educational_content", {  
      params: query  
    })  
    return {  
      data: response || [],  
      meta: {  
        currentPage: page,  
        totalItems: response?.length || 0,  
        hasMore: (response?.length || 0) >= limit,  
      },  
    }  
  } catch (error: any) {  
    console.error('Error fetching educational content:', error)  
    throw new Error(error.message || 'Error al cargar el contenido educativo')  
  }  
}  
  
// ===== NOTICIAS =====  
export async function getNewsList(category?: string) {  
  try {  
    const query: Record<string, string> = {  
      select: "*,author:users(id,nombre,full_name,username,photo_url,avatar_url)",  
      order: "published_at.desc"  
    }  
    if (category) {  
      query.category = `eq.${category}`  
    }  
    const response = await request("GET", "/news", { params: query })  
    return response || []  
  } catch (error: any) {  
    console.error('Error fetching news:', error)  
    return []  
  }  
}  
  
export async function getNewsDetail(newsId: string) {  
  try {  
    const response = await request("GET", "/news", {  
      params: {  
        id: `eq.${newsId}`,  
        select: "*,author:users(id,nombre,full_name,username,photo_url,avatar_url)"  
      },  
    })  
    return response?.[0] || null  
  } catch (error: any) {  
    console.error('Error fetching news detail:', error)  
    return null  
  }  
}  
  
// ===== BÚSQUEDA =====  
export async function globalSearch(query: string, userId: string) {  
  try {  
    const response = await request("POST", "/rpc/search_all", {  
      body: { search_term: query, current_user_id: userId }  
    })  
    return response || []  
  } catch (error: any) {  
    console.error('Error in global search:', error)  
    return []  
  }  
}  
  
export async function searchUsers(query: string) {  
  try {  
    const response = await request("GET", "/users", {  
      params: {  
        or: `nombre.ilike.%${query}%,username.ilike.%${query}%`,  
        select: "id,nombre,full_name,username,photo_url,avatar_url,role,bio",  
        limit: "20"  
      },  
    })  
    return response || []  
  } catch (error: any) {  
    console.error('Error searching users:', error)  
    return []  
  }  
}  
  
// ===== STORAGE =====  
export async function uploadAvatar(uid: string, blob: Blob) {  
  const token = await SecureStore.getItemAsync("access_token")  
  const response = await fetch(`${urls.STORAGE_URL}/object/avatars/${uid}/avatar.jpg`, {  
    method: "POST",  
    headers: {  
      "Content-Type": "image/jpeg",  
      "apikey": ANON_KEY,  
      "Authorization": `Bearer ${token}`,  
    },  
    body: blob,  
  })  
  
  if (!response.ok) {  
    const errorText = await response.text()  
    console.error("Upload error details:", errorText)  
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`)  
  }  
  return await response.json()  
}  
  
export async function uploadImage(file: any) {  
  try {  
    const formData = new FormData()  
    formData.append('file', file)  
    const token = await SecureStore.getItemAsync("access_token")  
    const response = await fetch(`${urls.STORAGE_URL}/object/avatars/${file.name}`, {  
      method: 'POST',  
      headers: {  
        'Authorization': `Bearer ${token}`,  
        'apikey': ANON_KEY,  
      },  
      body: formData,  
    })  
    if (!response.ok) {  
      throw new Error('Error al subir la imagen')  
    }  
    const data = await response.json()  
    return data.url  
  } catch (error: any) {  
    console.error('Error uploading image:', error)  
    return 'https://www.investiiapp.com/investi-logo-new-main.png'  
  }  
}  
  
// ===== CURSOS Y LECCIONES =====  

// Funciones para educación - mantén las existentes y agrega estas  
export async function getCourses() {  
  try {  
    return await request("GET", "/courses", {  
      params: {  
        select: "id,titulo,descripcion,imagen_url,categoria,precio,total_lecciones,duracion_total"  
      }  
    })  
  } catch (error: any) {  
    console.error('Error fetching courses:', error)  
    return []  
  }  
}  
  
export async function getLessons(courseId?: string) {  
  try {  
    let params: any = {  
      select: "id,titulo,descripcion,duracion,tipo,orden"  
    }  
      
    if (courseId) {  
      params.course_id = `eq.${courseId}`  
    }  
      
    return await request("GET", "/lessons", { params })  
  } catch (error: any) {  
    console.error('Error fetching lessons:', error)  
    return []  
  }  
}  
  
export async function getCoursesWithLessons() {  
  try {  
    return await request("GET", "/courses", {  
      params: {  
        select: "id,titulo,descripcion,course_modules(id,titulo,orden,lessons(id,titulo,orden))",  
      },  
    })  
  } catch (error: any) {  
    if (error.code === "42P01") return []  
    return []  
  }  
}  
  

export async function getUserLearningProgress(userId: string) {  
  try {  
    const response = await request("GET", "/user_course_progress", {  
      params: {  
        user_id: `eq.${userId}`,  
        select: "course:courses(id,titulo),completed_lessons,progress_percent,last_accessed",  
        order: "last_accessed.desc",  
        limit: "5"  
      }  
    })  
      
    return (response || []).map((progress: any) => ({  
      courseId: progress.course?.id,  
      title: progress.course?.titulo,  
      completedLessons: progress.completed_lessons,  
      progress: progress.progress_percent,  
      lastAccessed: progress.last_accessed  
    }))  
  } catch (error: any) {  
    console.error('Error fetching learning progress:', error)  
    return []  
  }  
}




export async function completeLesson(user_id: string, lesson_id: string) {  
  return await request("POST", "/lesson_progress", {  
    body: { user_id, lesson_id },  
  })  
}


  
// ===== PORTFOLIO =====  
export async function getPortfolio(uid: string) {  
  try {  
    const response = await request("GET", "/simulated_portfolios", {  
      params: {  
        user_id: `eq.${uid}`,  
        select: "*,simulated_investments(*)",  
      },  
    })  
    return response?.[0] || null  
  } catch (error: any) {  
    if (error.code === "42P01") return null  
    return null  
  }  
}  
  
export async function addInvestment(payload: any) {  
  return await request("POST", "/simulated_investments", { body: payload })  
}  
  
// ===== BLOQUEO DE USUARIOS =====  
export async function blockUser(user_id: string, blocked_user_id: string) {  
  return await request("POST", "/user_blocks", {  
    body: { user_id, blocked_user_id },  
  })  
}  
  
// ===== HELPERS =====  
export async function getCurrentUser() {  
  try {  
    const token = await SecureStore.getItemAsync("access_token")  
    if (!token) return null  
    const payload = JSON.parse(atob(token.split(".")[1]))  
    const uid = payload.sub || null  
    if (!uid) return null  
    return await getMe(uid)  
  } catch {  
    return null  
  }  
}  
  
export async function getCurrentUserId(): Promise<string | null> {  
  try {  
    const token = await SecureStore.getItemAsync("access_token")  
    if (!token) return null  
    const payload = JSON.parse(atob(token.split(".")[1]))  
    return payload.sub || null  
  } catch {  
    return null  
  }  
}  
  
// ===== NOTIFICACIONES =====  
export async function getNotifications(userId: string) {  
  const response = await request("GET", "/notifications", {  
    params: {  
      user_id: `eq.${userId}`,  
      select: "*",  
      order: "created_at.desc"  
    }  
  })  
  return response || []  
}  
  
export async function markNotificationAsRead(notificationId: string) {  
  return await request("PATCH", "/notifications", {  
    params: { id: `eq.${notificationId}` },  
    body: { read: true },  
    headers: { Prefer: "return=representation" },  
  })  
}  
  
// ===== FAQ Y GLOSARIO =====  
export async function getFAQs() {  
  const response = await request("GET", "/faqs", {  
    params: {  
      select: "*",  
      order: "created_at.asc"  
    }  
  })  
  return response || []  
}  
  
export async function getGlossaryTerms() {  
  const response = await request("GET", "/glossary", {  
    params: {  
      select: "*",  
      order: "termino.asc"  
    }  
  })  
  return response || []  
}  
  
// ===== BADGES =====  
export async function getUserBadges(userId: string) {  
  const response = await request("GET", "/user_badges", {  
    params: {  
      user_id: `eq.${userId}`,  
      select: "*,badge:badges(*)"  
    }  
  })  
  return response || []  
}


// Obtener datos de mercado  
export async function getMarketData() {  
  try {  
    const response = await request("GET", "/market_data", {  
      params: {  
        select: "*",  
        order: "last_updated.desc"  
      },  
    })  
    return response || []  
  } catch (error: any) {  
    console.error('Error fetching market data:', error)  
    return []  
  }  
}  
  
// Obtener datos destacados del mercado  
export async function getFeaturedStocks() {  
  try {  
    const response = await request("GET", "/market_data", {  
      params: {  
        select: "*",  
        is_featured: "eq.true",  
        order: "last_updated.desc"  
      },  
    })  
    return response || []  
  } catch (error: any) {  
    console.error('Error fetching featured stocks:', error)  
    return []  
  }  
}



// Obtener usuarios activos para historias  
export async function getActiveUsers(limit = 10) {  
  try {  
    const response = await request("GET", "/users", {  
      params: {  
        select: "id,nombre,avatar_url,is_online,last_seen_at",  
        order: "last_seen_at.desc",  
        limit: String(limit),  
      },  
    })  
    return response || []  
  } catch (error: any) {  
    console.error('Error fetching active users:', error)  
    return []  
  }  
}
  
// Obtener chats del usuario  
  
export async function getUserChats(userId: string) {  
  try {  
    const response = await request("GET", "/chats", {  
      params: {  
        or: `user_one_id.eq.${userId},user_two_id.eq.${userId}`,  
        select: "id,type,last_message,last_message_at,unread_count,community:communities(id,nombre,icono_url),user_one:users!user_one_id(id,nombre,avatar_url),user_two:users!user_two_id(id,nombre,avatar_url)",  
        order: "last_message_at.desc",  
      },  
    })  
      
    return (response || []).map((chat: any) => ({  
      ...chat,  
      user: chat.type === 'direct'   
        ? (chat.user_one?.id === userId ? chat.user_two : chat.user_one)  
        : null  
    }))  
  } catch (error: any) {  
    console.error('Error fetching user chats:', error)  
    return []  
  }  
}
  
// Obtener último mensaje por chat  
export async function getLastMessages(chatIds: string[]) {  
  try {  
    const response = await request("GET", "/messages", {  
      params: {  
        chat_id: `in.(${chatIds.join(',')})`,  
        select: "id,chat_id,sender:users(id,nombre),content,created_at",  
        order: "created_at.desc",  
        limit: "1"  
      },  
    })  
    return response || []  
  } catch (error: any) {  
    console.error('Error fetching last messages:', error)  
    return []  
  }  
}


export async function getUserComplete(userId: string) {  
  try {  
    const [userResponse, statsResponse, postsResponse, communitiesResponse] = await Promise.all([  
      request("GET", "/users", {  
        params: {  
          id: `eq.${userId}`,  
          select: "id,nombre,bio,location,avatar_url,banner_url,is_verified,created_at"  
        }  
      }),  
      request("GET", "/rpc/get_user_stats", {  
        body: { user_id: userId }  
      }),  
      request("GET", "/posts", {  
        params: {  
          user_id: `eq.${userId}`,  
          select: "id,contenido,created_at,likes_count,comment_count",  
          order: "created_at.desc",  
          limit: "10"  
        }  
      }),  
      request("GET", "/user_communities", {  
        params: {  
          user_id: `eq.${userId}`,  
          select: "community:communities(id,nombre,icono_url)"  
        }  
      })  
    ])  
  
    const user = userResponse?.[0]  
    if (!user) return null  
  
    return {  
      id: user.id,  
      name: user.nombre,  
      bio: user.bio,  
      location: user.location,  
      avatarUrl: user.avatar_url,  
      bannerUrl: user.banner_url,  
      isVerified: user.is_verified,  
      stats: {  
        postsCount: postsResponse?.length || 0,  
        followersCount: statsResponse?.followers_count || 0,  
        followingCount: statsResponse?.following_count || 0  
      },  
      posts: postsResponse || [],  
      communities: communitiesResponse?.map((uc: any) => uc.community) || []  
    }  
  } catch (error: any) {  
    console.error('Error fetching complete user profile:', error)  
    return null  
  }  
}  
  
export async function followUser(followerId: string, followingId: string) {  
  try {  
    return await request("POST", "/user_follows", {  
      body: { follower_id: followerId, following_id: followingId }  
    })  
  } catch (error: any) {  
    if (error.code === "23505") return null // Already following  
    throw error  
  }  
}  
  
export async function unfollowUser(followerId: string, followingId: string) {  
  try {  
    return await request("DELETE", "/user_follows", {  
      params: {  
        follower_id: `eq.${followerId}`,  
        following_id: `eq.${followingId}`  
      }  
    })  
  } catch (error: any) {  
    console.error('Error unfollowing user:', error)  
    throw error  
  }  
}  



export async function getUserPosts(userId: string, limit = 20) {  
  try {  
    const response = await request("GET", "/posts", {  
      params: {  
        user_id: `eq.${userId}`,  
        select: "id,contenido,created_at,likes_count,comment_count,media_url,user:users(id,nombre,avatar_url)",  
        order: "created_at.desc",  
        limit: String(limit)  
      }  
    })  
    return response || []  
  } catch (error: any) {  
    console.error('Error fetching user posts:', error)  
    return []  
  }  
}  
  
export async function getSavedPosts(userId: string) {  
  try {  
    const response = await request("GET", "/saved_posts", {  
      params: {  
        user_id: `eq.${userId}`,  
        select: "post:posts(id,contenido,created_at,likes_count,comment_count,user:users(id,nombre,avatar_url))",  
        order: "created_at.desc"  
      }  
    })  
    return response?.map((sp: any) => sp.post) || []  
  } catch (error: any) {  
    console.error('Error fetching saved posts:', error)  
    return []  
  }  
}  
  
export async function getRecommendedCommunities(userId: string) {  
  try {  
    const response = await request("GET", "/communities", {  
      params: {  
        select: "id,nombre,descripcion,icono_url,members:user_communities(count)",  
        limit: "5"  
      }  
    })  
    return response.map((community: {
      id: string;
      nombre: string;
      descripcion: string;
      icono_url: string;
      members?: Array<{ count: number }>;
    }) => ({
      id: community.id,
      name: community.nombre,
      description: community.descripcion,
      imageUrl: community.icono_url,
      memberCount: community.members?.[0]?.count || 0,
      isMember: false // TODO: Check if user is member  
    }))  
  } catch (error: any) {  
    console.error('Error fetching recommended communities:', error)  
    return []  
  }  
}

// ===== INVESTOR PROFILE =====
interface InvestorProfile {
  id: string;
  user_id: string;
  experience_level: string;
  investment_goals: string[];
  risk_tolerance: string;
  preferred_investments: string[];
  created_at: string;
  updated_at: string;
  user?: any;
}

export const fetchInvestorProfile = async (userId: string): Promise<InvestorProfile> => {
  try {
    const { data, error } = await request('GET', `/investor_profile?user_id=eq.${userId}`)
    
    if (error) throw error
    
    // If no profile exists, return a default one
    if (!data || data.length === 0) {
      const user = await getCurrentUser()
      return {
        id: userId,
        user_id: userId,
        experience_level: 'beginner',
        investment_goals: [],
        risk_tolerance: 'medium',
        preferred_investments: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: user || { id: userId, name: 'Inversionista' }
      }
    }
    
    // Get user data
    const userData = await getUserProfile(userId)
    
    return {
      ...data[0],
      user: userData
    }
  } catch (error) {
    console.error('Error fetching investor profile:', error)
    throw error
  }
}

export { request }
