import { axiosInstance, handleRequest } from "./axiosInstance";

// Отримати всі призначення пацієнта
export const getPatientPrescriptions = async (patientId) => {
  return handleRequest(
    axiosInstance.get(`/prescriptions/patient/${patientId}`)
  );
};

// Отримати всі призначення, виписані лікарем
export const getDoctorPrescriptions = async (doctorId) => {
  return handleRequest(axiosInstance.get(`/prescriptions/doctor/${doctorId}`));
};

// Створити нове призначення
export const createPrescription = async ({
  patientId,
  diagnosis,
  treatment,
  validUntil,
}) => {
  return handleRequest(
    axiosInstance.post(`/prescriptions/create`, {
      patientId,
      diagnosis,
      treatment,
      validUntil,
    })
  );
};
