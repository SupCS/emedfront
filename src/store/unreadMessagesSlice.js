import { createSlice } from "@reduxjs/toolkit";

const unreadMessagesSlice = createSlice({
  name: "unreadMessages",
  initialState: 0,
  reducers: {
    setUnreadMessages: (state, action) => action.payload,
    incrementUnreadMessages: (state) => state + 1,
    decrementUnreadMessages: (state) => Math.max(state - 1, 0),
    decrementUnreadMessagesBy: (state, action) =>
      Math.max(state - action.payload, 0),
  },
});

export const {
  setUnreadMessages,
  incrementUnreadMessages,
  decrementUnreadMessages,
  decrementUnreadMessagesBy,
} = unreadMessagesSlice.actions;

export default unreadMessagesSlice.reducer;
