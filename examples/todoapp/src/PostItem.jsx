/* eslint-disable no-nested-ternary */
import PropTypes from "prop-types";
import { useState } from "react";
import { useSelector, useStore } from "react-redux";
import PostListItem from "./data/PostListItem.js";
import { postDetailQuery } from "./createStore.js";
import LoadingView from "./LoadingView.jsx";
import ErrorView from "./ErrorView.jsx";

const propTypes = {
  postListItem: PropTypes.instanceOf(PostListItem).isRequired,
};

/** @param {import('prop-types').InferProps<propTypes>} props */
export default function PostItem({ postListItem }) {
  const [expanded, setExpanded] = useState(false);
  const ensure = postDetailQuery.useEnsure(useStore());
  const { result, pending, error } = useSelector((state) =>
    postDetailQuery.selectors.selectOne(state, postListItem.id)
  );

  /** @type {import("react").MouseEventHandler} */
  function handleExpandToggle(e) {
    e.preventDefault();
    ensure(postListItem.id);
    setExpanded((cur) => !cur);
  }

  const details = pending ? (
    <LoadingView />
  ) : error ? (
    <ErrorView error={error} />
  ) : result ? (
    <p>{result.post.message}</p>
  ) : null;

  return (
    <div>
      {expanded ? details : <p>{postListItem.message}</p>}
      <div>
        <button type="button" onClick={handleExpandToggle}>
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>
    </div>
  );
}

PostItem.propTypes = propTypes;
