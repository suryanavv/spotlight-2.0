import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  thumbnail: string;
  screenshots: string[];
  projectUrl: string;
  userId: string;
}

export const ProjectDetails: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      if (projectId) {
        try {
          const docRef = doc(db, 'projects', projectId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProject({ id: docSnap.id, ...docSnap.data() } as Project);
          } else {
            setError("Project not found");
          }
        } catch (err) {
          console.error("Error fetching project:", err);
          setError("Failed to load project details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProject();
  }, [projectId]);

  const handleDeleteProject = async () => {
    if (projectId && window.confirm('Are you sure you want to delete this project?')) {
      try {
        // Delete Firestore document first
        await deleteDoc(doc(db, 'projects', projectId));

        if (project) {
          const storageRef = ref(storage, `projects/${project.userId}/${project.title}`);
          
          try {
            // Try to list files in the folder
            const fileList = await listAll(storageRef);

            // Delete all files in the project folder
            await Promise.all(fileList.items.map(async (fileRef) => {
              try {
                await deleteObject(fileRef);
              } catch (error) {
                console.warn(`Failed to delete file: ${fileRef.fullPath}`, error);
              }
            }));

            // No need to try deleting the folder itself, as it doesn't exist in Storage
          } catch (storageError) {
            console.warn("No files found in storage for this project:", storageError);
          }
        }

        // Navigate away after deletion
        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting project:', error);
        setError('Failed to delete project. The project data may have been partially removed.');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !project) {
    return <div className="text-red-500">{error || "Project not found"}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
      
      {project.thumbnail && (
        <div className="mb-4">
          <img
            src={project.thumbnail}
            alt={`${project.title} thumbnail`}
            className="w-full max-w-2xl h-auto object-cover rounded-lg"
          />
        </div>
      )}
      
      <p className="text-gray-700 mb-4">{project.description}</p>
      
      <div className="mb-4">
        <h3 className="font-semibold">Technologies:</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {project.technologies.map((tech, index) => (
            <span key={index} className="bg-gray-200 px-2 py-1 rounded-md text-sm">
              {tech}
            </span>
          ))}
        </div>
      </div>
      
      {project.screenshots && project.screenshots.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Screenshots:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.screenshots.map((screenshot, index) => (
              <div key={index} className="w-full h-48">
                <img
                  src={screenshot}
                  alt={`Project screenshot ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-6">
        <div className="space-x-2">
          <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">View Project</Button>
          </a>
          <Button onClick={() => navigate(`/edit-project/${project.id}`)}>Edit Project</Button>
        </div>
        <div className="space-x-2">
          <Button onClick={handleDeleteProject} variant="destructive">Delete Project</Button>
          <Button onClick={() => navigate('/dashboard')} variant="secondary">Back to Dashboard</Button>
        </div>
      </div>
    </div>
  );
};