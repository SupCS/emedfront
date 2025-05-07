import { useEffect, useState } from "react";
import styles from "./ProfileInfo.module.css";
import noteIcon from "../../assets/note.svg";
import uploadIcon from "../../assets/upload.svg";
import deleteIcon from "../../assets/delete.svg";
import fileIcon from "../../assets/file.svg";
import { toast } from "react-toastify";

import {
  getProfileDocuments,
  uploadProfileDocument,
  deleteProfileDocument,
} from "../../api/profileApi";
import Loader from "../Loader/Loader";

export default function DocumentSection({ isOwner, userId }) {
  const [documents, setDocuments] = useState([]);
  const [fileTitle, setFileTitle] = useState("");
  const [fileInput, setFileInput] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await getProfileDocuments(userId);
        setDocuments(res.documents || []);
      } catch (err) {
        toast.error("Помилка завантаження документів");
        console.error("Помилка завантаження документів", err);
      }
    };
    fetchDocs();
  }, [userId]);

  const isValidTitle = (title) => {
    const invalidChars = /[\\/:*?"<>|]/;
    return (
      typeof title === "string" &&
      title.trim().length >= 3 &&
      title.trim().length <= 100 &&
      !invalidChars.test(title)
    );
  };

  const handleUpload = async () => {
    if (!fileTitle || !fileInput) {
      toast.warning("Заповніть всі поля");
      return;
    }

    if (!isValidTitle(fileTitle)) {
      toast.warning(
        'Некоректна назва: максимум 100 символів, без символів / \\ : * ? " < > |'
      );
      return;
    }

    const formData = new FormData();
    formData.append("document", fileInput);
    formData.append("title", fileTitle.trim());

    setIsUploading(true);
    try {
      const res = await uploadProfileDocument(formData);
      setDocuments((prev) => [...prev, res.document]);
      toast.success("Документ додано");
      setFileTitle("");
      setFileInput(null);
      setIsAdding(false);
    } catch (err) {
      toast.error("Помилка при завантаженні документа");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Видалити цей документ?")) return;
    try {
      await deleteProfileDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.info("Документ видалено");
    } catch (err) {
      toast.error("Помилка при видаленні документа");
    }
  };

  return (
    <div className={styles.leftBlock}>
      <div className={styles.prescriptionHeader}>
        <div className={styles.iconBlock}>
          <img src={noteIcon} alt="icon" className={styles.iconImage} />
        </div>
        <span>Документи</span>
      </div>

      {documents.length === 0 ? (
        <div>Документи відсутні.</div>
      ) : (
        <div className={styles.cardGrid}>
          {documents.map((doc) => (
            <div key={doc.id} className={styles.documentCard}>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.documentCardLink}
              >
                <img
                  src={fileIcon}
                  alt="Документ"
                  className={styles.documentCardIcon}
                />
                <div className={styles.documentCardTitle}>{doc.title}</div>
              </a>
              {isOwner && (
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(doc.id)}
                  title="Видалити"
                >
                  <img src={deleteIcon} alt="delete" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isOwner && (
        <div className={styles.uploadBlock}>
          {!isAdding ? (
            <button
              onClick={() => {
                setFileTitle("");
                setFileInput(null);
                setIsAdding(true);
              }}
              className={styles.uploadButton}
            >
              <img src={uploadIcon} alt="upload" /> Додати документ
            </button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Назва документа"
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
              />
              <label className={styles.fileInputLabel}>
                Обрати PDF
                <input
                  type="file"
                  accept="application/pdf"
                  className={styles.hiddenFileInput}
                  onChange={(e) => setFileInput(e.target.files[0])}
                />
              </label>

              {fileInput && (
                <div className={styles.selectedFileName}>
                  Обрано файл: <strong>{fileInput.name}</strong>
                </div>
              )}

              {isUploading ? (
                <Loader size={24} />
              ) : (
                <div className={styles.uploadActions}>
                  <button onClick={handleUpload} className={styles.saveButton}>
                    Завантажити
                  </button>
                  <button
                    onClick={() => {
                      setFileTitle("");
                      setFileInput(null);
                      setIsAdding(false);
                    }}
                    className={styles.cancelButton}
                  >
                    Скасувати
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
