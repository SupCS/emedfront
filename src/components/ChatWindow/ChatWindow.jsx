import { useEffect, useState, useRef, useMemo } from "react";
import {
  getChatMessages,
  markChatAsRead,
  getCurrentAppointment,
} from "../../api/chatApi";
import { socket, sendMessageSocket, connectSocket } from "../../api/socket";
import { toast } from "react-toastify";
import { getAvatarUrl } from "../../api/avatarApi";
import styles from "./ChatWindow.module.css";
import Loader from "../Loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveChatMessages,
  addMessageToActiveChat,
  resetActiveChatMessages,
} from "../../store/activeChatMessagesSlice";

const ChatWindow = ({ chat, currentUser, onBack }) => {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.activeChatMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isAppointmentActive, setIsAppointmentActive] = useState(false);
  const [callId, setCallId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const interlocutor = chat.participants.find((p) => p._id !== currentUser.id);
  const interlocutorIndex = chat.participants.findIndex(
    (p) => p._id === interlocutor?._id
  );
  const interlocutorRole =
    interlocutorIndex !== -1
      ? chat.participantModel[interlocutorIndex].toLowerCase()
      : "unknown";

  const avatarUrl = useMemo(() => {
    if (interlocutor?.avatar) {
      return getAvatarUrl(interlocutor.avatar);
    }
    return "/images/default-avatar.webp";
  }, [interlocutor?.avatar]);

  useEffect(() => {
    localStorage.setItem("currentChatId", chat._id);
    if (!connectSocket.connected) connectSocket();

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [messagesData, appointment] = await Promise.all([
          getChatMessages(chat._id),
          getCurrentAppointment(chat._id),
        ]);
        dispatch(setActiveChatMessages(messagesData));
        setIsAppointmentActive(appointment.isActive);
        setCallId(appointment.firestoreCallId || null);
        await markChatAsRead(chat._id, currentUser.id);
      } catch (err) {
        toast.error(`Не вдалося завантажити чат: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      localStorage.removeItem("currentChatId");
      dispatch(resetActiveChatMessages());
    };
  }, [chat, currentUser, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleAppointmentStart = (payload) => {
      if (payload.chatId === chat._id) {
        setIsAppointmentActive(true);
        setCallId(payload.firestoreCallId || null);
      }
    };

    socket.on("appointmentStart", handleAppointmentStart);
    return () => {
      socket.off("appointmentStart", handleAppointmentStart);
    };
  }, [chat]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    if (newMessage.length > 1000) {
      toast.error("Повідомлення занадто довге.");
      return;
    }

    const recipient = chat.participants.find((p) => p._id !== currentUser.id);
    if (!recipient) {
      toast.error("Не вдається визначити отримувача.");
      return;
    }

    const tempMessage = {
      _id: Math.random().toString(36).substr(2, 9),
      _tempId: true,
      chat: chat._id,
      sender: currentUser.id,
      senderName: currentUser.name,
      content: newMessage,
      createdAt: new Date().toISOString(),
    };

    dispatch(addMessageToActiveChat(tempMessage));
    sendMessageSocket(chat._id, newMessage, recipient._id);
    setNewMessage("");
  };

  if (isLoading) {
    return (
      <div className={`${styles.chatWindow} ${styles.centeredLoader}`}>
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatHeader}>
        <div className={styles.chatUserInfo}>
          {onBack && (
            <button className={styles.backButton} onClick={onBack}>
              ← Назад
            </button>
          )}
          <img src={avatarUrl} alt="Avatar" className={styles.chatAvatar} />
          <h3
            className={styles.chatTitle}
            onClick={() =>
              window.open(
                `/profile/${interlocutorRole}/${interlocutor._id}`,
                "_self"
              )
            }
            style={{ cursor: "pointer" }}
          >
            {interlocutor?.name || "Невідомий"}
          </h3>
        </div>

        {isAppointmentActive && callId && (
          <div className={styles.videoButtonWrapper}>
            <a
              className={styles.videoButton}
              href={`/video/${callId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Приєднатись до відеоконференції
            </a>
          </div>
        )}
      </div>

      <div className={styles.messages}>
        <div className={styles.imessage}>
          {Array.isArray(messages) &&
            messages.map((msg) => {
              const isMe = msg.sender === currentUser.id;
              return (
                <p
                  key={msg._id}
                  className={isMe ? styles.fromMe : styles.fromThem}
                >
                  {msg.content}
                </p>
              );
            })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="Введіть повідомлення..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button onClick={handleSendMessage}>Відправити</button>
      </div>
    </div>
  );
};

export default ChatWindow;
