import { axiosInstance, handleRequest } from "./axiosInstance";

// Створення appointment
export const createAppointment = async (doctorId, date, startTime, endTime) => {
  return handleRequest(
    axiosInstance.post("/appointments/create", {
      doctorId,
      date,
      startTime,
      endTime,
    })
  );
};

// Отримати майбутні апоінтменти для пацієнта
export const getPatientAppointments = async (patientId) => {
  return handleRequest(axiosInstance.get(`/appointments/patient/${patientId}`));
};

// Отримати майбутні апоінтменти для доктора
export const getDoctorAppointments = async (doctorId) => {
  return handleRequest(axiosInstance.get(`/appointments/doctor/${doctorId}`));
};

// Оновлення статусу appointment
export const updateAppointmentStatus = async (appointmentId, status) => {
  return handleRequest(
    axiosInstance.patch(`/appointments/${appointmentId}/status`, { status })
  );
};

// Скасування підтвердженого appointment
export const cancelConfirmedAppointment = async (appointmentId, reason) => {
  return handleRequest(
    axiosInstance.patch(`/appointments/${appointmentId}/cancel`, { reason })
  );
};
