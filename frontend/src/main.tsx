import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PhotoProvider } from "./context/PhotoContext";
import { SettingsProvider } from "./context/SettingsContext";
import { AppRoutes } from "./app/routes/AppRoutes";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <PhotoProvider>
          <AppRoutes />
        </PhotoProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
