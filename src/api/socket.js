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
    socket.auth.token = token;
    socket.connect();
    console.log("🟢 WebSocket connected");
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("🔴 WebSocket disconnected");
  }
};

export const sendMessageSocket = (chatId, content, recipientId) => {
  if (socket.connected) {
    socket.emit("sendMessage", { chatId, content, recipientId });
  } else {
    console.error("🔴 WebSocket is not connected");
  }
};

if (localStorage.getItem("authToken")) {
  connectSocket();
}
