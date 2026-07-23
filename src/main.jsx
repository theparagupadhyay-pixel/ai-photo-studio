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
import PermissionGate from "./components/PermissionGate.jsx";

function UserPages() {
  return (
    <PermissionGate>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/photo-editor" element={<App />} />
        <Route
          path="/prompt-generator"
          element={<PromptGenerator />}
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </PermissionGate>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/*" element={<UserPages />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);