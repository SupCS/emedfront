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
  const [visibleDaysCount, setVisibleDaysCount] = useState(3);
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

  useEffect(() => {
    const updateVisibleDays = () => {
      const width = window.innerWidth;
      if (width >= 1024) setVisibleDaysCount(4);
      else if (width >= 768) setVisibleDaysCount(3);
      else setVisibleDaysCount(1);
    };
    updateVisibleDays();
    window.addEventListener("resize", updateVisibleDays);
    return () => window.removeEventListener("resize", updateVisibleDays);
  }, []);

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
  const getVisibleDates = () => {
    return Array.from({ length: visibleDaysCount }, (_, i) =>
      addDays(visibleStartDate, i)
    );
  };

  const handleNext = () => {
    setVisibleStartDate((prev) => addDays(prev, visibleDaysCount));
  };

  const handlePrev = () => {
    const prevDate = subDays(visibleStartDate, visibleDaysCount);
    const today = startOfToday();
    if (!isBefore(prevDate, today)) {
      setVisibleStartDate(prevDate);
    }
  };

  const isAtToday = isSameDay(visibleStartDate, startOfToday());

  return (
    <div className={styles.scheduleContainer}>
      <h3 className={styles.scheduleHeader}>Розклад лікаря</h3>
      <div className={styles.navControls}>
        <button
          onClick={handlePrev}
          className={styles.navButton}
          disabled={isAtToday}
        >
          ←
        </button>
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
