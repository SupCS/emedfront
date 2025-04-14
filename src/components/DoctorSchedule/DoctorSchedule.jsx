import { useEffect, useState, useCallback } from "react";
import styles from "./DoctorSchedule.module.css";
import {
  getDoctorSchedule,
  addDoctorSlot,
  removeDoctorSlot,
} from "../../api/scheduleApi";
import { toast } from "react-toastify";
import {
  format,
  addDays,
  subDays,
  isBefore,
  isSameDay,
  startOfToday,
} from "date-fns";

function DoctorSchedule({ doctorId }) {
  const [schedule, setSchedule] = useState({});
  const [visibleStartDate, setVisibleStartDate] = useState(startOfToday());
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const fetchSchedule = useCallback(async () => {
    try {
      const data = await getDoctorSchedule(doctorId);
      const mapped = {};
      for (const day of data.availability) {
        mapped[day.date] = day.slots;
      }
      setSchedule(mapped);
    } catch (err) {
      toast.error("Не вдалося завантажити розклад.");
    }
  }, [doctorId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleAddSlot = async () => {
    if (!date || !startTime || !endTime) {
      toast.info("Будь ласка, заповніть всі поля.");
      return;
    }
    try {
      await addDoctorSlot(date, [{ startTime, endTime }]);
      toast.success("Тайм-слот успішно додано!");
      fetchSchedule();
    } catch (err) {
      toast.error("Не вдалося додати тайм-слот.");
    }
  };

  const handleRemoveSlot = async (date, startTime, endTime) => {
    try {
      await removeDoctorSlot(date, startTime, endTime);
      toast.success("Тайм-слот успішно видалено!");
      fetchSchedule();
    } catch (err) {
      toast.error("Не вдалося видалити тайм-слот.");
    }
  };

  const getFormattedDate = (date) => format(date, "yyyy-MM-dd");
  const getVisibleDates = () => [
    visibleStartDate,
    addDays(visibleStartDate, 1),
    addDays(visibleStartDate, 2),
  ];

  const handleNext = () => {
    setVisibleStartDate((prev) => addDays(prev, 3));
  };

  const handlePrev = () => {
    const prevDate = subDays(visibleStartDate, 3);
    const today = startOfToday();
    if (!isBefore(prevDate, today)) {
      setVisibleStartDate(prevDate);
    }
  };

  const isAtToday = isSameDay(visibleStartDate, startOfToday());

  return (
    <div className={styles.scheduleContainer}>
      <div className={styles.navHeader}>
        <button
          onClick={handlePrev}
          className={styles.navButton}
          disabled={isAtToday}
        >
          ←
        </button>
        <h3 className={styles.scheduleHeader}>Розклад лікаря</h3>
        <button onClick={handleNext} className={styles.navButton}>
          →
        </button>
      </div>

      <div className={styles.scheduleGrid}>
        {getVisibleDates().map((dateObj, index) => {
          const dateStr = getFormattedDate(dateObj);
          const slots = schedule[dateStr] || [];

          return (
            <div className={styles.scheduleColumn} key={index}>
              <div className={styles.dateLabel}>
                {format(dateObj, "EEEE, MMM d")}
              </div>
              {slots.length === 0 ? (
                <div className={styles.emptyMessage}>Немає слотів</div>
              ) : (
                slots.map((slot, i) => (
                  <div key={i} className={styles.timeSlot}>
                    <span>
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <button
                      className={styles.removeButton}
                      onClick={() =>
                        handleRemoveSlot(dateStr, slot.startTime, slot.endTime)
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>

      <h4 className={styles.formTitle}>Додати тайм-слот</h4>
      <div className={styles.addSlotForm}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        <button onClick={handleAddSlot}>Додати</button>
        <button onClick={fetchSchedule}>Оновити</button>
      </div>
    </div>
  );
}

export default DoctorSchedule;
