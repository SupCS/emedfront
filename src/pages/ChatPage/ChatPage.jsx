import { useState, useEffect } from "react";
import ChatList from "../../components/ChatList/ChatList";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import { getUserChats } from "../../api/chatApi";
import styles from "./ChatPage.module.css";

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null); // Додаємо стан для користувача

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userId = localStorage.getItem("userId"); // Отримуємо ID користувача
        if (!userId) {
          setError("Не знайдено ID користувача.");
          return;
        }

        setCurrentUser({ id: userId, name: "Ви" }); // Додаємо об'єкт користувача

        const data = await getUserChats(userId);
        setChats(data);
      } catch (err) {
        setError(err.message || "Не вдалося завантажити чати.");
      }
    };

    fetchChats();
  }, []);

  return (
    <div className={styles.chatPage}>
      {error && <p className={styles.error}>{error}</p>}
      <ChatList chats={chats} onSelectChat={setSelectedChat} />
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
