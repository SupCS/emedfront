import axios from "axios";

const API_URL = "http://localhost:5000/profile";

export const getUserProfile = async (role, userId) => {
    try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${API_URL}/${role}/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { message: "Network error" };
    }
};
