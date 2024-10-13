import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { auth, db, storage } from '../firebase/config';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  projectUrl: string;
  thumbnail: string;
}

export const ProjectManagement = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const q = query(collection(db, 'projects'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedProjects: Project[] = [];
        querySnapshot.forEach((doc) => {
          fetchedProjects.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjects(fetchedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects. Please try again later.');
      }
    } else {
      setError('You must be logged in to view projects.');
    }
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
  
        // Delete Firestore document
        await deleteDoc(doc(db, 'projects', projectId));
  
        // Delete associated files in Storage
        const storageRef = ref(storage, `projects/${user.uid}/${projectTitle}`);
        const fileList = await listAll(storageRef);
  
        // Delete all files in the project folder
        await Promise.all(fileList.items.map(fileRef => deleteObject(fileRef)));
  
        // Attempt to delete the project folder itself
        try {
          await deleteObject(storageRef);
        } catch (error) {
          console.log("Project folder doesn't exist or is already deleted");
        }
  
        // Refresh the projects list
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        setError('Failed to delete project. Please try again.');
      }
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Projects</h2>
        <Link to="/add-project">
          <Button>Add New Project</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => navigate(`/project/${project.id}`)}>
            <div className="aspect-w-16 aspect-h-9">
              <img 
                src={project.thumbnail || 'https://via.placeholder.com/300x200?text=No+Thumbnail'} 
                alt={project.title} 
                className="object-cover w-full h-full rounded-t-lg"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg truncate">{project.title}</h3>
              <div className="mt-2 flex justify-between">
                <Link to={`/edit-project/${project.id}`} onClick={(e) => e.stopPropagation()}>
                  <Button>Edit</Button>
                </Link>
                <Button onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project.id, project.title);
                }}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};