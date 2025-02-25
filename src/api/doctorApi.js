import { axiosInstance, handleRequest } from "./axiosInstance";

// Отримати список лікарів з фільтрацією
export const getDoctors = async (specializations, rating) => {
    let query = "";

    if (specializations && specializations.length > 0) {
        query += `specialization=${specializations.join(",")}`; // Об'єднуємо в один рядок
    }

    if (rating) {
        query += `${query ? "&" : ""}rating=${rating}`;
    }

    return handleRequest(axiosInstance.get(`/doctors${query ? `?${query}` : ""}`));
};

// Отримання деталей лікаря
export const getDoctorDetails = async (doctorId) => {
    return handleRequest(axiosInstance.get(`/doctors/details/${doctorId}`));
};