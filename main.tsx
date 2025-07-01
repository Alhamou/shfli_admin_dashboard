import ReactDOM from "react-dom/client";
import App from "./app";
import "./index.css";
import { ThemeProvider } from "./src/context/theme";
import './src/i18n';

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode> // stop rendering twice in a row
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <App />
  </ThemeProvider>
  // </React.StrictMode>,
);
