import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isActive: false,
  callId: null,
};

const activeAppointmentSlice = createSlice({
  name: "activeAppointment",
  initialState,
  reducers: {
    startAppointment(state, action) {
      state.isActive = true;
      state.callId = action.payload.callId;
    },
    resetAppointment(state) {
      state.isActive = false;
      state.callId = null;
    },
  },
});

export const { startAppointment, resetAppointment } =
  activeAppointmentSlice.actions;
export default activeAppointmentSlice.reducer;
