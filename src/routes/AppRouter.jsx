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
import DoctorListPage from "../pages/DoctorListPage";
import PrescriptionsPage from "../pages/PrescriptionsPage/PrescriptionsPage";
import ChatPage from "../pages/ChatPage/ChatPage";
import AppointmentsPage from "../pages/AppointmentsPage/AppointmentsPage";
import Sidebar from "../components/Sidebar/Sidebar";
import Notifications from "../components/Notifications";
import styles from "./AppRouter.module.css";
import PrivateRoute from "./PrivateRoute";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideSidebar =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className={styles.container}>
      {!hideSidebar && <Sidebar />}
      <div className={hideSidebar ? styles.fullContent : styles.content}>
        {children}
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
          {/* Редирект для всіх інших */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
      <Notifications />
    </Router>
  );
}

export default AppRouter;
