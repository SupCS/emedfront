import { useState } from "react";
import { uploadAvatar } from "../../api/avatarApi";
import { toast } from "react-toastify";
import styles from "./AvatarUploader.module.css";

const AvatarUploader = ({ onUpdate }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warning("Оберіть файл для завантаження.");
      return;
    }

    setLoading(true);
    try {
      const data = await uploadAvatar(file);
      toast.success("Аватарка успішно оновлена!");
      onUpdate(data.avatar); // Оновлюємо URL аватарки
    } catch (error) {
      toast.error(error.message || "Помилка завантаження аватарки.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className={styles.fileInput}
        id="avatarUpload"
      />
      <label htmlFor="avatarUpload" className={styles.uploadButton}>
        Обрати файл
      </label>
      <button
        onClick={handleUpload}
        disabled={loading}
        className={styles.uploadButton}
      >
        {loading ? "Завантаження..." : "Оновити аватар"}
      </button>
    </div>
  );
};

export default AvatarUploader;
