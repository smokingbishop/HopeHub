# Hope Hub

Welcome to Hope Hub, a community management application built with Next.js and Firebase. This application is designed for the "Marvelous Men of Hope" charity group to manage events, announcements, members, and internal communication.

## ✨ Features

- **Dashboard:** An overview of key metrics like volunteer hours, reward points, new events, and unread messages. It also displays recent announcements and upcoming events for the logged-in user.
- **Event Management:** Admins and Creators can create and edit volunteer events, defining roles, points, and hours. Members can view events and sign up for volunteer roles.
- **Announcements:** Admins and Creators can post and manage announcements that are visible to all members.
- **Member Directory:** View a list of all members, their roles, and contact information. Admins can add, edit, and remove members.
- **Direct Messaging:** A real-time messaging system for one-on-one or group conversations between members.
- **User Profiles:** Members can update their profile information, including their name and avatar.
- **Role-Based Access Control:** The application distinguishes between 'Admin', 'Creator', and 'Member' roles, granting different permissions for managing content.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **UI:** [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Database:** [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **Generative AI:** [Google AI & Genkit](https://firebase.google.com/docs/genkit) for AI-powered flows.

## 🚀 Getting Started

### Prerequisites

- Node.js (v22 or higher)
- Firebase Account and a new Firebase Project

### Firebase Setup

1.  **Enable Firebase Services:** In your Firebase project console, enable the following services:
    -   **Authentication:** Enable the "Email/Password" sign-in provider.
    -   **Firestore Database:** Create a new Firestore database in production mode.
    -   **Storage:** Create a new Storage bucket.

2.  **Environment Variables:**
    Create a `.env` file in the root of the project and add your Firebase project's web app configuration keys. You can find these in your Firebase project settings.

    ```bash
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...
    ```

### Installation & Running Locally

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`.
