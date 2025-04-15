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
import { uk } from "date-fns/locale";
import AddSlotForm from "./AddSlotForm";

function DoctorSchedule({ doctorId }) {
  const [schedule, setSchedule] = useState({});
  const [visibleStartDate, setVisibleStartDate] = useState(startOfToday());
  const [visibleDaysCount, setVisibleDaysCount] = useState(3);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    const today = startOfToday();
    const prevDate = subDays(visibleStartDate, visibleDaysCount);

    if (isBefore(prevDate, today)) {
      setVisibleStartDate(today);
    } else {
      setVisibleStartDate(prevDate);
    }
  };
  const isAtToday = isSameDay(visibleStartDate, startOfToday());
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className={styles.scheduleContainer}>
      <div className={styles.navRow}>
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
                {capitalize(format(dateObj, "EEEE, d MMM", { locale: uk }))}
              </div>
              {slots.length === 0 ? (
                <div className={styles.emptyMessage}>Немає слотів</div>
              ) : (
                [...slots]
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((slot, i) => (
                    <div
                      key={`${slot.startTime}-${slot.endTime}`}
                      className={styles.timeSlot}
                    >
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <button
                        className={styles.removeButton}
                        onClick={() =>
                          handleRemoveSlot(
                            dateStr,
                            slot.startTime,
                            slot.endTime
                          )
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

      <button
        className={styles.addSlotButton}
        onClick={() => setIsModalOpen(true)}
      >
        + Додати тайм-слот
      </button>

      {isModalOpen && (
        <AddSlotForm
          date={date}
          startTime={startTime}
          endTime={endTime}
          setDate={setDate}
          setStartTime={setStartTime}
          setEndTime={setEndTime}
          onAdd={() => {
            handleAddSlot();
            setIsModalOpen(false);
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default DoctorSchedule;
