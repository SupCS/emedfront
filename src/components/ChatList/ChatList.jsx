import styles from "./ChatList.module.css";

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

          return (
            <li
              key={chat._id}
              onClick={() => onSelectChat(chat)}
              className={styles.chatItem}
            >
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
