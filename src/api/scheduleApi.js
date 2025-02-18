import { axiosInstance, handleRequest } from "./axiosInstance";

// Отримати розклад лікаря
export const getDoctorSchedule = async (doctorId) => {
    return handleRequest(axiosInstance.get(`/schedule/${doctorId}`));
};

// Додати новий слот
export const addDoctorSlot = async (date, slots) => {
    return handleRequest(axiosInstance.post(`/schedule/add`, { date, slots }));
};

// Видалити слот
export const removeDoctorSlot = async (date, startTime, endTime) => {
    return handleRequest(axiosInstance.delete(`/schedule/remove-slot`, { data: { date, startTime, endTime } }));
};