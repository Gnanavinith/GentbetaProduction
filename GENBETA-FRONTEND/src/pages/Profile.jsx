import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../api/user.api";
import { apiRequest } from "../services/api";
import { 
  User, 
  Mail, 
  Phone,
  Briefcase,
  MessageCircle,
  Building2,
  Factory,
  Globe,
  CreditCard,
  MapPin,
  Calendar,
  Hash,
  Users,
  Receipt
} from "lucide-react";

export default function Profile() {
  const { user, updateUser, token } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [companyData, setCompanyData] = useState(null);
  const [plantData, setPlantData] = useState(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    position: user?.position || "",
    role: user?.role || ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setProfileLoading(false);
        return;
      }
      try {
        const response = await userApi.getProfile();
        if (response.success && response.data?.user) {
          const data = response.data.user;
          updateUser(data);
          setProfileData({
            name: data.name || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            position: data.position || "",
            role: data.role || ""
          });

          // Fetch extra data based on role
          if (data.role === "COMPANY_ADMIN") {
            const companyRes = await apiRequest("/api/companies/my-company", "GET", null, token);
            setCompanyData(companyRes);
          } else if (data.role === "PLANT_ADMIN") {
            const plantRes = await apiRequest("/api/plants/my-plant", "GET", null, token);
            setPlantData(plantRes);
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile info:", error);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const getPlanBadgeColor = (plan) => {
    const colors = {
      SILVER: 'bg-slate-100 text-slate-700',
      GOLD: 'bg-amber-100 text-amber-700',
      PREMIUM: 'bg-purple-100 text-purple-700',
      CUSTOM: 'bg-indigo-100 text-indigo-700'
    };
    return colors[plan?.toUpperCase()] || colors.SILVER;
  };

  if (profileLoading) {
    return (
      <div className="w-full py-10 px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-10 px-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">View your account information and organizational details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - User Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border-4 border-white shadow-md">
                  <User size={48} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{profileData.name}</h2>
                  <span className="inline-block mt-1 px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {profileData.role?.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                  <p className="text-sm font-semibold text-slate-700">{profileData.email || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                  <p className="text-sm font-semibold text-slate-700">{profileData.phoneNumber || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                  <Briefcase size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Position</p>
                  <p className="text-sm font-semibold text-slate-700">{profileData.position || "—"}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-amber-50 border-t border-amber-100">
              <p className="text-[11px] text-amber-700 text-center font-medium">Contact admin to update profile</p>
            </div>
          </div>

          {/* Role specific quick stats */}
          {(companyData || plantData) && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                {companyData && (
                  <>
                    <div className="flex justify-between py-2 border-b border-slate-50 text-sm">
                      <span className="text-slate-500">Plants</span>
                      <span className="font-bold text-slate-800">{companyData.plants?.length || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50 text-sm">
                      <span className="text-slate-500">Plan</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPlanBadgeColor(companyData.subscription?.plan)}`}>
                        {companyData.subscription?.plan || "SILVER"}
                      </span>
                    </div>
                  </>
                )}
                {plantData && (
                  <>
                    <div className="flex justify-between py-2 border-b border-slate-50 text-sm">
                      <span className="text-slate-500">Employees</span>
                      <span className="font-bold text-slate-800">{plantData.employeeCount || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50 text-sm">
                      <span className="text-slate-500">Plant Code</span>
                      <span className="font-bold text-slate-800">{plantData.plant?.code}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Organization Info */}
        <div className="lg:col-span-2 space-y-6">
          {companyData && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center overflow-hidden border border-indigo-100">
                      {companyData.logoUrl ? (
                        <img src={companyData.logoUrl} alt={companyData.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <Building2 className="w-8 h-8 text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">{companyData.name}</h2>
                      <p className="text-indigo-600 font-medium text-sm">{companyData.industry || "Enterprise"}</p>
                    </div>
                    <div className="ml-auto">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${companyData.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {companyData.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Company Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem icon={<Building2 size={18} />} label="Company Name" value={companyData.name} />
                    <DetailItem icon={<Receipt size={18} />} label="GST Number" value={companyData.gstNumber} />
                    <DetailItem icon={<Globe size={18} />} label="Industry" value={companyData.industry} />
                    <DetailItem icon={<MapPin size={18} />} label="Address" value={companyData.address} />
                    <DetailItem icon={<Phone size={18} />} label="Contact Phone" value={companyData.contactPhone} />
                    <DetailItem icon={<Mail size={18} />} label="Contact Email" value={companyData.contactEmail} />
                  </div>
                </div>

                {companyData.subscription && (
                  <div className="p-8 bg-slate-50/50">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Subscription</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailItem icon={<CreditCard size={18} />} label="Current Plan" value={companyData.subscription.plan} isBadge badgeColor={getPlanBadgeColor(companyData.subscription.plan)} />
                      <DetailItem icon={<Calendar size={18} />} label="Start Date" value={formatDate(companyData.subscription.startDate)} />
                      <DetailItem icon={<Hash size={18} />} label="Billing Cycle" value={companyData.subscription.billingCycle} className="capitalize" />
                      <DetailItem icon={<Hash size={18} />} label="Status" value={companyData.subscription.isActive !== false ? "Active" : "Inactive"} className={companyData.subscription.isActive !== false ? "text-emerald-600 font-bold" : "text-red-600 font-bold"} />
                    </div>
                  </div>
                )}
              </div>

              {companyData.plants && companyData.plants.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Plants</h3>
                    <span className="text-xs font-bold text-slate-400 px-2 py-1 bg-slate-100 rounded-lg">{companyData.plants.length} total</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companyData.plants.map((plant) => (
                      <div key={plant._id} className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors bg-slate-50/30 group">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 border border-slate-100 shadow-sm group-hover:bg-emerald-50">
                            <Factory size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 truncate">{plant.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">CODE: {plant.code}</p>
                            <div className="flex items-center gap-1.5 mt-2">
                              <MapPin size={10} className="text-slate-300" />
                              <p className="text-[11px] text-slate-500 truncate">{plant.location || "No location"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {plantData && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                    <Factory className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{plantData.plant?.name}</h2>
                    <p className="text-emerald-600 font-bold text-sm tracking-wider">{plantData.plant?.code}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${plantData.plant?.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {plantData.plant?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Plant Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem icon={<Hash size={18} />} label="Plant Number" value={plantData.plant?.plantNumber} />
                  <DetailItem icon={<MapPin size={18} />} label="Location" value={plantData.plant?.location} />
                  <DetailItem icon={<Users size={18} />} label="Total Employees" value={plantData.employeeCount} />
                  <DetailItem icon={<Calendar size={18} />} label="Created On" value={formatDate(plantData.plant?.createdAt)} />
                </div>
              </div>

              {plantData.company && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                      <Building2 size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Parent Company</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem icon={<Building2 size={18} />} label="Company Name" value={plantData.company.name} />
                    <DetailItem icon={<Globe size={18} />} label="Industry" value={plantData.company.industry} />
                  </div>
                </div>
              )}
            </div>
          )}

          {!companyData && !plantData && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center text-center py-20">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <Building2 size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No Organization Details</h3>
              <p className="text-slate-500 max-w-sm mt-2">You are currently not associated with a specific company or plant record as an administrator.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value, className = "", isBadge = false, badgeColor = "" }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        {isBadge ? (
          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${badgeColor}`}>
            {value || "—"}
          </span>
        ) : (
          <p className={`text-sm font-bold text-slate-700 mt-0.5 truncate ${className}`}>{value || "—"}</p>
        )}
      </div>
    </div>
  );
}
