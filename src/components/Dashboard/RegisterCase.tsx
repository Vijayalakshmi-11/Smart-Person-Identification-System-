import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { generateFaceDescriptor } from '../../services/api';
import { Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export function RegisterCase() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    description: '',
    lastSeenLocation: '',
    lastSeenDate: '',
    contactInfo: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!photoFile) {
        throw new Error('Please upload a photo');
      }

      let photoUrl = '';
      let descriptor: number[] | null = null;

      const fileName = `${Date.now()}_${photoFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('missing-persons')
        .upload(fileName, photoFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('missing-persons')
        .getPublicUrl(uploadData.path);

      photoUrl = urlData.publicUrl;

      try {
        const descriptorResponse = await generateFaceDescriptor(photoFile);
        if (descriptorResponse.success && descriptorResponse.descriptor) {
          descriptor = descriptorResponse.descriptor;
        }
      } catch (err) {
        console.error('Failed to generate descriptor:', err);
      }

      const caseNumber = `MP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const { error: insertError } = await supabase
        .from('missing_persons')
        .insert({
          case_number: caseNumber,
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          description: formData.description,
          last_seen_location: formData.lastSeenLocation,
          last_seen_date: formData.lastSeenDate,
          photo_url: photoUrl,
          descriptor: descriptor,
          contact_info: formData.contactInfo,
          user_id: user.id,
          status: 'active',
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({
        name: '',
        age: '',
        gender: 'male',
        description: '',
        lastSeenLocation: '',
        lastSeenDate: '',
        contactInfo: '',
      });
      setPhotoFile(null);
      setPhotoPreview('');

      setTimeout(() => setSuccess(false), 5000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Register Missing Person</h2>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-green-800 text-sm">Missing person case registered successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                required
                min="0"
                max="120"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="lastSeenDate" className="block text-sm font-medium text-gray-700 mb-2">
                Last Seen Date *
              </label>
              <input
                id="lastSeenDate"
                name="lastSeenDate"
                type="datetime-local"
                value={formData.lastSeenDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lastSeenLocation" className="block text-sm font-medium text-gray-700 mb-2">
              Last Seen Location *
            </label>
            <input
              id="lastSeenLocation"
              name="lastSeenLocation"
              type="text"
              value={formData.lastSeenLocation}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Central Park, New York"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Physical Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Height, build, hair color, clothing, distinguishing features..."
            />
          </div>

          <div>
            <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Information *
            </label>
            <input
              id="contactInfo"
              name="contactInfo"
              type="text"
              value={formData.contactInfo}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Phone number or email for reporting"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photo *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
              {photoPreview ? (
                <div className="space-y-4">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Change Photo
                  </button>
                </div>
              ) : (
                <label htmlFor="photo" className="cursor-pointer">
                  <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                Registering Case...
              </>
            ) : (
              'Register Case'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
