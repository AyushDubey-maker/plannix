import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

import './main.css'


const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();
  
    const handleRegister = async (e) => {
      e.preventDefault();
      if (password !== confirmPassword) {
        setError("Passwords do not match!");
        return;
      }
  
      try {
        const auth = getAuth();
        await createUserWithEmailAndPassword(auth, email, password);
        navigate("/"); 
      } catch (err) {
        setError(err.message); 
      }
    };

    return (
      <div className="form-container-wrapper">
        <div className="form-container">
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <input type="submit" value="Register" />
          </form>
          <p>
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
        </div>
      );
    };
    
export default Register;
