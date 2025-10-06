import { storage } from "../utils/storage"  
  
export const urls = {  
  REST_URL: "https://paoliakwfoczcallnecf.supabase.co/rest/v1",  
  AUTH_URL: "https://paoliakwfoczcallnecf.supabase.co/auth/v1",  
  STORAGE_URL: "https://paoliakwfoczcallnecf.supabase.co/storage/v1",  
}  
  
export const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2xpYWt3Zm9jemNhbGxuZWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzA5ODYsImV4cCI6MjA3MDIwNjk4Nn0.zCJoTHcWKZB9vpy5Vn231PNsNSLzmnPvFBKTkNlgG4o"  
  
// Token storage keys  
const TOKEN_KEYS = {  
  ACCESS_TOKEN: "access_token",  
  REFRESH_TOKEN: "refresh_token",  
  SUPABASE_AUTH_TOKEN: "supabase.auth.token",  
  SUPABASE_REFRESH_TOKEN: "supabase.auth.refresh_token",  
  TOKEN_EXPIRY: "token_expiry",  
  USER_SESSION: "user_session"  
}  
  
// Helper function to check if token is expired  
function isTokenExpired(token: string): boolean {  
  try {  
    const payload = JSON.parse(atob(token.split(".")[1]))  
    const currentTime = Math.floor(Date.now() / 1000)  
    return payload.exp <= (currentTime + 300)  
  } catch {  
    return true  
  }  
}  
  
// Helper function to store all token variants  
async function storeTokens(accessToken: string, refreshToken?: string) {  
  const promises = [  
    storage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken),  
    storage.setItem(TOKEN_KEYS.SUPABASE_AUTH_TOKEN, accessToken)  
  ]  
  
  if (refreshToken) {  
    promises.push(  
      storage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken),  
      storage.setItem(TOKEN_KEYS.SUPABASE_REFRESH_TOKEN, refreshToken)  
    )  
  }  
  
  try {  
    const payload = JSON.parse(atob(accessToken.split(".")[1]))  
    if (payload.exp) {  
      promises.push(  
        storage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, payload.exp.toString())  
      )  
    }  
  } catch (error) {  
    console.warn("Could not parse token expiry:", error)  
  }  
  
  await Promise.all(promises)  
}  
  
// Helper function to clear all tokens  
async function clearTokens() {  
  const promises = Object.values(TOKEN_KEYS).map(key =>  
    storage.removeItem(key).catch(() => {})  
  )  
  await Promise.all(promises)  
}  
  
// Refresh token function  
async function refreshAccessToken(): Promise<string | null> {  
  try {  
    const refreshToken = await storage.getItem(TOKEN_KEYS.REFRESH_TOKEN)  
    if (!refreshToken) return null  
  
    const response = await fetch(`${urls.AUTH_URL}/token?grant_type=refresh_token`, {  
      method: "POST",  
      headers: {  
        "Content-Type": "application/json",  
        apikey: ANON_KEY,  
      },  
      body: JSON.stringify({ refresh_token: refreshToken }),  
    })  
  
    if (!response.ok) {  
      await clearTokens()  
      return null  
    }  
  
    const data = await response.json()  
    if (data.access_token) {  
      await storeTokens(data.access_token, data.refresh_token || refreshToken)  
      return data.access_token  
    }  
  
    return null  
  } catch (error) {  
    console.error("Error refreshing token:", error)  
    return null  
  }  
}  
  
// Get valid access token (with automatic refresh)  
async function getValidAccessToken(): Promise<string | null> {  
  try {  
    let accessToken = await storage.getItem(TOKEN_KEYS.ACCESS_TOKEN)  
    if (!accessToken) return null  
  
    if (isTokenExpired(accessToken)) {  
      console.log("Token expired, attempting refresh...")  
      accessToken = await refreshAccessToken()  
    }  
  
    return accessToken  
  } catch (error) {  
    console.error("Error getting valid access token:", error)  
    return null  
  }  
}  
  
// Performance monitoring  
interface RequestMetrics {  
  path: string  
  method: string  
  duration: number  
  status: number  
  timestamp: number  
}  
  
const requestMetrics: RequestMetrics[] = []  
  
export function getRequestMetrics(): RequestMetrics[] {  
  return [...requestMetrics]  
}  
export function clearRequestMetrics() {  
  requestMetrics.length = 0  
}  
  
