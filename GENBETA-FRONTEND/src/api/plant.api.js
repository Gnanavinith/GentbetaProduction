import api from "./api";

export const plantApi = {
  getPlants: async () => {
    const response = await api.get("/api/plants");
    return response.data.data || response.data;
  },
  getPlantById: async (id) => {
    const response = await api.get(`/api/plants/${id}`);
    return response.data;
  },
  updateTemplateFeature: async (plantId, enabled) => {
    console.log("Calling updatePlantTemplateFeature API:", { plantId, enabled });
    try {
      const response = await api.put("/api/plants/template-feature", { plantId, enabled });
      console.log("Plant API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Plant API Error:", error);
      throw error;
    }
  }
};
