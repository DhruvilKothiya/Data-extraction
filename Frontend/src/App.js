import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import { useIsAuthenticated } from "./Auth/useAuth";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
    },
  },
});

function App() {
  const isAuthenticated = useIsAuthenticated();
  console.log("auth", isAuthenticated);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <HomePage /> : <Navigate to="/signin" replace />
            }
          />

          {/* If not authenticated, allow signin/signup access; otherwise redirect to / */}
          <Route
            path="/signin"
            element={
              !isAuthenticated ? <SignInPage /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/signup"
            element={
              !isAuthenticated ? <SignUpPage /> : <Navigate to="/" replace />
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
