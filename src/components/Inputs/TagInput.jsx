import { useState } from "react";
import styles from "./TagInput.module.css";

const MAX_TAGS = 10;
const MAX_LENGTH = 30;

export default function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      const trimmed = input.trim();

      if (value.length >= MAX_TAGS) {
        setError(`Максимум ${MAX_TAGS} тегів`);
        return;
      }

      if (trimmed.length > MAX_LENGTH) {
        setError(`Тег не може перевищувати ${MAX_LENGTH} символів`);
        return;
      }

      if (!value.includes(trimmed)) {
        onChange([...value, trimmed]);
        setError("");
      }

      setInput("");
    }
  };

  const removeTag = (index) => {
    const newTags = [...value];
    newTags.splice(index, 1);
    onChange(newTags);
    setError("");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.tagInputContainer}>
        {value.map((tag, i) => (
          <div key={i} className={styles.tag}>
            {tag}
            <button onClick={() => removeTag(i)}>&times;</button>
          </div>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
      </div>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
