import axios from 'axios';

export const getInstructorDashboardStats = async () => {
  return await axios.get('/api/instructor/stats');
};

export const getInstructorAssignments = async () => {
  return await axios.get('/api/instructor/assignments');
};

export const deleteInstructorAssignment = async (id) => {
  return await axios.delete(`/api/assessments/${id}`);
};