import api from "./axios";

export const getAllLessons = () =>
  api.get("/lessons");

export const getLessons = getAllLessons;

export const getLessonById = (id) =>
  api.get(`/lessons/${id}`);

export const getLessonsByModuleId = (moduleId) =>
  api.get(`/lessons/module/${moduleId}`);

export const createLesson = (data) =>
  api.post("/lessons", data);

export const updateLesson = (id, data) =>
  api.put(`/lessons/${id}`, data);

export const deleteLesson = (id) =>
  api.delete(`/lessons/${id}`);