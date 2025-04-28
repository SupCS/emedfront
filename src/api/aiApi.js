import { axiosInstance, handleRequest } from "./axiosInstance";

export const sendMessageToAI = async (message) => {
  const res = await handleRequest(axiosInstance.post("/ai/chat", { message }));
  return res.response;
};
