import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProfileData, Education } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProfileFormProps {
  fetchProfile: () => Promise<ProfileData>;
  onProfileUpdate: (profile: ProfileData) => Promise<void>;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ fetchProfile, onProfileUpdate }) => {
  const [profile, setProfile] = useState<ProfileData>({
    displayName: '',
    bio: '',
    education: [],
    hobbies: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const fetchedProfile = await fetchProfile();
        setProfile(fetchedProfile);
      } catch (error) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [fetchProfile]);

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const updatedEducation = [...profile.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setProfile(prev => ({ ...prev, education: updatedEducation }));
  };

  const addEducation = () => {
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, { school: '', degree: '', specialization: '', startYear: '', endYear: '' }],
    }));
  };

  const removeEducation = (index: number) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onProfileUpdate(profile);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            name="displayName"
            value={profile.displayName}
            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={3}
          />
        </div>
        <div>
          <Label>Education</Label>
          {profile.education.map((edu, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <Input
                placeholder="School"
                value={edu.school}
                onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                className="mb-2"
              />
              <Input
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                className="mb-2"
              />
              <Input
                placeholder="Specialization"
                value={edu.specialization}
                onChange={(e) => handleEducationChange(index, 'specialization', e.target.value)}
                className="mb-2"
              />
              <select
                value={edu.startYear}
                onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)}
                className="mb-2"
              >
                <option value="">Start Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {parseInt(edu.endYear) > currentYear ? (
                <div className="mb-2">Present</div>
              ) : (
                <>
                  <select
                    value={edu.endYear}
                    onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)}
                    className="mb-2"
                  >
                    <option value="">End Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-2">
                    Note: Leave the end year blank if you are currently pursuing the degree.
                  </p>
                </>
              )}
              <Button type="button" onClick={() => removeEducation(index)} variant="destructive">
                Remove Education
              </Button>
            </div>
          ))}
          <Button type="button" onClick={addEducation} className="mb-4">
            Add Education
          </Button>
        </div>
        <div>
          <Label htmlFor="hobbies">Hobbies</Label>
          <Input
            id="hobbies"
            name="hobbies"
            value={profile.hobbies}
            onChange={(e) => setProfile({ ...profile, hobbies: e.target.value })}
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <div className="flex justify-between">
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
          <Button type="button" onClick={() => navigate('/dashboard')} variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};