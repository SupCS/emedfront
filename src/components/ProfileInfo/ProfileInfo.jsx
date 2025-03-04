import styles from "./ProfileInfo.module.css";

function ProfileInfo({ profile, role }) {
  return (
    <div className={styles.profileContainer}>
      <h2 className={styles.profileTitle}>Profile</h2>
      <div className={styles.profileDetails}>
        <p>
          <strong>Name:</strong> {profile.name}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        {role === "doctor" ? (
          <>
            <p>
              <strong>Specialization:</strong> {profile.specialization}
            </p>
            <p>
              <strong>Experience:</strong> {profile.experience} years
            </p>
            <p>
              <strong>Rating:</strong> {profile.rating}
            </p>
            <p>
              <strong>Bio:</strong> {profile.bio}
            </p>
            <p>
              <strong>Awards:</strong>{" "}
              {profile.awards?.join(", ") || "No awards"}
            </p>
          </>
        ) : (
          <>
            <p>
              <strong>Phone:</strong> {profile.phone}
            </p>
            <p>
              <strong>Medical Records:</strong>{" "}
              {profile.medicalRecords?.length || 0} records
            </p>
            <p>
              <strong>Prescriptions:</strong>{" "}
              {profile.prescriptions?.length || 0} prescriptions
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfileInfo;
