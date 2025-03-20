import { createSlice } from "@reduxjs/toolkit";

const unreadMessagesSlice = createSlice({
  name: "unreadMessages",
  initialState: 0, // Початкове значення (кількість непрочитаних повідомлень)
  reducers: {
    setUnreadMessages: (state, action) => action.payload,
    incrementUnreadMessages: (state) => state + 1,
    decrementUnreadMessages: (state) => Math.max(state - 1, 0),
  },
});

export const {
  setUnreadMessages,
  incrementUnreadMessages,
  decrementUnreadMessages,
} = unreadMessagesSlice.actions;
export default unreadMessagesSlice.reducer;
