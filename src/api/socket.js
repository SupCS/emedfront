import { io } from "socket.io-client";
import { store } from "../store";
import { addNotification } from "../store/notificationsSlice";

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

    socket.on("receiveMessage", (message) => {
      console.log("📩 Отримано подію receiveMessage!", message);

      const currentChatId = localStorage.getItem("currentChatId");
      console.log("📌 Поточний відкритий чат:", currentChatId);

      if (String(message.chat) !== String(currentChatId)) {
        console.log("🔔 Викликаємо store.dispatch(addNotification)");

        store.dispatch(
          addNotification({
            id: message._id,
            chatId: message.chat,
            senderName: message.senderName,
            content: message.content,
            type: "chat",
          })
        );

        console.log("✅ Сповіщення відправлено в Redux");
      } else {
        console.log(
          "✅ Повідомлення для активного чату, сповіщення не потрібне."
        );
      }
    });

    socket.on(
      "appointmentStart",
      ({ message, appointmentId, chatId, firestoreCallId }) => {
        console.log("📅 Отримано сповіщення про початок прийому:", {
          message,
          appointmentId,
          chatId,
          firestoreCallId,
        });

        console.log("📥 Обробляємо appointmentStart подію!");
        console.log("🔻 Дані:", {
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

    socket.on("connect_error", (err) => {
      console.error("🔴 Помилка WebSocket:", err);
    });

    socket.onAny((event, ...args) => {
      console.log(`📡 Подія від сервера: ${event}`, args);
    });
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
    console.log(
      `📤 Відправка повідомлення: chatId=${chatId}, recipientId=${recipientId}, content="${content}"`
    );
    socket.emit("sendMessage", { chatId, content, recipientId });
  } else {
    console.error("🔴 WebSocket is not connected");
  }
};

// Підключаємо сокет, якщо є токен (щоб не втрачати зв’язок після оновлення сторінки)
if (localStorage.getItem("authToken")) {
  connectSocket();
}
