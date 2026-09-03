import React, { useState, useMemo } from 'react';
import {
  Heart,
  Plus,
  Bell,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  CheckCircle2,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { BloodPressureReading, BloodPressureReminderConfig } from '../../types';
import { BloodPressureFormModal } from '../forms/BloodPressureFormModal';
import { BloodPressureReminderModal } from '../forms/BloodPressureReminderModal';
import {
  getBPCategory,
  calculateBPAverages,
  exportBPReadingsToCSV,
} from '../../utils/bpCalculations';

export const BloodPressureView: React.FC = () => {
  const {
    bloodPressureReadings,
    addBloodPressureReading,
    updateBloodPressureReading,
    deleteBloodPressureReading,
    bpReminders,
    saveBloodPressureReminder,
  } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<BloodPressureReading | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'all' | '7d' | '30d' | '90d'>('30d');
  const [sortField, setSortField] = useState<'date' | 'systolic' | 'diastolic' | 'pulse'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedArmFilter, setSelectedArmFilter] = useState<'all' | 'left' | 'right'>('all');

  const bpReminderSchedule = bpReminders[0] || null;

  // Filtered readings based on time range
  const rangeFilteredReadings = useMemo(() => {
    if (!bloodPressureReadings) return [];
    if (timeRange === 'all') return bloodPressureReadings;

    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return bloodPressureReadings.filter((r) => r.date >= cutoff);
  }, [bloodPressureReadings, timeRange]);

  // Overall and Range Averages
  const rangeAverages = useMemo(
    () => calculateBPAverages(rangeFilteredReadings),
    [rangeFilteredReadings]
  );
  const overallAverages = useMemo(
    () => calculateBPAverages(bloodPressureReadings),
    [bloodPressureReadings]
  );

  // Latest reading
  const latestReading = useMemo(() => {
    if (!bloodPressureReadings || bloodPressureReadings.length === 0) return null;
    const sorted = [...bloodPressureReadings].sort((a, b) => {
      const dateTimeA = `${a.date}T${a.time || '00:00'}`;
      const dateTimeB = `${b.date}T${b.time || '00:00'}`;
      return dateTimeB.localeCompare(dateTimeA);
    });
    return sorted[0];
  }, [bloodPressureReadings]);

  // Search, arm filtered, and sorted readings for History Table
  const tableReadings = useMemo(() => {
    let result = [...bloodPressureReadings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          (r.notes && r.notes.toLowerCase().includes(q)) ||
          (r.medicationTaken && r.medicationTaken.toLowerCase().includes(q)) ||
          (r.symptoms && r.symptoms.toLowerCase().includes(q)) ||
          r.date.includes(q) ||
          r.arm.toLowerCase().includes(q) ||
          r.position.toLowerCase().includes(q)
      );
    }

    if (selectedArmFilter !== 'all') {
      result = result.filter((r) => r.arm === selectedArmFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        const dateTimeA = `${a.date}T${a.time || '00:00'}`;
        const dateTimeB = `${b.date}T${b.time || '00:00'}`;
        cmp = dateTimeA.localeCompare(dateTimeB);
      } else {
        cmp = (a[sortField] || 0) - (b[sortField] || 0);
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [bloodPressureReadings, searchQuery, selectedArmFilter, sortField, sortDirection]);

  // Chart data sorted chronologically
  const chartData = useMemo(() => {
    const list = [...rangeFilteredReadings].sort((a, b) => {
      const dateTimeA = `${a.date}T${a.time || '00:00'}`;
      const dateTimeB = `${b.date}T${b.time || '00:00'}`;
      return dateTimeA.localeCompare(dateTimeB);
    });

    return list.map((r) => ({
      dateTime: `${r.date.slice(5)} ${r.time || ''}`,
      date: r.date,
      systolic: r.systolic,
      diastolic: r.diastolic,
      pulse: r.pulse || 0,
    }));
  }, [rangeFilteredReadings]);

  const handleExportCSV = () => {
    if (bloodPressureReadings.length === 0) return;
    const csvContent = exportBPReadingsToCSV(bloodPressureReadings);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `blood_pressure_readings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (field: 'date' | 'systolic' | 'diastolic' | 'pulse') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleEdit = (reading: BloodPressureReading) => {
    setEditingReading(reading);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this blood pressure reading?')) {
      deleteBloodPressureReading(id);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />
              Blood Pressure Monitoring
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track daily systolic, diastolic, and pulse measurements with clinical guideline reference
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* BP Reminder Button */}
          <button
            id="bp-reminder-btn"
            type="button"
            onClick={() => setIsReminderModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold transition"
          >
            <Bell className={`w-4 h-4 ${bpReminderSchedule?.enabled ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
            <span>BP Reminders</span>
            {bpReminderSchedule?.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          {/* Export CSV Button */}
          {bloodPressureReadings.length > 0 && (
            <button
              id="bp-export-csv-btn"
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition"
              title="Export all readings to CSV"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          )}

          {/* Record BP Button */}
          <button
            id="record-bp-btn"
            type="button"
            onClick={() => {
              setEditingReading(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm shadow-md transition transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Record BP</span>
          </button>
        </div>
      </div>

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-300">
          <strong className="font-semibold">Informational Personal Health Tool:</strong> Readings and American Heart Association reference categories are for personal tracking only and do NOT constitute medical diagnosis or advice. Always consult your doctor or healthcare provider for medical evaluation or unusual readings.
        </div>
      </div>

      {/* Crisis Warning Banner if Latest Reading is in crisis zone */}
      {latestReading && (latestReading.systolic >= 180 || latestReading.diastolic >= 120) && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border-2 border-red-500/50 flex items-start gap-3.5 animate-pulse">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
          <div>
            <h4 className="font-bold text-red-900 dark:text-red-200 text-sm">
              High Reading Advisory ({latestReading.systolic}/{latestReading.diastolic} mmHg on {latestReading.date})
            </h4>
            <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
              Your most recent reading is in the Hypertensive Crisis reference range. If you feel unwell, dizzy, chest pain, or short of breath, please contact your doctor or local medical emergency services promptly.
            </p>
          </div>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latest Reading Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span>Latest Reading</span>
            {latestReading && (
              <span className="text-[11px] text-slate-400">
                {latestReading.date} {latestReading.time}
              </span>
            )}
          </div>
          {latestReading ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {latestReading.systolic} / {latestReading.diastolic}
                </span>
                <span className="text-xs font-medium text-slate-500">mmHg</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getBPCategory(latestReading.systolic, latestReading.diastolic).badgeClass}`}>
                  {getBPCategory(latestReading.systolic, latestReading.diastolic).label}
                </span>
                <span className="text-xs text-slate-500">
                  {latestReading.pulse} bpm • {latestReading.arm} arm
                </span>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-sm py-2">No readings recorded yet</div>
          )}
        </div>

        {/* 7-Day Average Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span>7-Day Average</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          {bloodPressureReadings.length > 0 ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {rangeAverages.avgSystolic || overallAverages.avgSystolic} / {rangeAverages.avgDiastolic || overallAverages.avgDiastolic}
                </span>
                <span className="text-xs font-medium text-slate-500">mmHg</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Pulse: ~{rangeAverages.avgPulse || overallAverages.avgPulse} bpm
              </p>
            </div>
          ) : (
            <div className="text-slate-400 text-sm py-2">—</div>
          )}
        </div>

        {/* Total Readings Logged */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span>Total Logged</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {bloodPressureReadings.length}
            </span>
            <span className="text-xs text-slate-500">records</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Encrypted secure cloud storage
          </p>
        </div>

        {/* Reminder Schedule Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span>Reminder Schedule</span>
            <Bell className="w-4 h-4 text-rose-500" />
          </div>
          {bpReminderSchedule?.enabled ? (
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Schedule
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Times: {bpReminderSchedule.times.join(', ')}
              </p>
            </div>
          ) : (
            <div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Not Scheduled
              </span>
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(true)}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
              >
                + Set daily BP reminder
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500" />
              Blood Pressure Trend & Pulse
            </h3>
            <p className="text-xs text-slate-500">
              Visualizes systolic and diastolic trends with standard clinical baseline reference lines (120/80 mmHg)
            </p>
          </div>

          {/* Time Range Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {(['7d', '30d', '90d', 'all'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  timeRange === r
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sysGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="diaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="dateTime" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis domain={[40, 200]} tick={{ fontSize: 11 }} tickLine={false} unit=" " />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                  }}
                />
                <ReferenceLine y={120} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Normal Sys (120)', position: 'insideTopRight', fill: '#f43f5e', fontSize: 10 }} />
                <ReferenceLine y={80} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Normal Dia (80)', position: 'insideBottomRight', fill: '#3b82f6', fontSize: 10 }} />

                <Area
                  type="monotone"
                  dataKey="systolic"
                  name="Systolic (mmHg)"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#sysGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="diastolic"
                  name="Diastolic (mmHg)"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#diaGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="pulse"
                  name="Pulse (bpm)"
                  stroke="#10b981"
                  strokeWidth={1.8}
                  dot={{ r: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
            <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300">
              No Blood Pressure Readings in this period
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
              Log your blood pressure regularly to see your trend chart, moving averages, and clinical reference percentiles.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingReading(null);
                setIsFormOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow transition"
            >
              + Record First Reading
            </button>
          </div>
        )}
      </div>

      {/* History Table & Filter Controls */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Blood Pressure History Log
            </h3>
            <p className="text-xs text-slate-500">
              Detailed chronological records of your measurements
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, meds, symptoms..."
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-48 sm:w-60"
              />
            </div>

            {/* Arm Filter */}
            <select
              value={selectedArmFilter}
              onChange={(e) => setSelectedArmFilter(e.target.value as 'all' | 'left' | 'right')}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Arms</option>
              <option value="left">Left Arm</option>
              <option value="right">Right Arm</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {tableReadings.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Date & Time</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    onClick={() => handleSort('systolic')}
                  >
                    <div className="flex items-center gap-1">
                      <span>BP (mmHg)</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    onClick={() => handleSort('pulse')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Pulse</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Category (AHA Ref)</th>
                  <th className="py-3 px-4">Arm / Position</th>
                  <th className="py-3 px-4">Context & Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tableReadings.map((r) => {
                  const cat = getBPCategory(r.systolic, r.diastolic);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {r.date}
                        </div>
                        <div className="text-xs text-slate-400">
                          {r.time || '—'}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-extrabold text-base text-slate-900 dark:text-white">
                        {r.systolic} / {r.diastolic}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {r.pulse ? `${r.pulse} bpm` : '—'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${cat.badgeClass}`}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 capitalize">
                        {r.arm} arm • {r.position}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {r.medicationTaken && (
                          <span className="font-semibold text-rose-600 dark:text-rose-400 mr-1">
                            [{r.medicationTaken}]
                          </span>
                        )}
                        {r.notes || r.symptoms || '—'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(r)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit reading"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            title="Delete reading"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No readings match your search or filter
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try clearing filters or search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Record BP Modal */}
      {isFormOpen && (
        <BloodPressureFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingReading(null);
          }}
          onSave={(reading) => {
            if (editingReading) {
              updateBloodPressureReading(reading.id, reading);
            } else {
              addBloodPressureReading(reading);
            }
          }}
          initialReading={editingReading}
        />
      )}

      {/* BP Reminder Modal */}
      {isReminderModalOpen && (
        <BloodPressureReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          config={bpReminderSchedule}
          onSave={(config) => {
            saveBloodPressureReminder(config);
          }}
        />
      )}
    </div>
  );
};
