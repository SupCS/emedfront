import { useEffect, useState, useRef, useCallback } from "react";
import {
  getChatMessages,
  markChatAsRead,
  getCurrentAppointment,
} from "../../api/chatApi";
import { socket, connectSocket, sendMessageSocket } from "../../api/socket";
import { toast } from "react-toastify";
import { getAvatarUrl } from "../../api/avatarApi";
import styles from "./ChatWindow.module.css";

const ChatWindow = ({ chat, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isAppointmentActive, setIsAppointmentActive] = useState(false);
  const [callId, setCallId] = useState(null);
  const messagesEndRef = useRef(null);

  const interlocutor = chat.participants.find((p) => p._id !== currentUser.id);
  const interlocutorIndex = chat.participants.findIndex(
    (p) => p._id === interlocutor?._id
  );
  const interlocutorRole =
    interlocutorIndex !== -1
      ? chat.participantModel[interlocutorIndex].toLowerCase()
      : "unknown";
  const avatar = interlocutor?.avatar
    ? getAvatarUrl(interlocutor.avatar)
    : "/images/default-avatar.webp";

  useEffect(() => {
    if (!chat || !currentUser) return;

    if (!socket.connected) connectSocket();

    const fetchMessages = async () => {
      try {
        const data = await getChatMessages(chat._id);
        setMessages(data);
        await markChatAsRead(chat._id, currentUser.id);
      } catch (err) {
        toast.error(`Не вдалося завантажити повідомлення: ${err.message}`);
      }
    };

    const checkAppointmentStatus = async () => {
      try {
        const res = await getCurrentAppointment(chat._id);
        setIsAppointmentActive(res.isActive);
        setCallId(res.firestoreCallId || null);
      } catch (err) {
        console.error("Помилка при перевірці апоінтменту:", err.message);
      }
    };

    fetchMessages();
    checkAppointmentStatus();

    return () => {
      socket.off("receiveMessage");
    };
  }, [chat, currentUser]);

  const handleReceiveMessage = useCallback(
    async (message) => {
      if (String(message.chat) !== String(chat._id)) {
        toast.info(
          `Нове повідомлення від ${message.senderName}: ${message.content}`
        );
        return;
      }

      setMessages((prev) => {
        const filtered = prev.filter(
          (msg) => !(msg._tempId && msg.content === message.content)
        );
        return [...filtered, message];
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

    setMessages((prev) => [...prev, tempMessage]);
    sendMessageSocket(chat._id, newMessage, recipient._id);
    setNewMessage("");
  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatHeader}>
        <div className={styles.chatUserInfo}>
          <img src={avatar} alt="Avatar" className={styles.chatAvatar} />
          <h3
            className={styles.chatTitle}
            onClick={() =>
              interlocutor &&
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
          {messages.map((msg) => {
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
