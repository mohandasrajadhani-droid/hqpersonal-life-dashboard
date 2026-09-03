import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Trip } from '../../types';
import { getTodayString } from '../../utils/dateUtils';

interface TripFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Trip | null;
}

export const TripFormModal: React.FC<TripFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const { addTrip, updateTrip, settings } = useApp();

  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState('');
  const [budget, setBudget] = useState('');
  const [transportation, setTransportation] = useState('');
  const [accommodation, setAccommodation] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDestination(initialData.destination);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate);
      setTravelers(initialData.travelers || '');
      setBudget(initialData.budget ? initialData.budget.toString() : '');
      setTransportation(initialData.transportation || '');
      setAccommodation(initialData.accommodation || '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setDestination('');
      setStartDate(getTodayString());
      setEndDate('');
      setTravelers('');
      setBudget('');
      setTransportation('');
      setAccommodation('');
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Trip name is required');
      return;
    }
    if (!destination.trim()) {
      setError('Destination is required');
      return;
    }
    if (!startDate || !endDate) {
      setError('Start date and end date are both required');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be earlier than start date');
      return;
    }

    const bVal = budget ? parseFloat(budget) : 0;

    if (initialData) {
      updateTrip(initialData.id, {
        name: name.trim(),
        destination: destination.trim(),
        startDate,
        endDate,
        travelers: travelers.trim() || undefined,
        budget: isNaN(bVal) ? 0 : bVal,
        transportation: transportation.trim() || undefined,
        accommodation: accommodation.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addTrip({
        name: name.trim(),
        destination: destination.trim(),
        startDate,
        endDate,
        travelers: travelers.trim() || undefined,
        budget: isNaN(bVal) ? 0 : bVal,
        transportation: transportation.trim() || undefined,
        accommodation: accommodation.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Trip' : 'Plan New Vacation / Trip'}
      subtitle="Organize travel logistics, budget, accommodations, and packing"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Trip Name *
            </label>
            <input
              id="trip-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Vacation, Weekend Getaway"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Destination *
            </label>
            <input
              id="trip-dest-input"
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Hawaii, Paris, Grand Canyon"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              End Date *
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Planned Budget ({settings.currency})
            </label>
            <input
              type="number"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0.00"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Travelers
            </label>
            <input
              type="text"
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              placeholder="e.g. 2 adults, 1 child"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Transportation
            </label>
            <input
              type="text"
              value={transportation}
              onChange={(e) => setTransportation(e.target.value)}
              placeholder="e.g. Flight UA412, Rental car"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Accommodation
            </label>
            <input
              type="text"
              value={accommodation}
              onChange={(e) => setAccommodation(e.target.value)}
              placeholder="e.g. Hilton Resort, Airbnb"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Notes &amp; Itinerary Highlights
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Emergency contacts, hotel confirmation codes, or key reservations"
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            id="trip-submit-btn"
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            {initialData ? 'Save Changes' : 'Create Trip'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
