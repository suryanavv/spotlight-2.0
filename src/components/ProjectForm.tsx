import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../firebase/config';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from '../contexts/AuthContext';  // Add this import

interface ProjectData {
  title: string;
  description: string;
  technologies: string[];
  thumbnail: string;
  screenshots: string[];
  projectUrl: string;
}

interface ProjectFormProps {
  // ... existing props
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ /* existing props */ }) => {
  const [project, setProject] = useState<ProjectData>({
    title: '',
    description: '',
    technologies: [],
    thumbnail: '',
    screenshots: [],
    projectUrl: '',
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [existingScreenshots, setExistingScreenshots] = useState<string[]>([]);
  const [removedScreenshots, setRemovedScreenshots] = useState<string[]>([]);
  const { currentUser } = useAuth();  // This line should now work

  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId]);

  const fetchProject = async (id: string) => {
    try {
      const docRef = doc(db, 'projects', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const projectData = docSnap.data() as ProjectData;
        setProject(projectData);
        setThumbnailPreview(projectData.thumbnail);
        setExistingScreenshots(projectData.screenshots);
        setScreenshotPreviews(projectData.screenshots);
      } else {
        setError('Project not found');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project. Please try again later.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };

  const handleTechnologiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const technologies = e.target.value.split(',').map(tech => tech.trim());
    setProject(prev => ({ ...prev, technologies }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setScreenshotFiles(prevFiles => [...prevFiles, ...newFiles]);
      
      // Create preview URLs for the new files
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setScreenshotPreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
  };

  const removeScreenshot = (index: number) => {
    if (index < existingScreenshots.length) {
      // This is an existing screenshot
      const removedScreenshot = existingScreenshots[index];
      setRemovedScreenshots(prev => [...prev, removedScreenshot]);
      setExistingScreenshots(prev => prev.filter((_, i) => i !== index));
    } else {
      // This is a new screenshot
      const adjustedIndex = index - existingScreenshots.length;
      setScreenshotFiles(prevFiles => prevFiles.filter((_, i) => i !== adjustedIndex));
    }
    setScreenshotPreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const scaleFactor = Math.min(1, 1000 / img.width);
          canvas.width = img.width * scaleFactor;
          canvas.height = img.height * scaleFactor;
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
              } else {
                reject(new Error('Canvas to Blob conversion failed'));
              }
            },
            'image/jpeg',
            0.7
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadImage = async (file: File, path: string) => {
    const compressedFile = await compressImage(file);
    const storageRef = ref(storage, path);
    const metadata = {
      contentType: compressedFile.type,
    };
    await uploadBytes(storageRef, compressedFile, metadata);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to save a project.');
        setLoading(false);
        return;
      }

      let thumbnailUrl = project.thumbnail;
      if (thumbnailFile) {
        thumbnailUrl = await uploadImage(thumbnailFile, `projects/${user.uid}/${project.title}/thumbnail`);
        setProgress(25);
      }

      const totalScreenshots = screenshotFiles.length;
      const newScreenshotUrls = await Promise.all(
        screenshotFiles.map(async (file, index) => {
          const url = await uploadImage(file, `projects/${user.uid}/${project.title}/screenshot_${index}`);
          setProgress(prev => prev + (75 / totalScreenshots));
          return url;
        })
      );

      // Delete removed screenshots from storage
      await Promise.all(removedScreenshots.map(async (url) => {
        const fileRef = ref(storage, url);
        await deleteObject(fileRef);
      }));

      const updatedProject = {
        ...project,
        thumbnail: thumbnailUrl,
        screenshots: [...existingScreenshots, ...newScreenshotUrls],
        userId: user.uid,
        updatedAt: new Date(),
      };

      if (projectId) {
        await updateDoc(doc(db, 'projects', projectId), updatedProject);
      } else {
        await addDoc(collection(db, 'projects'), {
          ...updatedProject,
          createdAt: new Date(),
        });
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving project:', error);
      setError('Failed to save project. Please try again.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{projectId ? 'Edit Project' : 'Add New Project'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            name="title"
            value={project.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={project.description}
            onChange={handleChange}
            rows={3}
            required
          />
        </div>
        <div>
          <Label htmlFor="technologies">Technologies (comma-separated)</Label>
          <Input
            id="technologies"
            name="technologies"
            value={project.technologies.join(', ')}
            onChange={handleTechnologiesChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="thumbnail">Thumbnail</Label>
          <Input
            id="thumbnail"
            name="thumbnail"
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
          />
          {thumbnailPreview && (
            <div className="mt-2">
              <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full max-w-xs h-auto object-cover rounded" />
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="screenshots">Project Screenshots</Label>
          <Input
            id="screenshots"
            name="screenshots"
            type="file"
            accept="image/*"
            multiple
            onChange={handleScreenshotsChange}
          />
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {screenshotPreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img src={preview} alt={`Screenshot ${index + 1}`} className="w-full h-32 object-cover rounded" />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1"
                  onClick={() => removeScreenshot(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="projectUrl">Project URL</Label>
          <Input
            id="projectUrl"
            name="projectUrl"
            value={project.projectUrl}
            onChange={handleChange}
            type="url"
            required
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        {loading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        )}
        <div className="flex justify-between">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : projectId ? 'Update Project' : 'Add Project'}
          </Button>
          <Button type="button" onClick={() => navigate('/dashboard')} variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;