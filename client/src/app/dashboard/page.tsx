"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Compass, Calendar, DollarSign, Tag, Trash2, ArrowRight, Plus, Loader2 } from 'lucide-react';
import { API_URL } from '../../config/api';

interface ItinerarySummary {
  _id: string;
  destination: string;
  duration: number;
  budgetType: 'Low' | 'Medium' | 'High';
  interests: string[];
  createdAt: string;
}

export default function DashboardPage() {
  const [trips, setTrips] = useState<ItinerarySummary[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user, loading, getAuthHeaders } = useAuth();
  const router = useRouter();

  // Route protection
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch user itineraries
  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      const res = await fetch(`${API_URL}/itineraries`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders()
        } as HeadersInit
      });
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleDeleteTrip = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Avoid triggering card click
    e.preventDefault();

    if (!confirm('Are you sure you want to delete this trip itinerary?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/itineraries/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders()
        } as HeadersInit
      });

      if (res.ok) {
        setTrips(trips.filter(t => t._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete trip:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Welcome, {user.username}!
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage your generated travel itineraries or start planning a new adventure.
            </p>
          </div>
          <Link
            href="/plan"
            className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Plan New Trip</span>
          </Link>
        </div>

        {/* Trips Display */}
        {loadingTrips ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : trips.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <Link 
                key={trip._id} 
                href={`/itinerary/${trip._id}`}
                className="group relative block border border-white/10 rounded-2xl bg-slate-900/40 hover:bg-slate-900/70 hover:border-blue-500/50 shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {/* Destination Header */}
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {trip.destination}
                    </h3>
                    <button
                      onClick={(e) => handleDeleteTrip(e, trip._id)}
                      disabled={deletingId === trip._id}
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete Trip"
                    >
                      {deletingId === trip._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Summary Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-400 pt-2 border-t border-white/5">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>{trip.duration} Days</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      <span>{trip.budgetType} Budget</span>
                    </div>
                  </div>

                  {/* Interests Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {trip.interests.map((interest, i) => (
                      <span 
                        key={i} 
                        className="inline-flex items-center rounded-md bg-slate-950 px-2.5 py-1 text-xs font-medium text-slate-300 border border-white/5"
                      >
                        <Tag className="mr-1 h-3 w-3 text-slate-500" />
                        {interest}
                      </span>
                    ))}
                  </div>

                  {/* Card Action Link */}
                  <div className="flex items-center justify-between pt-4 text-sm font-semibold text-blue-400 group-hover:translate-x-1 transition-transform duration-300">
                    <span>View Full Itinerary</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center border border-dashed border-white/10 rounded-2xl bg-slate-900/20 py-20 px-4">
            <Compass className="mx-auto h-12 w-12 text-slate-500 animate-bounce" />
            <h3 className="mt-4 text-lg font-bold text-white">No travel plans yet</h3>
            <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
              Ready to travel? Use our smart AI trip planner to generate a tailored itinerary in seconds.
            </p>
            <div className="mt-6">
              <Link
                href="/plan"
                className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Itinerary</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
