import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  format,
  subDays,
  startOfDay,
  startOfMonth,
  subMonths,
  eachDayOfInterval,
  eachMonthOfInterval,
} from "date-fns";
import { Activity, TrendingUp, PieChart as PieIcon } from "lucide-react";

interface Sighting {
  sighting_date: string;
}

interface MissingPerson {
  created_at: string;
  status: string | null;
}

interface DashboardGraphsProps {
  sightings?: Sighting[];
  missingPersons?: MissingPerson[];
}

const DashboardGraphs = ({
  sightings = [],
  missingPersons = [],
}: DashboardGraphsProps) => {
  /* ---------------- DAILY SIGHTINGS (LAST 7 DAYS) ---------------- */
  const dailySightings = useMemo(() => {
    const today = startOfDay(new Date());
    const days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    return days.map((day: Date) => {
      const dayKey = format(day, "yyyy-MM-dd");

      const count = sightings.filter(
        (s) =>
          format(new Date(s.sighting_date), "yyyy-MM-dd") === dayKey
      ).length;

      return {
        name: format(day, "EEE"),
        value: count,
      };
    });
  }, [sightings]);

  /* ---------------- MONTHLY OVERVIEW (LAST 6 MONTHS) ---------------- */
  const monthlyOverview = useMemo(() => {
    const today = startOfMonth(new Date());
    const months = eachMonthOfInterval({
      start: subMonths(today, 5),
      end: today,
    });

    return months.map((month: Date) => {
      const monthKey = format(month, "yyyy-MM");

      const cases = missingPersons.filter(
        (p) =>
          format(new Date(p.created_at), "yyyy-MM") === monthKey
      ).length;

      const detected = sightings.filter(
        (s) =>
          format(new Date(s.sighting_date), "yyyy-MM") === monthKey
      ).length;

      return {
        name: format(month, "MMM"),
        cases,
        detected,
      };
    });
  }, [missingPersons, sightings]);

  /* ---------------- CASE STATUS DISTRIBUTION ---------------- */
  const caseStatus = useMemo(() => {
    const active = missingPersons.filter(
      (p) => p.status === "missing"
    ).length;

    const found = missingPersons.filter(
      (p) => p.status === "found"
    ).length;

    const closed = missingPersons.filter(
      (p) => p.status === "closed"
    ).length;

    return [
      { name: "Active", value: active, color: "#ef4444" },
      { name: "Found", value: found, color: "#22c55e" },
      { name: "Closed", value: closed, color: "#9ca3af" },
    ].filter((i) => i.value > 0);
  }, [missingPersons]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* ---------------- DAILY SIGHTINGS ---------------- */}
      <div className="p-6 bg-white shadow rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">
            Daily Sightings
          </h3>
        </div>

        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailySightings}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------------- MONTHLY OVERVIEW ---------------- */}
      <div className="p-6 bg-white shadow rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-800">
            Monthly Overview
          </h3>
        </div>

        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyOverview}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="cases"
                stroke="#f97316"
                fill="#fed7aa"
              />
              <Area
                type="monotone"
                dataKey="detected"
                stroke="#22c55e"
                fill="#bbf7d0"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------------- CASE STATUS ---------------- */}
      <div className="p-6 bg-white shadow rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <PieIcon className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-800">
            Case Status
          </h3>
        </div>

        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={caseStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
              >
                {caseStatus.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardGraphs;
