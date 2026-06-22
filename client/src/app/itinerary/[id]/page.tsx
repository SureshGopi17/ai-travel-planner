"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../config/api';
import {
  ArrowLeft, Calendar, DollarSign, Hotel, Briefcase, 
  Trash2, Plus, Sparkles, Check, CheckSquare, Square, 
  AlertTriangle, Loader2, PlusCircle, Tag, TrendingUp, Compass
} from 'lucide-react';

interface IDayPlan {
  dayNumber: number;
  activities: string[];
}

interface IEstimatedBudget {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

interface ISuggestedHotel {
  name: string;
  rating: string;
  tier: string;
}

interface IPackingItem {
  _id: string;
  name: string;
  category: string;
  packed: boolean;
}

interface IExpense {
  _id: string;
  amount: number;
  category: 'Flights' | 'Accommodation' | 'Food' | 'Activities' | 'Other';
  description: string;
  date: string;
}

interface IItinerary {
  _id: string;
  destination: string;
  duration: number;
  budgetType: 'Low' | 'Medium' | 'High';
  interests: string[];
  days: IDayPlan[];
  estimatedBudget: IEstimatedBudget;
  suggestedHotels: ISuggestedHotel[];
  packingList: IPackingItem[];
  expenses: IExpense[];
}

export default function ItineraryDetailPage() {
  const { id } = useParams() as { id: string };
  const [itinerary, setItinerary] = useState<IItinerary | null>(null);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [error, setError] = useState('');

  // Daily expansion states
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true });

  // Inline activity addition state
  const [newActivityText, setNewActivityText] = useState<Record<number, string>>({});

  // Regeneration prompt state
  const [regenPrompt, setRegenPrompt] = useState<Record<number, string>>({});
  const [isRegenerating, setIsRegenerating] = useState<Record<number, boolean>>({});

  // Expense form state
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<'Flights' | 'Accommodation' | 'Food' | 'Activities' | 'Other'>('Food');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [addingExpense, setAddingExpense] = useState(false);

  const { user, loading, getAuthHeaders } = useAuth();
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load itinerary details
  useEffect(() => {
    if (user && id) {
      fetchItineraryDetails();
    }
  }, [user, id]);

  const fetchItineraryDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/itineraries/${id}`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders()
        } as HeadersInit
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch itinerary details');
      }

      setItinerary(data);
      
      // Expand all days by default
      const defaultExpanded: Record<number, boolean> = {};
      data.days.forEach((day: IDayPlan) => {
        defaultExpanded[day.dayNumber] = true;
      });
      setExpandedDays(defaultExpanded);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load itinerary');
    } finally {
      setLoadingTrip(false);
    }
  };

  const toggleDayExpansion = (dayNumber: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNumber]: !prev[dayNumber]
    }));
  };

  // 1. Remove Activity
  const handleRemoveActivity = async (dayNumber: number, actIndex: number) => {
    if (!itinerary) return;

    const updatedDays = itinerary.days.map(day => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          activities: day.activities.filter((_, idx) => idx !== actIndex)
        };
      }
      return day;
    });

    // Optimistically update UI
    const originalItinerary = { ...itinerary };
    setItinerary({ ...itinerary, days: updatedDays });

    try {
      const res = await fetch(`${API_URL}/itineraries/${id}/activities`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        } as HeadersInit,
        body: JSON.stringify({
          dayNumber,
          activities: updatedDays.find(d => d.dayNumber === dayNumber)?.activities || []
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update activities on server');
      }
    } catch (err) {
      console.error(err);
      setItinerary(originalItinerary); // Rollback
      alert('Failed to delete activity. Please try again.');
    }
  };

  // 2. Add Custom Activity
  const handleAddActivity = async (dayNumber: number) => {
    const text = newActivityText[dayNumber]?.trim();
    if (!text || !itinerary) return;

    const dayObj = itinerary.days.find(d => d.dayNumber === dayNumber);
    if (!dayObj) return;

    const updatedActivities = [...dayObj.activities, text];
    const updatedDays = itinerary.days.map(day => {
      if (day.dayNumber === dayNumber) {
        return { ...day, activities: updatedActivities };
      }
      return day;
    });

    // Optimistic update
    const originalItinerary = { ...itinerary };
    setItinerary({ ...itinerary, days: updatedDays });
    setNewActivityText(prev => ({ ...prev, [dayNumber]: '' }));

    try {
      const res = await fetch(`${API_URL}/itineraries/${id}/activities`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        } as HeadersInit,
        body: JSON.stringify({
          dayNumber,
          activities: updatedActivities
        })
      });

      if (!res.ok) {
        throw new Error('Failed to save activity');
      }
    } catch (err) {
      console.error(err);
      setItinerary(originalItinerary); // Rollback
      alert('Failed to add activity. Please try again.');
    }
  };

  // 3. Regenerate Day with Custom Prompt
  const handleRegenerateDay = async (dayNumber: number) => {
    const prompt = regenPrompt[dayNumber]?.trim();
    if (!prompt || !itinerary) return;

    setIsRegenerating(prev => ({ ...prev, [dayNumber]: true }));

    try {
      const res = await fetch(`${API_URL}/itineraries/${id}/regenerate-day`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        } as HeadersInit,
        body: JSON.stringify({ dayNumber, prompt })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to regenerate day');
      }

      setItinerary({ ...itinerary, days: data.days });
      setRegenPrompt(prev => ({ ...prev, [dayNumber]: '' }));
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Regeneration failed');
    } finally {
      setIsRegenerating(prev => ({ ...prev, [dayNumber]: false }));
    }
  };

  // 4. Toggle Packing Item
  const handleTogglePacking = async (itemId: string, currentStatus: boolean) => {
    if (!itinerary) return;

    // Optimistic UI toggle
    const updatedPackingList = itinerary.packingList.map(item => {
      if (item._id === itemId) {
        return { ...item, packed: !currentStatus };
      }
      return item;
    });
    const originalItinerary = { ...itinerary };
    setItinerary({ ...itinerary, packingList: updatedPackingList });

    try {
      const res = await fetch(`${API_URL}/itineraries/${id}/packing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        } as HeadersInit,
        body: JSON.stringify({ itemId, packed: !currentStatus })
      });

      if (!res.ok) {
        throw new Error('Failed to update packing status');
      }
    } catch (err) {
      console.error(err);
      setItinerary(originalItinerary); // Rollback
    }
  };

  // 5. Add Expense Record
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseDesc || !itinerary) return;

    setAddingExpense(true);

    try {
      const res = await fetch(`${API_URL}/itineraries/${id}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        } as HeadersInit,
        body: JSON.stringify({
          amount: parseFloat(expenseAmount),
          category: expenseCategory,
          description: expenseDesc
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to add expense');
      }

      setItinerary({ ...itinerary, expenses: data.expenses });
      setExpenseAmount('');
      setExpenseDesc('');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to log expense');
    } finally {
      setAddingExpense(false);
    }
  };

  // 6. Delete Expense Record
  const handleDeleteExpense = async (expenseId: string) => {
    if (!itinerary || !confirm('Delete this expense record?')) return;

    const originalItinerary = { ...itinerary };
    const updatedExpenses = itinerary.expenses.filter(e => e._id !== expenseId);
    setItinerary({ ...itinerary, expenses: updatedExpenses });

    try {
      const res = await fetch(`${API_URL}/itineraries/${id}/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders()
        } as HeadersInit
      });

      if (!res.ok) {
        throw new Error('Failed to delete expense record');
      }
    } catch (err) {
      console.error(err);
      setItinerary(originalItinerary); // Rollback
      alert('Failed to delete expense. Please try again.');
    }
  };

  // Category Expense calculations for dashboard comparison
  const getCategoryExpenseSums = () => {
    const sums = {
      Flights: 0,
      Accommodation: 0,
      Food: 0,
      Activities: 0,
      Other: 0
    };

    if (itinerary) {
      itinerary.expenses.forEach(e => {
        if (sums[e.category] !== undefined) {
          sums[e.category] += e.amount;
        } else {
          sums.Other += e.amount;
        }
      });
    }

    return sums;
  };

  const getBudgetCategoryEstimates = () => {
    if (!itinerary) return { Flights: 0, Accommodation: 0, Food: 0, Activities: 0, Other: 0 };
    return {
      Flights: itinerary.estimatedBudget.flights,
      Accommodation: itinerary.estimatedBudget.accommodation,
      Food: itinerary.estimatedBudget.food,
      Activities: itinerary.estimatedBudget.activities,
      Other: 0
    };
  };

  const actualSums = getCategoryExpenseSums();
  const estimateSums = getBudgetCategoryEstimates();
  const totalActualSpent = Object.values(actualSums).reduce((a, b) => a + b, 0);

  if (loading || loadingTrip) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-950 px-4">
        <div className="text-center space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h2 className="text-xl font-bold text-white">Itinerary Not Found</h2>
          <p className="text-slate-400 text-sm max-w-xs">{error || 'This travel plan does not exist or you do not have permission to view it.'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Navigation back and Title */}
        <div className="flex flex-col space-y-2 border-b border-white/10 pb-6">
          <div>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Trip to {itinerary.destination}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {itinerary.duration} Days Plan | {itinerary.budgetType} Budget Preferred
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {itinerary.interests.map((interest, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center rounded-md bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20"
                >
                  <Tag className="mr-1 h-3 w-3" />
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3-Column Layout: Left (Itinerary), Middle (Budget/Hotels), Right (Packing/Expenses) */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT SECTION: Collapsible Itinerary Days (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Calendar className="h-5.5 w-5.5 text-blue-400" />
              <span>Daily Itinerary</span>
            </h2>

            <div className="space-y-4">
              {itinerary.days.map((day) => {
                const isExpanded = expandedDays[day.dayNumber];
                const dayActText = newActivityText[day.dayNumber] || '';
                const dayRegenText = regenPrompt[day.dayNumber] || '';
                const dayRegenRunning = isRegenerating[day.dayNumber] || false;

                return (
                  <div 
                    key={day.dayNumber} 
                    className="border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md overflow-hidden transition-all duration-300"
                  >
                    {/* Day Header */}
                    <div 
                      onClick={() => toggleDayExpansion(day.dayNumber)}
                      className="flex items-center justify-between p-5 bg-slate-900/60 border-b border-white/5 cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-extrabold text-blue-400 border border-blue-500/30">
                          {day.dayNumber}
                        </span>
                        <h3 className="text-lg font-bold text-white">Day {day.dayNumber}</h3>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {isExpanded ? 'Collapse' : 'Expand'} ({day.activities.length} activities)
                      </span>
                    </div>

                    {/* Day Content */}
                    {isExpanded && (
                      <div className="p-5 space-y-4">
                        
                        {/* Activities List */}
                        {day.activities.length > 0 ? (
                          <ul className="space-y-2.5">
                            {day.activities.map((activity, actIdx) => (
                              <li 
                                key={actIdx}
                                className="group flex items-start justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 hover:border-slate-800 transition-colors"
                              >
                                <span className="text-sm text-slate-300 pr-4">{activity}</span>
                                <button
                                  onClick={() => handleRemoveActivity(day.dayNumber, actIdx)}
                                  className="text-slate-500 hover:text-red-400 p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
                                  title="Remove Activity"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-500 italic py-2">No activities planned for this day yet.</p>
                        )}

                        {/* Controls Container */}
                        <div className="pt-4 border-t border-white/5 grid gap-4 md:grid-cols-2">
                          
                          {/* Add Custom Activity Form */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-1 text-xs font-semibold text-slate-400">
                              <PlusCircle className="h-3.5 w-3.5" />
                              <span>Add Custom Activity</span>
                            </div>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={dayActText}
                                onChange={(e) => setNewActivityText(prev => ({ ...prev, [day.dayNumber]: e.target.value }))}
                                placeholder="Add custom plan..."
                                className="flex-1 px-3 py-1.5 bg-slate-950/50 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                              />
                              <button
                                onClick={() => handleAddActivity(day.dayNumber)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          {/* AI Regenerate Day Form */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-1 text-xs font-semibold text-slate-400">
                              <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                              <span>Regenerate Day with AI</span>
                            </div>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={dayRegenText}
                                onChange={(e) => setRegenPrompt(prev => ({ ...prev, [day.dayNumber]: e.target.value }))}
                                placeholder="e.g. Add outdoor hiking..."
                                className="flex-1 px-3 py-1.5 bg-slate-950/50 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-all"
                              />
                              <button
                                onClick={() => handleRegenerateDay(day.dayNumber)}
                                disabled={dayRegenRunning || !dayRegenText}
                                className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-xs font-bold text-white rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                              >
                                {dayRegenRunning ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <span>Modify</span>
                                )}
                              </button>
                            </div>
                          </div>

                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SECTION: Budget, Hotels, Packing, Expense Tracker (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Estimated Budget (Wow Factor layout!) */}
            <div className="border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md p-6 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-emerald-400" />
                <span>Estimated Budget</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950/50 border border-white/5 rounded-xl">
                  <span className="block text-xs text-slate-400">Flights</span>
                  <span className="text-lg font-bold text-white">${itinerary.estimatedBudget.flights}</span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-white/5 rounded-xl">
                  <span className="block text-xs text-slate-400">Lodging</span>
                  <span className="text-lg font-bold text-white">${itinerary.estimatedBudget.accommodation}</span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-white/5 rounded-xl">
                  <span className="block text-xs text-slate-400">Food</span>
                  <span className="text-lg font-bold text-white">${itinerary.estimatedBudget.food}</span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-white/5 rounded-xl">
                  <span className="block text-xs text-slate-400">Activities</span>
                  <span className="text-lg font-bold text-white">${itinerary.estimatedBudget.activities}</span>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-xl flex justify-between items-center">
                <div>
                  <span className="block text-xs font-semibold text-blue-400">Total Estimated Cost</span>
                  <span className="text-2xl font-black text-white">${itinerary.estimatedBudget.total}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Compass className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* 2. Hotel Suggestions */}
            <div className="border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md p-6 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Hotel className="h-5 w-5 text-indigo-400" />
                <span>Recommended Hotels</span>
              </h3>

              <div className="space-y-3">
                {itinerary.suggestedHotels.map((hotel, idx) => (
                  <div 
                    key={idx}
                    className="flex justify-between items-center p-3 rounded-xl bg-slate-950/50 border border-white/5 hover:border-slate-800 transition-colors"
                  >
                    <div>
                      <span className="block text-sm font-bold text-white">{hotel.name}</span>
                      <span className="text-xs text-slate-400">Rating: {hotel.rating}</span>
                    </div>
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        hotel.tier === 'Luxury' 
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                          : hotel.tier === 'Mid Range' 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {hotel.tier}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Interactive Packing Checklist (Custom Feature) */}
            <div className="border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md p-6 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-yellow-400 animate-pulse" />
                <span>Packing Checklist</span>
              </h3>

              {itinerary.packingList && itinerary.packingList.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {itinerary.packingList.map((item) => (
                    <div 
                      key={item._id}
                      onClick={() => handleTogglePacking(item._id, item.packed)}
                      className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-white/5 cursor-pointer select-none transition-colors"
                    >
                      <button className="text-blue-500 focus:outline-none shrink-0">
                        {item.packed ? (
                          <CheckSquare className="h-5 w-5 text-blue-400 fill-blue-500/10" />
                        ) : (
                          <Square className="h-5 w-5 text-slate-500" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm truncate block ${item.packed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider">{item.category}</span>
                      </div>
                      {item.packed && (
                        <span className="h-4.5 w-4.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No packing items found.</p>
              )}
            </div>

            {/* 4. Real-Time Expense Tracker & Comparison Dashboard (Custom Feature) */}
            <div className="border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                  <span>Expense Tracker</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Log actual purchases and compare them against the AI budget.</p>
              </div>

              {/* Total Budget Spent Comparison Gauge */}
              <div className="space-y-2 p-4 bg-slate-950/60 border border-white/5 rounded-xl">
                <div className="flex justify-between items-end text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold">ACTUAL SPENT</span>
                    <span className={`text-lg font-bold ${totalActualSpent > itinerary.estimatedBudget.total ? 'text-red-400' : 'text-emerald-400'}`}>
                      ${totalActualSpent.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">OF ESTIMATED</span>
                    <span className="text-slate-300 font-bold">${itinerary.estimatedBudget.total}</span>
                  </div>
                </div>
                
                {/* Progress bar visual */}
                {(() => {
                  const percent = Math.min((totalActualSpent / itinerary.estimatedBudget.total) * 100, 100);
                  const isOver = totalActualSpent > itinerary.estimatedBudget.total;
                  return (
                    <div className="space-y-1">
                      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-white/5">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            isOver ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-emerald-400 to-blue-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase">
                        <span>{((totalActualSpent / itinerary.estimatedBudget.total) * 100).toFixed(0)}% Used</span>
                        {isOver && <span className="text-red-400 font-bold">Over Budget!</span>}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Log New Expense Form */}
              <form onSubmit={handleAddExpense} className="space-y-3 p-4 border border-white/5 bg-slate-950/30 rounded-xl">
                <div className="font-bold text-xs text-white uppercase tracking-wider">Log Purchase</div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0.01"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="Amount ($)"
                      className="w-full px-2.5 py-1.5 bg-slate-950/80 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <select
                      value={expenseCategory}
                      onChange={(e: any) => setExpenseCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-950/80 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="Food">Food</option>
                      <option value="Accommodation">Lodging</option>
                      <option value="Flights">Flights</option>
                      <option value="Activities">Activities</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    placeholder="Description (e.g. Lunch at bistro)"
                    className="flex-1 px-2.5 py-1.5 bg-slate-950/80 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={addingExpense || !expenseAmount || !expenseDesc}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </form>

              {/* Logged Expenses List */}
              <div className="space-y-2">
                <div className="font-bold text-xs text-slate-400 uppercase tracking-wider">Purchase History</div>
                {itinerary.expenses.length > 0 ? (
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                    {itinerary.expenses.map((expense) => (
                      <div 
                        key={expense._id}
                        className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/50 border border-white/5 text-xs hover:border-slate-800 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-semibold text-white block truncate">{expense.description}</span>
                          <span className="text-[10px] text-slate-500 flex items-center space-x-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/5">{expense.category}</span>
                            <span>{new Date(expense.date).toLocaleDateString()}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="font-bold text-slate-300">${expense.amount.toFixed(2)}</span>
                          <button
                            onClick={() => handleDeleteExpense(expense._id)}
                            className="text-slate-600 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete Expense"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">No expenses logged for this trip yet.</p>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
