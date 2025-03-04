import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem("authToken"), // Використовуємо той же токен, що й в `axiosInstance`
  },
  autoConnect: false, // Не підключатися автоматично
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.auth.token = localStorage.getItem("authToken"); // Оновлюємо токен при кожному підключенні
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const joinChat = (chatId) => {
  if (socket.connected) {
    console.log(`📩 Emitting joinChat for chatId: ${chatId}`);
    socket.emit("joinChat", { chatId });
  } else {
    console.log("🔴 Socket is not connected, cannot join chat.");
  }
};

export const sendMessageSocket = (chatId, content) => {
  if (socket.connected) {
    socket.emit("sendMessage", { chatId, content });
  }
};
