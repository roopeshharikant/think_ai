import api from './axios';

export const runCode = ({ language, code, stdin = '', submissionId, questionId, testCaseId }) =>
  api
    .post('/code/run', { language, code, stdin, submissionId, questionId, testCaseId })
    .then((res) => res.data.data);

export const submitSolution = ({ submissionId, questionId, language, code }) =>
  api
    .post('/code/submit', { submissionId, questionId, language, code })
    .then((res) => res.data.data);

export const getSubmissionResult = (submissionId) =>
  api.get(`/code/submissions/${submissionId}`).then((res) => res.data.data);

export const practiceRun = ({ language, code, stdin = '' }) =>
  api.post('/code/practice-run', { language, code, stdin }).then((res) => res.data.data);