// ÚNICA función request - sin duplicados  
export async function request(  
  method: string,  
  path: string,  
  options: {  
    params?: Record<string, any>  
    body?: any  
    headers?: Record<string, string>  
    binary?: boolean  
    retryOnAuth?: boolean  
    timeout?: number  
  } = {},  
): Promise<any> {  
  const startTime = Date.now()  
  let status = 0  
  
  const {   
    params,   
    body,   
    headers = {},   
    binary = false,   
    retryOnAuth = true,  
    timeout = 30000   
  } = options  
  
  console.log('🔷 [request] INICIO:', { method, path, body, params })
  
  try {  
    let url = `${urls.REST_URL}${path}`  
    if (params) {  
      const searchParams = new URLSearchParams()  
      Object.entries(params).forEach(([key, value]) => {  
        if (value !== undefined) {  
          searchParams.append(key, String(value))  
        }  
      })  
      if (searchParams.toString()) {  
        url += `?${searchParams.toString()}`  
      }  
    }  
  
    console.log('🔷 [request] URL:', url)
  
    const requestHeaders: Record<string, string> = {  
      apikey: ANON_KEY,  
      ...headers,  
    }  
  
    const token = await getValidAccessToken()  
    if (token) {  
      requestHeaders["Authorization"] = `Bearer ${token}`  
      console.log('🔷 [request] Token agregado')
    }  
  
    if (!binary) {  
      requestHeaders["Content-Type"] = "application/json"  
    }  
  
    const controller = new AbortController()  
    const timeoutId = setTimeout(() => controller.abort(), timeout)  
  
    console.log('🔷 [request] Enviando fetch...')
    const response = await fetch(url, {  
      method,  
      headers: requestHeaders,  
      body: body ? (binary ? body : JSON.stringify(body)) : undefined,  
      signal: controller.signal,  
    })  
  
    console.log('🔷 [request] Respuesta:', { status: response.status, ok: response.ok })
    clearTimeout(timeoutId)  
  
    if (!response.ok && response.status === 401 && retryOnAuth) {  
      console.log("🔷 [request] Auth error, refreshing token...")  
      const newToken = await refreshAccessToken()  
      if (newToken) {  
        requestHeaders["Authorization"] = `Bearer ${newToken}`  
        const retryResponse = await fetch(url, {  
          method,  
          headers: requestHeaders,  
          body: body ? (binary ? body : JSON.stringify(body)) : undefined,  
        })  
  
        if (retryResponse.ok) {  
          status = 200  
          try {  
            return await retryResponse.json()  
          } catch {  
            return null  
          }  
        }  
      }  
    }  
  
    if (!response.ok) {  
      let errorData  
      try {  
        errorData = await response.json()  
      } catch {  
        errorData = { message: response.statusText }  
      }  
      status = response.status  
      console.error('❌ [request] Error response:', errorData)
      throw {  
        code: errorData.code || response.status,  
        message: errorData.message || "Request failed",  
        details: errorData.details || null,  
        status: response.status  
      }  
    }  
  
    status = 200  
    try {  
      const result = await response.json()
      console.log('✅ [request] Success:', result)
      return result  
    } catch {  
      return null  
    }  
  } catch (error: any) {  
    console.error('❌ [request] Exception:', error)
    if (error.name === 'AbortError') {  
      throw {  
        code: 'TIMEOUT',  
        message: 'Request timeout',  
        details: `Request took longer than ${timeout}ms`  
      }  
    }  
    status = error.status || 500  
    throw error  
  } finally {  
    const duration = Date.now() - startTime  
      
    requestMetrics.push({  
      path,  
      method,  
      duration,  
      status,  
      timestamp: startTime  
    })  
      
    // Keep only last 100 metrics  
    if (requestMetrics.length > 100) {  
      requestMetrics.shift()  
    }  
  }  
}  
  
export async function authSignIn(email: string, password: string) {  
  const response = await fetch(`${urls.AUTH_URL}/token?grant_type=password`, {  
    method: "POST",  
    headers: {  
      "Content-Type": "application/json",  
      apikey: ANON_KEY,  
    },  
    body: JSON.stringify({ email, password }),  
  })  
  
  if (!response.ok) {  
    const error = await response.json()  
    throw new Error(error.error_description || "Sign in failed")  
  }  
  
  const data = await response.json()  
  
  if (data.access_token) {  
    await storeTokens(data.access_token, data.refresh_token)  
    await storage.setItem(TOKEN_KEYS.USER_SESSION, JSON.stringify({  
      email,  
      loginTime: Date.now(),  
      lastActivity: Date.now()  
    }))  
  }  
  
  return data  
}  
  
