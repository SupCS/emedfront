import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: [],
  reducers: {
    addNotification: (state, action) => {
      console.log("🟢 Додаємо сповіщення в Redux:", action.payload);
      console.log("📊 Поточна кількість сповіщень у state:", state.length + 1);
      if (!action.payload.chatId) {
        console.warn(
          "⚠️ Попередження: сповіщення не має `chatId`!",
          action.payload
        );
      }
      state.push(action.payload);
    },
    removeNotification: (state, action) => {
      console.log("🔴 Видаляємо сповіщення:", action.payload);
      return state.filter((notif) => notif.id !== action.payload);
    },
    clearNotifications: () => {
      console.log("🟡 Очищаємо всі сповіщення");
      return [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
