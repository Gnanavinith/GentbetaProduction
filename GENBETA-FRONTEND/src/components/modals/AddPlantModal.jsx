import { useState } from "react";
import { apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Modal, Input, Section } from "./Modal";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AddPlantModal({ companyId, onClose, onSaved }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

    const [plant, setPlant] = useState({
      plantName: "",
      location: "",
      plantNumber: ""
    });
  
    const save = async () => {
      if (!plant.plantName || !plant.location) {
        toast.error("Please fill in all the required fields");
        return;
      }
  
      try {
        setLoading(true);
        await apiRequest(
          "/api/plant/create",
          "POST",
          {
            companyId,
            name: plant.plantName,
            location: plant.location,
            plantNumber: plant.plantNumber
          },
          token
        );

        toast.success("Plant created successfully");
        onSaved();
        onClose();
    } catch (err) {
      toast.error(err.message || "Failed to add plant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add New Plant" onClose={onClose}>
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        <div className="mb-6">
          <p className="text-sm text-slate-500">Create a new manufacturing unit and assign a plant administrator.</p>
        </div>

        <Section title="Plant Information">
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Plant Name"
              value={plant.plantName}
              placeholder="e.g. Pune Manufacturing Unit"
              onChange={v => setPlant({ ...plant, plantName: v })}
            />
            <Input
              label="Location"
              value={plant.location}
              placeholder="e.g. Chakan, Pune"
              onChange={v => setPlant({ ...plant, location: v })}
            />
          </div>
        </Section>

        <Section title="Plant Administrator">
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Admin Name"
              value={plant.adminName}
              placeholder="Full Name"
              onChange={v => setPlant({ ...plant, adminName: v })}
            />
            <Input
              label="Admin Email"
              value={plant.adminEmail}
              placeholder="email@example.com"
              type="email"
              onChange={v => setPlant({ ...plant, adminEmail: v })}
            />
            <Input
              label="Temp Password"
              value={plant.adminPassword}
              placeholder="••••••••"
              type="password"
              onChange={v => setPlant({ ...plant, adminPassword: v })}
            />
          </div>
        </Section>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100">
        <button
          onClick={save}
          disabled={loading}
          className={`w-full ${loading ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Plus />
              Create Plant
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
