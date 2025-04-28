import { io } from "socket.io-client";
import { store } from "../store";
import { addNotification } from "../store/notificationsSlice";
import { incrementUnreadMessages } from "../store/unreadMessagesSlice";
import { incrementUnreadForChat } from "../store/chatListSlice";
import { addMessageToActiveChat } from "../store/activeChatMessagesSlice";

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
    console.log("Токен не знайдено, підключення до WebSocket пропущено.");
    return;
  }

  socket.auth.token = token;

  if (!socket.connected) {
    socket.connect();
    console.log("WebSocket підключено.");
  }

  socket.off("receiveMessage");
  socket.on("receiveMessage", handleReceiveMessage);

  socket.off("appointmentStart");
  socket.on("appointmentStart", handleAppointmentStart);

  socket.off("connect_error");
  socket.on("connect_error", (err) => {
    console.error("Помилка WebSocket:", err);
  });

  socket.offAny();
  socket.onAny((event, ...args) => {
    console.log(`Подія від сервера: ${event}`, args);
  });
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("WebSocket відключено.");
  }
};

export const sendMessageSocket = (chatId, content, recipientId) => {
  if (socket.connected) {
    console.log(
      `Надсилання повідомлення: chatId=${chatId}, recipientId=${recipientId}, content="${content}"`
    );
    socket.emit("sendMessage", { chatId, content, recipientId });
  } else {
    console.error("WebSocket не підключено.");
  }
};

const handleReceiveMessage = (message) => {
  const currentChatId = localStorage.getItem("currentChatId");

  if (String(message.chat) === String(currentChatId)) {
    store.dispatch(addMessageToActiveChat(message));
  } else {
    store.dispatch(
      addNotification({
        id: message._id,
        chatId: message.chat,
        senderName: message.senderName,
        content: message.content,
        type: "chat",
      })
    );
    store.dispatch(incrementUnreadMessages());
    store.dispatch(incrementUnreadForChat(message.chat));
  }
};

const handleAppointmentStart = ({
  message,
  appointmentId,
  chatId,
  firestoreCallId,
}) => {
  store.dispatch(
    addNotification({
      id: `appt-${appointmentId}`,
      chatId,
      senderName: "Система",
      content: message,
      type: "appointment",
      firestoreCallId,
    })
  );
};

if (localStorage.getItem("authToken")) {
  connectSocket();
}
