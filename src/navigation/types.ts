import type { AuthUser } from "../utils/authStorage";
import type { Post } from "../screens/apiService/types";

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Home: { user: AuthUser };
  PostDetails: { postId: number };
  CreatePost: undefined;
  EditPost: { post: Post };
};
