import styles from "./Pagination.module.css";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const maxButtons = 5;
  const half = Math.floor(maxButtons / 2);
  const buttons = [];

  let start = Math.max(2, currentPage - half);
  let end = Math.min(totalPages - 1, currentPage + half);

  if (currentPage <= half + 1) {
    end = Math.min(maxButtons, totalPages - 1);
  }

  if (currentPage >= totalPages - half) {
    start = Math.max(totalPages - maxButtons + 1, 2);
  }

  if (totalPages <= maxButtons + 2) {
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          className={`${styles.pageButton} ${
            currentPage === i ? styles.active : ""
          }`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }
  } else {
    buttons.push(
      <button
        key={1}
        className={`${styles.pageButton} ${
          currentPage === 1 ? styles.active : ""
        }`}
        onClick={() => onPageChange(1)}
      >
        1
      </button>
    );

    if (start > 2) {
      buttons.push(<span key="dots-start">...</span>);
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <button
          key={i}
          className={`${styles.pageButton} ${
            currentPage === i ? styles.active : ""
          }`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages - 1) {
      buttons.push(<span key="dots-end">...</span>);
    }

    buttons.push(
      <button
        key={totalPages}
        className={`${styles.pageButton} ${
          currentPage === totalPages ? styles.active : ""
        }`}
        onClick={() => onPageChange(totalPages)}
      >
        {totalPages}
      </button>
    );
  }

  return <div className={styles.pagination}>{buttons}</div>;
}
