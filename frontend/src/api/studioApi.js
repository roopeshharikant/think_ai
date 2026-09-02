import api from "./axios";

export const getStudioSession = (sessionId) => 
  api.get(`/studio/sessions/${sessionId}`);

export const joinStudioSession = (sessionId) => 
  api.post(`/studio/sessions/${sessionId}/join`);

export const createStudioPoll = (sessionId, data) => 
  api.post(`/studio/sessions/${sessionId}/polls`, data);

export const voteStudioPoll = (pollId, optionId) => 
  api.post(`/studio/polls/${pollId}/vote`, { optionId });

export const updateAttendeeMediaStatus = (sessionId, statusData) => 
  api.patch(`/studio/sessions/${sessionId}/attendee`, statusData);