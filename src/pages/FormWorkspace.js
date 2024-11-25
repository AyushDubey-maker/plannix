import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db, storage } from "../firebase"; 
import { doc, setDoc } from "firebase/firestore"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; 
import imageCompression from "browser-image-compression"; 
import "./FormWorkspace.css";

const FormWorkspace = ({ user }) => {
  const [workspaceName, setWorkspaceName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [followers, setFollowers] = useState("");
  const [posts, setPosts] = useState("");
  const [following, setFollowing] = useState("");
  const [loading, setLoading] = useState(false); // Loader state

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loader

    try {
      let profilePhotoURL = "";
      const workspaceId = `${workspaceName}-${user.uid}-${Date.now()}`; // Unique ID for workspace

      // Optimize the profile photo if it exceeds 5MB
      if (profilePhoto && profilePhoto.size > 5 * 1024 * 1024) {
        console.log("Original image size:", (profilePhoto.size / (1024 * 1024)).toFixed(2), "MB");

        const compressedPhoto = await imageCompression(profilePhoto, {
          maxSizeMB: 1, // Compress to ~1MB
          maxWidthOrHeight: 1920, // Resize for large dimensions
          useWebWorker: true, // Use web workers for better performance
        });

        console.log("Compressed image size:", (compressedPhoto.size / (1024 * 1024)).toFixed(2), "MB");
        setProfilePhoto(compressedPhoto); // Update the profile photo with the optimized version
      
          const storageRef = ref(storage, `workspaces/${workspaceId}/profilePhoto`);
          await uploadBytes(storageRef, compressedPhoto);
          profilePhotoURL = await getDownloadURL(storageRef);
        
      }else{

      if (profilePhoto) {
        const storageRef = ref(storage, `workspaces/${workspaceId}/profilePhoto`);
        await uploadBytes(storageRef, profilePhoto);
        profilePhotoURL = await getDownloadURL(storageRef);
      }

    }

      // Save workspace data to Firestore
      await setDoc(doc(db, "workspaces", workspaceId), {
        workspaceName,
        bio,
        username,
        profilePhotoURL,
        followers: parseInt(followers),
        posts: parseInt(posts),
        following: parseInt(following),
        created_by: user.uid, // Store the user ID
        createdAt: new Date().toISOString(),
      });

      // Navigate to the CreateWorkspacePage
      navigate(`/create-workspace/${workspaceId}`);
    } catch (error) {
      console.error("Error creating workspace:", error);
      alert("Failed to create workspace. Please try again.");
    } finally {
      setLoading(false); // Stop loader
    }
  };

  // Get the first letter of the user's email
  const userInitial = user?.email ? user.email[0].toUpperCase() : "?";

  return (
    <div className="form-workspace">
      {loading && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}

<header className="header">
  <div className="app-name"><a className="plannix" href="/">PLANNIX</a></div>
  <div className="profile-container">
    <div className="profile-icon">{userInitial}</div>
    <button className="logout-button" onClick={handleLogout}>
      Logout
    </button>
  </div>
</header>

      <form onSubmit={handleSubmit}>
        <label>
          Workspace Name:
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            required
          />
        </label>

        <label>
          Bio:
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          />
        </label>

        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label>
          Profile Photo:
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePhotoChange}
            required
          />
        </label>

        {profilePhotoPreview && (
          <div className="profile-photo-preview">
            <p>Profile Photo Preview:</p>
            <img
              src={profilePhotoPreview}
              alt="Profile Preview"
              className="thumbnail"
            />
          </div>
        )}

        <label>
          Followers Count:
          <input
            type="number"
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
            required
          />
        </label>

        <label>
          Posts Count:
          <input
            type="number"
            value={posts}
            onChange={(e) => setPosts(e.target.value)}
            required
          />
        </label>

        <label>
          Following Count:
          <input
            type="number"
            value={following}
            onChange={(e) => setFollowing(e.target.value)}
            required
          />
        </label>

        <button type="submit">Create Workspace</button>
      </form>
    </div>
  );
};

export default FormWorkspace;