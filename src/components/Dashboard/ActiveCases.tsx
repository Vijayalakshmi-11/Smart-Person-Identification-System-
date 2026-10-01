import { useEffect, useState } from 'react';
import { supabase, MissingPerson } from '../../lib/supabase';
import { User, MapPin, Calendar, AlertCircle, Search } from 'lucide-react';

export function ActiveCases() {
  const [cases, setCases] = useState<MissingPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from('missing_persons')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCases(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.last_seen_location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 border border-red-200 rounded-lg bg-red-50">
        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={20} />
          <input
            type="text"
            placeholder="Search by name, case number, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredCases.length === 0 ? (
        <div className="py-12 text-center rounded-lg bg-gray-50">
          <User className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No active cases found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'Register a new case to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCases.map((person) => (
            <div
              key={person.id}
              className="overflow-hidden transition bg-white shadow-md rounded-xl hover:shadow-xl"
            >
              {person.photo_url ? (
                <img
                  src={person.photo_url}
                  alt={person.name}
                  className="object-cover w-full h-48"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-48 bg-gray-200">
                  <User className="text-gray-400" size={64} />
                </div>
              )}

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="mb-1 text-xl font-bold text-gray-900">{person.name}</h3>
                  <p className="text-sm text-gray-500">{person.case_number}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <User className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <span className="text-gray-600">{person.age} years old</span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-gray-600 capitalize">{person.gender}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-gray-600">{person.last_seen_location}</span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-gray-600">
                      {new Date(person.last_seen_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {person.description && (
                  <p className="mt-4 text-sm text-gray-600 line-clamp-3">
                    {person.description}
                  </p>
                )}

                {person.contact_info && (
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Contact:</span> {person.contact_info}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
