
import { ThemeProvider } from "./app/theme/ThemeContext";
import { AuthProvider } from "./app/auth/AuthContext";
import { PhotoProvider } from "./context/PhotoContext";
import { SelectionProvider } from "./context/SelectionContext";
import { AppRoutes } from "./app/routes/AppRoutes";
import { BrowserRouter } from "react-router-dom";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SelectionProvider>
          <PhotoProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </PhotoProvider>
        </SelectionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
