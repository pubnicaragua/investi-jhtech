"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react-native"
import { getPostDetail, likePost, commentPost, getCurrentUserId } from "../rest/api"
import { LanguageToggle } from "../components/LanguageToggle"
import { EmptyState } from "../components/EmptyState"
import { useAuthGuard } from "../hooks/useAuthGuard"

export function PostDetailScreen({ navigation, route }: any) {
  const { t } = useTranslation()
  const { postId } = route.params
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [error, setError] = useState<string | null>(null)

  useAuthGuard()

  useEffect(() => {
    loadPost()
  }, [postId])

  const loadPost = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPostDetail(postId)
      setPost(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    try {
      const uid = await getCurrentUserId()
      if (uid && post) {
        await likePost(post.id, uid)
        // Update local state
        setPost((prev) => ({
          ...prev,
          likes_count: (prev.likes_count || 0) + 1,
        }))
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleComment = async () => {
    if (!comment.trim()) return

    try {
      const uid = await getCurrentUserId()
      if (uid && post) {
        await commentPost(post.id, uid, comment)
        setComment("")
        // Reload post to get updated comments
        loadPost()
      }
    } catch (error) {
      console.error("Error commenting:", error)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("postDetail.title")}</Text>
          <LanguageToggle />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2673f3" />
        </View>
      </SafeAreaView>
    )
  }

  if (error || !post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("postDetail.title")}</Text>
          <LanguageToggle />
        </View>
        <EmptyState
          title={t("postDetail.postNotFound")}
          message={t("postDetail.postNotFoundMessage")}
          onRetry={loadPost}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("postDetail.title")}</Text>
        <LanguageToggle />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <Image
              source={{
                uri:
                  post.author?.photo_url ||
                  "https://www.investiiapp.com/investi-logo-new-main.png",
              }}
              style={styles.authorAvatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{post.author?.username || "Usuario"}</Text>
              <Text style={styles.postTime}>2h</Text>
            </View>
            <TouchableOpacity>
              <MoreHorizontal size={20} color="#667" />
            </TouchableOpacity>
          </View>

          <Text style={styles.postContent}>{post.contenido}</Text>

          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Heart size={20} color="#667" />
              <Text style={styles.actionText}>{post.likes_count || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={20} color="#667" />
              <Text style={styles.actionText}>{post.comment_count || 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share size={20} color="#667" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>{t("postDetail.comments")}</Text>
          {post.comments?.map((comment: any, index: number) => (
            <View key={index} style={styles.commentItem}>
              <Image
                source={{
                  uri: comment.author?.photo_url || "https://www.investiiapp.com/investi-logo-new-main.png",
                }}
                style={styles.commentAvatar}
              />
              <View style={styles.commentContent}>
                <Text style={styles.commentAuthor}>{comment.author?.username || "Usuario"}</Text>
                <Text style={styles.commentText}>{comment.contenido}</Text>
                <Text style={styles.commentTime}>1h</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.commentInputContainer}>
        <Image
          source={{
            uri: "https://www.investiiapp.com/investi-logo-new-main.png",
          }}
          style={styles.inputAvatar}
        />
        <TextInput
          style={styles.commentInput}
          placeholder={t("postDetail.writeComment")}
          placeholderTextColor="#999"
          value={comment}
          onChangeText={setComment}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleComment}>
          <Text style={styles.sendButtonText}>{t("postDetail.send")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  scrollView: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  postTime: {
    fontSize: 14,
    color: "#667",
  },
  postContent: {
    fontSize: 16,
    color: "#111",
    lineHeight: 22,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#667",
  },
  commentsContainer: {
    backgroundColor: "white",
    padding: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  commentText: {
    fontSize: 14,
    color: "#111",
    lineHeight: 20,
    marginVertical: 2,
  },
  commentTime: {
    fontSize: 12,
    color: "#667",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 12,
  },
  sendButtonText: {
    color: "#2673f3",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
