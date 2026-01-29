import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TopBar from '../organisms/Navigation/TopNavbar';
import Sidebar from '../organisms/Navigation/SideNavbar';

export default function MainLayout() {
  const { user, nameRol, rol, client, provider, otherRol } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [darkMode, setDarkMode] = useState('light');

  return (
    <div className="flex flex-col h-screen">
      {/* TopBar Fijo */}
      <div className="fixed top-0 z-50 w-full">
        <TopBar 
          name={user?.name} 
          darkMode={darkMode} 
          rolName={nameRol} 
          rol={otherRol} 
          clientName={client} 
          provider={provider} 
          userRol={rol} 
          setDarkMode={setDarkMode} 
        />
      </div>
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed} 
          userRol={rol} 
          id={user?.id}
        />

        {/* Contenido principal */}
        <main
          onClick={() => setIsSidebarCollapsed(true)}
          className={`relative top-12 flex-auto transition-all duration-300 bg-gray-200 dark:bg-dark2 dark:text-white ${
            isSidebarCollapsed ? 'ml-16' : 'ml-20'
          }`}
        >
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}