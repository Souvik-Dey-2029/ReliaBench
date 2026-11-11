import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface LayoutProps {
  activeMode?: string;
}

export const Layout: React.FC<LayoutProps> = ({ activeMode }) => {
  return (
    <div className="flex min-h-screen bg-[#171A16] text-[#E8DDC8]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar activeMode={activeMode} />
        <main className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
