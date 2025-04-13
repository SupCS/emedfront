import { useState, useEffect } from "react";
import { uploadAvatar } from "../../api/avatarApi";
import { toast } from "react-toastify";
import styles from "./AvatarUploader.module.css";

const AvatarUploader = ({ onUpdate, initialUrl }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialUrl || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    if (!file && initialUrl) {
      setPreviewUrl(initialUrl);
    }
  }, [initialUrl, file]);

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
      onUpdate(data.avatar);
      setFile(null);
      setPreviewUrl(initialUrl);
    } catch (error) {
      toast.error(error.message || "Помилка завантаження аватарки.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Попередній перегляд"
          className={styles.preview}
        />
      )}

      <div className={styles.buttonRow}>
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

        {file && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className={styles.uploadButton}
          >
            {loading ? "Завантаження..." : "Зберегти"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AvatarUploader;
