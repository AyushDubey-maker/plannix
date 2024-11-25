import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth"; 

import { auth } from './firebase';  

// import App from './App';
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import CreateWorkspacePage from "./pages/CreateWorkspacePage";
import FormWorkspace from "./pages/FormWorkspace";
import reportWebVitals from './reportWebVitals';


const Root = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (!currentUser && location.pathname !== "/login" && location.pathname !== "/register") {
        navigate("/login"); 
      }

    });

  

    return () => unsubscribe(); 
  }, [navigate, location]);

  return (
    <Routes>
      {/* <Route path="/" element={<App />} /> */}
      <Route path="/" element={user ? <HomePage user={user} /> : <Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} /> {/* Always accessible */}
      <Route path="/form-workspace" element={user ? <FormWorkspace user={user} /> : <Login />} />
      <Route path="/create-workspace/:workspaceId"element={user ? <CreateWorkspacePage user={user} /> : <Login />}/>      

      </Routes>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Root />
  </Router>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
