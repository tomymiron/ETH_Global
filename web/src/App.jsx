import { UserLogin, UserRegister, UserProfile } from "./screens/user";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth as useAuthUser } from "./contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RegisterProvider } from "./contexts/RegisterContext";
import { Events, Event, Landing, Privacy, Terms, Success } from "./screens";
import { ToastContainer } from "material-react-toastify";
import "material-react-toastify/dist/ReactToastify.css";
import { AnimatePresence } from "framer-motion";
import { FilterProvider } from "./contexts/FilterContext";

const queryClient = new QueryClient();

export default function App() {
  return (
        <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <FilterProvider>
                <RegisterProvider>
                  <ToastContainer />
                  <Router>
                    <AppRoutes />
                  </Router>
                </RegisterProvider>
                </FilterProvider>
              </AuthProvider>
        </QueryClientProvider>
    );
}

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<HandlerUserLogin component={<UserLogin />} />} />
      <Route path="/register" element={<HandlerUserLogin component={<UserRegister />} />} />
      <Route path="/profile" element={<ProtectedUserRoute component={<UserProfile />} />} />
    </Routes>
  )
}

function AppRoutes() {
    const location = useLocation();

    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          <Route path="/" element={<Landing />} />
          <Route path="/user/*" element={<UserRoutes />} />

          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          <Route path="/events" element={<Events />} />
          <Route path="/event" element={<Event />} />
          <Route path="/success" element={<Success />} />

        </Routes>
      </AnimatePresence>
    );
}

function ProtectedUserRoute({ component }) {
  const { authState } = useAuthUser();

  if (authState?.authenticated == null) {
    return <div>Cargando...</div>;
  }
    
  return authState.authenticated && authState.user ? component : <Navigate to="/user/login" />;
}

function HandlerUserLogin({ component }) {
  const { authState } = useAuthUser();

  if (authState?.authenticated == null) {
    return <div>Cargando...</div>;
  }
  
  return authState.authenticated && authState.user ? <Navigate to="/events" /> : component;
}