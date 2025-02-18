import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserProfile } from "../api/profileApi";
import DoctorSchedule from "../components/DoctorSchedule";

function ProfilePage() {
    const { role, id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");

    const currentUserRole = localStorage.getItem("userRole");
    const currentUserId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (currentUserRole === "patient" && role === "patient" && currentUserId !== id) {
                    navigate("/");
                    return;
                }

                const data = await getUserProfile(role, id);
                setProfile(data);
            } catch (err) {
                setError(err.message || "Failed to load profile");
            }
        };

        fetchProfile();
    }, [role, id, navigate, currentUserRole, currentUserId]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!profile) return <p>Loading profile...</p>;

    return (
        <div>
            <h2>Profile</h2>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>

            {role === "doctor" ? (
                <>
                    <p><strong>Specialization:</strong> {profile.specialization}</p>
                    <p><strong>Experience:</strong> {profile.experience} years</p>
                    <p><strong>Rating:</strong> {profile.rating}</p>
                    <p><strong>Bio:</strong> {profile.bio}</p>
                    <p><strong>Awards:</strong> {profile.awards?.join(", ") || "No awards"}</p>

                    {/* Підключаємо розклад лікаря */}
                    <DoctorSchedule doctorId={id} />
                </>
            ) : (
                <>
                    <p><strong>Phone:</strong> {profile.phone}</p>
                    <p><strong>Medical Records:</strong> {profile.medicalRecords?.length || 0} records</p>
                    <p><strong>Prescriptions:</strong> {profile.prescriptions?.length || 0} prescriptions</p>
                </>
            )}

            <button
                onClick={handleLogout}
                style={{
                    marginTop: "20px",
                    backgroundColor: "red",
                    color: "white",
                    padding: "10px",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                Logout
            </button>
        </div>
    );
}

export default ProfilePage;
