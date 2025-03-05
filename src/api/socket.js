import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem("authToken"),
  },
  autoConnect: false,
});

export const connectSocket = () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    console.log("🔴 No auth token found, cannot connect to WebSocket.");
    return;
  }

  if (!socket.connected) {
    socket.auth.token = token; // Оновлюємо токен
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
    socket.emit("joinChat", { chatId });
  }
};

export const sendMessageSocket = (chatId, content) => {
  if (socket.connected) {
    socket.emit("sendMessage", { chatId, content });
  }
};
