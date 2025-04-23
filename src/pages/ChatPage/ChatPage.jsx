import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ChatList from "../../components/ChatList/ChatList";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import {
  getUserChats,
  getUnreadCounts,
  markChatAsRead,
} from "../../api/chatApi";
import { setChats, resetUnreadForChat } from "../../store/chatListSlice";
import { decrementUnreadMessagesBy } from "../../store/unreadMessagesSlice";
import styles from "./ChatPage.module.css";

const ChatPage = () => {
  const chats = useSelector((state) => state.chatList);
  const dispatch = useDispatch();
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
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

        dispatch(setChats(updatedChats));

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
  }, [searchParams, dispatch]);

  const handleSelectChat = async (chat, userId) => {
    setSelectedChat(chat);
    if (isMobileView) setShowChatWindow(true);

    if (chat.unreadCount > 0) {
      const userToMark = userId || currentUser?.id;
      if (!userToMark) return;

      await markChatAsRead(chat._id, userToMark);
      dispatch(resetUnreadForChat(chat._id));
      dispatch(decrementUnreadMessagesBy(chat.unreadCount));
    }
  };

  return (
    <div className={styles.chatPage}>
      {error && <p className={styles.error}>{error}</p>}
      {currentUser && (!isMobileView || !showChatWindow) ? (
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
