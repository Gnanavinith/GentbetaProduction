import api from "./api";

export const uploadSignature = async (base64) => {
  const response = await api.post("/api/upload/signature", { base64 });
  return response.data;
};

export const uploadImage = async (base64, folder = 'profiles') => {
  const response = await api.post("/api/upload/image", { base64, folder });
  return response.data;
};
