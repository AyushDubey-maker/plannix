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

import Loader from "./components/Loader";

const Root = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser && location.pathname !== "/login" && location.pathname !== "/register") {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate, location]);

  if (loading) {
    return <Loader />;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <HomePage user={user} /> : <Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/form-workspace" element={user ? <FormWorkspace user={user} /> : <Login />} />
      <Route path="/create-workspace/:workspaceId" element={user ? <CreateWorkspacePage user={user} /> : <Login />} />
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
