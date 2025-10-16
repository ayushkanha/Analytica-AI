import React from 'react';
import './SignInPopup.css';
import { SignIn } from '@clerk/clerk-react';

const SignInPopup = ({ onClose }) => {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <SignIn />
      </div>
    </div>
  );
};

export default SignInPopup;
