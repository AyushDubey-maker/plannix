import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; 
import './home.css'

const images = [
  "https://via.placeholder.com/150",
  "https://via.placeholder.com/150",
  "https://via.placeholder.com/150",
  "https://via.placeholder.com/150",
  "https://via.placeholder.com/150",
  "https://via.placeholder.com/150",
  "https://via.placeholder.com/150",
  "https://via.placeholder.com/150",
  "https://via.placeholder.com/150"
];

const HomePage = ({ user }) => {
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // Get the first letter of the user's email
  const userInitial = user?.email ? user.email[0].toUpperCase() : "?";

  return (
    <div className="homepage">
      {/* Header */}
      <header className="header">
        <div className="profile-icon">{userInitial}</div>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="image-grid">
          {images.map((image, index) => (
            <img src={image} alt={`grid item ${index}`} key={index} className="grid-image" />
          ))}
        </div>
      </main>

      {/* Footer with button */}
      <footer className="footer">
        <button className="create-workspace-button" onClick={() => navigate("/create-workspace")}>Create New Workspace</button>
      </footer>
    </div>
  );
};

export default HomePage;
