# Lumina Notes App

A modern, full-stack notes application built with **React**, **Node.js**, and **Express**. It features real-time-like sync, rich text editing, tagging, and pinning.

![Notes App Screenshot](https://placehold.co/800x400?text=Notes+App+Preview) 

## Features

- 📝 **Rich Text Editing**: Create notes with formatting using the integrated editor.
- 🏷️ **Organization**: Tag, pin, and filter notes effectively.
- 🔄 **Auto-Sync**: Changes are saved automatically.
- 🔒 **Authentication**: Secure user registration and login.
- 📱 **Responsive**: Works beautifully on desktop and mobile.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, JWT
- **Database**: 
  - **Development**: Local JSON File Storage (Zero-config)
  - **Production**: MongoDB (Auto-detects via `MONGODB_URI`)

## Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/notes-app.git
    cd notes-app
    ```

2.  **Install Dependencies**
    ```bash
    npm run install:all
    ```

3.  **Start Development Server**
    ```bash
    npm run dev
    ```
    The app will open at `http://localhost:5173`.

## Deployment

### Vercel (Recommended)

This project is configured for seamless deployment on Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fnotes-app)

1.  Click the button above.
2.  Set the Environment Variables:
    -   `JWT_SECRET`: A random string for security.
    -   `MONGODB_URI`: Your MongoDB Atlas connection string.

### Manual Deployment

Build the frontend and backend:
```bash
npm run build
```

## Environment Variables

Copy `.env.example` to `.env` in the root directory:

```env
PORT=5000
JWT_SECRET=your_super_secret_key
MONGODB_URI=mongodb+srv://... (Optional for local dev)
```
