export type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

export type PostComment = {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
};

export type PostInput = Pick<Post, "title" | "body" | "userId">;

export type UpdatePostInput = Partial<PostInput>;

export type UpdatedPostFields = Partial<Post> & Pick<Post, "id">;
