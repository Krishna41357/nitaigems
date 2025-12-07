import React, { useState } from 'react';
import UserLoginModal from '../components/auth/UserLoginModal';
import { useLocation } from 'react-router-dom';

export default function UserLogin() {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  return (
    <div>
      <UserLoginModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
