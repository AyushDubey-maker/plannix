import React from 'react';
import './CreateWorkspacePage.css'; 
import '@fortawesome/fontawesome-free/css/all.min.css';

const posts = Array(15).fill("https://via.placeholder.com/150"); 

const CreateWorkspacePage = () => {
  return (
    <div className="workspace-page">
      {/* Header with profile info */}
      <header className="profile-header">
        <div className="profile-info">
          <div>
          <img
            src="https://via.placeholder.com/100"
            alt="Profile"
            className="profile-photo"
          />
          </div>
          <div className="bio">
            <h2 className="username">Plannix</h2>
            <p className="bio-text">E-commerce Website</p>
            <p className="bio-description">
              Selective free resources for designers @plannix.
              <br />
              Tempe, Arizona
            </p>
          </div>
        </div>
        <div className="profile-stats-follow">
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">371</span>
              <span className="stat-label">posts</span>
            </div>
            <div className="stat">
              <span className="stat-number">14.4K</span>
              <span className="stat-label">followers</span>
            </div>
            <div className="stat">
              <span className="stat-number">272</span>
              <span className="stat-label">following</span>
            </div>
          </div>
          <button className="follow-button">Follow</button>
        </div>
      </header>

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
        <i className="fas fa-video"></i>                 {/* Video Icon */}
        <i className="fas fa-user-circle"></i>           {/* Profile Icon */}
        </div>


      {/* Post grid */}
      <div className="post-grid">
        {posts.map((post, index) => (
          <img src={post} alt={`Post ${index + 1}`} key={index} className="post-image" />
        ))}
      </div>
    </div>
  );
};

export default CreateWorkspacePage;
