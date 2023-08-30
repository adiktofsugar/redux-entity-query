export default class PostDetail {
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
