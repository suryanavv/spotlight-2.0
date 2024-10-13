import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { HomePage } from './components/HomePage';
import Dashboard from './components/Dashboard';
import { ProjectDetails } from './components/ProjectDetails';
import { ProjectForm } from './components/ProjectForm';
import { AuthProvider } from './contexts/AuthContext';
import PublicPortfolio from './components/PublicPortfolio';
import { ProfileForm } from './components/ProfileForm';
import { ProfileData } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const fetchUserProfile = async (): Promise<ProfileData> => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ProfileData;
    } else {
      return {
        displayName: user.displayName || '',
        bio: '',
        education: [],
        hobbies: ''
      };
    }
  };

  const handleProfileUpdate = async (profile: ProfileData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, profile, { merge: true });
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/" />}
          />
          <Route
            path="/project/:projectId"
            element={user ? <ProjectDetails /> : <Navigate to="/" />}
          />
          <Route
            path="/add-project"
            element={user ? <ProjectForm /> : <Navigate to="/" />}
          />
          <Route
            path="/edit-project/:projectId"
            element={user ? <ProjectForm /> : <Navigate to="/" />}
          />
          <Route
            path="/portfolio/:userId"
            element={<PublicPortfolio />}
          />
          <Route
            path="/edit-profile"
            element={user ? <ProfileForm fetchProfile={fetchUserProfile} onProfileUpdate={handleProfileUpdate} /> : <Navigate to="/" />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
