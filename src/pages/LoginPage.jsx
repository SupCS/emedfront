import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import LoginForm from "../components/LoginForm";

function LoginPage() {
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
        try {
            const data = await loginUser(email, password);
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("userRole", data.role);
            localStorage.setItem("userId", data.user.id);

            // Перенаправляємо на відповідний профіль
            const profilePath = data.role === "doctor" ? `/profile/doctor/${data.user.id}` : `/profile/patient/${data.user.id}`;
            navigate(profilePath);
        } catch (error) {
            console.error("Login error:", error.message);
        }
    };
    

    return (
        <div>
            <LoginForm onLogin={handleLogin} />
            <p>
                Don&apos;t have an account?{" "}
                <button onClick={() => navigate("/register")}>Register</button>
            </p>
        </div>
    );
}

export default LoginPage;
