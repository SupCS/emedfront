// 📄 socket.js
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
    console.log("🔴 No auth token found, cannot connect to WebSocket.");
    return;
  }

  // 🔄 Оновлюємо токен
  socket.auth.token = token;

  // 🔌 Підключення
  if (!socket.connected) {
    socket.connect();
    console.log("🟢 WebSocket connected");
  }

  // 💬 Подія нове повідомлення
  socket.off("receiveMessage"); // очищуємо попередні
  socket.on("receiveMessage", (message) => {
    console.log("📩 Отримано подію receiveMessage!", message);

    const currentChatId = localStorage.getItem("currentChatId");
    console.log("📌 Поточний відкритий чат:", currentChatId);

    if (String(message.chat) === String(currentChatId)) {
      console.log("💬 Додаємо повідомлення в активний чат");
      store.dispatch(addMessageToActiveChat(message));
      // Не підвищуємо лічильники
    } else {
      console.log(
        "🔔 Чат не активний — оновлюємо лічильники і додаємо сповіщення"
      );
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
  });

  // 📅 Початок прийому
  socket.off("appointmentStart");
  socket.on(
    "appointmentStart",
    ({ message, appointmentId, chatId, firestoreCallId }) => {
      console.log("📅 Отримано сповіщення про початок прийому:", {
        message,
        appointmentId,
        chatId,
        firestoreCallId,
      });

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
    }
  );

  socket.off("connect_error");
  socket.on("connect_error", (err) => {
    console.error("🔴 Помилка WebSocket:", err);
  });

  socket.offAny(); // Очищаємо попередні onAny
  socket.onAny((event, ...args) => {
    console.log(`📡 Подія від сервера: ${event}`, args);
  });
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("🔴 WebSocket disconnected");
  }
};

export const sendMessageSocket = (chatId, content, recipientId) => {
  if (socket.connected) {
    console.log(
      `📤 Відправка повідомлення: chatId=${chatId}, recipientId=${recipientId}, content="${content}"`
    );
    socket.emit("sendMessage", { chatId, content, recipientId });
  } else {
    console.error("🔴 WebSocket is not connected");
  }
};

// Підключення одразу після завантаження, якщо є токен
if (localStorage.getItem("authToken")) {
  connectSocket();
}
