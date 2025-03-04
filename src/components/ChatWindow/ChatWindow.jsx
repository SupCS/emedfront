import { useEffect, useState } from "react";
import { getChatMessages } from "../../api/chatApi";
import {
  socket,
  connectSocket,
  joinChat,
  sendMessageSocket,
} from "../../api/socket";
import styles from "./ChatWindow.module.css";

const ChatWindow = ({ chat, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!chat || !currentUser) return;

    // Підключаємо WebSocket (лише якщо ще не підключено)
    if (!socket.connected) {
      console.log("🟢 Connecting WebSocket...");
      connectSocket();
    }

    // Очікуємо підключення перед приєднанням до чату
    socket.on("connect", () => {
      console.log(`✅ WebSocket connected! Joining chat ${chat._id}`);
      joinChat(chat._id);
    });

    // Отримуємо історію повідомлень при першому завантаженні
    const fetchMessages = async () => {
      try {
        const data = await getChatMessages(chat._id);
        console.log("🔵 Messages fetched:", data);
        setMessages(data);
      } catch (err) {
        setError(err.message || "Не вдалося завантажити повідомлення.");
      }
    };

    fetchMessages();

    // Обробник події отримання нового повідомлення
    const handleReceiveMessage = (message) => {
      console.log("🟢 New message received:", message);
      if (String(message.chat) === String(chat._id)) {
        setMessages((prev) => [...prev, message]);
      }
    };

    // Перевірка чи підключено слухач
    console.log("🔵 Subscribing to receiveMessage...");
    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      console.log("🔴 Unsubscribing from receiveMessage...");
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [chat, currentUser]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    console.log("🔵 Sending message...");
    sendMessageSocket(chat._id, newMessage);
    setNewMessage("");
  };

  if (!chat) return <p className={styles.noChatSelected}>Виберіть чат</p>;

  return (
    <div className={styles.chatWindow}>
      <h3>Чат з {chat.participants.map((p) => p.name).join(", ")}</h3>
      <div className={styles.messages}>
        {messages.map((msg) => (
          <div key={msg._id} className={styles.message}>
            <strong>{msg.sender?.name || "Анонім"}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="Введіть повідомлення..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Відправити</button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default ChatWindow;
