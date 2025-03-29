import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add custom Tailwind styles for the vintage look
import { createTheme } from "@/lib/utils";

// Create and apply the theme
createTheme({
  extend: {
    colors: {
      burgundy: "#7d2240",
      gold: "#d4a95e",
      cream: "#f9f5f0",
      beige: "#f0ebe3",
      darkbrown: "#3a2c24",
      softteal: "#5a9a9d",
      mutedred: "#b8405e"
    },
    fontFamily: {
      'playfair': ['"Playfair Display"', 'serif'],
      'lora': ['Lora', 'serif'],
      'roboto-slab': ['"Roboto Slab"', 'serif']
    },
    boxShadow: {
      'vintage': '0 4px 6px -1px rgba(58, 44, 36, 0.1), 0 2px 4px -1px rgba(58, 44, 36, 0.06)',
      'vintage-lg': '0 10px 15px -3px rgba(58, 44, 36, 0.1), 0 4px 6px -2px rgba(58, 44, 36, 0.05)'
    }
  }
});

createRoot(document.getElementById("root")!).render(<App />);
