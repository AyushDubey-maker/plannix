import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject, listAll } from "firebase/storage";
import "./home.css";

const HomePage = ({ user }) => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // Fetch workspaces for the logged-in user
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        if (user) {
          const userId = user.uid;
          const workspaceRef = collection(db, "workspaces");
          const q = query(workspaceRef, where("created_by", "==", userId));
          const querySnapshot = await getDocs(q);

          const fetchedWorkspaces = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setWorkspaces(fetchedWorkspaces);
        }
      } catch (error) {
        console.error("Error fetching workspaces:", error);
        alert("Failed to fetch workspaces. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [user]);

  // Handle delete popup
  const handleDelete = (workspace) => {
    setSelectedWorkspace(workspace);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    if (!selectedWorkspace) return;
  
    const workspaceId = selectedWorkspace.id;
    const storagePath = `workspaces/${workspaceId}/`;
  
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "workspaces", workspaceId));
  
      // Delete all files and directories in the specified storage path
      const storageRef = ref(storage, storagePath);
      const list = await listAll(storageRef);
  
      // Delete all files under the workspace path
      for (const fileRef of list.items) {
        await deleteObject(fileRef);
      }
  
      // Recursively delete subfolders (if any)
      for (const folderRef of list.prefixes) {
        await deleteFolderContents(folderRef);
      }
  
      // Update the UI
      setWorkspaces((prevWorkspaces) =>
        prevWorkspaces.filter((workspace) => workspace.id !== workspaceId)
      );
  
      alert(`Workspace "${selectedWorkspace.workspaceName}" deleted successfully.`);
    } catch (error) {
      console.error("Error deleting workspace:", error);
      alert("Failed to delete workspace. Please try again.");
    } finally {
      setShowDeletePopup(false);
      setSelectedWorkspace(null);
    }
  };
  
  // Helper function to delete all contents in a folder recursively
  const deleteFolderContents = async (folderRef) => {
    const list = await listAll(folderRef);
  
    // Delete files in the folder
    for (const fileRef of list.items) {
      await deleteObject(fileRef);
    }
  
    // Recursively delete subfolders
    for (const subFolderRef of list.prefixes) {
      await deleteFolderContents(subFolderRef);
    }
  };
  

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setSelectedWorkspace(null);
  };

  // Get the first letter of the user's email
  const userInitial = user?.email ? user.email[0].toUpperCase() : "?";

  return (
    <div className="homepage">
      {/* Header */}
      <header className="header">
        <div className="app-name"><a className="plannix" href="/">PLANNIX</a></div>
        <div className="profile-container">
          <div className="profile-icon">{userInitial}</div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        ) : workspaces.length === 0 ? (
          <p>No workspaces found. Create a new one!</p>
        ) : (
          <div className="image-grid">
            {workspaces.map((workspace) => (
              <div className="workspace-card" key={workspace.id}>
                <img
                  src={workspace.profilePhotoURL || "https://via.placeholder.com/150"}
                  alt={workspace.workspaceName}
                  className="grid-image"
                />
                <div className="overlay">
                  <button
                    className="edit-button"
                    onClick={() =>
                      navigate(`/create-workspace/${workspace.id}`)
                    }
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(workspace)}
                  >
                    🗑️
                  </button>
                </div>
                <p className="workspace-title">{workspace.workspaceName}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer with button */}
      <footer className="footer">
        <button
          className="create-workspace-button"
          onClick={() => navigate("/form-workspace")}
        >
          + Create New Workspace 
        </button>
      </footer>

      {/* Delete Popup */}
      {showDeletePopup && (
        <div className="delete-popup">
          <p>Are you sure you want to delete {selectedWorkspace?.workspaceName}?</p>
          <button onClick={confirmDelete}>Yes</button>
          <button onClick={cancelDelete}>No</button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