export async function authSignUp(email: string, password: string) {  
  const response = await fetch(`${urls.AUTH_URL}/signup`, {  
    method: "POST",  
    headers: {  
      "Content-Type": "application/json",  
      apikey: ANON_KEY,  
    },  
    body: JSON.stringify({ email, password }),  
  })  
  
  if (!response.ok) {  
    const error = await response.json()  
    throw new Error(error.error_description || "Sign up failed")  
  }  
  
  const data = await response.json()  
  
  if (data.access_token) {  
    await storeTokens(data.access_token, data.refresh_token)  
    await storage.setItem(TOKEN_KEYS.USER_SESSION, JSON.stringify({  
      email,  
      signupTime: Date.now(),  
      lastActivity: Date.now()  
    }))  
  }  
  
  return data  
}  
  
export async function authSignOut() {  
  try {  
    const token = await storage.getItem(TOKEN_KEYS.ACCESS_TOKEN)  
    if (token) {  
      await fetch(`${urls.AUTH_URL}/logout`, {  
        method: "POST",  
        headers: {  
          "Content-Type": "application/json",  
          apikey: ANON_KEY,  
          "Authorization": `Bearer ${token}`  
        },  
      }).catch(() => {})  
    }  
  } catch (error) {  
    console.warn("Error during server logout:", error)  
  }  
  
  await clearTokens()  
}  
  
export async function getCurrentUserId(): Promise<string | null> {  
  try {  
    const token = await getValidAccessToken()  
    if (!token) return null  
  
    const payload = JSON.parse(atob(token.split(".")[1]))  
    return payload.sub || null  
  } catch (error) {  
    console.error("Error getting current user ID:", error)  
    return null  
  }  
}  
  
export async function isAuthenticated(): Promise<boolean> {  
  try {  
    const token = await getValidAccessToken()  
    return !!token  
  } catch {  
    return false  
  }  
}  
  
export async function updateLastActivity() {  
  try {  
    const sessionData = await storage.getItem(TOKEN_KEYS.USER_SESSION)  
    if (sessionData) {  
      const session = JSON.parse(sessionData)  
      session.lastActivity = Date.now()  
      await storage.setItem(TOKEN_KEYS.USER_SESSION, JSON.stringify(session))  
    }  
  } catch (error) {  
    console.warn("Error updating last activity:", error)  
  }  
}  
  
export async function getSessionInfo() {  
  try {  
    const sessionData = await storage.getItem(TOKEN_KEYS.USER_SESSION)  
    return sessionData ? JSON.parse(sessionData) : null  
  } catch {  
    return null  
  }  
}  
  
// Network status monitoring  
export async function checkNetworkStatus(): Promise<boolean> {  
  // En desarrollo, siempre retornar true para evitar errores  
  if (__DEV__) {  
    return Promise.resolve(true);  
  }  
  
  try {  
    const response = await fetch(`${urls.REST_URL}/health`, {  
      method: 'HEAD',  
      headers: {  
        'apikey': ANON_KEY,  
        'Authorization': `Bearer ${await getValidAccessToken()}`  
      }  
    })  
    return response.ok  
  } catch (error) {  
    console.error('Network status check failed:', error)  
    return false  
  }  
}  
  
// Batch requests for better performance  
export async function batchRequest(requests: Array<{  
  method: string  
  path: string  
  options?: any  
}>) {  
  const promises = requests.map(req =>   
    request(req.method, req.path, req.options).catch(error => ({ error }))  
  )  
  return await Promise.all(promises)  
}  
  
// Upload progress tracking  
export async function uploadWithProgress(  
  path: string,   
  file: any,   
  onProgress?: (progress: number) => void  
): Promise<any> {  
  return new Promise((resolve, reject) => {  
    const xhr = new XMLHttpRequest()  
      
    xhr.upload.addEventListener('progress', (event) => {  
      if (event.lengthComputable && onProgress) {  
        const progress = (event.loaded / event.total) * 100  
        onProgress(progress)  
      }  
    })  
      
    xhr.addEventListener('load', () => {  
      if (xhr.status >= 200 && xhr.status < 300) {  
        try {  
          resolve(JSON.parse(xhr.responseText))  
        } catch {  
          resolve(xhr.responseText)  
        }  
      } else {  
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))  
      }  
    })  
      
    xhr.addEventListener('error', () => {  
      reject(new Error('Upload failed'))  
    })  
      
    xhr.addEventListener('abort', () => {  
      reject(new Error('Upload cancelled'))  
    })  
      
    xhr.open('POST', `${urls.STORAGE_URL}${path}`)  
    xhr.setRequestHeader('apikey', ANON_KEY)  
      
    getValidAccessToken().then(token => {  
      if (token) {  
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)  
      }  
      xhr.send(file)  
    })  
  })  
}  
  
