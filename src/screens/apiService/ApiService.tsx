import type {
  Post,
  PostComment,
  PostInput,
  UpdatedPostFields,
  UpdatePostInput,
} from "./types";

export type {
  Post,
  PostComment,
  PostInput,
  UpdatedPostFields,
  UpdatePostInput,
} from "./types";

const API_URL = "https://jsonplaceholder.typicode.com";

const isPost = (value: unknown): value is Post => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const post = value as Record<string, unknown>;
  return (
    typeof post.id === "number" &&
    typeof post.userId === "number" &&
    typeof post.title === "string" &&
    typeof post.body === "string"
  );
};

const isPostComment = (value: unknown): value is PostComment => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const comment = value as Record<string, unknown>;
  return (
    typeof comment.id === "number" &&
    typeof comment.postId === "number" &&
    typeof comment.name === "string" &&
    typeof comment.email === "string" &&
    typeof comment.body === "string"
  );
};

const getJson = async (url: string): Promise<unknown> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (HTTP ${response.status}).`);
  }
  return response.json();
};

const sendJson = async (
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: object,
): Promise<unknown> => {
  const response = await fetch(url, {
    method,
    headers: body
      ? { "Content-Type": "application/json; charset=UTF-8" }
      : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`Request failed (HTTP ${response.status}).`);
  }
  if (method === "DELETE" || response.status === 204) {
    return null;
  }
  return response.json();
};

export const getPosts = async (): Promise<Post[]> => {
  const data = await getJson(`${API_URL}/posts`);
  if (!Array.isArray(data) || !data.every(isPost)) {
    throw new Error("The posts response has an unexpected format.");
  }
  return data;
};

export const getPostById = async (postId: number): Promise<Post> => {
  const data = await getJson(`${API_URL}/posts/${postId}`);
  if (!isPost(data)) {
    throw new Error("The post response has an unexpected format.");
  }
  return data;
};

export const getCommentsByPostId = async (
  postId: number,
): Promise<PostComment[]> => {
  const data = await getJson(`${API_URL}/posts/${postId}/comments`);
  if (!Array.isArray(data) || !data.every(isPostComment)) {
    throw new Error("The comments response has an unexpected format.");
  }
  return data;
};

export const createPost = async (post: PostInput): Promise<Post> => {
  const data = await sendJson(`${API_URL}/posts`, "POST", post);
  if (!isPost(data)) {
    throw new Error("The created post response has an unexpected format.");
  }
  return data;
};

export const updatePost = async (
  postId: number,
  post: UpdatePostInput,
  method: "PUT" | "PATCH",
): Promise<UpdatedPostFields> => {
  if (
    method === "PUT" &&
    (typeof post.title !== "string" ||
      typeof post.body !== "string" ||
      typeof post.userId !== "number")
  ) {
    throw new Error("PUT requires a complete post resource.");
  }
  const requestBody = method === "PUT" ? { id: postId, ...post } : post;
  await sendJson(
    `${API_URL}/posts/${postId}`,
    method,
    requestBody,
  );
  return { id: postId, ...post };
};

export const deletePost = async (postId: number): Promise<number> => {
  await sendJson(`${API_URL}/posts/${postId}`, "DELETE");
  return postId;
};