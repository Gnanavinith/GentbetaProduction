import { useState, useEffect } from "react";
import { Modal, Input, Section } from "./Modal";
import { Save, Info } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function EditPlantModal({ plant, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [FacilityData, setFacilityData] = useState({
    name: "",
    location: ""
  });

  useEffect(() => {
    if (plant) {
      setFacilityData({
        name: plant.name || "",
        location: plant.location || ""
      });
    }
  }, [plant]);

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Plant name is required");
      return;
    }

    setLoading(true);
    try {
      await axios.put(`/api/plants/${plant._id}`, formData);
      toast.success("Plant updated successfully");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update plant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Edit Plant Details" onClose={onClose}>
      <div className="space-y-6">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-lg shadow-sm flex items-center justify-center text-indigo-600">
            <Info size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Plant Information</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Update the basic details of this manufacturing unit.</p>
          </div>
        </div>

        <Section title="Basic Details">
          <div className="md:col-span-2">
            <Input
              label="Plant Name"
              value={formData.name}
              onChange={(v) => setFacilityData({ ...formData, name: v })}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Location"
              value={formData.location}
              onChange={(v) => setFacilityData({ ...formData, location: v })}
            />
          </div>
        </Section>

        <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
