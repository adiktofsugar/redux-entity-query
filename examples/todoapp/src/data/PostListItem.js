export default class PostListItem {
  /**
   *
   * @param {object} param
   * @param {string} param.id
   * @param {string} param.message
   */
  constructor({ id, message }) {
    this.id = id;
    this.message = message;
  }
}
