<p align="left">
  <img src="./public/plannix-favicon.png" width="40" height="40" style="vertical-align: middle;" />
  <!-- <span style="font-size: 1.5rem; font-weight: bold;">Plannix</span> -->
</p>

**Plannix** is a learning project built with **React** and **Firebase** to explore the latest updates in Firebase integration. It provides a minimal, Instagram-like interface where users can design their feed layout in a prototype environment that closely resembles how it would appear to visitors.

Whether you're part of a marketing team planning a campaign or just an Instagram enthusiast who loves experimenting with your layout, Plannix offers a fun and functional way to prototype your profile.

---

## Features

- React + Firebase Authentication  
- Firestore for real-time workspace data storage  
- Firebase Storage for uploading profile photos  
- Fully responsive prototype UI resembling Instagram  
- Ability to create and visualize custom “workspaces” before publishing content  

---

## Use Cases

- **Marketing Teams**: Visualize a client’s Instagram layout before actually posting any content  
- **Instagram Enthusiasts**: Experiment with profile designs just for fun  

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/AyushDubey-maker/plannix.git
cd plannix
```

### 2. Install dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project  
2. Enable **Email/Password Authentication** under the Authentication tab  
3. Create a **Cloud Firestore** database  
4. Enable **Firebase Storage** for image uploads  
5. Go to **Project Settings > General > Your Apps** and register a new Web App  
6. Copy your Firebase config and replace it in `src/firebase.js`:

```js
// src/firebase.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## 💻 Run Locally

```bash
npm start
```

Your app will be available at [http://localhost:3000](http://localhost:3000)

---

## 🌐 Firebase Hosting (Optional)

To deploy the app using Firebase Hosting:

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login to Firebase:

```bash
firebase login
```

3. Initialize Firebase in your project:

```bash
firebase init
```

- Select **Hosting**  
- Choose your Firebase project  
- Set `build` as the public directory  
- Configure as a single-page app: **Yes**  

4. Build the React app:

```bash
npm run build
```

5. Deploy:

```bash
firebase deploy
```

After deployment, your app will be accessible at:

```
your_firebase_URL
```

---

## 📁 Folder Structure

```
src/
├── components/
│   └── Loader.js
├── pages/
│   ├── HomePage.js
│   ├── Login.js
│   ├── Register.js
│   ├── FormWorkspace.js
│   └── CreateWorkspacePage.js
├── firebase.js
└── index.js
```

---

## 📸 Live Demo

Once deployed, you can access the live version of Plannix at:

```
https://plannix.vercel.app/ (My Demo Link)
```

---

## 🛠 Tech Stack

- React  
- Firebase (Auth, Firestore, Storage, Hosting)  
- CSS Modules  

---


