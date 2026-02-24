import api from "./api";

export const uploadSignature = async (base64) => {
  const response = await api.post("/api/upload/signature", { base64 });
  return response.data;
};

export const uploadImage = async (base64, folder = 'profiles') => {
  const response = await api.post("/api/upload/image", { base64, folder });
  return response.data;
};

// Updated function for file uploads (PDFs, documents, etc.) - now accepts filename
export const uploadFile = async (base64, folder = 'submissions', fileName = null) => {
  const requestBody = { base64, folder };
  if (fileName) {
    requestBody.fileName = fileName;
  }
  const response = await api.post("/api/upload/file", requestBody);
  return response.data;
};