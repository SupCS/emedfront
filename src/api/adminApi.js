import { axiosInstance, handleRequest } from "./axiosInstance";

// Auth
export const loginAdmin = (email, password) =>
  handleRequest(axiosInstance.post("/admin/login", { email, password }));

export const getAdminProfile = () =>
  handleRequest(axiosInstance.get("/admin/profile"));

export const removeAvatar = (role, id) =>
  handleRequest(axiosInstance.delete(`/admin/avatar/${role}/${id}`));

// Doctors
export const getAllDoctors = (params) =>
  handleRequest(axiosInstance.get("/admin/doctors", { params }));

export const addDoctor = (doctorData) =>
  handleRequest(axiosInstance.post("/admin/doctors", doctorData));

export const deleteDoctor = (doctorId) =>
  handleRequest(axiosInstance.delete(`/admin/doctors/${doctorId}`));

export const blockDoctor = (doctorId) =>
  handleRequest(axiosInstance.patch(`/admin/doctors/${doctorId}/block`));

export const unblockDoctor = (doctorId) =>
  handleRequest(axiosInstance.patch(`/admin/doctors/${doctorId}/unblock`));

export const updateDoctor = (doctorId, updates) =>
  handleRequest(axiosInstance.patch(`/admin/doctors/${doctorId}`, updates));

// Patients
export const getAllPatients = (params) =>
  handleRequest(axiosInstance.get("/admin/patients", { params }));

export const blockPatient = (patientId) =>
  handleRequest(axiosInstance.patch(`/admin/patients/${patientId}/block`));

export const unblockPatient = (patientId) =>
  handleRequest(axiosInstance.patch(`/admin/patients/${patientId}/unblock`));

export const updatePatient = (patientId, updates) =>
  handleRequest(axiosInstance.patch(`/admin/patients/${patientId}`, updates));

// Appointments
export const getAllAppointments = () =>
  handleRequest(axiosInstance.get("/admin/appointments"));

export const cancelAppointment = (appointmentId) =>
  handleRequest(
    axiosInstance.patch(`/admin/appointments/${appointmentId}/cancel`)
  );

// Prescriptions
export const getAllPrescriptions = () =>
  handleRequest(axiosInstance.get("/admin/prescriptions"));

export const deletePrescription = (prescriptionId) =>
  handleRequest(axiosInstance.delete(`/admin/prescriptions/${prescriptionId}`));

// Stats
export const getAdminStats = (params) =>
  handleRequest(axiosInstance.get("/admin/stats", { params }));
