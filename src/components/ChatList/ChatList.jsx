import styles from "./ChatList.module.css";

const ChatList = ({ chats, onSelectChat }) => {
  if (!chats.length)
    return <p className={styles.noChats}>У вас немає чатів.</p>;

  return (
    <div className={styles.chatList}>
      <h3>Ваші чати</h3>
      <ul>
        {chats.map((chat) => (
          <li key={chat._id} onClick={() => onSelectChat(chat)}>
            {chat.participants.map((p) => p.name).join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
