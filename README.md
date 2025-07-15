# AI & Data Science Department Portal

A comprehensive web application for the AI & Data Science department at Vignan Institute of Technology and Science, built with React, TypeScript, and Firebase.

## Features

### For Students
- **Authentication**: Secure login/signup with email verification
- **Profile Management**: Complete profile with photo upload
- **Dashboard**: View attendance, results, and academic information
- **Certifications**: Upload and manage certificates
- **Timetable**: View class schedules
- **Events**: Stay updated with department events

### For Admins
- **User Management**: Approve/reject student registrations
- **Content Management**: Manage events, faculty, placements
- **Timetable Management**: Create and update class schedules
- **Analytics**: View department statistics and reports

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **State Management**: React Context API
- **Build Tool**: Vite
- **Deployment**: Netlify

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication, Firestore, and Storage

### 2. Configure Authentication
1. Go to Authentication > Sign-in method
2. Enable Email/Password authentication
3. Add authorized domains if needed

### 3. Setup Firestore Database
1. Go to Firestore Database
2. Create database in production mode
3. Set up the following collections:

#### Collections Structure:

**user_profiles**
```javascript
{
  id: string,
  role: 'student' | 'admin',
  status: 'pending' | 'approved' | 'rejected',
  email: string,
  student_name?: string,
  ht_no?: string,
  year?: string,
  phone?: string,
  address?: string,
  emergency_no?: string,
  cgpa?: number,
  photo_url?: string
}
```

**verified_students**
```javascript
{
  ht_no: string, // Document ID
  student_name: string,
  year: string
}
```

**events**
```javascript
{
  title: string,
  description: string,
  date: string,
  time: string,
  venue: string,
  speaker?: string,
  image_url?: string,
  created_at: timestamp
}
```

**faculty**
```javascript
{
  name: string,
  position: string,
  expertise?: string,
  email?: string,
  phone?: string,
  bio?: string,
  image_url?: string,
  created_at: timestamp
}
```

**placements**
```javascript
{
  student_name: string,
  company: string,
  package: string,
  ctc?: number,
  year: string,
  type: 'Internship' | 'Full-Time',
  created_at: timestamp
}
```

**timetable**
```javascript
{
  year: number,
  day: string,
  hour: string,
  subject_name: string,
  created_at: timestamp
}
```

**student_certificates**
```javascript
{
  htno: string,
  title: string,
  description?: string,
  file_url: string,
  uploaded_at: timestamp
}
```

**attendance**
```javascript
{
  ht_no: string,
  subject: string,
  percentage: number,
  month: string,
  year: number
}
```

**results**
```javascript
{
  ht_no: string,
  semester: number,
  sgpa?: number,
  cgpa?: number,
  file_url?: string,
  year: number
}
```

### 4. Setup Storage
1. Go to Storage
2. Create the following folders:
   - `profile_photos/`
   - `certifications/`
   - `results/`
   - `events/`
   - `gallery/`

### 5. Configure Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /user_profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/user_profiles/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Anyone can read verified students for verification
    match /verified_students/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/user_profiles/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Public read access, admin write access for events, faculty, placements
    match /{collection}/{document} {
      allow read: if collection in ['events', 'faculty', 'placements', 'timetable', 'gallery'];
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/user_profiles/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin' &&
        collection in ['events', 'faculty', 'placements', 'timetable', 'gallery'];
    }
    
    // Students can manage their own certificates
    match /student_certificates/{document} {
      allow read, write: if request.auth != null && 
        resource.data.htno == get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.ht_no;
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/user_profiles/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Students can read their own attendance and results
    match /{collection}/{document} {
      allow read: if request.auth != null && 
        resource.data.ht_no == get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.ht_no &&
        collection in ['attendance', 'results'];
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/user_profiles/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin' &&
        collection in ['attendance', 'results'];
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile_photos/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /certifications/{htno}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 6. Update Configuration
1. Copy your Firebase config from Project Settings > General > Your apps
2. Update `src/integrations/firebase/config.ts` with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vignan-ai-ds-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Update `src/integrations/firebase/config.ts` with your Firebase configuration
   - Set up Firestore collections and security rules as described above

4. **Add initial data**
   - Add verified students to the `verified_students` collection
   - Create an admin user profile manually or through the authentication flow

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Initial Setup Data

### Create Admin User
1. Register with email: `admin@vignanits.ac.in`
2. The system will automatically create an admin profile

### Add Verified Students
Add documents to the `verified_students` collection:
```javascript
// Document ID: "23891A7228"
{
  student_name: "John Doe",
  year: "3rd Year"
}
```

## Deployment

The application is configured for deployment on Netlify:

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support and questions, contact the development team or create an issue in the repository.

## License

This project is licensed under the MIT License.