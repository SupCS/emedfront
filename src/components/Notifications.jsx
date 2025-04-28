import { useSelector, useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { removeNotification } from "../store/notificationsSlice";
import "react-toastify/dist/ReactToastify.css";

const Notifications = () => {
  const notifications = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shownNotifications = useRef(new Set());

  const handleNotificationClick = (notif, closeToast) => {
    console.log("🔗 Перехід до чату:", notif);
    if (notif.chatId) {
      navigate(`/chat?chatId=${notif.chatId}`);
    } else {
      console.warn("⚠️ chatId undefined у сповіщенні:", notif);
    }
    dispatch(removeNotification(notif.id));
    shownNotifications.current.delete(notif.id);
    closeToast();
  };

  useEffect(() => {
    notifications.forEach((notif) => {
      if (!shownNotifications.current.has(notif.id)) {
        shownNotifications.current.add(notif.id);

        toast.info(
          <CustomToast notif={notif} onClick={handleNotificationClick} />,
          {
            closeOnClick: false,
            autoClose: 5000,
            onClose: () => {
              dispatch(removeNotification(notif.id));
              shownNotifications.current.delete(notif.id);
            },
          }
        );

        console.log("🔔 Відображаємо чат-сповіщення:", notif);
      }
    });
  }, [notifications, dispatch]);

  return null; // Повертаємо `null`, бо `ToastContainer` вже є в `App.jsx`
};

const CustomToast = ({ notif, onClick }) => {
  const { type, senderName, content } = notif;

  let title = "";

  if (type === "chat") {
    title = `Нове повідомлення від ${senderName}`;
  } else if (type === "appointment") {
    title = `Починається прийом`;
  } else if (type === "newAppointmentRequest") {
    title = `Новий запит на прийом`;
  } else if (type === "appointmentStatusChanged") {
    title = `Оновлення запису на прийом`;
  } else {
    title = "Сповіщення";
  }

  return (
    <div onClick={(e) => onClick(notif, () => toast.dismiss())}>
      <strong>{title}</strong>
      <p>{content}</p>
    </div>
  );
};

export default Notifications;
