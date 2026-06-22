"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Plane, LogOut, Compass, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/80 backdrop-blur-md text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
              <Plane className="h-6 w-6 text-blue-400 rotate-45" />
              <span>AI Travel Planner</span>
            </Link>
          </div>

          {/* Navigation Links */}
          {user ? (
            <div className="flex items-center space-x-6">
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link 
                href="/plan" 
                className="flex items-center space-x-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                <Compass className="h-4 w-4" />
                <span className="hidden sm:inline">Plan Trip</span>
              </Link>

              {/* User Dropdown / Status */}
              <div className="flex items-center space-x-4 border-l border-white/10 pl-6">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {user.username}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-red-400 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Log out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
