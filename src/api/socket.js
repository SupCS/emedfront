import { io } from "socket.io-client";
import { store } from "../store";
import { addNotification } from "../store/notificationsSlice";
import { incrementUnreadMessages } from "../store/unreadMessagesSlice";
import { incrementUnreadForChat } from "../store/chatListSlice";
import { addMessageToActiveChat } from "../store/activeChatMessagesSlice";
import { startAppointment } from "../store/activeAppointmentSlice";

const SOCKET_URL = "https://emed-backend-fc35c553180b.herokuapp.com/";

export const socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem("authToken"),
  },
  autoConnect: false,
  transports: ["websocket"],
});

export const connectSocket = () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    console.log("Токен не знайдено, підключення до WebSocket пропущено.");
    return;
  }

  if (socket.connected) {
    socket.disconnect();
    console.log("Старий WebSocket відключено перед повторним підключенням.");
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

  socket.off("newAppointmentRequest");
  socket.on("newAppointmentRequest", handleNewAppointmentRequest);

  socket.off("appointmentStatusChanged");
  socket.on("appointmentStatusChanged", handleAppointmentStatusChanged);

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

// Отримання нового повідомлення
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

// Початок прийому
const handleAppointmentStart = ({
  message,
  appointmentId,
  chatId,
  firestoreCallId,
}) => {
  store.dispatch(startAppointment({ callId: firestoreCallId }));

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

// Новий запит на прийом (для лікаря)
const handleNewAppointmentRequest = (appointment) => {
  store.dispatch(
    addNotification({
      id: `new-appt-${appointment._id}`,
      chatId: null,
      senderName: "Система",
      content: `Новий запит на прийом ${appointment.date} ${appointment.startTime}-${appointment.endTime}`,
      type: "newAppointmentRequest",
    })
  );
};

// Зміна статусу запису (для пацієнта)
const handleAppointmentStatusChanged = (appointment) => {
  store.dispatch(
    addNotification({
      id: `appt-status-${appointment._id}`,
      chatId: null,
      senderName: "Система",
      content: `Ваш запис на ${appointment.date} о ${
        appointment.startTime
      } було ${
        appointment.status === "confirmed" ? "підтверджено" : "скасовано"
      }.`,
      type: "appointmentStatusChanged",
    })
  );
};

if (localStorage.getItem("authToken")) {
  connectSocket();
}
