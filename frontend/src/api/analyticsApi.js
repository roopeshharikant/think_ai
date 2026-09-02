import api from "./axios";

export const getEnrollmentTrends = (params = {}) =>
  api.get("/analytics/enrollment-trends", { params });

export const getCourseEnrollments = (params = {}) =>
  api.get("/analytics/course-enrollments", { params });

export const getCourseCompletionRates = (params = {}) =>
  api.get("/analytics/course-completion-rates", { params });

export const getAssessmentAnalytics = (params = {}) =>
  api.get("/analytics/assessment", { params });