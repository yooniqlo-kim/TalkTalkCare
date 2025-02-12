// src/components/layout/Layout.tsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ChatChat from './ChatChat';
import { Link } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <Outlet />
      {location.pathname !== '/talktalk' && (
        <Link to="/talktalk">
          <ChatChat />
        </Link>
      )}
    </>
  );
};

export default Layout;