// Connection retry with exponential backoff  
export async function requestWithRetry(  
  method: string,  
  path: string,  
  options: any = {},  
  maxRetries: number = 3  
): Promise<any> {  
  let lastError: any  
    
  for (let attempt = 0; attempt <= maxRetries; attempt++) {  
    try {  
      return await request(method, path, options)  
    } catch (error: any) {  
      lastError = error  
        
      if (error.status >= 400 && error.status < 500) {  
        throw error  
      }  
        
      if (attempt < maxRetries) {  
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000) // Max 10s  
        console.log(`Request failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`)  
        await new Promise(resolve => setTimeout(resolve, delay))  
      }  
    }  
  }  
    
  throw lastError  
}  
  
// Cache management for offline support  
const requestCache = new Map<string, { data: any; timestamp: number; ttl: number }>()  
  
export async function requestWithCache(  
  method: string,  
  path: string,  
  options: any = {},  
  ttl: number = 300000 // 5 minutes default  
): Promise<any> {  
  const cacheKey = `${method}:${path}:${JSON.stringify(options.params || {})}`  
  const cached = requestCache.get(cacheKey)  
    
  // Return cached data if still valid  
  if (cached && Date.now() - cached.timestamp < cached.ttl) {  
    return cached.data  
  }  
    
  try {  
    const data = await request(method, path, options)  
      
    // Cache successful GET requests only  
    if (method === 'GET' && data) {  
      requestCache.set(cacheKey, {  
        data,  
        timestamp: Date.now(),  
        ttl  
      })  
    }  
      
    return data  
  } catch (error) {  
    // Return cached data if available during errors  
    if (cached) {  
      console.warn('Request failed, returning cached data:', error)  
      return cached.data  
    }  
    throw error  
  }  
}  
  
// Clear cache  
export function clearRequestCache() {  
  requestCache.clear()  
}  
  
// Real-time connection status  
let isOnline = true  
let connectionListeners: Array<(online: boolean) => void> = []  
  
export function addConnectionListener(callback: (online: boolean) => void) {  
  connectionListeners.push(callback)  
}  
  
export function removeConnectionListener(callback: (online: boolean) => void) {  
  connectionListeners = connectionListeners.filter(cb => cb !== callback)  
}  
  
export function getConnectionStatus(): boolean {  
  return isOnline  
}  
  
// Monitor connection status  
setInterval(async () => {  
  const wasOnline = isOnline  
  isOnline = await checkNetworkStatus()  
    
  if (wasOnline !== isOnline) {  
    connectionListeners.forEach(callback => callback(isOnline))  
  }  
}, 30000) // Check every 30 seconds  
  
// Request queue for offline support  
interface QueuedRequest {  
  id: string  
  method: string  
  path: string  
  options: any  
  timestamp: number  
  retries: number  
}  
  
const requestQueue: QueuedRequest[] = []  
  
export async function queueRequest(method: string, path: string, options: any = {}) {  
  const queuedRequest: QueuedRequest = {  
    id: `${Date.now()}-${Math.random()}`,  
    method,  
    path,  
    options,  
    timestamp: Date.now(),  
    retries: 0  
  }  
    
  requestQueue.push(queuedRequest)  
    
  // Try to process queue if online  
  if (isOnline) {  
    processRequestQueue()  
  }  
    
  return queuedRequest.id  
}  
  
async function processRequestQueue() {  
  if (!isOnline || requestQueue.length === 0) return  
    
  const queuedRequest = requestQueue.shift()  
  if (!queuedRequest) return  
    
  try {  
    await requestWithRetry(queuedRequest.method, queuedRequest.path, queuedRequest.options)  
    console.log(`Queued request processed: ${queuedRequest.method} ${queuedRequest.path}`)  
  } catch (error) {  
    console.error(`Failed to process queued request:`, error)  
      
    // Re-queue if not too old and hasn't been retried too many times  
    if (Date.now() - queuedRequest.timestamp < 3600000 && queuedRequest.retries < 3) { // 1 hour max age  
      queuedRequest.retries++  
      requestQueue.push(queuedRequest)  
    }  
  }  
    
  // Process next request  
  if (requestQueue.length > 0) {  
    setTimeout(processRequestQueue, 1000)  
  }  
}  
  
// Auto-process queue when connection is restored  
addConnectionListener((online) => {  
  if (online) {  
    processRequestQueue()  
  }  
})