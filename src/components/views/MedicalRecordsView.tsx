import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Building,
  Paperclip,
  Eye,
  Edit2,
  Trash2,
  Download,
  Link as LinkIcon,
  ShieldCheck,
  Heart,
  Clock,
  Pill,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  Stethoscope,
  Receipt,
  Syringe,
  Scan,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  MedicalRecord,
  MedicalRecordType,
  MedicalAttachment,
} from '../../types';
import { MedicalRecordFormModal } from '../forms/MedicalRecordFormModal';
import { MedicalDocumentViewerModal } from '../medical/MedicalDocumentViewerModal';

export const MedicalRecordsView: React.FC = () => {
  const {
    medicalRecords,
    addMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    bloodPressureReadings,
    healthAppointments,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'records' | 'timeline'>('records');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<MedicalRecordType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [formDefaultType, setFormDefaultType] = useState<MedicalRecordType>('prescription');

  // Dedicated Document Viewer State
  const [viewerState, setViewerState] = useState<{
    record?: MedicalRecord | null;
    attachments: MedicalAttachment[];
    initialIndex: number;
  } | null>(null);

  const handleOpenDocumentViewer = (
    record: MedicalRecord | null,
    attachments: MedicalAttachment[],
    initialIndex = 0
  ) => {
    setViewerState({
      record,
      attachments,
      initialIndex,
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Collect all attachments across records for quick browsing
  const allAttachments = useMemo(() => {
    const list: { attachment: MedicalAttachment; record: MedicalRecord }[] = [];
    medicalRecords.forEach((r) => {
      (r.attachments || []).forEach((att) => {
        list.push({ attachment: att, record: r });
      });
    });
    return list;
  }, [medicalRecords]);

  // Extract unique doctors and hospitals for filters
  const doctorsList = useMemo(() => {
    const set = new Set<string>();
    medicalRecords.forEach((r) => {
      if (r.doctorName) set.add(r.doctorName.trim());
    });
    return Array.from(set).sort();
  }, [medicalRecords]);

  const hospitalsList = useMemo(() => {
    const set = new Set<string>();
    medicalRecords.forEach((r) => {
      if (r.hospitalClinic) set.add(r.hospitalClinic.trim());
    });
    return Array.from(set).sort();
  }, [medicalRecords]);

  // Filtered and chronologically sorted medical records
  const filteredRecords = useMemo(() => {
    let result = [...medicalRecords];

    if (selectedTypeFilter !== 'all') {
      result = result.filter((r) => r.recordType === selectedTypeFilter);
    }

    if (selectedDoctorFilter !== 'all') {
      result = result.filter((r) => r.doctorName === selectedDoctorFilter);
    }

    if (selectedHospitalFilter !== 'all') {
      result = result.filter((r) => r.hospitalClinic === selectedHospitalFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.doctorName && r.doctorName.toLowerCase().includes(q)) ||
          (r.hospitalClinic && r.hospitalClinic.toLowerCase().includes(q)) ||
          (r.specialty && r.specialty.toLowerCase().includes(q)) ||
          (r.diagnosis && r.diagnosis.toLowerCase().includes(q)) ||
          (r.shortDescription && r.shortDescription.toLowerCase().includes(q)) ||
          (r.notes && r.notes.toLowerCase().includes(q)) ||
          (r.medicines && r.medicines.some((m) => m.name.toLowerCase().includes(q))) ||
          (r.testResults && r.testResults.some((t) => t.testName.toLowerCase().includes(q))) ||
          r.date.includes(q)
      );
    }

    // Chronological sort: newest records first
    result.sort((a, b) => {
      const dtA = `${a.date}T${a.time || '00:00'}`;
      const dtB = `${b.date}T${b.time || '00:00'}`;
      return dtB.localeCompare(dtA);
    });

    return result;
  }, [medicalRecords, selectedTypeFilter, selectedDoctorFilter, selectedHospitalFilter, searchQuery]);

  // Unified Timeline Events
  const timelineEvents = useMemo(() => {
    const events: Array<{
      id: string;
      date: string;
      time?: string;
      title: string;
      category: 'medical_record' | 'blood_pressure' | 'appointment';
      recordType?: MedicalRecordType;
      subtitle?: string;
      details?: string;
      originalItem: any;
    }> = [];

    // Add medical records
    medicalRecords.forEach((r) => {
      events.push({
        id: `rec_${r.id}`,
        date: r.date,
        time: r.time,
        title: r.title,
        category: 'medical_record',
        recordType: r.recordType,
        subtitle: r.doctorName ? `Dr. ${r.doctorName}${r.hospitalClinic ? ` • ${r.hospitalClinic}` : ''}` : r.hospitalClinic,
        details: r.diagnosis || r.shortDescription,
        originalItem: r,
      });
    });

    // Add blood pressure readings
    bloodPressureReadings.forEach((bp) => {
      events.push({
        id: `bp_${bp.id}`,
        date: bp.date,
        time: bp.time,
        title: `BP Reading: ${bp.systolic}/${bp.diastolic} mmHg`,
        category: 'blood_pressure',
        subtitle: `Pulse: ${bp.pulse} bpm • ${bp.arm} arm (${bp.position})`,
        details: bp.notes || bp.medicationTaken ? `Context: ${bp.medicationTaken || bp.notes}` : undefined,
        originalItem: bp,
      });
    });

    // Add health appointments
    healthAppointments.forEach((apt) => {
      events.push({
        id: `apt_${apt.id}`,
        date: apt.date,
        time: apt.time,
        title: `Consultation: ${apt.reason}`,
        category: 'appointment',
        subtitle: apt.doctorName ? `Dr. ${apt.doctorName}` : apt.hospitalClinic,
        details: apt.notes,
        originalItem: apt,
      });
    });

    // Sort newest first
    events.sort((a, b) => {
      const dtA = `${a.date}T${a.time || '00:00'}`;
      const dtB = `${b.date}T${b.time || '00:00'}`;
      return dtB.localeCompare(dtA);
    });

    return events;
  }, [medicalRecords, bloodPressureReadings, healthAppointments]);

  const handleOpenCreateModal = (type: MedicalRecordType = 'prescription') => {
    setEditingRecord(null);
    setFormDefaultType(type);
    setIsFormOpen(true);
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setFormDefaultType(record.recordType);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this medical record and its attachments?')) {
      deleteMedicalRecord(id);
    }
  };

  const getRecordTypeBadge = (type: MedicalRecordType) => {
    switch (type) {
      case 'prescription':
        return {
          label: 'Prescription',
          bg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
          icon: Pill,
        };
      case 'lab_report':
        return {
          label: 'Lab Report',
          bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          icon: Activity,
        };
      case 'discharge_summary':
        return {
          label: 'Discharge Summary',
          bg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          icon: Building,
        };
      case 'doctor_consultation':
        return {
          label: 'Consultation',
          bg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          icon: Stethoscope,
        };
      case 'medical_bill':
        return {
          label: 'Medical Bill',
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: Receipt,
        };
      case 'vaccination':
        return {
          label: 'Vaccination',
          bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: Syringe,
        };
      case 'imaging_scan':
        return {
          label: 'Imaging / Scan',
          bg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
          icon: Scan,
        };
      default:
        return {
          label: 'Medical Document',
          bg: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          icon: FileText,
        };
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <FileText className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              Medical Records
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <ShieldCheck className="w-3.5 h-3.5" /> Encrypted & Private
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Prescriptions, lab test reports, discharge summaries, consultations, bills, and scans
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'records'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Records Center
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Unified Timeline ({timelineEvents.length})
            </button>
          </div>

          {/* Add Record Main CTA */}
          <button
            id="add-medical-record-btn"
            type="button"
            onClick={() => handleOpenCreateModal('prescription')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm shadow-md transition transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Security Statement Banner */}
      <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-teal-800 dark:text-teal-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            <strong>Zero Public Access:</strong> All documents, prescriptions, and health data are stored exclusively in authenticated storage and encrypted at rest with AES-256-GCM.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {allAttachments.length > 0 && (
            <button
              type="button"
              id="browse-all-documents-btn"
              onClick={() => handleOpenDocumentViewer(null, allAttachments.map((a) => a.attachment), 0)}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 font-bold hover:bg-teal-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-teal-600" />
              <span>Browse All Docs ({allAttachments.length})</span>
            </button>
          )}
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
            {medicalRecords.length} stored records
          </span>
        </div>
      </div>

      {activeTab === 'records' ? (
        <div className="space-y-6">
          {/* Filters Bar: Type Tabs & Search */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            {/* Record Type Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedTypeFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                  selectedTypeFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                All Records ({medicalRecords.length})
              </button>

              {(
                [
                  ['prescription', 'Prescriptions'],
                  ['lab_report', 'Lab Reports'],
                  ['discharge_summary', 'Discharge Summaries'],
                  ['doctor_consultation', 'Consultations'],
                  ['medical_bill', 'Bills'],
                  ['vaccination', 'Vaccinations'],
                  ['imaging_scan', 'Scans & Imaging'],
                  ['other', 'Other'],
                ] as const
              ).map(([tId, tLabel]) => {
                const count = medicalRecords.filter((r) => r.recordType === tId).length;
                return (
                  <button
                    key={tId}
                    type="button"
                    onClick={() => setSelectedTypeFilter(tId)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                      selectedTypeFilter === tId
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tLabel} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search and Secondary Dropdown Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctor, hospital, diagnosis, medicine, test name, notes..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400"
                />
              </div>

              {doctorsList.length > 0 && (
                <select
                  value={selectedDoctorFilter}
                  onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Doctors</option>
                  {doctorsList.map((doc) => (
                    <option key={doc} value={doc}>
                      Dr. {doc}
                    </option>
                  ))}
                </select>
              )}

              {hospitalsList.length > 0 && (
                <select
                  value={selectedHospitalFilter}
                  onChange={(e) => setSelectedHospitalFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Hospitals/Labs</option>
                  {hospitalsList.map((hosp) => (
                    <option key={hosp} value={hosp}>
                      {hosp}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Records Cards List */}
          {filteredRecords.length > 0 ? (
            <div className="space-y-4">
              {filteredRecords.map((record) => {
                const typeInfo = getRecordTypeBadge(record.recordType);
                const TypeIcon = typeInfo.icon;
                const hasAttachments = record.attachments && record.attachments.length > 0;
                const hasMedicines = record.medicines && record.medicines.length > 0;
                const hasTests = record.testResults && record.testResults.length > 0;

                return (
                  <div
                    key={record.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Card Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-2xl border ${typeInfo.bg} shrink-0`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${typeInfo.bg}`}>
                              {typeInfo.label}
                            </span>
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {record.date} {record.time && `• ${record.time}`}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {record.title}
                          </h3>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 sm:self-start">
                        <button
                          type="button"
                          onClick={() => handleEdit(record)}
                          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Edit record"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(record.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata summary (Doctor, Hospital, Diagnosis) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 py-3 text-xs text-slate-600 dark:text-slate-300">
                      {record.doctorName && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-teal-600" />
                          <span>
                            <strong>Doctor:</strong> Dr. {record.doctorName}
                            {record.specialty && ` (${record.specialty})`}
                          </span>
                        </div>
                      )}
                      {record.hospitalClinic && (
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            <strong>Hospital/Lab:</strong> {record.hospitalClinic}
                          </span>
                        </div>
                      )}
                      {record.diagnosis && (
                        <div className="flex items-center gap-1.5 sm:col-span-3">
                          <Activity className="w-3.5 h-3.5 text-rose-600" />
                          <span>
                            <strong>Diagnosis / Reason:</strong> {record.diagnosis}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description or Notes */}
                    {record.shortDescription && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl mb-3">
                        {record.shortDescription}
                      </p>
                    )}

                    {/* STRUCTURED SECTION 1: PRESCRIPTION MEDICINES */}
                    {hasMedicines && (
                      <div className="my-3 p-3.5 bg-teal-50/40 dark:bg-teal-950/20 rounded-2xl border border-teal-200/60 dark:border-teal-800/40">
                        <h4 className="text-xs font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5" /> Prescribed Medicines ({record.medicines?.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {record.medicines?.map((m) => (
                            <div
                              key={m.id}
                              className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-teal-100 dark:border-teal-900 text-xs"
                            >
                              <div className="font-bold text-slate-900 dark:text-white">
                                {m.name}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                                {m.dosage} • {m.frequency}
                              </div>
                              {m.duration && (
                                <div className="text-[11px] text-teal-700 dark:text-teal-300 font-medium mt-0.5">
                                  Duration: {m.duration}
                                </div>
                              )}
                              {m.instructions && (
                                <div className="text-[11px] text-slate-400 italic mt-0.5">
                                  Note: {m.instructions}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STRUCTURED SECTION 2: LAB TEST RESULTS */}
                    {hasTests && (
                      <div className="my-3 p-3.5 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-200/60 dark:border-blue-800/40">
                        <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5" /> Test Parameters & Measured Values
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="text-slate-500 font-semibold border-b border-blue-200/60 dark:border-blue-800/40">
                              <tr>
                                <th className="py-1.5 px-2">Parameter</th>
                                <th className="py-1.5 px-2">Result</th>
                                <th className="py-1.5 px-2">Ref Range</th>
                                <th className="py-1.5 px-2">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-100/80 dark:divide-blue-900/40">
                              {record.testResults?.map((t) => {
                                const isFlagged = t.flag && t.flag !== 'Normal';
                                return (
                                  <tr key={t.id}>
                                    <td className="py-1.5 px-2 font-medium text-slate-800 dark:text-slate-200">
                                      {t.testName}
                                    </td>
                                    <td className="py-1.5 px-2 font-bold text-slate-900 dark:text-white">
                                      {t.result} {t.unit}
                                    </td>
                                    <td className="py-1.5 px-2 text-slate-500">
                                      {t.referenceRange || '—'}
                                    </td>
                                    <td className="py-1.5 px-2">
                                      <span
                                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                          isFlagged
                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        }`}
                                      >
                                        {t.flag || 'Normal'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* STRUCTURED SECTION 3: DISCHARGE SUMMARY DETAILS */}
                    {record.recordType === 'discharge_summary' && (
                      <div className="my-3 p-3.5 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40 text-xs space-y-1.5">
                        {record.admissionDate && record.dischargeDate && (
                          <div className="text-slate-700 dark:text-slate-300">
                            <strong>Hospital Stay:</strong> {record.admissionDate} to {record.dischargeDate}
                          </div>
                        )}
                        {record.procedures && (
                          <div className="text-slate-700 dark:text-slate-300">
                            <strong>Procedures:</strong> {record.procedures}
                          </div>
                        )}
                        {record.importantFindings && (
                          <div className="text-slate-700 dark:text-slate-300">
                            <strong>Findings:</strong> {record.importantFindings}
                          </div>
                        )}
                        {record.followUpInstructions && (
                          <div className="text-indigo-800 dark:text-indigo-300 font-semibold">
                            <strong>Follow-up:</strong> {record.followUpInstructions}
                          </div>
                        )}
                      </div>
                    )}

                    {/* STRUCTURED SECTION 4: MEDICAL BILL AMOUNT */}
                    {record.billAmount !== undefined && record.billAmount !== null && (
                      <div className="my-2 p-2.5 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl text-xs flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-semibold">
                        <span>Total Billed Amount</span>
                        <span className="text-base font-bold">${record.billAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Attachments Row */}
                    {hasAttachments && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
                            <Paperclip className="w-3.5 h-3.5" /> Attachments ({record.attachments.length}):
                          </span>
                          {record.attachments.map((att, idx) => (
                            <button
                              key={att.id}
                              type="button"
                              onClick={() => handleOpenDocumentViewer(record, record.attachments, idx)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-700 dark:hover:text-teal-300 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                              title={`View ${att.fileName} in dedicated document viewer`}
                            >
                              <Eye className="w-3.5 h-3.5 text-teal-600" />
                              <span className="truncate max-w-[180px]">{att.fileName}</span>
                              <span className="text-[10px] text-slate-400">({formatFileSize(att.fileSize)})</span>
                            </button>
                          ))}
                          {record.attachments.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleOpenDocumentViewer(record, record.attachments, 0)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-700 dark:text-teal-300 text-xs font-semibold border border-teal-200 dark:border-teal-800 transition cursor-pointer"
                            >
                              <span>View All ({record.attachments.length})</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Follow-up / Linked Records Footer */}
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <div>
                        {record.followUpDate && (
                          <span className="font-semibold text-teal-600 dark:text-teal-400">
                            Follow-Up Scheduled: {record.followUpDate}
                          </span>
                        )}
                      </div>
                      {record.linkedRecordIds && record.linkedRecordIds.length > 0 && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <LinkIcon className="w-3 h-3" />
                          <span>{record.linkedRecordIds.length} linked record(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Friendly Medical Empty State */
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                No Medical Records Yet
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                All records are securely encrypted and isolated to your private account. Start by adding your first prescription, lab report, or consultation.
              </p>

              {/* 4 Quick Start Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal('prescription')}
                  className="p-3.5 rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30 hover:bg-teal-100/70 text-left transition group"
                >
                  <Pill className="w-5 h-5 text-teal-600 mb-2" />
                  <div className="font-bold text-xs text-teal-900 dark:text-teal-200">
                    + Add Prescription
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Medicines & doses
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenCreateModal('lab_report')}
                  className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/70 text-left transition group"
                >
                  <Activity className="w-5 h-5 text-blue-600 mb-2" />
                  <div className="font-bold text-xs text-blue-900 dark:text-blue-200">
                    + Upload Lab Report
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Blood tests & scans
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenCreateModal('discharge_summary')}
                  className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/70 text-left transition group"
                >
                  <Building className="w-5 h-5 text-indigo-600 mb-2" />
                  <div className="font-bold text-xs text-indigo-900 dark:text-indigo-200">
                    + Discharge Summary
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Hospital stays
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenCreateModal('doctor_consultation')}
                  className="p-3.5 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30 hover:bg-purple-100/70 text-left transition group"
                >
                  <Stethoscope className="w-5 h-5 text-purple-600 mb-2" />
                  <div className="font-bold text-xs text-purple-900 dark:text-purple-200">
                    + Consultation
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Doctor visits
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* UNIFIED HEALTH TIMELINE TAB */
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600" />
              Unified Chronological Health Timeline
            </h3>
            <p className="text-xs text-slate-500">
              Integrated timeline combining all doctor consultations, prescriptions, lab reports, discharge summaries, and blood pressure logs
            </p>
          </div>

          {timelineEvents.length > 0 ? (
            <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-8 my-4">
              {timelineEvents.map((evt) => {
                let dotClass = 'bg-teal-500';
                let Icon = FileText;

                if (evt.category === 'blood_pressure') {
                  dotClass = 'bg-rose-500';
                  Icon = Heart;
                } else if (evt.category === 'appointment') {
                  dotClass = 'bg-purple-500';
                  Icon = Stethoscope;
                } else if (evt.recordType === 'prescription') {
                  dotClass = 'bg-teal-500';
                  Icon = Pill;
                } else if (evt.recordType === 'lab_report') {
                  dotClass = 'bg-blue-500';
                  Icon = Activity;
                } else if (evt.recordType === 'discharge_summary') {
                  dotClass = 'bg-indigo-500';
                  Icon = Building;
                }

                return (
                  <div key={evt.id} className="relative group">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full ${dotClass} border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow`}
                    >
                      <Icon className="w-3 h-3" />
                    </div>

                    {/* Timeline Entry Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 transition">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-400">
                          {evt.date} {evt.time && `• ${evt.time}`}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                          {evt.category === 'medical_record'
                            ? evt.recordType?.replace('_', ' ')
                            : evt.category.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {evt.title}
                      </h4>

                      {evt.subtitle && (
                        <p className="text-xs text-teal-700 dark:text-teal-300 font-medium mt-0.5">
                          {evt.subtitle}
                        </p>
                      )}

                      {evt.details && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {evt.details}
                        </p>
                      )}

                      {/* View details & attachments button if it's a medical record */}
                      {evt.category === 'medical_record' && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {evt.originalItem?.attachments && evt.originalItem.attachments.length > 0 && (
                              <>
                                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                                  <Paperclip className="w-3 h-3" /> Documents:
                                </span>
                                {evt.originalItem.attachments.map((att: MedicalAttachment, aIdx: number) => (
                                  <button
                                    key={att.id}
                                    type="button"
                                    onClick={() => handleOpenDocumentViewer(evt.originalItem, evt.originalItem.attachments, aIdx)}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-950 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                                    title={`View ${att.fileName}`}
                                  >
                                    <Eye className="w-3 h-3 text-teal-600" />
                                    <span className="truncate max-w-[120px]">{att.fileName}</span>
                                  </button>
                                ))}
                              </>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleEdit(evt.originalItem)}
                            className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1 ml-auto"
                          >
                            <span>View Full Record</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              No health timeline entries yet. Add a prescription, checkup, or BP reading to generate your health history stream.
            </div>
          )}
        </div>
      )}

      {/* Medical Record Create/Edit Form Modal */}
      {isFormOpen && (
        <MedicalRecordFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingRecord(null);
          }}
          onSave={(record, addToReminders) => {
            if (editingRecord) {
              updateMedicalRecord(record.id, record);
            } else {
              addMedicalRecord(record, addToReminders);
            }
          }}
          initialRecord={editingRecord}
          existingRecords={medicalRecords}
          defaultType={formDefaultType}
        />
      )}

      {/* Dedicated Document Viewer Component Modal */}
      {viewerState && (
        <MedicalDocumentViewerModal
          attachments={viewerState.attachments}
          initialIndex={viewerState.initialIndex}
          record={viewerState.record}
          onClose={() => setViewerState(null)}
        />
      )}
    </div>
  );
};
