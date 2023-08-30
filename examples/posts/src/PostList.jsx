import { useStore, useSelector } from "react-redux";
import { postListQuery } from "./createStore.js";
import LoadingView from "./LoadingView.jsx";
import ErrorView from "./ErrorView.jsx";
import PostItem from "./PostItem.jsx";

export default function PostList() {
  postListQuery.useEnsured(useStore());
  const { pending, error, result } = useSelector((state) =>
    postListQuery.selectors.selectOne(state)
  );
  if (pending) return <LoadingView />;
  if (error) return <ErrorView error={error} />;
  if (!result) return null;
  return (
    <ul>
      {result.posts.map((post) => (
        <PostItem key={post.id} postListItem={post} />
      ))}
    </ul>
  );
}
