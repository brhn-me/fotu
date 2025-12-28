import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PhotoProvider } from "./context/PhotoContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ThemeProvider } from "./app/theme/ThemeContext";
import { SelectionProvider } from "./context/SelectionContext";
import { JobProvider } from "./context/JobContext";
import { AppRoutes } from "./app/routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <ThemeProvider>
          <PhotoProvider>
            <SelectionProvider>
              <JobProvider>
                <AppRoutes />
                <Toaster position="bottom-right" />
              </JobProvider>
            </SelectionProvider>
          </PhotoProvider>
        </ThemeProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
