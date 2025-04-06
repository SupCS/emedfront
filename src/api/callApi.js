import { axiosInstance, handleRequest } from "./axiosInstance";

// Перевірка доступу до WebRTC-кімнати за callId
export const checkCallAccess = async (callId) => {
  return handleRequest(axiosInstance.get(`/calls/${callId}`));
};
