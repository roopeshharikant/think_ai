import api from "./axios";

export const getActiveCertificateTemplate = () =>
  api.get("/certificate-templates/active");

export const getAllCertificateTemplates = () =>
  api.get("/certificate-templates");

export const getCertificateTemplateById = (id) =>
  api.get(`/certificate-templates/${id}`);

export const createCertificateTemplate = (data) =>
  api.post("/certificate-templates", data);

export const updateCertificateTemplate = (id, data) =>
  api.put(`/certificate-templates/${id}`, data);

export const deleteCertificateTemplate = (id) =>
  api.delete(`/certificate-templates/${id}`);