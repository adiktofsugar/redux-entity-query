import PostDetail from "./PostDetail.js";

export class PostDetailResponse {
  /**
   * @param {PostDetail} post
   */
  constructor(post) {
    this.post = post;
  }
}

/**
 * @param {string} token
 * @param {string} id
 */
export default async function fetchPostDetail(token, id) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  if (!res.ok) throw new Error("bad response");
  const post = /** @type {any} */ (await res.json());
  return new PostDetailResponse(
    new PostDetail({ id: post.id, message: post.body })
  );
}
