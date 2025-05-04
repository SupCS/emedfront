import { useEffect, useRef, useState } from "react";
import {
  getAdminStats,
  getDoctorStats,
  getAllDoctors,
} from "../../../../api/adminApi";
import flatpickr from "flatpickr";
import { Ukrainian } from "flatpickr/dist/l10n/uk.js";
import "flatpickr/dist/flatpickr.min.css";
import styles from "./StatsTab.module.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FF8042"];

function StatsTab() {
  const [stats, setStats] = useState(null);
  const [from, setFrom] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [to, setTo] = useState(new Date());
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("all");

  const fromRef = useRef(null);
  const toRef = useRef(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const result = await getAllDoctors();
        setDoctors(result);
      } catch (error) {
        console.error("❌ Не вдалося завантажити лікарів:", error);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fromPicker = flatpickr(fromRef.current, {
      locale: Ukrainian,
      dateFormat: "Y-m-d",
      defaultDate: from,
      onChange: ([date]) => setFrom(date),
    });

    const toPicker = flatpickr(toRef.current, {
      locale: Ukrainian,
      dateFormat: "Y-m-d",
      defaultDate: to,
      onChange: ([date]) => setTo(date),
    });

    return () => {
      fromPicker.destroy();
      toPicker.destroy();
    };
  }, [from, to]);

  useEffect(() => {
    fetchStats();
  }, [from, to, selectedDoctorId]);

  const formatLocalDate = (date) => {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  };

  const fetchStats = async () => {
    try {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);

      const params = {
        from: formatLocalDate(start),
        to: formatLocalDate(end),
      };

      const data =
        selectedDoctorId === "all"
          ? await getAdminStats(params)
          : await getDoctorStats(selectedDoctorId, params);

      // Якщо бек повертає "totalPatients" тільки для all, додаємо дефолтні значення для лікаря
      if (selectedDoctorId !== "all") {
        data.totalDoctors = 1;
        data.totalPatients = "—";
      }

      setStats(data);
    } catch (error) {
      console.error("Помилка при завантаженні статистики:", error);
    }
  };

  const chartData = stats
    ? [
        { name: "Створено", value: stats.appointmentsCreated },
        { name: "Завершено", value: stats.appointmentsPassed },
        { name: "Скасовано", value: stats.appointmentsCancelled },
      ]
    : [];

  const lineData = stats?.daily || [];

  const totalCreatedInPeriod = lineData.reduce(
    (sum, d) => sum + (d.Created || 0),
    0
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📊 Статистика платформи</h2>

      <div className={styles.filters}>
        <label>
          З:
          <input ref={fromRef} readOnly />
        </label>
        <label>
          По:
          <input ref={toRef} readOnly />
        </label>
        <label>
          Лікар:
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          >
            <option value="all">Усі</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {stats ? (
        <>
          <div className={styles.kpiGrid}>
            <div className={styles.kpiBox}>
              <div className={styles.kpiTitle}>Лікарі (загалом)</div>
              <div className={styles.kpiValue}>{stats.totalDoctors}</div>
            </div>
            <div className={styles.kpiBox}>
              <div className={styles.kpiTitle}>Пацієнти (загалом)</div>
              <div className={styles.kpiValue}>{stats.totalPatients}</div>
            </div>
            <div className={styles.kpiBox}>
              <div className={styles.kpiTitle}>Прийоми (за період)</div>
              <div className={styles.kpiValue}>{totalCreatedInPeriod}</div>
            </div>
          </div>

          <div className={styles.chartsGrid}>
            <div className={styles.chartBox}>
              <h4>Розподіл статусів прийомів</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.chartBox}>
              <h4>Огляд прийомів</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(str) =>
                      new Date(str).toLocaleDateString("uk-UA", {
                        day: "2-digit",
                        month: "2-digit",
                      })
                    }
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Created"
                    stroke="#8884d8"
                    name="Створено"
                  />
                  <Line
                    type="monotone"
                    dataKey="Passed"
                    stroke="#00C49F"
                    name="Завершено"
                  />
                  <Line
                    type="monotone"
                    dataKey="Cancelled"
                    stroke="#FF8042"
                    name="Скасовано"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <p>Завантаження статистики...</p>
      )}
    </div>
  );
}

export default StatsTab;
