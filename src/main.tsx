import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { SessionContextProvider } from "./components/SessionContextProvider.tsx"; // Import the new context provider

createRoot(document.getElementById("root")!).render(
  <SessionContextProvider>
    <App />
  </SessionContextProvider>
);