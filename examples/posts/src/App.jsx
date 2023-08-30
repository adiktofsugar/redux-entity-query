import { Provider } from "react-redux";
import createStore from "./createStore.js";
import PostList from "./PostList.jsx";

export default function App() {
  return (
    <Provider store={createStore()}>
      <h1>Current Posts</h1>
      <PostList />
    </Provider>
  );
}
