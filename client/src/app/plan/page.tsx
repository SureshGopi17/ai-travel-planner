"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Compass, Calendar, DollarSign, Heart, Sparkles, MapPin, Loader2 } from 'lucide-react';
import { API_URL } from '../../config/api';

const INTERESTS_OPTIONS = [
  { id: 'Food', label: 'Food & Culinary', desc: 'Street markets, cafes, fine dining' },
  { id: 'Culture', label: 'Culture & History', desc: 'Museums, historic landmarks, art' },
  { id: 'Adventure', label: 'Adventure & Sport', desc: 'Hiking, outdoor exploration, tours' },
  { id: 'Shopping', label: 'Shopping', desc: 'Local bazaars, malls, fashion' },
  { id: 'Relaxation', label: 'Relaxation & Spa', desc: 'Parks, beaches, river cruises' }
];

const BUDGET_OPTIONS = [
  { id: 'Low', label: 'Budget Friendly', desc: 'Hostels, public transit, street food' },
  { id: 'Medium', label: 'Mid Range', desc: 'Cozy hotels, nice dinners, popular tours' },
  { id: 'High', label: 'Luxury Experience', desc: 'High-end resorts, fine dining, private guides' }
];

export default function PlanTripPage() {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('3');
  const [budgetType, setBudgetType] = useState('Medium');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');

  const { user, loading, getAuthHeaders } = useAuth();
  const router = useRouter();

  // Route protection
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Loading steps animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generating) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [generating]);

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter(i => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!destination.trim()) {
      setError('Please specify a destination');
      return;
    }

    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0 || durationNum > 30) {
      setError('Duration must be between 1 and 30 days');
      return;
    }

    if (selectedInterests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setGenerating(true);

    try {
      const res = await fetch(`${API_URL}/itineraries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        } as HeadersInit,
        body: JSON.stringify({
          destination,
          duration: durationNum,
          budgetType,
          interests: selectedInterests
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to generate itinerary');
      }

      router.push(`/itinerary/${data._id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Server error. Please try again.');
      setGenerating(false);
    }
  };

  const getLoadingMessage = () => {
    switch (loadingStep) {
      case 0: return 'Consulting AI travel guide...';
      case 1: return 'Drafting day-by-day activities...';
      case 2: return 'Estimating budget & selecting hotels...';
      case 3: return 'Polishing and packing your itinerary...';
      default: return 'Preparing your trip...';
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (generating) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-950 px-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Compass className="h-10 w-10 animate-spin" />
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Generating Itinerary</h3>
            <p className="text-sm text-slate-400 animate-pulse">{getLoadingMessage()}</p>
          </div>
          {/* Progress Indicator */}
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${(loadingStep + 1) * 25}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        
        {/* Header */}
        <div className="text-center border-b border-white/10 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Plan Your Next Adventure
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Provide details, and our AI will engineer a day-by-day itinerary, suggest hotels, and build a checklist.
          </p>
        </div>

        {/* Form Card */}
        <div className="border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-xl p-8 shadow-xl shadow-slate-950/50">
          
          {error && (
            <div className="mb-6 flex items-center space-x-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
              <Compass className="h-5 w-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Destination Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center space-x-1.5">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>Where do you want to go?</span>
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Tokyo, Paris, New York"
                className="block w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-base"
              />
            </div>

            {/* 2. Duration Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center space-x-1.5">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>How many days is the trip?</span>
              </label>
              <input
                type="number"
                required
                min="1"
                max="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-base"
              />
            </div>

            {/* 3. Budget Selector */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300 flex items-center space-x-1.5">
                <DollarSign className="h-4 w-4 text-blue-500" />
                <span>Select your budget preference</span>
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setBudgetType(opt.id)}
                    className={`p-4 border rounded-xl text-left transition-all duration-200 cursor-pointer ${
                      budgetType === opt.id
                        ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500'
                        : 'border-white/10 bg-slate-950/20 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-white text-sm">{opt.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Interests Selector */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300 flex items-center space-x-1.5">
                <Heart className="h-4 w-4 text-blue-500" />
                <span>What are you interested in? (Select all that apply)</span>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {INTERESTS_OPTIONS.map((opt) => {
                  const selected = selectedInterests.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleInterest(opt.id)}
                      className={`p-4 border rounded-xl text-left transition-all duration-200 cursor-pointer ${
                        selected
                          ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500'
                          : 'border-white/10 bg-slate-950/20 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-white text-sm">{opt.label}</div>
                      <div className="text-xs text-slate-400 mt-1">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer shadow-lg shadow-blue-600/20"
              >
                <Sparkles className="h-5 w-5 mr-2 animate-pulse text-yellow-400" />
                <span>Generate Itinerary</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
