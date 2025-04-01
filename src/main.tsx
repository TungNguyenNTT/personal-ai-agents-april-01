
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Get the saved theme from localStorage or use dark as default
const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.classList.add(savedTheme);

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(<App />);
} else {
  console.error("Root element not found");
}
