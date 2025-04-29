import axios from "axios";

const API_BASE_URL = "https://emed-backend-fc35c553180b.herokuapp.com/"; // Базовий URL бекенду

// Створюємо `axiosInstance` з базовими налаштуваннями
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Додаємо `Authorization` перед кожним запитом, якщо є токен
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Централізована обробка помилок
const handleRequest = async (request) => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: "Network error" };
  }
};

export { axiosInstance, handleRequest };
