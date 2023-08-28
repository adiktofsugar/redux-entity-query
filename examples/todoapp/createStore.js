import EntityQuery from "../../EntityQuery";

class PostListItem {
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


class PostListResponse {
    /**
     * 
     * @param {object} param
     * @param {PostListItem[]} param.posts
     */
    constructor({ posts }) {
        this.posts = posts;
    }
}

/**
 * 
 * @param {string} token 
 */
async function fetchPostList(token) {
    const res = await fetch('/posts', { headers: {
        authorization: token
    }});
    if (!res.ok) throw new Error('bad response');
    const { posts  } = await res.json();
    return new PostListResponse({ posts });
}

class PostDetail {
    /**
     * 
     * @param {object} param
     * @param {string} param.id
     * @param {string} param.message
     * @param {Date} param.created
     */
    constructor({ id, message, created }) {
        this.id = id;
        this.message = message;
        this.created = created;
    }
}
class PostDetailResponse {
    /**
     * 
     * @param {object} param 
     * @param {PostDetail} param.post 
     */
    constructor({ post }) {
        this.post = post;
    }
}

async function fetchPostDetail(token, id) {
    return new PostDetailResponse({ post: new PostDetail({ id, message: 'yeah', created: new Date() }) });
}

/**
 * @typedef {object} GlobalState
 * @property {string} token
 */

const postListQuery = new EntityQuery(['postList'], 
    () => (getState) => {
        const gs = getState();
        return fetchPostList(gs.token);
    },
);
postListQuery.actions.ensure();

const postQuery = new EntityQuery(['posts'],
    /** @param {string} id */
    (id) => (getState) => fetchPostDetail('token', id));

postQuery.actions.exec('12');

const { complete, error, result } = postQuery.selectors.selectOne({}, '2');