import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import LoginForm from "../components/LoginForm";

function LoginPage() {
    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
        const data = await loginUser(email, password);
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userRole", data.role);
        navigate("/"); // Перенаправлення після логіну
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
