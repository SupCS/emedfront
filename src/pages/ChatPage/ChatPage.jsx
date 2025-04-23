import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useSearchParams } from "react-router-dom";
import ChatList from "../../components/ChatList/ChatList";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import {
  getUserChats,
  getUnreadCounts,
  markChatAsRead,
} from "../../api/chatApi";
import styles from "./ChatPage.module.css";
import { useDispatch } from "react-redux";
import { decrementUnreadMessagesBy } from "../../store/unreadMessagesSlice";
import { socket } from "../../api/socket";

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

        const chatData = await getUserChats(decoded.id);
        const unreadCounts = await getUnreadCounts(decoded.id);
        const updatedChats = chatData.map((chat) => ({
          ...chat,
          unreadCount: unreadCounts[chat._id] || 0,
        }));

        setChats(updatedChats);

        const chatIdFromUrl = searchParams.get("chatId");
        if (chatIdFromUrl && updatedChats.length > 0) {
          const chatToSelect = updatedChats.find(
            (chat) => chat._id === chatIdFromUrl
          );
          if (chatToSelect && decoded?.id) {
            handleSelectChat(chatToSelect, decoded.id);
          }
        }
      } catch (err) {
        setError(err.message || "Не вдалося завантажити чати.");
      }
    };

    fetchChats();
  }, [searchParams]);

  const handleSelectChat = async (chat, userId) => {
    setSelectedChat(chat);
    if (isMobileView) setShowChatWindow(true);

    if (chat.unreadCount > 0) {
      const userToMark = userId || currentUser?.id;
      if (!userToMark) return;

      await markChatAsRead(chat._id, userToMark);
      setChats((prevChats) =>
        prevChats.map((c) =>
          c._id === chat._id ? { ...c, unreadCount: 0 } : c
        )
      );
    }
    dispatch(decrementUnreadMessagesBy(chat.unreadCount));
  };

  useEffect(() => {
    if (!currentUser) return;

    const handleNewMessage = (message) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === message.chat
            ? { ...chat, unreadCount: (chat.unreadCount || 0) + 1 }
            : chat
        )
      );
    };

    socket.on("receiveMessage", handleNewMessage);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
    };
  }, [currentUser]);

  return (
    <div className={styles.chatPage}>
      {error && <p className={styles.error}>{error}</p>}

      {!isMobileView || !showChatWindow ? (
        <ChatList
          chats={chats}
          onSelectChat={handleSelectChat}
          currentUser={currentUser}
          selectedChatId={selectedChat?._id}
        />
      ) : null}

      <div
        className={`${styles.chatWindowWrapper} ${
          !isMobileView || showChatWindow ? styles.active : ""
        }`}
      >
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            currentUser={currentUser}
            onBack={() => setShowChatWindow(false)}
          />
        ) : (
          <div className={styles.emptyChat}>
            <p>Оберіть чат, щоб розпочати розмову</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
