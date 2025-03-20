import { useEffect, useState, useRef, useCallback } from "react";
import { getChatMessages, markChatAsRead } from "../../api/chatApi";
import { socket, connectSocket, sendMessageSocket } from "../../api/socket";
import { toast } from "react-toastify";
import styles from "./ChatWindow.module.css";

const ChatWindow = ({ chat, currentUser }) => {
  const [messages, setMessages] = useState([]); // Список повідомлень
  const [newMessage, setNewMessage] = useState(""); // Поточне введене повідомлення
  const messagesEndRef = useRef(null); // Референс для автоматичної прокрутки вниз

  useEffect(() => {
    if (!chat || !currentUser) return;

    if (!socket.connected) {
      connectSocket();
    }

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
      socket.off("receiveMessage");
      socket.off("messageSent");
    };
  }, [chat, currentUser]);

  // Функція для отримання нових повідомлень через WebSocket
  const handleReceiveMessage = useCallback(
    async (message) => {
      if (String(message.chat) !== String(chat._id)) {
        toast.info(
          `Нове повідомлення від ${message.senderName}: ${message.content}`
        );
        return;
      }

      setMessages((prev) => {
        // Видаляємо тимчасове повідомлення, якщо прийшло справжнє
        const filteredMessages = prev.filter(
          (msg) => !(msg._tempId && msg.content === message.content)
        );
        return [...filteredMessages, message];
      });

      await markChatAsRead(chat._id, currentUser.id);
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

  // Функція відправлення повідомлення
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    if (newMessage.length > 1000) {
      toast.error("Повідомлення занадто довге.");
      return;
    }

    try {
      const recipient = chat.participants.find((p) => p._id !== currentUser.id);
      if (!recipient) {
        toast.error("Не вдається визначити отримувача.");
        return;
      }

      const tempMessage = {
        _id: Math.random().toString(36).substr(2, 9), // Генеруємо тимчасовий ID
        _tempId: true, // Позначка, що це тимчасове повідомлення
        chat: chat._id,
        sender: currentUser.id,
        senderName: currentUser.name,
        content: newMessage,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMessage]); // Додаємо тимчасове повідомлення у список
      sendMessageSocket(chat._id, newMessage, recipient._id);
      setNewMessage(""); // Очищуємо поле вводу
    } catch (err) {
      toast.error(`Помилка відправлення: ${err.message}`);
    }
  };

  return (
    <div className={styles.chatWindow}>
      <h3>
        Чат з{" "}
        {chat.participants.find((p) => p._id !== currentUser.id)?.name ||
          "Невідомий"}
      </h3>
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
