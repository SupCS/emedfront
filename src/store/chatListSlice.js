import { createSlice } from "@reduxjs/toolkit";

const chatListSlice = createSlice({
  name: "chatList",
  initialState: [],
  reducers: {
    setChats: (_, action) => action.payload,
    incrementUnreadForChat: (state, action) => {
      const chat = state.find((c) => c._id === action.payload);
      if (chat) {
        chat.unreadCount = (chat.unreadCount || 0) + 1;
      }
    },
    resetUnreadForChat: (state, action) => {
      const chat = state.find((c) => c._id === action.payload);
      if (chat) {
        chat.unreadCount = 0;
      }
    },
  },
});

export const { setChats, incrementUnreadForChat, resetUnreadForChat } =
  chatListSlice.actions;
export default chatListSlice.reducer;
