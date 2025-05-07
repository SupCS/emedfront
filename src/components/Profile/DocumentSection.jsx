import { useEffect, useState } from "react";
import styles from "./ProfileInfo.module.css";
import noteIcon from "../../assets/note.svg";
import uploadIcon from "../../assets/upload.svg";
import deleteIcon from "../../assets/delete.svg";
import fileIcon from "../../assets/file.svg";

import {
  getProfileDocuments,
  uploadProfileDocument,
  deleteProfileDocument,
} from "../../api/profileApi";

export default function DocumentSection({ isOwner, userId }) {
  const [documents, setDocuments] = useState([]);
  const [fileTitle, setFileTitle] = useState("");
  const [fileInput, setFileInput] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await getProfileDocuments(userId);
        setDocuments(res.documents || []);
      } catch (err) {
        console.error("Помилка завантаження документів", err);
      }
    };
    fetchDocs();
  }, [userId]);

  const handleUpload = async () => {
    if (!fileTitle || !fileInput) return alert("Заповніть всі поля");
    const formData = new FormData();
    formData.append("document", fileInput);
    formData.append("title", fileTitle);
    try {
      const res = await uploadProfileDocument(formData);
      setDocuments((prev) => [...prev, res.document]);
      setFileTitle("");
      setFileInput(null);
      setIsAdding(false);
    } catch (err) {
      alert("Помилка при завантаженні");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Видалити цей документ?")) return;
    try {
      await deleteProfileDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert("Помилка при видаленні");
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
