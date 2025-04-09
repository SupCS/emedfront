import { useState } from "react";
import styles from "./AIAssistantWidget.module.css";
import { FaRobot, FaTimes } from "react-icons/fa";
import { sendMessageToAI } from "../../api/aiApi";
import DotLoader from "../Loader/DotLoader";

function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text:
        "Вітаю! Я штучний інтелект-помічник AI-боліт 🤖.\n\n" +
        "Я можу відповісти на нескладні медичні питання, надати поради чи допомогти з орієнтацією у сервісі.\n\n" +
        "⚠️ Проте я не є лікарем, і жодна моя порада не може замінити консультацію зі спеціалістом.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleWidget = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSend = async () => {
    const trimmed = input.trim();

    // Валідація довжини
    if (trimmed.length < 2) {
      setError("Повідомлення повинно містити щонайменше 2 символи.");
      return;
    }
    if (trimmed.length > 1000) {
      setError("Повідомлення не повинно перевищувати 1000 символів.");
      return;
    }

    setError(""); // очищення попередніх помилок
    const userMessage = { sender: "user", text: trimmed };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const aiReply = await sendMessageToAI(trimmed);
      const aiMessage = { sender: "ai", text: aiReply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ Сталася помилка при зверненні до AI." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {isOpen && (
        <div className={`${styles.chatBox} ${styles.fadeIn}`}>
          <div className={styles.header}>
            <span>🤖 Помічник AI-боліт</span>
            <button onClick={toggleWidget} className={styles.closeButton}>
              <FaTimes />
            </button>
          </div>

          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.sender === "user" ? styles.userMessage : styles.aiMessage
                }
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className={styles.aiMessage}>
                <DotLoader />
              </div>
            )}
          </div>

          <div className={styles.inputArea}>
            <input
              type="text"
              placeholder="Напишіть повідомлення..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading}>
              Надіслати
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </div>
      )}

      {!isOpen && (
        <button onClick={toggleWidget} className={styles.floatingButton}>
          <FaRobot size={20} />
          <span className={styles.label}>Чат з AI</span>
        </button>
      )}
    </div>
  );
}

export default AIAssistantWidget;
