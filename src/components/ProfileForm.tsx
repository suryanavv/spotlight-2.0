import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProfileData, Education } from '../types';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information and education history</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                name="displayName"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Education</Label>
              <Accordion type="single" collapsible className="w-full">
                {profile.education.map((edu, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>
      {edu.school ? `${edu.school} - ${edu.degree}` : `Education ${index + 1}`}
    </AccordionTrigger>
    <AccordionContent>
                      <div className="space-y-4">
                        <Input
                          placeholder="School"
                          value={edu.school}
                          onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                        />
                        <Input
                          placeholder="Degree"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        />
                        <Input
                          placeholder="Specialization"
                          value={edu.specialization}
                          onChange={(e) => handleEducationChange(index, 'specialization', e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Select
                            value={edu.startYear}
                            onValueChange={(value) => handleEducationChange(index, 'startYear', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Start Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={edu.endYear}
                            onValueChange={(value) => handleEducationChange(index, 'endYear', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="End Year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              {years.map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="button" onClick={() => removeEducation(index)} variant="destructive" className="w-full">
                          <Trash2 className="w-4 h-4 mr-2" /> Remove Education
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Button type="button" onClick={addEducation} variant="outline" className="w-full mt-4">
                <Plus className="w-4 h-4 mr-2" /> Add Education
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hobbies">Hobbies</Label>
              <Input
                id="hobbies"
                name="hobbies"
                value={profile.hobbies}
                onChange={(e) => setProfile({ ...profile, hobbies: e.target.value })}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-between">
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
              <Button type="button" onClick={() => navigate('/dashboard')} variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};