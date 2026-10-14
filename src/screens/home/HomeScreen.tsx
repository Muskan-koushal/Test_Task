import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
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
import CommonInput from "../../commonComponents/CommonInput";
import type { RootStackParamList } from "../../navigation/types";
import type { Post } from "../apiService/types";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchPosts } from "../../store/postsSlice";
import { clearSession } from "../../utils/authStorage";

const HomeScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, "Home">>();
  const { error, items, status } = useSelector(
    (state: RootState) => state.posts,
  );
  const [search, setSearch] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    void dispatch(fetchPosts());
  }, [dispatch]);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) {
      return items;
    }
    return items.filter(post => post.title.toLocaleLowerCase().includes(query));
  }, [items, search]);

  const onRefresh = useCallback(() => {
    void dispatch(fetchPosts());
  }, [dispatch]);

  const signOut = async () => {
    setIsSigningOut(true);
    try {
      await clearSession();
      navigation.reset({ index: 0, routes: [{ name: "SignIn" }] });
    } catch (signOutError) {
      Alert.alert(
        "Unable to sign out",
        signOutError instanceof Error
          ? signOutError.message
          : "Please try again.",
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={() => navigation.navigate("PostDetails", { postId: item.id })}
      style={styles.postCard}
    >
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postPreview}>
        {item.body.length > 120 ? `${item.body.slice(0, 120)}...` : item.body}
      </Text>
    </TouchableOpacity>
  );

  const listHeader = (
    <View>
      <View style={styles.topBar}>
        <View style={styles.greeting}>
          <Text style={styles.heading}>Posts</Text>
          <Text style={styles.subtitle}>Welcome, {params.user.fullName}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => navigation.navigate("CreatePost")}
            style={styles.createButton}
          >
            <Text style={styles.createButtonText}>+ New post</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            disabled={isSigningOut}
            onPress={signOut}
            style={styles.signOutButton}
          >
            <Text style={styles.signOutText}>
              {isSigningOut ? "Signing out..." : "Sign out"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <CommonInput
        accessibilityLabel="Search posts by title"
        autoCapitalize="none"
        onChangeText={setSearch}
        placeholder="Search posts by title"
        returnKeyType="search"
        value={search}
      />
      {error && items.length > 0 && (
        <Text accessibilityRole="alert" style={styles.inlineError}>
          Could not refresh posts: {error}
        </Text>
      )}
    </View>
  );

  if (status === "loading" && items.length === 0) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color="#4F46E5" size="large" />
        <Text style={styles.stateText}>Loading posts...</Text>
      </View>
    );
  }

  if (status === "failed" && items.length === 0) {
    return (
      <View style={styles.centerState}>
        <Text accessibilityRole="alert" style={styles.errorTitle}>
          Unable to load posts
        </Text>
        <Text style={styles.stateText}>{error}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onRefresh}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.listContent}
      data={filteredPosts}
      keyExtractor={item => String(item.id)}
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          {items.length === 0
            ? "There are no posts to show."
            : "No posts match your search."}
        </Text>
      }
      ListHeaderComponent={listHeader}
      refreshControl={
        <RefreshControl
          colors={["#4F46E5"]}
          onRefresh={onRefresh}
          refreshing={status === "loading"}
          tintColor="#4F46E5"
        />
      }
      renderItem={renderPost}
      showsVerticalScrollIndicator={false}
      style={styles.screen}
    />
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F9FAFB",
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 32,
  },
  headerActions: {
    alignItems: "flex-end",
  },
  createButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  greeting: {
    flex: 1,
    marginRight: 12,
  },
  heading: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 4,
  },
  signOutButton: {
    padding: 8,
  },
  signOutText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "600",
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
    padding: 16,
  },
  postTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 23,
    marginBottom: 8,
    textTransform: "capitalize",
  },
  postPreview: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 21,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 15,
    paddingTop: 28,
    textAlign: "center",
  },
  inlineError: {
    color: "#B91C1C",
    fontSize: 13,
    marginTop: 12,
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
  retryButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default HomeScreen;
