import { axiosInstance, handleRequest } from "./axiosInstance";

// Отримати всі чати користувача
export const getUserChats = async (userId) => {
  return handleRequest(axiosInstance.get(`/chat/${userId}`));
};

// Отримати повідомлення для конкретного чату
export const getChatMessages = async (chatId) => {
  return handleRequest(axiosInstance.get(`chat/message/${chatId}`));
};

// Відправити повідомлення у чат
export const sendMessage = async (chatId, content) => {
  return handleRequest(axiosInstance.post("chat/message", { chatId, content }));
};

// Отримати кількість непрочитаних повідомлень
export const getUnreadCounts = async (userId) => {
  return handleRequest(axiosInstance.get(`/chat/unread/${userId}`));
};

// Позначити повідомлення як прочитані
export const markChatAsRead = async (chatId, userId) => {
  return handleRequest(axiosInstance.post(`/chat/read`, { chatId, userId }));
};
