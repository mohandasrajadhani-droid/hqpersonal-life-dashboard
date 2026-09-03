import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { HealthAppointment, HealthRecordType, CheckupCategory } from '../../types';
import { getTodayString } from '../../utils/dateUtils';

interface HealthAppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: HealthAppointment | null;
}

export const HealthAppointmentFormModal: React.FC<HealthAppointmentFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { addHealthAppointment, updateHealthAppointment } = useApp();

  const [type, setType] = useState<HealthRecordType>('consultation');
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hospitalClinic, setHospitalClinic] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [time, setTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [checkupCategory, setCheckupCategory] = useState<CheckupCategory>('general');
  const [reminder, setReminder] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setDoctorName(initialData.doctorName || '');
      setSpecialty(initialData.specialty || '');
      setHospitalClinic(initialData.hospitalClinic || '');
      setDate(initialData.date);
      setTime(initialData.time || '10:00');
      setReason(initialData.reason);
      setNotes(initialData.notes || '');
      setFollowUpDate(initialData.followUpDate || '');
      setCheckupCategory(initialData.checkupCategory || 'general');
      setReminder(initialData.reminder);
    } else {
      setType('consultation');
      setDoctorName('');
      setSpecialty('');
      setHospitalClinic('');
      setDate(getTodayString());
      setTime('10:00');
      setReason('');
      setNotes('');
      setFollowUpDate('');
      setCheckupCategory('general');
      setReminder(true);
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Reason / Consultation Purpose is required');
      return;
    }
    if (!date) {
      setError('Date is required');
      return;
    }

    if (initialData) {
      updateHealthAppointment(initialData.id, {
        type,
        doctorName: doctorName.trim() || undefined,
        specialty: specialty.trim() || undefined,
        hospitalClinic: hospitalClinic.trim() || undefined,
        date,
        time: time || undefined,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        followUpDate: followUpDate || undefined,
        checkupCategory: type === 'checkup' ? checkupCategory : undefined,
        reminder,
      });
    } else {
      addHealthAppointment({
        type,
        doctorName: doctorName.trim() || undefined,
        specialty: specialty.trim() || undefined,
        hospitalClinic: hospitalClinic.trim() || undefined,
        date,
        time: time || undefined,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        followUpDate: followUpDate || undefined,
        checkupCategory: type === 'checkup' ? checkupCategory : undefined,
        reminder,
        completed: false,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Health Record' : 'Add Health Record'}
      subtitle="Doctor consultations, medical checkups, and tests"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Consultation vs Checkup selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setType('consultation')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'consultation'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Doctor Consultation
          </button>
          <button
            type="button"
            onClick={() => setType('checkup')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'checkup'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Health Checkup / Lab
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            {type === 'consultation' ? 'Reason for Visit *' : 'Checkup / Test Name *'}
          </label>
          <input
            id="health-reason-input"
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              type === 'consultation'
                ? 'e.g. Annual physical, persistent cough, knee pain'
                : 'e.g. Routine blood panel, dental cleaning, eye test'
            }
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {type === 'checkup' ? (
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Checkup Category
            </label>
            <select
              value={checkupCategory}
              onChange={(e) => setCheckupCategory(e.target.value as CheckupCategory)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="general">General Checkup</option>
              <option value="dental">Dental Checkup</option>
              <option value="eye">Eye Exam / Vision</option>
              <option value="blood_test">Blood Test / Lab</option>
              <option value="cardio">Cardiology / Heart</option>
              <option value="other">Other Medical Checkup</option>
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Doctor Name
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Sarah Jenkins"
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Specialty
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g. Cardiologist, Dermatologist"
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Clinic / Hospital / Lab
          </label>
          <input
            type="text"
            value={hospitalClinic}
            onChange={(e) => setHospitalClinic(e.target.value)}
            placeholder="e.g. City General Hospital, Room 402"
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Follow-Up Date (Optional)
          </label>
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Doctor Notes / Prescribed Tests
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Fasting 12 hours required before blood draw"
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
            id="health-submit-btn"
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors"
          >
            {initialData ? 'Save Changes' : 'Add Health Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
