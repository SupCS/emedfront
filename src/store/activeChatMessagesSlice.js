import { createSlice } from "@reduxjs/toolkit";

const activeChatMessagesSlice = createSlice({
  name: "activeChatMessages",
  initialState: [],
  reducers: {
    setActiveChatMessages: (_, action) => action.payload,
    addMessageToActiveChat: (state, action) => {
      const exists = state.some((m) => m._id === action.payload._id);
      if (!exists) {
        state.push(action.payload);
      }
    },
    resetActiveChatMessages: () => [],
  },
});

export const {
  setActiveChatMessages,
  addMessageToActiveChat,
  resetActiveChatMessages,
} = activeChatMessagesSlice.actions;

export default activeChatMessagesSlice.reducer;
