import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface Education {
  school: string;
  degree: string;
  specialization: string;
  startYear: string;
  endYear: string;
}

interface UserData {
  displayName: string;
  bio: string;
  avatar: string;
  email: string;
  age?: number; // new optional field 
  services: { name: string; description: string }[];
  education: Education[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  projectUrl: string;
  technologies: string[];
  thumbnail: string;
}

const PublicPortfolio: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!userId) return;

      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        setUserData(userDocSnap.data() as UserData);
        
        const projectsRef = collection(db, 'projects');
        const projectsQuery = query(projectsRef, where('userId', '==', userId));
        const projectsSnapshot = await getDocs(projectsQuery);
        
        setProjects(projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      }
    };

    fetchPortfolioData();
  }, [userId]);

  if (!userData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <section className="text-center mb-12">
        {userData?.avatar && <img src={userData.avatar} alt={userData.displayName} className="w-24 h-24 rounded-full mx-auto mb-4" />}
        {userData?.displayName && <h1 className="text-3xl font-bold mb-2">Hi! I'm {userData.displayName} 👋</h1>}
        {userData?.age && <h2 className="text-xl mb-4">Age: {userData.age}</h2>}
        <h2 className="text-2xl font-semibold mb-4">Website design, app, and developer.</h2>
        {userData?.bio && <p className="mb-6">{userData.bio}</p>}
        <div className="flex justify-center">
          <Button variant="outline">Download CV</Button>
        </div>
      </section>

      {userData.services && userData.services.length > 0 && (
        <section id="services" className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userData.services.map((service, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{service.name}</h3>
                  <p className="text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {userData.education && userData.education.length > 0 && (
        <section id="education" className="mb-12">
          <h2 className="text-2xl font-bold mb-6">My Education</h2>
          {userData.education.map((edu, index) => (
            <div key={index} className="mb-6">
              <h3 className="font-semibold text-lg">{edu.school}</h3>
              <p className="text-md">{edu.degree}</p>
              <p className="text-md">{edu.specialization}</p>
              <p className="text-sm text-gray-600">
                {edu.startYear} - {edu.endYear === 'present' ? 'Present' : edu.endYear}
              </p>
            </div>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section id="portfolio" className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Let's have a look at my portfolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map(project => (
              <Card key={project.id} className="relative group">
                {project.thumbnail && (
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                  />
                )}
                <CardContent className="relative flex items-center justify-center h-full">
                  <h3 className="font-semibold text-black text-center z-10">{project.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {userData.email && (
        <footer id="contact" className="bg-black text-white p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Have an idea? Let's talk about it</h2>
          <p className="mb-4">{userData.email}</p>
          <div className="flex space-x-4">
            <a href="#" className="text-white hover:text-gray-300">LinkedIn</a>
            <a href="#" className="text-white hover:text-gray-300">Instagram</a>
            <a href="#" className="text-white hover:text-gray-300">Dribbble</a>
            <a href="#" className="text-white hover:text-gray-300">Github</a>
            <a href="#" className="text-white hover:text-gray-300">Pinterest</a>
            <a href="#" className="text-white hover:text-gray-300">Youtube</a>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PublicPortfolio;