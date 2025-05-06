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
export const createPrescription = async (data, attachments = []) => {
  const formData = new FormData();

  // Додаємо всі текстові поля
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  // Додаємо файли з тайтлами (максимум 4)
  attachments.forEach((item, index) => {
    if (item.file && item.title) {
      formData.append("attachments", item.file); // сам файл
      formData.append(`attachments_title_${index}`, item.title); // тайтл до нього
    }
  });

  return handleRequest(
    axiosInstance.post(`/prescriptions/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );
};
