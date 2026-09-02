import api from "./axios";

export const loginApi = async (credentials) => {
  const res = await api.post("/auth/login", credentials);
  // Ensure we extract data safely, stripping out headers/config
  return res.data;
};

export const registerApi = async (formData) => {
  const res = await api.post("/auth/register", formData);
  return res.data;
};

export const updateProfileApi = async (userId, updates) => {
  const res = await api.put(`/admin/users/${userId}`, updates);
  return res.data;
};

export const logoutApi = async () => {
  return { success: true, message: "Logged out" };
};

export const getCurrentUserApi = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};