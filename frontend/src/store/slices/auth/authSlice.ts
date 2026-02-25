import type { AuthState, LoginResponse } from "@/types/auth";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthState = {
  token: localStorage.getItem("token") || "",
  email: localStorage.getItem("email") || "",
  firstName: localStorage.getItem("firstName") || "",
  lastName: localStorage.getItem("lastName") || "",
  role: localStorage.getItem("role") || "",
  permissions: JSON.parse(localStorage.getItem("permissions") || "[]"),
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLogin: (state, action: PayloadAction<LoginResponse>) => {
      const { token, permissions, email, firstName, lastName, role } = action.payload;

      state.token = token || "";
      state.email = email || "";
      state.permissions = permissions || [];
      state.firstName = firstName || "";
      state.lastName = lastName || "";
      state.role = role || "";
      state.isAuthenticated = !!token;

      localStorage.setItem("token", token || "");
      localStorage.setItem("email", email || "");
      localStorage.setItem("firstName", firstName || "");
      localStorage.setItem("lastName", lastName || "");
      localStorage.setItem("role", role || "");
      localStorage.setItem("permissions", JSON.stringify(permissions || [""]));
    },
    setLogout: (state) => {
      state.token = "";
      state.email = "";
      state.firstName = "";
      state.lastName = "";
      state.role = "";
      state.permissions = [""];
      state.isAuthenticated = false;
      localStorage.clear();
    },
  },
});

export const { setLogin, setLogout } = authSlice.actions;
export default authSlice.reducer;
