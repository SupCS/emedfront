import { axiosInstance, handleRequest } from "./axiosInstance";

// Отримати список лікарів з фільтрацією
export const getDoctors = async (specializations, rating) => {
  const params = {};

  if (specializations?.length) {
    params.specialization = specializations.join(",");
  }

  if (rating) {
    params.rating = rating;
  }

  return handleRequest(axiosInstance.get("/doctors", { params }));
};

// Отримання деталей лікаря
export const getDoctorDetails = async (doctorId) => {
  return handleRequest(axiosInstance.get(`/doctors/details/${doctorId}`));
};
