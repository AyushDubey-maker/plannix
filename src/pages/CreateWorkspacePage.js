import React, { useState, useEffect } from "react";
import './CreateWorkspacePage.css'; 
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db, storage } from "../firebase"; 
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc 
} from "firebase/firestore"; // Includes deleteDoc for Firestore
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage"; // Includes deleteObject for Storage
import imageCompression from "browser-image-compression"; // For image compression
import '@fortawesome/fontawesome-free/css/all.min.css';

const posts = Array(15).fill(null); // Default array of null posts

const CreateWorkspacePage = ({ user }) => {
  const { workspaceId } = useParams();
  const [workspaceDetails, setWorkspaceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // Upload loader state
  const [workspacePosts, setWorkspacePosts] = useState(posts);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  // const [isClicked, setIsClicked] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaceDetailsAndPosts = async () => {
      try {
        setLoading(true);

        // Fetch workspace details
        if (workspaceId) {
          const workspaceDocRef = doc(collection(db, "workspaces"), workspaceId);
          const docSnap = await getDoc(workspaceDocRef);

          if (docSnap.exists()) {
            setWorkspaceDetails({ id: docSnap.id, ...docSnap.data() });
          } else {
            console.error("No such workspace found!");
            alert("Workspace not found!");
          }
        }

        // Fetch workspace posts
        const postsCollectionRef = collection(db, `workspaces/${workspaceId}/posts`);
        const postsSnapshot = await getDocs(postsCollectionRef);

        const fetchedPosts = Array(15).fill(null); // Ensure a 15-slot array
        postsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.slot !== undefined && data.imageUrl) {
            fetchedPosts[data.slot] = data.imageUrl; // Assign image to the correct slot
          }
        });

        setWorkspacePosts(fetchedPosts);

      } catch (error) {
        console.error("Error fetching workspace data:", error);
        alert("Failed to load workspace data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceDetailsAndPosts();
  }, [workspaceId]);


  useEffect(() => {
    // Handler to toggle between mobile and desktop modes
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // Reset clicked state when switching to desktop
      if (!mobile) {
        setClickedIndex(null);
      }
    };

    handleResize(); // Initial screen size check
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // const handleClick = () => {
  //   if (isMobile) {
  //     setIsClicked(!isClicked);
  //   }
  // };
  const [clickedIndex, setClickedIndex] = useState(null); // Track which post is clicked
  const handleClick = (index) => {
    if (isMobile) {
      setClickedIndex(clickedIndex === index ? null : index); // Toggle click visibility
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleUpload = async (index) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setUploading(true); // Show loader
        try {
          let finalImage = file;

          if (file.size > 5 * 1024 * 1024) {
            console.log("Original image size:", (file.size / (1024 * 1024)).toFixed(2), "MB");
            finalImage = await imageCompression(file, {
              maxSizeMB: 1, // Compress to ~1MB
              maxWidthOrHeight: 1920, // Resize for large dimensions
              useWebWorker: true, // Use web workers for better performance
            });
            console.log("Compressed image size:", (finalImage.size / (1024 * 1024)).toFixed(2), "MB");
          }

          const storageRef = ref(storage, `workspaces/${workspaceId}/posts/post_${index}`);
          await uploadBytes(storageRef, finalImage);
          const downloadURL = await getDownloadURL(storageRef);

          const newPostData = {
            imageUrl: downloadURL,
            slot: index,
            workspaceId,
            timestamp: new Date(),
          };

          const postDocRef = doc(collection(db, `workspaces/${workspaceId}/posts`), `post_${index}`);
          await setDoc(postDocRef, newPostData);

          setWorkspacePosts((prev) => {
            const updatedPosts = [...prev];
            updatedPosts[index] = downloadURL;
            return updatedPosts;
          });

          alert("Image uploaded successfully!");
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("Failed to upload image. Please try again.");
        } finally {
          setUploading(false); // Hide loader
        }
      }
    };
    fileInput.click();
  };

  // Edit
  const handleEdit = async (index) => {
    // Create an input element to select the new file
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*"; // Allow only images
  
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          // Start by showing the upload loader
          setUploading(true);
  
          // Compress the image (same logic as for uploading)
          if (file.size > 5 * 1024 * 1024) { // If the image is larger than 5MB
            console.log("Original image size:", (file.size / (1024 * 1024)).toFixed(2), "MB");
  
            const compressedImage = await imageCompression(file, {
              maxSizeMB: 1, // Compress to ~1MB
              maxWidthOrHeight: 1920, // Resize for large dimensions
              useWebWorker: true, // Use web workers for better performance
            });
  
            console.log("Compressed image size:", (compressedImage.size / (1024 * 1024)).toFixed(2), "MB");
  
            // Replace the image in Firebase Storage
            const storageRef = ref(storage, `workspaces/${workspaceId}/posts/post_${index}`);
            await uploadBytes(storageRef, compressedImage);
            const downloadURL = await getDownloadURL(storageRef);
  
            // Update the Firestore document
            const postDocRef = doc(db, `workspaces/${workspaceId}/posts`, `post_${index}`);
            await setDoc(postDocRef, {
              imageUrl: downloadURL,
              slot: index,
              workspaceId,
              timestamp: new Date(),
            });
  
            // Update the state with the new image URL
            setWorkspacePosts((prev) => {
              const updatedPosts = [...prev];
              updatedPosts[index] = downloadURL; // Update the post at the specific index
              return updatedPosts;
            });
  
            alert("Post edited successfully!");
          } else {
            // If the image size is smaller than 5MB, no need to compress
            const storageRef = ref(storage, `workspaces/${workspaceId}/posts/post_${index}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
  
            // Update the Firestore document
            const postDocRef = doc(db, `workspaces/${workspaceId}/posts`, `post_${index}`);
            await setDoc(postDocRef, {
              imageUrl: downloadURL,
              slot: index,
              workspaceId,
              timestamp: new Date(),
            });
  
            // Update the state with the new image URL
            setWorkspacePosts((prev) => {
              const updatedPosts = [...prev];
              updatedPosts[index] = downloadURL; // Update the post at the specific index
              return updatedPosts;
            });
  
            alert("Post edited successfully!");
          }
        } catch (error) {
          console.error("Error editing post:", error);
          alert("Failed to edit post. Please try again.");
        } finally {
          setUploading(false); // Hide the loader after the process is finished
        }
      }
    };
  
    fileInput.click(); // Trigger file input click to open the file selector
  };
  

  const handleDelete = async (index) => {
    try {
      // Reference to the Firestore document
      const postDocRef = doc(collection(db, `workspaces/${workspaceId}/posts`), `post_${index}`);
      
      // Fetch the document to get the image URL
      const postDocSnap = await getDoc(postDocRef);
  
      if (postDocSnap.exists()) {
        const postData = postDocSnap.data();
  
        if (postData.imageUrl) {
          // Reference to the storage object
          const storageRef = ref(storage, `workspaces/${workspaceId}/posts/post_${index}`);
          
          // Delete the image from storage
          await deleteObject(storageRef);
        }
      }
  
      // Delete the document from Firestore
      await deleteDoc(postDocRef);
  
      // Update local state
      setWorkspacePosts((prev) => {
        const updatedPosts = [...prev];
        updatedPosts[index] = null;
        return updatedPosts;
      });
  
      alert("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };
  

  const userInitial = user?.email ? user.email[0].toUpperCase() : "?";


  return (
    <>
    <header className="header">
  <div className="app-name"><a className="plannix" href="/">PLANNIX</a></div>
  <div className="profile-container">
    <div className="profile-icon">{userInitial}</div>
    <button className="logout-button" onClick={handleLogout}>
      Logout
    </button>
  </div>
</header>
    
<div className="workspace-page">
  {/* Check if workspaceDetails is available */}
  {workspaceDetails ? (
    <>
      {loading && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}

      {/* Header with profile info */}
      <div className="profile-header">
        <div className="profile-info">
          <div>
            <img
              src={workspaceDetails.profilePhotoURL ? workspaceDetails.profilePhotoURL : "https://via.placeholder.com/100"}
              alt="Profile"
              className="profile-photo"
            />
          </div>
        </div>
        <div className="profile-stats-follow">
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{workspaceDetails.posts}</span>
              <span className="stat-label">posts</span>
            </div>
            <div className="stat">
              <span className="stat-number">{workspaceDetails.followers}</span>
              <span className="stat-label">followers</span>
            </div>
            <div className="stat">
              <span className="stat-number">{workspaceDetails.following}</span>
              <span className="stat-label">following</span>
            </div>
          </div>
          <button className="follow-button">Follow</button>
        </div>
      </div>

      <div className="bio">
        <h2 className="username">{workspaceDetails.username}</h2>
        <p className="bio-text">{workspaceDetails.bio}</p>
        {/* <p className="bio-description">
          Selective free resources for designers @plannix.
          <br />
          Tempe, Arizona
        </p> */}
      </div>

      {/* Stories section */}
      <section className="stories">
        {Array(5).fill().map((_, index) => (
          <div className="story" key={index}>
            <div className="story-circle"></div>
            <p className="story-label">Text 0{index + 1}</p>
          </div>
        ))}
      </section>

      <div className="workspace-icons">
        <i className="fas fa-th-large active-icon"></i> {/* Grid Icon */}
        <i className="fas fa-video"></i> {/* Video Icon */}
        <i className="fas fa-user-circle"></i> {/* Profile Icon */}
      </div>

      {/* Post grid */}
          {/* <div className="post-grid">
            {workspacePosts.map((post, index) => (
              <div className={`post-slot ${isMobile ? 'clickable' : 'hoverable'}`} key={index}
              onClick={isMobile ? handleClick : undefined}
              >
                {post === null ? (
                  <>
                    <img
                      src="https://via.placeholder.com/150"
                      alt={`Empty slot ${index + 1}`}
                      className="post-image"
                    />
                    <div className={`post-actions ${isMobile ? (isClicked ? 'visible' : '') : ''}`}>
                      <i
                        className="fas fa-plus-circle"
                        onClick={() => handleUpload(index)}
                        title="Add Post"
                      ></i>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={post}
                      alt={`Post ${index + 1}`}
                      className="post-image"
                    />
                    <div className="post-actions">
                    <i
                    className="fas fa-edit"
                    title="Edit Post"
                    onClick={() => handleEdit(index)} // Connect the edit button to the edit function
                  ></i>
                    <i
                    className="fas fa-trash"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this post?")) {
                        handleDelete(index);
                      }
                    }}
                    title="Delete Post"
                  ></i>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div> */}
    <div className="post-grid">
      {workspacePosts.map((post, index) => (
        <div
          className={`post-slot ${isMobile ? "clickable" : "hoverable"}`}
          key={index}
          onClick={() => handleClick(index)}
        >
          {post === null ? (
            <>
              <img
                src="https://via.placeholder.com/150"
                alt={`Empty slot ${index + 1}`}
                className="post-image"
              />
              <div
                className={`post-actions ${
                  isMobile && clickedIndex === index ? "visible" : ""
                }`}
              >
                <i
                  className="fas fa-plus-circle"
                  onClick={() => handleUpload(index)}
                  title="Add Post"
                ></i>
              </div>
            </>
          ) : (
            <>
              <img
                src={post}
                alt={`Post ${index + 1}`}
                className="post-image"
              />
              <div
                className={`post-actions ${
                  isMobile && clickedIndex === index ? "visible" : ""
                }`}
              >
                <i
                  className="fas fa-edit"
                  onClick={() => handleEdit(index)}
                  title="Edit Post"
                ></i>
                <i
                  className="fas fa-trash"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this post?"
                      )
                    ) {
                      handleDelete(index);
                    }
                  }}
                  title="Delete Post"
                ></i>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
 
    </>
  ) : (
    <></>
  )}
  {uploading && (
        <div className="upload-loader">
          <div className="loader"></div>
          <p>Uploading image...</p>
        </div>
      )}
    </div>


    </>
  );
};

export default CreateWorkspacePage;








