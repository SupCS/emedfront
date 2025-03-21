import { axiosInstance, handleRequest } from "./axiosInstance";

// Створення appointment
export const createAppointment = async (doctorId, date, startTime, endTime) => {
    return handleRequest(
        axiosInstance.post("/appointments/create", {
            doctorId,
            date,
            startTime,
            endTime
        })
    );
};

// Отримати майбутні апоінтменти для пацієнта
export const getPatientAppointments = async (patientId) => {
    return handleRequest(
        axiosInstance.get(`/appointments/patient/${patientId}`)
    );
};

// Отримати майбутні апоінтменти для доктора
export const getDoctorAppointments = async (doctorId) => {
    return handleRequest(
        axiosInstance.get(`/appointments/doctor/${doctorId}`)
    );
};