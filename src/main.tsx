// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Buffer } from "buffer"; // 👈 import buffer
window.Buffer = Buffer;          // 👈 make Buffer available globally

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
