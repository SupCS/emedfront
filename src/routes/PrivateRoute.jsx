import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("authToken");
  const toastId = "session-expired";

  const showToast = (message) => {
    if (!toast.isActive(toastId)) {
      toast.warn(message || "Сесія недійсна або закінчилася. Увійдіть знову.", {
        toastId,
      });
    }
  };

  if (!token) {
    showToast("Авторизуйтесь для доступу.");
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      showToast();
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      showToast("У вас немає доступу до цієї сторінки.");
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    showToast();
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;
