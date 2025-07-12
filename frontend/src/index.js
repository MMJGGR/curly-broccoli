import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const origFetch = window.fetch;
window.fetch = (url, opts = {}) => {
  const headers = { ...(opts.headers || {}) };
  if (localStorage.jwt) {
    headers["Authorization"] = `Bearer ${localStorage.jwt}`;
  }
  return origFetch(url, { ...opts, headers });
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
