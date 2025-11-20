# SkillForge Learning Platform

[Live Demo](https://skill-forge-woad.vercel.app/)

SkillForge is a full-stack learning management system (LMS) designed to provide a seamless experience for both **students** and **instructors**. It allows students to enroll in courses, track their progress, earn XP and badges, and manage their profiles. Instructors can create courses, add lessons, quizzes, and multimedia content, and manage their students efficiently.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Installation](#installation)  
- [Environment Variables](#environment-variables)  
- [Project Structure](#project-structure)  
- [Available Scripts](#available-scripts)  
- [Usage](#usage)  
- [Screenshots](#screenshots)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Features

### For Students:
- **Can register through the user interface.  
- **Dashboard:** View enrolled courses, progress, XP, and badges earned.  
- **Rewards & Gamification:** Earn XP and badges based on course completion and milestones.  
- **Course Interaction:** Access course lessons with multimedia content (text, video, PDF), complete quizzes, and track progress.  
- **Profile Management:** Update profile information, password, and profile photo.  
- **Settings:** Enable/disable notifications, toggle dark mode.  

#### Admin
- Can create instructors (generates temporary password/OTP for first login).  
- Can view, edit, and manage:
  - Courses
  - Students
  - Enrollments
  - Instructors
- Full control over the platform and user management.  

### For Instructors:
- **Course Creation:** Create courses with detailed lessons, quizzes, and multimedia content.  
- **Lesson Management:** Add, edit, or remove lessons, videos, PDFs, and quizzes.  
- **Student Management:** View students enrolled in each course, grouped by course.  
- **Profile Settings:** Update profile information and password.  

### Authentication:
- Secure login and registration for **students** through the user interface.  
- Admin and Instructor accounts are created by the system or via terminal setup.  
- **First-login password change prompt applies only to Instructors.**

---

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Lucide React Icons  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT (JSON Web Tokens)  
- **HTTP Requests:** Axios  
- **Hosting:** Vercel / Render (Frontend & Backend)  

---

## Project Structure


skillforge/
├─ client/ # Frontend (React)
│ ├─ src/
│ │ ├─ components/
│ │ ├─ pages/
│ │ ├─ context/
│ │ ├─ api/
│ │ └─ App.jsx
│ └─ package.json
├─ server/ # Backend (Node/Express)
│ ├─ controllers/
│ ├─ models/
│ ├─ routes/
│ ├─ middleware/
│ ├─ utils/
│ ├─ server.js
│ └─ package.json
├─ .gitignore
└─ README.md

## Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/skillforge.git
cd skillforge


1. Install dependencies for frontend:
cd client
npm install


2. Install dependencies for backend:
cd ../server
npm install


3. Environment Variables
Create a .env file in the backend root folder with the following variables:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
API_URL=http://localhost:5000
# OpenRouter API
OPENROUTER_API_KEY=
# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=


4. Frontend .env:
VITE_API_URL=http://localhost:5000


Usage

Frontend: Navigate to http://localhost:5173 (or your Vite port)
Backend: Runs on http://localhost:5000

A. Student Flow:
Register or login
View dashboard and enrolled courses
Complete lessons and quizzes
Track XP and badges
Update profile & settings

B. Instructor Flow:
Register or login as instructor
Create courses and add lessons/quizzes
View students enrolled in each course
Update profile & settings

## Initial Setup

After cloning the repository and installing dependencies, you need to create **an Admin user** and optionally an **Instructor user** directly from the terminal.

---

### 1. Create Admin User

Run the following command in the **server folder**:

```bash
node -e "
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  await User.create({
    name: 'Admin',
    email: 'muleantony18@gmail.com',
    password: hashedPassword,
    role: 'admin',
    isActive: true
  });
  console.log('✅ Admin user created!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error creating admin user:', err);
  process.exit(1);
});
"
This will create an Admin user with:

Email: muleantony18@gmail.com
Password: Admin@123


2. Create Instructor User
Run the following command in the server folder:

node -e "
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
dotenv.config();

const instructorEmail = 'techeckmate254@gmail.com';
const instructorName = 'Your Instructor Name'; // Change as needed

mongoose.connect(process.env.MONGO_URI).then(async () => {
  let instructor = await User.findOne({ email: instructorEmail });

  if (!instructor) {
    const tempPlain = Math.random().toString(36).slice(-8); // 8-character temp password
    const hashedPassword = await bcrypt.hash(tempPlain, 10);

    instructor = await User.create({
      name: instructorName,
      email: instructorEmail,
      role: 'instructor',
      password: hashedPassword,
      createdByAdmin: true,
      isFirstLogin: true
    });

    console.log('✅ Instructor user created!');
    console.log('Email:', instructorEmail);
    console.log('Temporary password:', tempPlain);
  } else {
    console.log('ℹ️ Instructor already exists.');
  }

  process.exit(0);
}).catch(err => {
  console.error('❌ Error creating instructor user:', err);
  process.exit(1);
});
"

This will create an Instructor user with:

Email: techeckmate254@gmail.com
Temporary password: Randomly generated (displayed in the terminal)
Note: The instructor will be prompted to change the password on first login.