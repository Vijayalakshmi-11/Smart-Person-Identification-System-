import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { scanVideo, ScanMatch } from '../../services/api';
import {  AlertCircle, CheckCircle, Loader, Video, Image as ImageIcon } from 'lucide-react';

export function CCTVScanner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [matches, setMatches] = useState<ScanMatch[]>([]);
  const [scanComplete, setScanComplete] = useState(false);
  const [location, setLocation] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setScanComplete(false);
      setMatches([]);
      setError('');

      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview('');
      }
    }
  };

  const handleScan = async () => {
    if (!file) {
      setError('Please select a file to scan');
      return;
    }

    setLoading(true);
    setError('');
    setScanComplete(false);

    try {
      const { data: persons, error: fetchError } = await supabase
        .from('missing_persons')
        .select('id, name, descriptor, case_number, photo_url, last_seen_location')
        .eq('status', 'active')
        .not('descriptor', 'is', null);

      if (fetchError) throw fetchError;

      if (!persons || persons.length === 0) {
        throw new Error('No active missing person cases with face data found');
      }

      const result = await scanVideo(file, persons);

      setMatches(result.matches);
      setScanComplete(true);

      if (result.matches.length > 0 && location) {
        for (const match of result.matches) {
          await supabase.from('sightings').insert({
            missing_person_id: match.person_id,
            confidence_score: match.confidence,
            location: location,
            status: 'pending_review',
            bbox: match.bbox || null,
            sighting_date: new Date().toISOString(),
          });
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="p-8 bg-white shadow-lg rounded-2xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">CCTV Scanner</h2>

        <div className="space-y-6">
          {error && (
            <div className="flex items-start gap-3 p-4 border border-red-200 rounded-lg bg-red-50">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Upload CCTV Video or Image
            </label>
            <div className="p-8 text-center transition border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500">
              {file ? (
                <div className="space-y-4">
                  {filePreview && (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="mx-auto rounded-lg max-h-64"
                    />
                  )}
                  {!filePreview && file.type.startsWith('video/') && (
                    <Video className="mx-auto text-blue-600" size={64} />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setFilePreview('');
                      setMatches([]);
                      setScanComplete(false);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <label htmlFor="cctv-file" className="cursor-pointer">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Video className="text-gray-400" size={48} />
                    <ImageIcon className="text-gray-400" size={48} />
                  </div>
                  <p className="mb-2 text-gray-600">Click to upload CCTV footage or image</p>
                  <p className="text-sm text-gray-500">Supports MP4, MOV, AVI, JPG, PNG</p>
                  <input
                    id="cctv-file"
                    type="file"
                    accept="video/*,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block mb-2 text-sm font-medium text-gray-700">
              Location (Optional)
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Main Street CCTV Camera 5"
            />
          </div>

          <button
            onClick={handleScan}
            disabled={loading || !file}
            className="flex items-center justify-center w-full gap-2 py-3 font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                Scanning...
              </>
            ) : (
              'Start Scan'
            )}
          </button>

          {scanComplete && (
            <div className="pt-8 mt-8 border-t border-gray-200">
              <h3 className="mb-4 text-xl font-bold text-gray-900">Scan Results</h3>

              {matches.length === 0 ? (
                <div className="flex items-start gap-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-blue-800">
                    Scan completed. No matches found above the confidence threshold.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-green-800">
                      Found {matches.length} potential match{matches.length > 1 ? 'es' : ''}! Sightings have been recorded for review.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {matches.map((match, index) => (
                      <div
                        key={index}
                        className="p-6 transition bg-white border-2 border-orange-200 rounded-lg hover:border-orange-300"
                      >
                        <div className="flex items-start gap-4">
                          {match.photo_url && (
                            <img
                              src={match.photo_url}
                              alt={match.person_name}
                              className="object-cover w-24 h-24 rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-lg font-bold text-gray-900">{match.person_name}</h4>
                                <p className="text-sm text-gray-500">{match.case_number}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                match.confidence >= 80
                                  ? 'bg-green-100 text-green-800'
                                  : match.confidence >= 70
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {match.confidence.toFixed(1)}% Match
                              </span>
                            </div>
                            {match.last_seen_location && (
                              <p className="text-sm text-gray-600">
                                Last seen: {match.last_seen_location}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
