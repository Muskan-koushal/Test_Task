import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createPost as createPostRequest,
  deletePost as deletePostRequest,
  getPosts,
  updatePost as updatePostRequest,
} from "../screens/apiService/ApiService";
import type {
  Post,
  PostInput,
  UpdatedPostFields,
  UpdatePostInput,
} from "../screens/apiService/types";

type UpdatePostArgs = {
  postId: number;
  method: "PUT" | "PATCH";
  post: UpdatePostInput;
};

type PostsState = {
  items: Post[];
  locallyCreatedIds: number[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  createStatus: "idle" | "loading" | "succeeded" | "failed";
  createError: string | null;
  updateStatus: "idle" | "loading" | "succeeded" | "failed";
  updateError: string | null;
  deleteStatus: "idle" | "loading" | "succeeded" | "failed";
  deleteError: string | null;
};

const initialState: PostsState = {
  items: [],
  locallyCreatedIds: [],
  status: "idle",
  error: null,
  createStatus: "idle",
  createError: null,
  updateStatus: "idle",
  updateError: null,
  deleteStatus: "idle",
  deleteError: null,
};

export const fetchPosts = createAsyncThunk<
  Post[],
  void,
  { rejectValue: string }
>("posts/fetchPosts", async (_, { rejectWithValue }) => {
  try {
    return await getPosts();
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to load posts.",
    );
  }
});

export const createPost = createAsyncThunk<
  Post,
  PostInput,
  { rejectValue: string }
>("posts/createPost", async (post, { rejectWithValue }) => {
  try {
    return await createPostRequest(post);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to create post.",
    );
  }
});

export const updatePost = createAsyncThunk<
  UpdatedPostFields,
  UpdatePostArgs,
  { rejectValue: string }
>("posts/updatePost", async ({ postId, post, method }, { rejectWithValue }) => {
  try {
    return await updatePostRequest(postId, post, method);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to update post.",
    );
  }
});

export const deletePost = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("posts/deletePost", async (postId, { rejectWithValue }) => {
  try {
    return await deletePostRequest(postId);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to delete post.",
    );
  }
});

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    updateLocalPost: (
      state,
      action: { payload: UpdatedPostFields },
    ) => {
      if (!state.locallyCreatedIds.includes(action.payload.id)) {
        return;
      }
      state.items = state.items.map(post =>
        post.id === action.payload.id ? { ...post, ...action.payload } : post,
      );
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPosts.pending, state => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        const localPosts = state.items.filter(post =>
          state.locallyCreatedIds.includes(post.id),
        );
        state.items = [
          ...localPosts,
          ...action.payload.filter(
            post => !state.locallyCreatedIds.includes(post.id),
          ),
        ];
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Unable to load posts.";
      })
      .addCase(createPost.pending, state => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        if (!state.locallyCreatedIds.includes(action.payload.id)) {
          state.locallyCreatedIds.push(action.payload.id);
        }
        state.items = [
          action.payload,
          ...state.items.filter(post => post.id !== action.payload.id),
        ];
      })
      .addCase(createPost.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError =
          action.payload ?? action.error.message ?? "Unable to create post.";
      })
      .addCase(updatePost.pending, state => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.items = state.items.map(post =>
          post.id === action.payload.id ? { ...post, ...action.payload } : post,
        );
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError =
          action.payload ?? action.error.message ?? "Unable to update post.";
      })
      .addCase(deletePost.pending, state => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.items = state.items.filter(post => post.id !== action.payload);
        state.locallyCreatedIds = state.locallyCreatedIds.filter(
          id => id !== action.payload,
        );
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError =
          action.payload ?? action.error.message ?? "Unable to delete post.";
      });
  },
});

export const { updateLocalPost } = postsSlice.actions;

export default postsSlice.reducer;
