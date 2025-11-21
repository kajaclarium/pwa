import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./store/store.js";
import * as serviceWorkerRegistration from "./Serviceworkerregistration.js";




serviceWorkerRegistration.register(); // Register once here!

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
