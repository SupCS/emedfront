import { configureStore } from "@reduxjs/toolkit";
import notificationsReducer from "./notificationsSlice";
import unreadMessagesReducer from "./unreadMessagesSlice";
import chatListReducer from "./chatListSlice";
import activeChatMessageReducer from "./activeChatMessagesSlice";
import activeAppointmentReducer from "./activeAppointmentSlice";

export const store = configureStore({
  reducer: {
    notifications: notificationsReducer,
    unreadMessages: unreadMessagesReducer,
    chatList: chatListReducer,
    activeChatMessages: activeChatMessageReducer,
    activeAppointment: activeAppointmentReducer,
  },
});
