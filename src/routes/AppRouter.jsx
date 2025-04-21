import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import DoctorListPage from "../pages/DoctorListPage/DoctorListPage";
import PrescriptionsPage from "../pages/PrescriptionsPage/PrescriptionsPage";
import ChatPage from "../pages/ChatPage/ChatPage";
import AppointmentsPage from "../pages/AppointmentsPage/AppointmentsPage";
import VideoCallPage from "../pages/VideoCallPage/VideoCallPage";
import LandingPage from "../pages/LandingPage/LandingPage";
import Sidebar from "../components/Sidebar/Sidebar";
import Notifications from "../components/Notifications";
import styles from "./AppRouter.module.css";
import PrivateRoute from "./PrivateRoute";
import AIAssistantWidget from "../components/AIAssistant/AIAssistantWidget";

const Layout = ({ children }) => {
  const location = useLocation();

  // Визначаємо, чи це публічна сторінка
  const isPublicRoute =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/";

  const isChatPage = location.pathname.startsWith("/chat");
  return (
    <div className={styles.container}>
      {!isPublicRoute && <Sidebar />}
      <div className={isPublicRoute ? styles.fullContent : styles.content}>
        {children}
        {/* AI-помічник тільки на захищених сторінках */}
        {!isPublicRoute && !isChatPage && <AIAssistantWidget />}
      </div>
    </div>
  );
};

function AppRouter() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Публічні маршрути */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<LandingPage />} />

          {/* Приватні маршрути */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:role/:id"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/patient/:id/prescriptions"
            element={
              <PrivateRoute>
                <PrescriptionsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctors"
            element={
              <PrivateRoute>
                <DoctorListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <PrivateRoute>
                <AppointmentsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/video/:callId"
            element={
              <PrivateRoute>
                <VideoCallPage />
              </PrivateRoute>
            }
          />
          {/* Редирект для всіх інших */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
      <Notifications />
    </Router>
  );
}

export default AppRouter;
