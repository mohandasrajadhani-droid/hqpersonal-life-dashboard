import React, { useState, useRef } from 'react';
import {
  X,
  FileText,
  Upload,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  Building,
  ShieldCheck,
  Paperclip,
  CheckSquare,
  DollarSign,
  AlertCircle,
  Link as LinkIcon,
  Eye,
} from 'lucide-react';
import {
  MedicalRecord,
  MedicalRecordType,
  PrescriptionMedicineItem,
  LabTestItem,
  MedicalAttachment,
} from '../../types';
import { MedicalDocumentViewerModal } from '../medical/MedicalDocumentViewerModal';

interface MedicalRecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: MedicalRecord, addToMedicineReminders?: boolean) => void;
  initialRecord?: MedicalRecord | null;
  existingRecords?: MedicalRecord[];
  defaultType?: MedicalRecordType;
}

export const MedicalRecordFormModal: React.FC<MedicalRecordFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRecord,
  existingRecords = [],
  defaultType = 'prescription',
}) => {
  const [recordType, setRecordType] = useState<MedicalRecordType>(
    initialRecord?.recordType || defaultType
  );
  const [title, setTitle] = useState(initialRecord?.title || '');
  const [date, setDate] = useState(
    initialRecord?.date || new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState(initialRecord?.time || '');
  const [doctorName, setDoctorName] = useState(initialRecord?.doctorName || '');
  const [specialty, setSpecialty] = useState(initialRecord?.specialty || '');
  const [hospitalClinic, setHospitalClinic] = useState(initialRecord?.hospitalClinic || '');
  const [shortDescription, setShortDescription] = useState(initialRecord?.shortDescription || '');
  const [notes, setNotes] = useState(initialRecord?.notes || '');
  const [followUpDate, setFollowUpDate] = useState(initialRecord?.followUpDate || '');
  const [diagnosis, setDiagnosis] = useState(initialRecord?.diagnosis || '');

  // Prescription medicines
  const [medicines, setMedicines] = useState<PrescriptionMedicineItem[]>(
    initialRecord?.medicines || []
  );
  const [addToReminders, setAddToReminders] = useState(true);

  // Lab test items
  const [labName, setLabName] = useState(initialRecord?.labName || '');
  const [testResults, setTestResults] = useState<LabTestItem[]>(
    initialRecord?.testResults || []
  );

  // Discharge summary specifics
  const [admissionDate, setAdmissionDate] = useState(initialRecord?.admissionDate || '');
  const [dischargeDate, setDischargeDate] = useState(initialRecord?.dischargeDate || '');
  const [procedures, setProcedures] = useState(initialRecord?.procedures || '');
  const [importantFindings, setImportantFindings] = useState(initialRecord?.importantFindings || '');
  const [medicinesAtDischarge, setMedicinesAtDischarge] = useState(
    initialRecord?.medicinesAtDischarge || ''
  );
  const [followUpInstructions, setFollowUpInstructions] = useState(
    initialRecord?.followUpInstructions || ''
  );

  // Bill amount
  const [billAmount, setBillAmount] = useState<number | string>(
    initialRecord?.billAmount ?? ''
  );

  // Attachments
  const [attachments, setAttachments] = useState<MedicalAttachment[]>(
    initialRecord?.attachments || []
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewAttachmentIndex, setPreviewAttachmentIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Linked records
  const [linkedRecordIds, setLinkedRecordIds] = useState<string[]>(
    initialRecord?.linkedRecordIds || []
  );

  if (!isOpen) return null;

  // Medicine Item handlers
  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {
        id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: '',
        dosage: '1 tablet',
        frequency: 'Twice daily after meals',
        duration: '5 days',
        instructions: '',
      },
    ]);
  };

  const handleUpdateMedicine = (index: number, field: keyof PrescriptionMedicineItem, val: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: val };
    setMedicines(updated);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  // Lab Test handlers
  const handleAddLabTest = () => {
    setTestResults([
      ...testResults,
      {
        id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        testName: '',
        result: '',
        unit: '',
        referenceRange: '',
        flag: 'Normal',
        notes: '',
      },
    ]);
  };

  const handleUpdateLabTest = (index: number, field: keyof LabTestItem, val: string) => {
    const updated = [...testResults];
    updated[index] = { ...updated[index], [field]: val };
    setTestResults(updated);
  };

  const handleRemoveLabTest = (index: number) => {
    setTestResults(testResults.filter((_, i) => i !== index));
  };

  // File Upload Handlers (converts to base64 Data URL)
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError('');
    setIsUploading(true);

    const maxSizeBytes = 15 * 1024 * 1024; // 15MB

    Array.from(files).forEach((file) => {
      if (file.size > maxSizeBytes) {
        setUploadError(`"${file.name}" exceeds 15MB limit.`);
        setIsUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newAttachment: MedicalAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
          dataUrl,
          uploadedAt: new Date().toISOString(),
        };
        setAttachments((prev) => [...prev, newAttachment]);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setUploadError(`Failed to read "${file.name}".`);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleToggleLinkedRecord = (recordId: string) => {
    if (linkedRecordIds.includes(recordId)) {
      setLinkedRecordIds(linkedRecordIds.filter((id) => id !== recordId));
    } else {
      setLinkedRecordIds([...linkedRecordIds, recordId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-generate title if empty
    let autoTitle = title.trim();
    if (!autoTitle) {
      if (recordType === 'prescription') {
        autoTitle = doctorName ? `Prescription - Dr. ${doctorName}` : 'Medical Prescription';
      } else if (recordType === 'lab_report') {
        autoTitle = labName ? `Lab Report - ${labName}` : 'Laboratory Test Report';
      } else if (recordType === 'discharge_summary') {
        autoTitle = hospitalClinic ? `Discharge Summary - ${hospitalClinic}` : 'Hospital Discharge Summary';
      } else if (recordType === 'doctor_consultation') {
        autoTitle = doctorName ? `Consultation with Dr. ${doctorName}` : 'Doctor Consultation';
      } else if (recordType === 'medical_bill') {
        autoTitle = hospitalClinic ? `Medical Bill - ${hospitalClinic}` : 'Medical Expense Bill';
      } else if (recordType === 'vaccination') {
        autoTitle = 'Vaccination Record';
      } else if (recordType === 'imaging_scan') {
        autoTitle = 'Imaging / Diagnostic Scan Report';
      } else {
        autoTitle = 'Medical Document';
      }
    }

    const newRecord: MedicalRecord = {
      id: initialRecord?.id || `medrec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      recordType,
      title: autoTitle,
      date,
      time: time.trim() || undefined,
      doctorName: doctorName.trim() || undefined,
      specialty: specialty.trim() || undefined,
      hospitalClinic: hospitalClinic.trim() || undefined,
      shortDescription: shortDescription.trim() || undefined,
      notes: notes.trim() || undefined,
      followUpDate: followUpDate.trim() || undefined,
      diagnosis: diagnosis.trim() || undefined,
      medicines: recordType === 'prescription' ? medicines.filter((m) => m.name.trim()) : undefined,
      labName: recordType === 'lab_report' ? labName.trim() || undefined : undefined,
      testResults: recordType === 'lab_report' ? testResults.filter((t) => t.testName.trim()) : undefined,
      admissionDate: recordType === 'discharge_summary' ? admissionDate || undefined : undefined,
      dischargeDate: recordType === 'discharge_summary' ? dischargeDate || undefined : undefined,
      procedures: recordType === 'discharge_summary' ? procedures.trim() || undefined : undefined,
      importantFindings: recordType === 'discharge_summary' ? importantFindings.trim() || undefined : undefined,
      medicinesAtDischarge: recordType === 'discharge_summary' ? medicinesAtDischarge.trim() || undefined : undefined,
      followUpInstructions: recordType === 'discharge_summary' ? followUpInstructions.trim() || undefined : undefined,
      billAmount: recordType === 'medical_bill' && billAmount !== '' ? Number(billAmount) : undefined,
      attachments,
      linkedRecordIds: linkedRecordIds.length > 0 ? linkedRecordIds : undefined,
      createdAt: initialRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newRecord, recordType === 'prescription' && addToReminders);
    onClose();
  };

  // Types list with friendly names
  const recordTypes: { id: MedicalRecordType; label: string }[] = [
    { id: 'prescription', label: 'Prescription' },
    { id: 'lab_report', label: 'Lab Report' },
    { id: 'discharge_summary', label: 'Discharge Summary' },
    { id: 'doctor_consultation', label: 'Doctor Consultation' },
    { id: 'medical_bill', label: 'Medical Bill' },
    { id: 'vaccination', label: 'Vaccination' },
    { id: 'imaging_scan', label: 'Imaging / Scan' },
    { id: 'other', label: 'Other Document' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="med-record-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl my-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 id="med-record-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
                {initialRecord ? 'Edit Medical Record' : 'Add Medical Record'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Encrypted, authenticated personal health document
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Record Type Selector Pills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Record Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {recordTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setRecordType(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    recordType === t.id
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Record Title & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="rec-title-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Record Title
              </label>
              <input
                id="rec-title-input"
                type="text"
                placeholder="e.g. Cardiology Prescription or Annual Blood Test"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div>
              <label htmlFor="rec-date-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Record Date
              </label>
              <input
                id="rec-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Doctor & Hospital Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="rec-doctor-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Doctor Name
              </label>
              <input
                id="rec-doctor-input"
                type="text"
                placeholder="Dr. Rajesh Sharma"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div>
              <label htmlFor="rec-specialty-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Specialty / Department
              </label>
              <input
                id="rec-specialty-input"
                type="text"
                placeholder="e.g. Cardiology, Orthopedics"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div>
              <label htmlFor="rec-hospital-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hospital / Clinic / Lab
              </label>
              <input
                id="rec-hospital-input"
                type="text"
                placeholder="e.g. City General Hospital"
                value={hospitalClinic}
                onChange={(e) => setHospitalClinic(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Diagnosis / Chief Reason */}
          <div>
            <label htmlFor="rec-diagnosis-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Diagnosis / Clinical Reason
            </label>
            <input
              id="rec-diagnosis-input"
              type="text"
              placeholder="e.g. Primary Hypertension, Seasonal Bronchitis, Routine Health Check"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          {/* TYPE-SPECIFIC SECTIONS */}

          {/* 1. PRESCRIPTION MEDICINES BUILDER */}
          {recordType === 'prescription' && (
            <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Prescribed Medicines
                  </h4>
                  <p className="text-xs text-slate-500">
                    Add each medicine prescribed with dosage, frequency, and instructions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Medicine
                </button>
              </div>

              {medicines.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {medicines.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                          Medicine #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Remove medicine"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Medicine Name (e.g. Telmisartan 40mg)"
                            value={m.name}
                            onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Dosage (e.g. 1 tab)"
                            value={m.dosage}
                            onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Duration (e.g. 15 days)"
                            value={m.duration}
                            onChange={(e) => handleUpdateMedicine(idx, 'duration', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Frequency (e.g. Twice daily after breakfast)"
                          value={m.frequency}
                          onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Instructions (e.g. Take with warm water)"
                          value={m.instructions || ''}
                          onChange={(e) => handleUpdateMedicine(idx, 'instructions', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-dashed border-teal-200 dark:border-teal-800 text-xs text-slate-500">
                  No individual medicines listed yet. Click "Add Medicine" to enter structured details.
                </div>
              )}

              {/* Checkbox to auto-sync to Medicine Reminder Section */}
              {medicines.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-teal-200/60 dark:border-teal-800/40">
                  <input
                    id="auto-sync-reminders-cb"
                    type="checkbox"
                    checked={addToReminders}
                    onChange={(e) => setAddToReminders(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer"
                  />
                  <label
                    htmlFor="auto-sync-reminders-cb"
                    className="text-xs font-semibold text-teal-900 dark:text-teal-200 cursor-pointer"
                  >
                    Sync these medicines to my Medicine Tracker & Daily Reminders
                  </label>
                </div>
              )}
            </div>
          )}

          {/* 2. LAB REPORT TEST RESULTS BUILDER */}
          {recordType === 'lab_report' && (
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Lab Test Results
                  </h4>
                  <p className="text-xs text-slate-500">
                    Optionally record specific test parameters, measured values, and reference ranges
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddLabTest}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Test Parameter
                </button>
              </div>

              <div className="w-full">
                <input
                  type="text"
                  placeholder="Laboratory Name (e.g. Quest Diagnostics, Dr. Lal PathLabs)"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              {testResults.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {testResults.map((t, idx) => (
                    <div
                      key={t.id || idx}
                      className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                          Parameter #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLabTest(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Remove test"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Test Name (e.g. HbA1c, Fasting Blood Glucose)"
                            value={t.testName}
                            onChange={(e) => handleUpdateLabTest(idx, 'testName', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Result (e.g. 5.7)"
                            value={t.result}
                            onChange={(e) => handleUpdateLabTest(idx, 'result', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Unit (e.g. % or mg/dL)"
                            value={t.unit || ''}
                            onChange={(e) => handleUpdateLabTest(idx, 'unit', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <select
                            value={t.flag || 'Normal'}
                            onChange={(e) => handleUpdateLabTest(idx, 'flag', e.target.value as any)}
                            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          >
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                            <option value="Low">Low</option>
                            <option value="Borderline">Borderline</option>
                            <option value="Abnormal">Abnormal</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Reference Range (e.g. 4.0 - 5.6%)"
                          value={t.referenceRange || ''}
                          onChange={(e) => handleUpdateLabTest(idx, 'referenceRange', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-dashed border-blue-200 dark:border-blue-800 text-xs text-slate-500">
                  Optional: You can attach the lab report PDF/Image below, and/or enter specific parameters above.
                </div>
              )}
            </div>
          )}

          {/* 3. DISCHARGE SUMMARY FIELDS */}
          {recordType === 'discharge_summary' && (
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Hospital Stay & Discharge Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Admission Date
                  </label>
                  <input
                    type="date"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Discharge Date
                  </label>
                  <input
                    type="date"
                    value={dischargeDate}
                    onChange={(e) => setDischargeDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Procedures Performed
                </label>
                <input
                  type="text"
                  placeholder="e.g. Angioplasty with 1 stent, Laparoscopic appendectomy"
                  value={procedures}
                  onChange={(e) => setProcedures(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Important Findings
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of hospital course, test findings, condition at discharge..."
                  value={importantFindings}
                  onChange={(e) => setImportantFindings(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Medicines at Discharge
                </label>
                <textarea
                  rows={2}
                  placeholder="Medicines prescribed upon discharge..."
                  value={medicinesAtDischarge}
                  onChange={(e) => setMedicinesAtDischarge(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-up Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Suture removal in 7 days, wound dressing every 2 days"
                  value={followUpInstructions}
                  onChange={(e) => setFollowUpInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {/* 4. MEDICAL BILL AMOUNT */}
          {recordType === 'medical_bill' && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
              <label htmlFor="rec-bill-amount" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Total Bill Amount
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                <input
                  id="rec-bill-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                />
              </div>
            </div>
          )}

          {/* Follow-up Date & Short Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="rec-followup-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Next Follow-Up / Appointment Date
              </label>
              <input
                id="rec-followup-input"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
            <div>
              <label htmlFor="rec-desc-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Short Summary
              </label>
              <input
                id="rec-desc-input"
                type="text"
                placeholder="Brief 1-sentence note for quick overview"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* General Notes */}
          <div>
            <label htmlFor="rec-notes-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              General Notes & Advice
            </label>
            <textarea
              id="rec-notes-input"
              rows={2}
              placeholder="Doctor's advice, lifestyle modifications, precautions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none"
            />
          </div>

          {/* FILE ATTACHMENTS (Drag & Drop + Manual Click) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Medical Documents & Scans (PDF, JPG, PNG)
                </label>
                <p className="text-xs text-slate-400">
                  Stored securely with encryption at rest. Never made public.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {attachments.length} attached
              </span>
            </div>

            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            {/* Dropzone button */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileSelect(e.dataTransfer.files);
              }}
              className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/30 transition-all group"
            >
              <Upload className="w-8 h-8 mx-auto text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Click to browse or drag & drop medical scans/PDFs
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supported formats: PDF, JPEG, PNG, WEBP (Up to 15MB each)
              </p>
            </div>

            {uploadError && (
              <p className="text-xs text-rose-600 font-semibold">{uploadError}</p>
            )}

            {/* Attachments list */}
            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {attachments.map((att, idx) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Paperclip className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={att.fileName}>
                        {att.fileName}
                      </span>
                      <span className="text-slate-400 shrink-0">
                        ({Math.round(att.fileSize / 1024)} KB)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewAttachmentIndex(idx)}
                        className="p-1 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg transition"
                        title="Preview document in viewer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INTER-RECORD LINKING */}
          {existingRecords.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-teal-600" />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Link Related Medical Records
                </label>
              </div>
              <p className="text-xs text-slate-400">
                Connect this document to related consultation, lab tests, or hospital admission
              </p>
              <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                {existingRecords
                  .filter((r) => r.id !== initialRecord?.id)
                  .map((r) => {
                    const isLinked = linkedRecordIds.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleToggleLinkedRecord(r.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition ${
                          isLinked
                            ? 'bg-teal-100/70 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate">
                          [{r.recordType.replace('_', ' ')}] {r.title} ({r.date})
                        </span>
                        <span className="ml-2 shrink-0">
                          {isLinked ? '✓ Linked' : '+ Link'}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-sm shadow-md transition-all"
            >
              Save Medical Record
            </button>
          </div>
        </form>
      </div>

      {/* Attachment Preview Modal */}
      {previewAttachmentIndex !== null && (
        <MedicalDocumentViewerModal
          attachments={attachments}
          initialIndex={previewAttachmentIndex}
          onClose={() => setPreviewAttachmentIndex(null)}
        />
      )}
    </div>
  );
};
