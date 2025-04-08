function DoctorCard({ name, specialization, rating, ratingCount, avatar }) {
  return (
    <div style={cardStyle}>
      <img
        src={avatar || "/images/default-avatar.webp"}
        alt="Аватар лікаря"
        style={avatarStyle}
      />
      <h3>{name}</h3>
      <p>
        <strong>Спеціалізація:</strong> {specialization}
      </p>
      <p>
        <strong>Рейтинг:</strong>{" "}
        {rating !== null
          ? `${rating} ⭐ (${ratingCount || 0})`
          : "Немає оцінок"}
      </p>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  maxWidth: "300px",
  transition: "transform 0.2s",
  cursor: "pointer",
  textAlign: "center",
};

const avatarStyle = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  objectFit: "cover",
  marginBottom: "10px",
};

export default DoctorCard;
