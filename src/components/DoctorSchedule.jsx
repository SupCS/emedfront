import { useEffect, useState, useCallback } from "react";
import { getDoctorSchedule, addDoctorSlot, removeDoctorSlot } from "../api/scheduleApi";

function DoctorSchedule({ doctorId }) {
    const [schedule, setSchedule] = useState(null);
    const [error, setError] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    // Функція для отримання розкладу лікаря
    const fetchSchedule = useCallback(async () => {
        try {
            const data = await getDoctorSchedule(doctorId);
            setSchedule(data);
        } catch (err) {
            setError(err.message || "Failed to load schedule.");
        }
    }, [doctorId]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    // Функція для додавання нового слота
    const handleAddSlot = async () => {
        if (!date || !startTime || !endTime) {
            alert("Please fill all fields.");
            return;
        }

        try {
            await addDoctorSlot(date, [{ startTime, endTime }]);
            alert("Slot added successfully!");
            fetchSchedule(); // Оновлюємо розклад після додавання
        } catch (err) {
            alert(err.message || "Failed to add slot.");
        }
    };

    const handleRemoveSlot = async (date, startTime, endTime) => {
        try {
            await removeDoctorSlot(date, startTime, endTime);
            alert("Slot removed successfully!");
            fetchSchedule();
        } catch (err) {
            alert(err.message || "Failed to remove slot.");
        }
    };

    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!schedule) return <p>Loading schedule...</p>;

    return (
        <div>
            <h3>Doctor&apos;s Schedule</h3>

            {schedule.availability.length === 0 ? (
                <p>No schedule available</p>
            ) : (
                <ul>
                    {schedule.availability.map((day, index) => (
                        <li key={index}>
                            <strong>{day.date}</strong>
                            <ul>
                                {day.slots.map((slot, idx) => (
                                    <li key={idx}>
                                        {slot.startTime} - {slot.endTime}
                                        <button onClick={() => handleRemoveSlot(day.date, slot.startTime, slot.endTime)}>Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}

            <h4>Add New Slot</h4>
            <label>Select Date:</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <label>Start Time:</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <label>End Time:</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            <button onClick={handleAddSlot} style={{ marginTop: "10px" }}>
                Add Slot
            </button>

            <button onClick={fetchSchedule} style={{ marginTop: "10px", marginLeft: "10px" }}>
                Refresh Schedule
            </button>
        </div>
    );
}

export default DoctorSchedule;
