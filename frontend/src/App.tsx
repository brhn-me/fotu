
import { ThemeProvider } from "./app/theme/ThemeContext";
import { AuthProvider } from "./app/auth/AuthContext";
import { PhotoProvider } from "./context/PhotoContext";
import { SelectionProvider } from "./context/SelectionContext";
import { JobProvider } from "./context/JobContext";
import { AppRoutes } from "./app/routes/AppRoutes";
import { BrowserRouter } from "react-router-dom";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SelectionProvider>
          <PhotoProvider>
            <JobProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </JobProvider>
          </PhotoProvider>
        </SelectionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
