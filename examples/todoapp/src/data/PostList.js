export default class PostList {
  /**
   *
   * @param {object} param
   * @param {import('./PostListItem.js').default[]} param.posts
   */
  constructor({ posts }) {
    this.posts = posts;
  }
}
