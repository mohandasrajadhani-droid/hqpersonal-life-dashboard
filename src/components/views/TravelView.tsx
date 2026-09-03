import React, { useState } from 'react';
import {
  Plane,
  Plus,
  Calendar,
  Users,
  Trash2,
  Edit2,
  Check,
  Car,
  Hotel,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { formatDatePretty } from '../../utils/dateUtils';
import { Trip } from '../../types';

export const TravelView: React.FC = () => {
  const { trips, updateTrip, deleteTrip, openModal, settings } = useApp();
  const [newChecklistText, setNewChecklistText] = useState<{ [tripId: string]: string }>({});

  const handleToggleChecklist = (trip: Trip, itemId: string) => {
    const updatedChecklist = (trip.checklist || []).map((c) =>
      c.id === itemId ? { ...c, completed: !c.completed } : c
    );
    updateTrip(trip.id, { checklist: updatedChecklist });
  };

  const handleAddChecklistItem = (trip: Trip) => {
    const text = (newChecklistText[trip.id] || '').trim();
    if (!text) return;

    const newItem = {
      id: crypto.randomUUID(),
      item: text,
      completed: false,
    };

    const currentChecklist = trip.checklist || [];
    updateTrip(trip.id, { checklist: [...currentChecklist, newItem] });

    setNewChecklistText({ ...newChecklistText, [trip.id]: '' });
  };

  const handleDeleteChecklistItem = (trip: Trip, itemId: string) => {
    const updatedChecklist = (trip.checklist || []).filter((c) => c.id !== itemId);
    updateTrip(trip.id, { checklist: updatedChecklist });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Plane className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Trips &amp; Vacation Planner</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Plan destinations, travel budgets, hotels, packing checklists, and itineraries
          </p>
        </div>
        <button
          id="add-trip-btn"
          onClick={() => openModal('trip')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/10 transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Trip</span>
        </button>
      </div>

      {/* Trips Grid */}
      {trips.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <EmptyState
            title="No trips planned yet"
            description="Start organizing your next vacation, weekend getaway, or family pilgrimage."
            buttonText="Plan a Trip"
            onAction={() => openModal('trip')}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {trips.map((trip) => {
            const checklist = trip.checklist || [];
            const completedCount = checklist.filter((c) => c.completed).length;

            return (
              <div
                key={trip.id}
                className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5"
              >
                {/* Trip Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {trip.destination}
                      </span>
                      {Number(trip.budget) > 0 && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Budget: {settings.currency} {Number(trip.budget).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1.5">
                      {trip.name}
                    </h2>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <div className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {formatDatePretty(trip.startDate)} - {formatDatePretty(trip.endDate)}
                        </span>
                      </div>
                      {trip.travelers && (
                        <div className="flex items-center gap-1 font-medium">
                          <Users className="w-3.5 h-3.5" />
                          <span>{trip.travelers}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-auto">
                    <button
                      onClick={() => openModal('trip', trip)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTrip(trip.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Logistics Strip */}
                {(trip.transportation || trip.accommodation) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {trip.transportation && (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                        <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            Transport:
                          </span>{' '}
                          <span className="text-slate-600 dark:text-slate-400">
                            {trip.transportation}
                          </span>
                        </div>
                      </div>
                    )}
                    {trip.accommodation && (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                        <Hotel className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            Hotel / Stay:
                          </span>{' '}
                          <span className="text-slate-600 dark:text-slate-400">
                            {trip.accommodation}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {trip.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {trip.notes}
                  </p>
                )}

                {/* Interactive Packing & Preparation Checklist */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span>Packing &amp; Preparation Checklist</span>
                      {checklist.length > 0 && (
                        <span className="text-[11px] text-slate-400">
                          ({completedCount}/{checklist.length} packed)
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Add item input */}
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Add packing item (e.g. Passports, Charger, Sunscreen)..."
                      value={newChecklistText[trip.id] || ''}
                      onChange={(e) =>
                        setNewChecklistText({ ...newChecklistText, [trip.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddChecklistItem(trip);
                        }
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddChecklistItem(trip)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {/* Checklist items */}
                  {checklist.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {checklist.map((c) => (
                        <div
                          key={c.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                            c.completed
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/40 text-slate-400'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <button
                            onClick={() => handleToggleChecklist(trip, c.id)}
                            className="flex items-center gap-2 text-left truncate flex-1 cursor-pointer"
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                c.completed
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-400'
                              }`}
                            >
                              {c.completed && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className={c.completed ? 'line-through' : 'font-medium'}>
                              {c.item}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteChecklistItem(trip, c.id)}
                            className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
