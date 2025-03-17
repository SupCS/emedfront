import styles from "./ChatList.module.css";
import { getAvatarUrl } from "../../api/avatarApi";

const ChatList = ({ chats, onSelectChat, currentUser }) => {
  if (!chats.length)
    return <p className={styles.noChats}>У вас немає чатів.</p>;

  return (
    <div className={styles.chatList}>
      <h3>Ваші чати</h3>
      <ul>
        {chats.map((chat) => {
          const interlocutor = chat.participants.find(
            (p) => p._id !== currentUser.id
          );

          const avatar = interlocutor?.avatar
            ? getAvatarUrl(interlocutor.avatar)
            : "/images/default-avatar.webp";

          return (
            <li
              key={chat._id}
              onClick={() => onSelectChat(chat)}
              className={styles.chatItem}
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
