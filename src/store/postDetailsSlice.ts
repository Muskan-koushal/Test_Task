import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getCommentsByPostId,
  getPostById,
} from "../screens/apiService/ApiService";
import type { Post, PostComment } from "../screens/apiService/types";
import { updateLocalPost, updatePost } from "./postsSlice";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

type PostDetailsState = {
  activePostId: number | null;
  post: Post | null;
  postStatus: RequestStatus;
  postError: string | null;
  comments: PostComment[];
  commentsStatus: RequestStatus;
  commentsError: string | null;
};

const initialState: PostDetailsState = {
  activePostId: null,
  post: null,
  postStatus: "idle",
  postError: null,
  comments: [],
  commentsStatus: "idle",
  commentsError: null,
};

type FetchPostDetailsArgs = {
  postId: number;
  localPost?: Post;
};

type FetchPostCommentsArgs = {
  postId: number;
  isLocalPost?: boolean;
};

export const fetchPostDetails = createAsyncThunk<
  Post,
  FetchPostDetailsArgs,
  { rejectValue: string }
>("postDetails/fetchPost", async ({ postId, localPost }, { rejectWithValue }) => {
  try {
    if (localPost) {
      return localPost;
    }
    return await getPostById(postId);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to load post.",
    );
  }
});

export const fetchPostComments = createAsyncThunk<
  PostComment[],
  FetchPostCommentsArgs,
  { rejectValue: string }
>("postDetails/fetchComments", async ({ postId, isLocalPost }, { rejectWithValue }) => {
  try {
    if (isLocalPost) {
      return [];
    }
    return await getCommentsByPostId(postId);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to load comments.",
    );
  }
});

const postDetailsSlice = createSlice({
  name: "postDetails",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchPostDetails.pending, (state, action) => {
        const { postId } = action.meta.arg;
        const isDifferentPost = state.activePostId !== postId;
        state.activePostId = postId;
        state.post = null;
        state.postStatus = "loading";
        state.postError = null;
        if (isDifferentPost) {
          state.comments = [];
          state.commentsStatus = "idle";
          state.commentsError = null;
        }
      })
      .addCase(fetchPostDetails.fulfilled, (state, action) => {
        if (state.activePostId === action.meta.arg.postId) {
          state.post = action.payload;
          state.postStatus = "succeeded";
        }
      })
      .addCase(fetchPostDetails.rejected, (state, action) => {
        if (state.activePostId === action.meta.arg.postId) {
          state.postStatus = "failed";
          state.postError =
            action.payload ?? action.error.message ?? "Unable to load post.";
        }
      })
      .addCase(fetchPostComments.pending, (state, action) => {
        if (state.activePostId === action.meta.arg.postId) {
          state.comments = [];
          state.commentsStatus = "loading";
          state.commentsError = null;
        }
      })
      .addCase(fetchPostComments.fulfilled, (state, action) => {
        if (state.activePostId === action.meta.arg.postId) {
          state.comments = action.payload;
          state.commentsStatus = "succeeded";
        }
      })
      .addCase(fetchPostComments.rejected, (state, action) => {
        if (state.activePostId === action.meta.arg.postId) {
          state.commentsStatus = "failed";
          state.commentsError =
            action.payload ??
            action.error.message ??
            "Unable to load comments.";
        }
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        if (state.post?.id === action.payload.id) {
          state.post = { ...state.post, ...action.payload };
        }
      })
      .addCase(updateLocalPost, (state, action) => {
        if (state.post?.id === action.payload.id) {
          state.post = { ...state.post, ...action.payload };
        }
      });
  },
});

export default postDetailsSlice.reducer;
