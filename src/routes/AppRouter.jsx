import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/ProfilePage";
import DoctorListPage from "../pages/DoctorListPage"

function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile/:role/:id" element={<ProfilePage />} />
                <Route path="/doctors" element={<DoctorListPage />} />
            </Routes>
        </Router>
    );
}

export default AppRouter;
