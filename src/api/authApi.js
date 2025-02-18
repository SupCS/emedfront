import { axiosInstance, handleRequest } from "./axiosInstance";

export const loginUser = async (email, password) => {
    return handleRequest(axiosInstance.post("/auth/login", { email, password }));
};

export const registerUser = async (formData) => {
    return handleRequest(axiosInstance.post("/auth/register", formData));
};
