import PostList from "./PostList.js";
import PostListItem from "./PostListItem.js";

export class PostListResponse {
  /**
   * @param {PostList} postList
   */
  constructor(postList) {
    this.postList = postList;
  }
}

/**
 *
 * @param {string} token
 */
export default async function fetchPostList(token) {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
    headers: { authorization: token },
  });
  if (!res.ok) throw new Error("bad response");
  const posts = /** @type {any[]} */ (await res.json());
  return new PostList({
    posts: posts.map((p) => new PostListItem({ id: p.id, message: p.title })),
  });
}
