import { axiosInstance, handleRequest } from "./axiosInstance";

export const getUserProfile = async (role, userId) => {
    return handleRequest(axiosInstance.get(`/profile/${role}/${userId}`));
};
