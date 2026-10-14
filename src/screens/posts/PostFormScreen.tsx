import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import CommonInput from "../../commonComponents/CommonInput";
import type { RootStackParamList } from "../../navigation/types";
import type { Post, PostInput } from "../apiService/types";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  createPost,
  updateLocalPost,
  updatePost,
} from "../../store/postsSlice";

type PostFormValues = Pick<Post, "title" | "body">;
type UpdateMethod = "PUT" | "PATCH";

type PostFormScreenProps = {
  existingPost?: Post;
};

const PostFormScreen = ({ existingPost }: PostFormScreenProps) => {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const createStatus = useAppSelector(state => state.posts.createStatus);
  const updateStatus = useAppSelector(state => state.posts.updateStatus);
  const locallyCreatedIds = useAppSelector(
    state => state.posts.locallyCreatedIds,
  );
  const isLocallyCreated = existingPost
    ? locallyCreatedIds.includes(existingPost.id)
    : false;
  const [method, setMethod] = useState<UpdateMethod>("PUT");
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PostFormValues>({
    defaultValues: {
      title: existingPost?.title ?? "",
      body: existingPost?.body ?? "",
    },
    mode: "onTouched",
  });
  const isSubmitting = existingPost
    ? !isLocallyCreated && updateStatus === "loading"
    : createStatus === "loading";

  const onSubmit = async (values: PostFormValues) => {
    const title = values.title.trim();
    const body = values.body.trim();

    try {
      if (!existingPost) {
        const newPost: PostInput = { title, body, userId: 1 };
        await dispatch(createPost(newPost)).unwrap();
        Alert.alert("Post created", "Your post was created successfully.");
      } else {
        const updateFields =
          method === "PUT"
            ? {
                title,
                body,
                userId: existingPost.userId,
              }
            : {
                ...(title !== existingPost.title ? { title } : {}),
                ...(body !== existingPost.body ? { body } : {}),
              };

        if (method === "PATCH" && Object.keys(updateFields).length === 0) {
          Alert.alert("No changes", "Change the title or body before saving.");
          return;
        }

        if (isLocallyCreated) {
          dispatch(updateLocalPost({ id: existingPost.id, ...updateFields }));
        } else {
          await dispatch(
            updatePost({
              postId: existingPost.id,
              method,
              post: updateFields,
            }),
          ).unwrap();
        }
        Alert.alert(
          "Post updated",
          `Your post was updated successfully using ${method}.`,
        );
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        existingPost ? "Unable to update post" : "Unable to create post",
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>
          {existingPost ? "Edit post" : "Create post"}
        </Text>

        {existingPost && (
          <View style={styles.methodPicker}>
            <Text style={styles.label}>Update method</Text>
            <View style={styles.methodOptions}>
              {(["PUT", "PATCH"] as const).map(option => (
                <TouchableOpacity
                  accessibilityRole="radio"
                  accessibilityState={{ checked: method === option }}
                  key={option}
                  onPress={() => setMethod(option)}
                  style={[
                    styles.methodButton,
                    method === option && styles.methodButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.methodText,
                      method === option && styles.methodTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.methodHint}>
              {method === "PUT"
                ? "PUT sends the full post resource."
                : "PATCH sends only fields changed from the original."}
            </Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <Controller
            control={control}
            name="title"
            rules={{
              required: "Title is required.",
              validate: value =>
                value.trim().length > 0 || "Title is required.",
            }}
            render={({ field: { onBlur, onChange, value } }) => (
              <CommonInput
                accessibilityLabel="Post title"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Enter a title"
                style={[styles.input, errors.title && styles.inputError]}
                value={value}
              />
            )}
          />
          {errors.title && (
            <Text style={styles.error}>{errors.title.message}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Body</Text>
          <Controller
            control={control}
            name="body"
            rules={{
              required: "Body is required.",
              validate: value => value.trim().length > 0 || "Body is required.",
            }}
            render={({ field: { onBlur, onChange, value } }) => (
              <CommonInput
                accessibilityLabel="Post body"
                multiline
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="Write your post"
                returnKeyType="default"
                style={[
                  styles.input,
                  styles.bodyInput,
                  errors.body && styles.inputError,
                ]}
                textAlignVertical="top"
                value={value}
              />
            )}
          />
          {errors.body && (
            <Text style={styles.error}>{errors.body.message}</Text>
          )}
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={() => handleSubmit(onSubmit)()}
          style={[styles.submitButton, isSubmitting && styles.disabled]}
        >
          <Text style={styles.submitText}>
            {isSubmitting
              ? "Saving..."
              : existingPost
                ? `Save with ${method}`
                : "Create post"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F9FAFB",
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 36,
  },
  heading: {
    color: "#111827",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 28,
  },
  methodPicker: {
    marginBottom: 24,
  },
  methodOptions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  methodButton: {
    alignItems: "center",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  methodButtonSelected: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  methodText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  methodTextSelected: {
    color: "#FFFFFF",
  },
  methodHint: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderColor: "#D1D5DB",
  },
  bodyInput: {
    minHeight: 150,
  },
  inputError: {
    borderColor: "#DC2626",
  },
  error: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: 6,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    justifyContent: "center",
    marginTop: 8,
    minHeight: 50,
  },
  disabled: {
    opacity: 0.65,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PostFormScreen;
