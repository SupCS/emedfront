import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import { Ukrainian } from "flatpickr/dist/l10n/uk.js";
import "flatpickr/dist/flatpickr.min.css";
import styles from "./AddSlotForm.module.css";

export default function AddSlotForm({
  date,
  startTime,
  endTime,
  setDate,
  setStartTime,
  setEndTime,
  onAdd,
  onClose,
}) {
  const dateRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  const startInstance = useRef(null);
  const endInstance = useRef(null);

  useEffect(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const currentTimeStr = now.toTimeString().slice(0, 5);

    const isToday = (selectedDate) =>
      selectedDate.toDateString() === new Date().toDateString();

    console.log(todayStr);

    // Date picker
    flatpickr(dateRef.current, {
      disableMobile: true,
      locale: Ukrainian,
      dateFormat: "d.m.Y",
      defaultDate: now,
      minDate: "today",
      onChange: ([selectedDate]) => {
        if (!selectedDate) return;
        const pad = (num) => String(num).padStart(2, "0");
        const newDate = `${selectedDate.getFullYear()}-${pad(
          selectedDate.getMonth() + 1
        )}-${pad(selectedDate.getDate())}`;

        setDate(newDate);

        const isTodaySelected = isToday(selectedDate);
        const minTime = isTodaySelected ? currentTimeStr : "00:00";

        // оновлюємо time-пікери
        startInstance.current?.set("minTime", minTime);
        endInstance.current?.set("minTime", minTime);

        // якщо сьогодні — оновлюємо час початку
        if (isTodaySelected) {
          startInstance.current?.setDate(currentTimeStr, true);
          endInstance.current?.setDate("", true);
          setStartTime(currentTimeStr);
          setEndTime("");
        } else {
          startInstance.current?.setDate("08:00", true);
          endInstance.current?.setDate("", true);
          setStartTime("08:00");
          setEndTime("");
        }
      },
    });

    console.log(currentTimeStr);

    // Start time
    startInstance.current = flatpickr(startTimeRef.current, {
      disableMobile: true,
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: true,
      defaultDate: currentTimeStr,
      minTime: currentTimeStr,
      onChange: ([selectedDate]) => {
        if (selectedDate) {
          const time = selectedDate.toTimeString().slice(0, 5);
          setStartTime(time);
        }
      },
    });

    // End time
    endInstance.current = flatpickr(endTimeRef.current, {
      disableMobile: true,
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: true,
      defaultDate: currentTimeStr,
      minTime: currentTimeStr,
      onChange: ([selectedDate]) => {
        if (selectedDate) {
          const time = selectedDate.toTimeString().slice(0, 5);
          setEndTime(time);
        }
      },
    });

    // Початкові значення
    setDate(todayStr);
    setStartTime(currentTimeStr);
    setEndTime("");

    return () => {
      startInstance.current?.destroy();
      endInstance.current?.destroy();
    };
  }, [setDate, setStartTime, setEndTime]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h4 className={styles.formTitle}>Додати тайм-слот</h4>
        <div className={styles.form}>
          <input ref={dateRef} placeholder="Оберіть дату" readOnly />
          <input ref={startTimeRef} placeholder="Час початку" readOnly />
          <input ref={endTimeRef} placeholder="Час завершення" readOnly />
          <div className={styles.actions}>
            <button onClick={onAdd}>Додати</button>
            <button onClick={onClose} className={styles.cancel}>
              Скасувати
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
