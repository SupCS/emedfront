import { Link } from "react-router-dom";
import styles from "./LandingPage.module.css";
import doctorImage from "../../assets/doctor-hero.png";
import calendarIcon from "../../assets/calendar.svg";
import videoIcon from "../../assets/video.svg";
import chatIcon from "../../assets/chat.svg";
import HeroBlob from "./HeroBlob";
import PrimaryButton from "../../components/Buttons/PrimaryButton";
import OutlineButton from "../../components/Buttons/OutlineButton";

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      <div className={styles.left}>
        <h1 className={styles.title}>Здоров&apos;я починається тут</h1>
        <p className={styles.subtitle}>
          Записуйтесь на прийом, консультуйтесь із лікарями та керуйте медичною
          інформацією — усе в одному додатку.
        </p>

        <ul className={styles.featuresList}>
          <li>Легке планування прийомів</li>
          <li>Чат із лікарем у реальному часі</li>
          <li>Доступ до медичних записів 24/7</li>
        </ul>

        <div className={styles.buttons}>
          <PrimaryButton to="/login">Увійти</PrimaryButton>
          <OutlineButton to="/register">Зареєструватись</OutlineButton>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.imageWrapper}>
          <div className={styles.iconsOverlay}>
            <img src={chatIcon} className={styles.iconChat} />
            <img src={videoIcon} className={styles.iconVideo} />
            <img src={calendarIcon} className={styles.iconCalendar} />
          </div>
          <HeroBlob>
            <img
              src={doctorImage}
              alt="Doctor"
              className={styles.doctorImage}
            />
          </HeroBlob>
        </div>
      </div>
    </div>
  );
}
