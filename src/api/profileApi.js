import { axiosInstance, handleRequest } from "./axiosInstance";

export const getUserProfile = async (role, userId) => {
  return handleRequest(axiosInstance.get(`/profile/${role}/${userId}`));
};

export const updateUserProfile = async (data) => {
  return handleRequest(axiosInstance.patch("/profile/update", data));
};
