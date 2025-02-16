export interface Education {
  school: string;
  degree: string;
  specialization: string;
  startYear: string;
  endYear: string;
}

export interface ProfileData {
  displayName: string;
  bio: string;
  education: Education[];
  hobbies: string;
  age: number; // new field for age
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  userId: string;
}

export interface UserData {
  displayName?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  education?: Education[];
  age?: number; // optional age for public portfolio
  experience?: {
    company: string;
    position: string;
    duration: string;
    description: string;
  }[];
  services?: {
    name: string;
    description: string;
  }[];
}
