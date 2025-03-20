import { configureStore } from "@reduxjs/toolkit";
import notificationsReducer from "./notificationsSlice";
import unreadMessagesReducer from "./unreadMessagesSlice";

export const store = configureStore({
  reducer: {
    notifications: notificationsReducer,
    unreadMessages: unreadMessagesReducer,
  },
});
