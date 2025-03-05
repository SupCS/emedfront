import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import ChatList from "../../components/ChatList/ChatList";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import {
  getUserChats,
  getUnreadCounts,
  markChatAsRead,
} from "../../api/chatApi";
import styles from "./ChatPage.module.css";

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Користувач не авторизований.");
          return;
        }

        const decoded = jwtDecode(token);
        setCurrentUser({ id: decoded.id, name: decoded.name });

        // Отримуємо чати
        const chatData = await getUserChats(decoded.id);

        // Отримуємо кількість непрочитаних повідомлень
        const unreadCounts = await getUnreadCounts(decoded.id);

        // Додаємо `unreadCount` до кожного чату
        const updatedChats = chatData.map((chat) => ({
          ...chat,
          unreadCount: unreadCounts[chat._id] || 0,
        }));

        setChats(updatedChats);
      } catch (err) {
        setError(err.message || "Не вдалося завантажити чати.");
      }
    };

    fetchChats();
  }, []);

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);

    if (chat.unreadCount > 0) {
      await markChatAsRead(chat._id, currentUser.id);
      setChats((prevChats) =>
        prevChats.map((c) =>
          c._id === chat._id ? { ...c, unreadCount: 0 } : c
        )
      );
    }
  };

  return (
    <div className={styles.chatPage}>
      {error && <p className={styles.error}>{error}</p>}
      <ChatList chats={chats} onSelectChat={handleSelectChat} />
      {selectedChat ? (
        <ChatWindow chat={selectedChat} currentUser={currentUser} />
      ) : (
        <div className={styles.emptyChat}>
          <p>Оберіть чат, щоб розпочати розмову</p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
