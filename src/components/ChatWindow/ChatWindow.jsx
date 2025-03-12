import { useEffect, useState, useRef, useCallback } from "react";
import { getChatMessages, markChatAsRead } from "../../api/chatApi";
import {
  socket,
  connectSocket,
  joinChat,
  sendMessageSocket,
} from "../../api/socket";
import { toast } from "react-toastify";
import styles from "./ChatWindow.module.css";

const ChatWindow = ({ chat, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!chat || !currentUser) return;

    if (!socket.connected) {
      connectSocket();
    }

    socket.on("connect", () => {
      joinChat(chat._id);
    });

    const fetchMessages = async () => {
      try {
        const data = await getChatMessages(chat._id);
        setMessages(data);

        await markChatAsRead(chat._id, currentUser.id);
      } catch (err) {
        toast.error(`Не вдалося завантажити повідомлення: ${err.message}`);
      }
    };

    fetchMessages();

    return () => {
      socket.off("connect");
    };
  }, [chat, currentUser]);

  // Використовуємо useCallback, щоб уникнути повторних ререндерів
  const handleReceiveMessage = useCallback(
    async (message) => {
      if (String(message.chat) === String(chat._id)) {
        setMessages((prev) => [...prev, message]);

        await markChatAsRead(chat._id, currentUser.id);
      }
    },
    [chat, currentUser]
  );

  useEffect(() => {
    socket.on("receiveMessage", handleReceiveMessage);
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [handleReceiveMessage]);

  // Прокрутка вниз після отримання нового повідомлення
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    try {
      sendMessageSocket(chat._id, newMessage);
      setNewMessage("");
    } catch (err) {
      toast.error(`Помилка відправлення: ${err.message}`);
    }
  };

  // Знаходимо ім'я співрозмовника
  const interlocutor = chat.participants.find((p) => p._id !== currentUser.id);

  if (!chat) return <p className={styles.noChatSelected}>Виберіть чат</p>;

  return (
    <div className={styles.chatWindow}>
      <h3>Чат з {interlocutor ? interlocutor.name : "Невідомий"}</h3>
      <div className={styles.messages}>
        {messages.map((msg) => (
          <div key={msg._id} className={styles.message}>
            <strong>{msg.senderName || "Анонім"}:</strong> {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
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
    </div>
  );
};

export default ChatWindow;
