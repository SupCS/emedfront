import { axiosInstance } from "./axiosInstance";

export const sendMessageToAI = async (message) => {
  const response = await axiosInstance.post("/ai/chat", { message });
  return response.data.response;
};
