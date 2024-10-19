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
  const [educationErrors, setEducationErrors] = useState<boolean[]>([]);
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
    setEducationErrors(prev => [...prev, false]);
  };

  const removeEducation = (index: number) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
    setEducationErrors(prev => prev.filter((_, i) => i !== index));
  };

  const validateEducation = (edu: Education): boolean => {
    return !!edu.school && !!edu.degree;
  };

  const handleSaveEducation = (index: number) => {
    const edu = profile.education[index];
    const isValid = validateEducation(edu);

    setEducationErrors(prev => {
      const updatedErrors = [...prev];
      updatedErrors[index] = !isValid;
      return updatedErrors;
    });

    if (isValid) {
      const updatedEducation = [...profile.education];
      updatedEducation[index] = edu;
      setProfile(prev => ({ ...prev, education: updatedEducation }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validEducation = profile.education.filter(validateEducation);

    if (validEducation.length !== profile.education.length) {
      setError('Some education entries were not saved due to missing required fields.');
    }

    const updatedProfile = {
      ...profile,
      education: validEducation,
    };

    try {
      await onProfileUpdate(updatedProfile);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError((prevError) => 
        prevError 
          ? `${prevError} Additionally, failed to update profile. Please try again.` 
          : 'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const startYears = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => 1990 + i).reverse();

  const getEndYears = (startYear: string) => {
    const start = parseInt(startYear);
    if (!isNaN(start)) {
      return Array.from({ length: currentYear - start + 1 }, (_, i) => currentYear - i);
    }
    return [];
  };

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
              <Label htmlFor="displayName">Display Name <span className="text-red-500">*</span></Label>
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
                        <div className="space-y-2">
                          <Label htmlFor={`school-${index}`}>School/College <span className="text-red-500">*</span></Label>
                          <Input
                            id={`school-${index}`}
                            placeholder="School/College"
                            value={edu.school}
                            onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                            className={educationErrors[index] ? 'border-red-500' : ''}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`degree-${index}`}>Degree <span className="text-red-500">*</span></Label>
                          <Input
                            id={`degree-${index}`}
                            placeholder="Degree"
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            className={educationErrors[index] ? 'border-red-500' : ''}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`specialization-${index}`}>Specialization</Label>
                          <Input
                            id={`specialization-${index}`}
                            placeholder="Specialization"
                            value={edu.specialization}
                            onChange={(e) => handleEducationChange(index, 'specialization', e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`startYear-${index}`}>Start Year</Label>
                            <Select
                              value={edu.startYear}
                              onValueChange={(value) => handleEducationChange(index, 'startYear', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Start Year" />
                              </SelectTrigger>
                              <SelectContent>
                                {startYears.map(year => (
                                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`endYear-${index}`}>End Year</Label>
                            <Select
                              value={edu.endYear}
                              onValueChange={(value) => handleEducationChange(index, 'endYear', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="End Year" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">Currently Pursuing</SelectItem>
                                {getEndYears(edu.startYear).map(year => (
                                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button type="button" onClick={() => handleSaveEducation(index)} className="w-full mt-4">
                          Save Education
                        </Button>
                        <Button type="button" onClick={() => removeEducation(index)} variant="destructive" className="w-full mt-2">
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

export default ProfileForm;