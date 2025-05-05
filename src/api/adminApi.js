import { axiosInstance, handleRequest } from "./axiosInstance";

// Авторизація
export const loginAdmin = async (email, password) => {
  return handleRequest(axiosInstance.post("/admin/login", { email, password }));
};

export const getAdminProfile = async () => {
  return handleRequest(axiosInstance.get("/admin/profile"));
};

export const removeAvatar = async (role, id) => {
  return handleRequest(axiosInstance.delete(`/admin/avatar/${role}/${id}`));
};

// Лікарі
export const getAllDoctors = async (params) => {
  return handleRequest(axiosInstance.get("/admin/doctors", { params }));
};

export const addDoctor = async (doctorData) => {
  return handleRequest(axiosInstance.post("/admin/doctors", doctorData));
};

export const deleteDoctor = async (doctorId) => {
  return handleRequest(axiosInstance.delete(`/admin/doctors/${doctorId}`));
};

export const blockDoctor = async (doctorId) => {
  return handleRequest(axiosInstance.patch(`/admin/doctors/${doctorId}/block`));
};

export const unblockDoctor = async (doctorId) => {
  return handleRequest(
    axiosInstance.patch(`/admin/doctors/${doctorId}/unblock`)
  );
};

export const updateDoctor = async (doctorId, updates) => {
  return handleRequest(
    axiosInstance.patch(`/admin/doctors/${doctorId}`, updates)
  );
};

// Пацієнти
export const getAllPatients = async (params) => {
  return handleRequest(axiosInstance.get("/admin/patients", { params }));
};

export const blockPatient = async (patientId) => {
  return handleRequest(
    axiosInstance.patch(`/admin/patients/${patientId}/block`)
  );
};

export const unblockPatient = async (patientId) => {
  return handleRequest(
    axiosInstance.patch(`/admin/patients/${patientId}/unblock`)
  );
};

export const updatePatient = async (patientId, updates) => {
  return handleRequest(
    axiosInstance.patch(`/admin/patients/${patientId}`, updates)
  );
};

// Прийоми
export const getAllAppointments = async () => {
  return handleRequest(axiosInstance.get("/admin/appointments"));
};

export const cancelAppointment = async (appointmentId, reason) => {
  return handleRequest(
    axiosInstance.patch(`/admin/appointments/${appointmentId}/cancel`, {
      reason,
    })
  );
};

// Призначення
export const getAllPrescriptions = async () => {
  return handleRequest(axiosInstance.get("/admin/prescriptions"));
};

export const deletePrescription = async (prescriptionId) => {
  return handleRequest(
    axiosInstance.delete(`/admin/prescriptions/${prescriptionId}`)
  );
};

// Статистика
export const getAdminStats = async (params) => {
  return handleRequest(axiosInstance.get("/admin/stats", { params }));
};

export const getDoctorStats = async (doctorId, params) => {
  return handleRequest(
    axiosInstance.get(`/admin/stats/doctor/${doctorId}`, { params })
  );
};
