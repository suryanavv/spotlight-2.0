Here’s a more detailed breakdown of each step for building your portfolio showcase platform using ShadCN, Vite, Firebase

### 1. **Authentication**

#### 1.1. Set up Google Sign-In using Firebase

- **Firebase Console**:

  - Go to the Firebase Console and create a new project. Enable Firebase Authentication and set up Google as a sign-in provider.
  - Obtain the necessary credentials (API keys, client ID, etc.) from Firebase to integrate Google sign-in.
  - Set up Firebase Firestore (NoSQL database) for storing user profiles and project details.
  - Go to the "Authentication" tab and enable Google sign-in under the "Sign-in method" section.

- **Vite Setup**:

  - Create a new Vite project. In the terminal, run `npm init vite@latest` and select React as the framework.
  - Install Firebase SDK by running `npm install firebase`.
  - Initialize Firebase in the project by creating a `firebase.js` or `firebaseConfig.js` file. Use the credentials from the Firebase Console to configure the Firebase app (API keys, project ID, etc.).
  - Ensure Firebase Authentication is properly initialized in this file.

- **Create Google Sign-In Button**:

  - On the homepage, use ShadCN to create a button labeled "Sign in with Google." This button will trigger Firebase’s Google Authentication flow.
  - Attach the Firebase authentication function to this button. Use Firebase’s `signInWithPopup()` method with the `GoogleAuthProvider` to authenticate users.
  - Style the button using ShadCN components, ensuring it fits with the overall design of the homepage.

- **Redirect to Dashboard After Login**:
  - Implement Firebase's `onAuthStateChanged()` listener to monitor authentication state.
  - If the user is logged in, automatically redirect them to the dashboard using React Router.
  - Ensure the sign-in state persists across sessions using Firebase’s built-in session persistence.

#### 1.2. Sign-Out Functionality

- Add a "Sign Out" button to the dashboard using ShadCN’s button components.
- Attach Firebase’s `signOut()` function to the button to allow users to log out.
- After signing out, redirect the user back to the homepage and show the Google sign-in button again.

---

### 2. **Homepage**

#### 2.1. Design the homepage layout using ShadCN

- **Create a Simple Intro Section**:

  - Use ShadCN’s UI components like headers, text, and buttons to build an introductory section explaining the platform.
  - Add text introducing the platform’s features (e.g., “Create and showcase your portfolio easily. Log in to manage your personal details and projects”).
  - Use a responsive grid or flex layout to ensure the intro section looks good on both desktop and mobile.

- **Sign-In with Google Button**:
  - Display a "Sign in with Google" button only if the user is not logged in. This can be conditionally rendered using React state (`isAuthenticated`).
  - Ensure the button is styled properly using ShadCN’s button and layout components.
  - When the user is logged in, replace the button with a “Go to Dashboard” button that redirects to the user’s dashboard.

#### 2.2. Handle Login State

- Add logic to check whether the user is logged in using Firebase’s auth state listener (`onAuthStateChanged()`).
- If the user is logged in, show a personalized welcome message or their name instead of the sign-in button.
- Ensure that navigating back to the homepage (from the dashboard) reflects the logged-in state (i.e., shows “Go to Dashboard” instead of “Sign in”).

---

### 3. **User Dashboard**

#### 3.1. Design and implement the dashboard page

- **Use ShadCN for Layout**:

  - Structure the dashboard layout using ShadCN’s grid or flexbox components to display the user’s personal information, education, hobbies, and projects.
  - Divide the dashboard into different sections (e.g., "Personal Information," "Education," "Projects").
  - Use cards, tables, or simple lists to display user details and projects.

- **Fetch User Data from Firebase**:

  - After login, fetch user-specific data from Firestore using the user’s unique Firebase authentication ID (`uid`).
  - Use Firebase Firestore queries to retrieve personal details (name, education, hobbies) and display them in the appropriate sections of the dashboard.

- **Section for Project Management**:
  - Create a "Projects" section where users can add, edit, or delete their projects.
  - Use ShadCN components like modals or forms to handle project creation and editing.
  - Display a list of user projects using ShadCN cards or lists. Each card should display the project title, description, and a button to view more details or edit the project.

---

### 4. **Profile Management**

#### 4.1. Create a form for users to input their personal information

- **Create Form Layout**:

  - Use ShadCN components such as input fields, text areas, and buttons to build a form where users can enter personal information like name, education, and hobbies.
  - Include validation for the input fields (e.g., required fields, character limits) using form libraries or manual validation logic.

- **Save Data in Firebase Firestore**:

  - When the user submits the form, save the data to Firestore under a document associated with their `uid`.
  - Each user will have a unique Firestore document storing their profile data. Update this document if the user edits their information.
  - Show a loading state or spinner while the data is being saved to Firestore.

- **Display Data on Dashboard**:
  - Fetch the saved profile data from Firestore upon login and display it on the dashboard.
  - Provide an "Edit Profile" button that allows users to open the form and update their details.

---

### 5. **Project Management**

#### 5.1. Create a page for users to add and edit their projects

- **Create Add/Edit Project Form**:

  - Use ShadCN form components to design a project form where users can enter project details such as title, description, links, images, and technologies used.
  - Allow users to upload project images or screenshots. Integrate Firebase Storage for handling file uploads.
  - Implement a field to add external links (e.g., GitHub, demo site) related to the project.

- **Save Projects in Firebase**:
  - Save project details in Firestore under a `projects` collection. Each project should reference the user’s `uid`.
  - Ensure that users can update or delete their projects from Firestore.
  - Store images and links separately in Firebase Storage and save their references in Firestore for retrieval.

#### 5.2. Implement project details view

- **Project Overview Page**:
  - When a user clicks on a project in the dashboard, navigate them to a detailed project page.
  - Fetch project-specific data from Firestore and display all relevant project information: title, description, images, technologies used, and links.
  - Use a clean layout with ShadCN components (cards, image galleries, text) to display project details.

---

### 6. **Generate Shareable Portfolio Link**

#### 6.1. Implement unique shareable links

- **Generate Dynamic User Portfolio Link**:

  - Create a shareable URL for each user’s portfolio. The URL will contain the user’s unique `uid`, allowing dynamic fetching of their data.
  - Use React Router to handle public routes for viewing portfolios. When someone accesses the link, the user’s portfolio data will be fetched from Firestore.

- **Display Public Portfolio**:
  - Create a public portfolio page where the user’s profile information, education, hobbies, and projects are displayed.
  - Use ShadCN components to create a clean, responsive layout for the public view.
  - Ensure that project details are also viewable in the public portfolio, similar to how they appear in the dashboard.

---

### 7. **Deployment and Testing**

#### 7.1. Host the app on Firebase Hosting

- **Deploy to Firebase Hosting**:
  - Initialize Firebase Hosting in your project using `firebase init hosting` and follow the setup steps.
  - Build the Vite app by running `npm run build`, then deploy the build directory to Firebase Hosting using `firebase deploy`.
  - After deployment, test the app’s functionality (login, dashboard, project creation, shareable link) to ensure everything works smoothly.
