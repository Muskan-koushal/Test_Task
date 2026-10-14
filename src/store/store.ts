import { configureStore } from "@reduxjs/toolkit";
import postDetailsReducer from "./postDetailsSlice";
import postsReducer from "./postsSlice";

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    postDetails: postDetailsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
