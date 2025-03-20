import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import DoctorListPage from "../pages/DoctorListPage";
import PrescriptionsPage from "../pages/PrescriptionsPage/PrescriptionsPage";
import ChatPage from "../pages/ChatPage/ChatPage";
import Sidebar from "../components/Sidebar/Sidebar";
import styles from "./AppRouter.module.css";
import Notifications from "../components/Notifications";

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
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile/:role/:id" element={<ProfilePage />} />
          <Route
            path="/profile/patient/:id/prescriptions"
            element={<PrescriptionsPage />}
          />
          <Route path="/doctors" element={<DoctorListPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </Layout>
      <Notifications />
    </Router>
  );
}

export default AppRouter;
