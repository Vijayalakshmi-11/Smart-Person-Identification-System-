import { Eye } from "lucide-react";

interface Sighting {
  id: string;
  confidence_score: number;
  location: string;
  status: string;
  created_at: string;
  missing_persons?: {
    name: string;
  };
}

export const SightingsReview = ({ sightings }: { sightings: Sighting[] }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold">
        <Eye size={20} /> Sightings
      </h2>

      {sightings.length === 0 && (
        <p className="text-gray-500">No sightings yet.</p>
      )}

      <div className="space-y-4">
        {sightings.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <p className="font-semibold">
                {s.missing_persons?.name || "Unknown Person"}
              </p>

              <p className="text-sm text-gray-600">
                Confidence: {(s.confidence_score * 100).toFixed(1)}%
              </p>

              <p className="text-sm text-gray-500">
                Source: {s.location}
              </p>
            </div>

            <div className="text-sm text-right text-gray-500">
              {new Date(s.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
