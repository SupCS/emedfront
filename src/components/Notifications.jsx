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
  const isChat = notif.type === "chat";
  const isAppointment = notif.type === "appointment";

  return (
    <div
      onClick={(e) => onClick(notif, () => toast.dismiss())}
      style={{
        cursor: "pointer",
        padding: "10px",
        borderRadius: "5px",
        background: "#f8f9fa",
      }}
    >
      <strong>
        {isChat && `Нове повідомлення від ${notif.senderName}`}
        {isAppointment && `Починається прийом`}
      </strong>
      <p>{notif.content}</p>
    </div>
  );
};

export default Notifications;
