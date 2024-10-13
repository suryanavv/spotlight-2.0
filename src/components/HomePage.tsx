import { Button } from "./ui/button";
import { GoogleSignIn } from "./GoogleSignIn";
import { useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';

interface HomePageProps {
  user: User | null;
}

export const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to Spotlight</h1>
        {user ? (
          <>
            <p className="text-xl text-gray-600">
              Hello, {user.displayName || user.email}! Ready to manage your portfolio?
            </p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go to Dashboard
            </Button>
          </>
        ) : (
          <>
            <p className="text-xl text-gray-600">
              Create and showcase your portfolio easily. Log in to manage your personal details and projects.
            </p>
            <GoogleSignIn />
          </>
        )}
      </div>
    </div>
  );
};