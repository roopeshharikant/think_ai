import axiosInstance from "./axios";

const BASE_URL = "/assessments";
const ADMIN_BASE = "/admin";

// Assessment CRUD & Submissions
export const getAllAssessments = (moduleId) =>
  axiosInstance.get(BASE_URL, { params: moduleId ? { moduleId } : {} });

export const deleteAssessment = (id) =>
  axiosInstance.delete(`${BASE_URL}/${id}`);

export const createAssessment = (payload) =>
  axiosInstance.post(BASE_URL, payload);

export const updateAssessment = (id, payload) =>
  axiosInstance.put(`${BASE_URL}/${id}`, payload);

export const getAssessmentById = (id) =>
  axiosInstance.get(`${BASE_URL}/${id}`);

export const startAssessment = (id, enrollmentId) =>
  axiosInstance.post(`${BASE_URL}/${id}/start`, { enrollmentId });

export const submitAssessment = (id, payload) =>
  axiosInstance.post(`${BASE_URL}/${id}/submit`, payload);

export const getAssessmentAnalytics = (id) =>
  axiosInstance.get(`${BASE_URL}/${id}/analytics`);

export const getEnrollmentAssessmentStatus = (enrollmentId) =>
  axiosInstance.get(`${BASE_URL}/enrollment/${enrollmentId}/status`);

export const getAssessmentSubmissionResult = (submissionId) =>
  axiosInstance.get(`${BASE_URL}/submissions/${submissionId}/result`);

// Admin Coding Question Management
export const createCodingQuestion = (payload) =>
  axiosInstance.post(`${ADMIN_BASE}/coding-questions`, payload);

export const getCodingQuestions = (assessmentId) =>
  axiosInstance.get(`${ADMIN_BASE}/assessments/${assessmentId}/coding-questions`);

export const getCodingQuestionById = (questionId) =>
  axiosInstance.get(`${ADMIN_BASE}/coding-questions/${questionId}`);

export const updateCodingQuestion = (questionId, payload) =>
  axiosInstance.put(`${ADMIN_BASE}/coding-questions/${questionId}`, payload);

export const deleteCodingQuestion = (questionId) =>
  axiosInstance.delete(`${ADMIN_BASE}/coding-questions/${questionId}`);

// Admin Coding Test Case Management
export const createCodingTestCase = (questionId, payload) =>
  axiosInstance.post(`${ADMIN_BASE}/coding-questions/${questionId}/test-cases`, payload);

export const getCodingTestCases = (questionId) =>
  axiosInstance.get(`${ADMIN_BASE}/coding-questions/${questionId}/test-cases`);

export const updateCodingTestCase = (testCaseId, payload) =>
  axiosInstance.put(`${ADMIN_BASE}/coding-test-cases/${testCaseId}`, payload);

export const deleteCodingTestCase = (testCaseId) =>
  axiosInstance.delete(`${ADMIN_BASE}/coding-test-cases/${testCaseId}`);