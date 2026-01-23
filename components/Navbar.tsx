
import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { UserProfile, UserRole } from '../types';
import { LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  profile: UserProfile;
}

const Navbar: React.FC<NavbarProps> = ({ profile }) => {
  const handleLogout = () => signOut(auth);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">GIGO TOYS</h1>
              <p className="text-xs text-gray-500 font-medium">Savdo Boshqaruvi</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-gray-900">{profile.name}</span>
              <span className="text-xs text-blue-600 uppercase tracking-wider font-bold">
                {profile.role === UserRole.DIRECTOR ? 'Direktor' : 'Agent'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
