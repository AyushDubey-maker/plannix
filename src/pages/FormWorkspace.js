import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; 
import './FormWorkspace.css'

const FormWorkspace = ({ user }) => {
  const [workspaceName, setWorkspaceName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [followers, setFollowers] = useState("");
  const [posts, setPosts] = useState("");
  const [following, setFollowing] = useState("");
  
  const navigate = useNavigate();

    // Handle logout
    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
      };
    
  // Handle profile photo file selection
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
    
    // Generate a thumbnail preview
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfilePhotoPreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Pass data to the CreateWorkspacePage
    navigate("/create-workspace", {
      state: {
        workspaceName,
        bio,
        username,
        profilePhoto,
        followers,
        posts,
        following,
      },
    });
  };
  // Get the first letter of the user's email
  const userInitial = user?.email ? user.email[0].toUpperCase() : "?";
  return (
    <div className="form-workspace">
    <header className="header">
        <div className="profile-icon">{userInitial}</div>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>

      <form onSubmit={handleSubmit}>
        <label>
          Workspace Name:
          <input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} required />
        </label>

        <label>
          Bio:
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} required />
        </label>

        <label>
          Username:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>

        <label>
          Profile Photo:
          <input type="file" accept="image/*" onChange={handleProfilePhotoChange} required />
        </label>

        {profilePhotoPreview && (
          <div className="profile-photo-preview">
            <p>Profile Photo Preview:</p>
            <img src={profilePhotoPreview} alt="Profile Preview" className="thumbnail" />
          </div>
        )}

        <label>
          Followers Count:
          <input type="number" value={followers} onChange={(e) => setFollowers(e.target.value)} required />
        </label>

        <label>
          Posts Count:
          <input type="number" value={posts} onChange={(e) => setPosts(e.target.value)} required />
        </label>

        <label>
          Following Count:
          <input type="number" value={following} onChange={(e) => setFollowing(e.target.value)} required />
        </label>

        <button type="submit">Create Workspace</button>
      </form>
    </div>
  );
};

export default FormWorkspace;
