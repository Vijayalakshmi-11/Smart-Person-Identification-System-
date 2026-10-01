import { useEffect, useState } from "react";
import { Users, Eye, CheckCircle, Clock } from "lucide-react";

type Stats = {
  activeMissing: number;
  sightingsToday: number;
  confirmedSightings: number;
  pendingReviews: number;
};

const RealtimeStats = () => {
  const [stats, setStats] = useState<Stats>({
    activeMissing: 0,
    sightingsToday: 0,
    confirmedSightings: 0,
    pendingReviews: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats");
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // 🔁 real-time refresh
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      label: "Active Missing",
      value: stats.activeMissing,
      icon: <Users className="text-blue-600" />,
    },
    {
      label: "Sightings Today",
      value: stats.sightingsToday,
      icon: <Eye className="text-purple-600" />,
    },
    {
      label: "Confirmed",
      value: stats.confirmedSightings,
      icon: <CheckCircle className="text-green-600" />,
    },
    {
      label: "Pending Review",
      value: stats.pendingReviews,
      icon: <Clock className="text-orange-600" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 mb-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-5 bg-white shadow-md rounded-2xl"
        >
          <div className="p-3 bg-gray-100 rounded-xl">
            {card.icon}
          </div>
          <div>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealtimeStats;
