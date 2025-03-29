import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Note: Theme settings are configured in theme.json at the project root

createRoot(document.getElementById("root")!).render(<App />);
