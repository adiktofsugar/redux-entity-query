export default class PostDetailResponse {
  /**
   *
   * @param {object} param
   * @param {import('./PostDetail.js').default} param.post
   */
  constructor({ post }) {
    this.post = post;
  }
}
