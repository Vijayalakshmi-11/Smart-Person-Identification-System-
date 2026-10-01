import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Video,
  Eye,
  Camera,
} from "lucide-react";

import { ActiveCases } from "./ActiveCases";
import { RegisterCase } from "./RegisterCase";
import { CCTVScanner } from "./CCTVScanner";
import LiveCamera from "./live_camera";
import { SightingsReview } from "./SightingsReview";
import RealtimeStats from "./RealtimeStats";
import DashboardGraphs from "./DashboardGraphs";

type Tab =
  | "overview"
  | "active"
  | "register"
  | "scanner"
  | "live"
  | "sightings";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // 🔹 Shared data for graphs & sightings
  const [sightings, setSightings] = useState<any[]>([]);
  const [missingPersons, setMissingPersons] = useState<any[]>([]);

  // 🔹 Fetch data for analytics & sightings
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sRes, mRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/sightings"),
          fetch("http://127.0.0.1:8000/missing-persons"),
        ]);

        const sightingsData = await sRes.json();
        const missingData = await mRes.json();

        setSightings(sightingsData);
        setMissingPersons(missingData);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    };

    fetchDashboardData();

    // refresh every 5 seconds (near real-time)
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "active", label: "Active Cases", icon: Users },
    { id: "register", label: "Register Case", icon: FileText },
    { id: "scanner", label: "CCTV Scanner", icon: Video },
    { id: "live", label: "Live Camera", icon: Camera },
    { id: "sightings", label: "Sightings", icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Adaptive Intelligence Identification System
        </h1>
      </div>

      {/* Tabs */}
      <div className="px-6 bg-white border-b">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 py-3 px-2 border-b-2 transition ${
                  active
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* ✅ DASHBOARD OVERVIEW (Analytics) */}
        {activeTab === "overview" && (
          <>
            <RealtimeStats />
            <DashboardGraphs
              sightings={sightings}
              missingPersons={missingPersons}
            />
          </>
        )}

        {activeTab === "active" && <ActiveCases />}

        {activeTab === "register" && <RegisterCase />}

        {activeTab === "scanner" && <CCTVScanner />}

        {activeTab === "live" && <LiveCamera />}

        {activeTab === "sightings" && (
          <SightingsReview sightings={sightings} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
