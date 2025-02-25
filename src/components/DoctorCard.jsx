function DoctorCard({ name, specialization, rating }) {
    return (
        <div style={cardStyle}>
            <h3>{name}</h3>
            <p><strong>Спеціалізація:</strong> {specialization}</p>
            <p><strong>Рейтинг:</strong> {rating} ⭐</p>
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
};

export default DoctorCard;
