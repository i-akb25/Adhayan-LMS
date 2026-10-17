import { StrictMode } from "react";
import { MotionConfig } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // Assuming you have your Tailwind imports here

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </ErrorBoundary>
  </StrictMode>,
);
