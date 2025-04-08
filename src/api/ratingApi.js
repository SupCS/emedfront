import { axiosInstance, handleRequest } from "./axiosInstance";

export const submitRating = async (appointmentId, value) => {
  return handleRequest(
    axiosInstance.post(`/ratings/${appointmentId}`, { value })
  );
};
