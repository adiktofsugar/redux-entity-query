import { createRoot } from "react-dom/client";
import App from "./App.jsx";

let el = document.getElementById("root");
if (!el) {
  el = document.createElement("div");
  el.id = "root";
  document.body.appendChild(el);
}

createRoot(el).render(<App />);
