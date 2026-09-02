import api from "./axios";

export const getUsersApi = () => api.get("/admin/users");

export const createUserApi = (data) => api.post("/admin/users", data);

// Sends whatever fields changed (name/email/role) — matches the backend's
// combined PATCH /users/:id, not a role-only endpoint.
export const updateUserApi = (userId, data) => api.patch(`/admin/users/${userId}`, data);

export const deleteUserApi = (userId) => api.delete(`/admin/users/${userId}`);