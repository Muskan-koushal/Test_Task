import { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import type { RootStackParamList } from "../../navigation/types";
import type { AppDispatch, RootState } from "../../store/store";
import {
  fetchPostComments,
  fetchPostDetails,
} from "../../store/postDetailsSlice";
import { deletePost } from "../../store/postsSlice";

const PostDetailsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } =
    useRoute<RouteProp<RootStackParamList, "PostDetails">>();
  const { items: posts, locallyCreatedIds } = useSelector(
    (state: RootState) => state.posts,
  );
  const localPost = locallyCreatedIds.includes(params.postId)
    ? posts.find(item => item.id === params.postId)
    : undefined;
  const { comments, commentsError, commentsStatus, post, postError, postStatus } =
    useSelector((state: RootState) => state.postDetails);
  const deleteStatus = useSelector(
    (state: RootState) => state.posts.deleteStatus,
  );

  useEffect(() => {
    void dispatch(fetchPostDetails({ postId: params.postId, localPost }));
    void dispatch(
      fetchPostComments({
        postId: params.postId,
        isLocalPost: localPost !== undefined,
      }),
    );
  }, [dispatch, localPost, params.postId]);

  if (postStatus === "idle" || postStatus === "loading") {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color="#4F46E5" size="large" />
        <Text style={styles.stateText}>Loading post...</Text>
      </View>
    );
  }

  if (postStatus === "failed" || !post) {
    return (
      <View style={styles.centerState}>
        <Text accessibilityRole="alert" style={styles.errorTitle}>
          Unable to load post
        </Text>
        <Text style={styles.stateText}>{postError}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => {
            void dispatch(fetchPostDetails({ postId: params.postId, localPost }));
          }}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const confirmDelete = () => {
    if (deleteStatus === "loading") {
      return;
    }

    Alert.alert(
      "Delete post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deletePost(post.id)).unwrap();
              Alert.alert("Post deleted", "The post was deleted.");
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                "Unable to delete post",
                error instanceof Error ? error.message : String(error),
              );
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.postActions}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.navigate("EditPost", { post })}
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>Edit post</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          disabled={deleteStatus === "loading"}
          onPress={confirmDelete}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>
            {deleteStatus === "loading" ? "Deleting..." : "Delete post"}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.postNumber}>POST #{post.id}</Text>
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.metadata}>
        Post ID: {post.id}{"\n"}User ID: {post.userId}
      </Text>
      <Text style={styles.body}>{post.body}</Text>

      <View style={styles.commentsHeading}>
        <Text style={styles.sectionTitle}>Comments</Text>
        {commentsStatus === "loading" && (
          <ActivityIndicator color="#4F46E5" />
        )}
      </View>

      {commentsStatus === "failed" && (
        <View>
          <Text accessibilityRole="alert" style={styles.commentError}>
            {commentsError}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => {
              void dispatch(
                fetchPostComments({
                  postId: params.postId,
                  isLocalPost: localPost !== undefined,
                }),
              );
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Retry comments</Text>
          </TouchableOpacity>
        </View>
      )}

      {commentsStatus === "succeeded" && comments.length === 0 && (
        <Text style={styles.stateText}>No comments for this post.</Text>
      )}

      {comments.map(comment => (
        <View key={comment.id} style={styles.commentCard}>
          <Text style={styles.commentName}>{comment.name}</Text>
          <Text style={styles.commentEmail}>{comment.email}</Text>
          <Text style={styles.commentBody}>{comment.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F9FAFB",
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  postActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
  editButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    borderColor: "#DC2626",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  deleteButtonText: {
    color: "#B91C1C",
    fontSize: 14,
    fontWeight: "600",
  },
  postNumber: {
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 24,
  },
  title: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
    marginBottom: 16,
    textTransform: "capitalize",
  },
  metadata: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  body: {
    color: "#4B5563",
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 32,
  },
  commentsHeading: {
    alignItems: "center",
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "700",
  },
  commentCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  commentName: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    textTransform: "capitalize",
  },
  commentEmail: {
    color: "#4F46E5",
    fontSize: 13,
    marginTop: 4,
  },
  commentBody: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  centerState: {
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  stateText: {
    color: "#6B7280",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: "center",
  },
  errorTitle: {
    color: "#B91C1C",
    fontSize: 18,
    fontWeight: "700",
  },
  commentError: {
    color: "#B91C1C",
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PostDetailsScreen;
