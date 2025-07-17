// src/LoginModal.js
import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { auth, provider } from './firebase';

const LoginModal = ({ show, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  if (!show) return null;

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      let result;
      if (isRegistering) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess(result.user);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      onLoginSuccess(result.user);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'white', padding: 30, borderRadius: 8, width: 320,
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>
          {isRegistering ? 'Register' : 'Login'}
        </h2>

        {error && (
          <p style={{ color: 'red', fontSize: '14px', marginBottom: 10 }}>{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 4, border: '1px solid #ccc' }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 4, border: '1px solid #ccc' }}
        />

        <button
          onClick={handleEmailLogin}
          style={{ width: '100%', marginBottom: 10, padding: 10, background: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>

        <button
          onClick={handleGoogleLogin}
          style={{ width: '100%', marginBottom: 16, padding: 10, background: '#db4437', color: 'white', border: 'none', borderRadius: 4 }}
        >
          Sign in with Google
        </button>

        <p style={{ fontSize: '14px', textAlign: 'center' }}>
          {isRegistering ? 'Already have an account?' : 'New user?'}{' '}
          <span
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            style={{ color: '#007bff', cursor: 'pointer' }}
          >
            {isRegistering ? 'Login here' : 'Register here'}
          </span>
        </p>

        <button
          onClick={onClose}
          style={{ marginTop: 12, width: '100%', padding: 8, background: '#f0f0f0', border: '1px solid #ccc', borderRadius: 4 }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
