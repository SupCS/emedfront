import { useState } from "react";
import styles from "./AdminDashboardPage.module.css";
import DoctorsTab from "./tabs/DoctorsTab";
import PatientsTab from "./tabs/PatientsTab/PatientsTab";
import AppointmentsTab from "./tabs/AppointmentsTab/AppointmentsTab";
import PrescriptionsTab from "./tabs/PrescriptionsTab/PrescriptionsTab";
import StatsTab from "./tabs/StatsTab/StatsTab";

const tabs = ["Doctors", "Patients", "Appointments", "Prescriptions", "Stats"];

function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("Doctors");

  const renderTab = () => {
    switch (activeTab) {
      case "Doctors":
        return <DoctorsTab />;
      case "Patients":
        return <PatientsTab />;
      case "Appointments":
        return <AppointmentsTab />;
      case "Prescriptions":
        return <PrescriptionsTab />;
      case "Stats":
        return <StatsTab />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.adminContainer}>
      <h1 className={styles.title}>Admin Panel</h1>
      <div className={styles.tabMenu}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tabButton} ${
              activeTab === tab ? styles.active : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>{renderTab()}</div>
    </div>
  );
}

export default AdminDashboardPage;
