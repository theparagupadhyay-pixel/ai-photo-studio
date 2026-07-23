 import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import Admin from "./Admin.jsx";
import Home from "./pages/Home.jsx";
import PromptGenerator from "./pages/PromptGenerator.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/photo-editor" element={<App />} />
        <Route
          path="/prompt-generator"
          element={<PromptGenerator />}
        />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);