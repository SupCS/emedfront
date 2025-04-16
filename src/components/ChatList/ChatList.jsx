import { useState } from "react";
import styles from "./ChatList.module.css";
import { getAvatarUrl } from "../../api/avatarApi";

const ChatList = ({ chats, onSelectChat, currentUser, selectedChatId }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChats = chats.filter((chat) => {
    const other = chat.participants.find((p) => p._id !== currentUser.id);
    return other?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!chats.length)
    return <p className={styles.noChats}>У вас немає чатів.</p>;

  return (
    <div className={styles.chatList}>
      <h3>Ваші чати</h3>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Пошук за імʼям..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul>
        {filteredChats.map((chat) => {
          const interlocutor = chat.participants.find(
            (p) => p._id !== currentUser.id
          );

          const avatar = interlocutor?.avatar
            ? getAvatarUrl(interlocutor.avatar)
            : "/images/default-avatar.webp";

          const isActive = chat._id === selectedChatId;

          return (
            <li
              key={chat._id}
              onClick={() =>
                onSelectChat({ ...chat, role: interlocutor?.role })
              }
              className={`${styles.chatItem} ${
                isActive ? styles.chatItemActive : ""
              }`}
            >
              <img src={avatar} alt="Аватар" className={styles.chatAvatar} />
              <span className={styles.chatName}>
                {interlocutor ? interlocutor.name : "Невідомий"}
              </span>
              {chat.unreadCount > 0 && (
                <span className={styles.unreadBadge}>{chat.unreadCount}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChatList;
