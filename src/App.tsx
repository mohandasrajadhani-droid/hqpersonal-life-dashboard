import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/navigation/Sidebar';
import { Header } from './components/navigation/Header';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';

// Views
import { TodayView } from './components/views/TodayView';
import { HabitsView } from './components/views/HabitsView';
import { TasksView } from './components/views/TasksView';
import { RemindersView } from './components/views/RemindersView';
import { ExpensesView } from './components/views/ExpensesView';
import { IncomeView } from './components/views/IncomeView';
import { BillsView } from './components/views/BillsView';
import { CreditCardsView } from './components/views/CreditCardsView';
import { EmiView } from './components/views/EmiView';
import { FinancialSummaryView } from './components/views/FinancialSummaryView';
import { MedicinesView } from './components/views/MedicinesView';
import { HealthAppointmentsView } from './components/views/HealthAppointmentsView';
import { MedicalRecordsView } from './components/views/MedicalRecordsView';
import { BloodPressureView } from './components/views/BloodPressureView';
import { CalendarView } from './components/views/CalendarView';
import { TravelView } from './components/views/TravelView';
import { RenewalsView } from './components/views/RenewalsView';
import { ReportsView } from './components/views/ReportsView';
import { GlobalSearchView } from './components/views/GlobalSearchView';
import { SettingsView } from './components/views/SettingsView';

// Common Modals
import { QuickAddModal } from './components/common/QuickAddModal';
import { VoiceInputModal } from './components/common/VoiceInputModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { VoiceAlarmActiveModal } from './components/common/VoiceAlarmActiveModal';

// Forms Modals
import { HabitFormModal } from './components/forms/HabitFormModal';
import { TaskFormModal } from './components/forms/TaskFormModal';
import { ReminderFormModal } from './components/forms/ReminderFormModal';
import { BillFormModal } from './components/forms/BillFormModal';
import { EmiFormModal } from './components/forms/EmiFormModal';
import { CreditCardFormModal } from './components/forms/CreditCardFormModal';
import { ExpenseFormModal } from './components/forms/ExpenseFormModal';
import { IncomeFormModal } from './components/forms/IncomeFormModal';
import { MedicineFormModal } from './components/forms/MedicineFormModal';
import { HealthAppointmentFormModal } from './components/forms/HealthAppointmentFormModal';
import { BloodPressureFormModal } from './components/forms/BloodPressureFormModal';
import { MedicalRecordFormModal } from './components/forms/MedicalRecordFormModal';
import { RenewalFormModal } from './components/forms/RenewalFormModal';
import { CalendarEventFormModal } from './components/forms/CalendarEventFormModal';
import { TripFormModal } from './components/forms/TripFormModal';

// Authentication & Lock Screens
import { AuthScreen } from './components/auth/AuthScreen';
import { LockScreen } from './components/auth/LockScreen';

const MainLayout: React.FC = () => {
  const {
    activeSection,
    isQuickAddOpen,
    closeQuickAdd,
    isVoiceModalOpen,
    closeVoiceModal,
    isNotificationDrawerOpen,
    closeNotificationDrawer,
    modalState,
    closeModal,
    settings,
    isAuthenticated,
    isLoadingAuth,
    isLocked,
  } = useApp();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#F9FAF7] dark:bg-slate-950 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400">
        <div className="w-10 h-10 border-2 border-[#387652] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium tracking-wide">Securing personal vault...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (isLocked) {
    return <LockScreen />;
  }

  const renderActiveView = () => {
    switch (activeSection) {
      case 'today':
        return <TodayView />;
      case 'habits':
        return <HabitsView />;
      case 'tasks':
        return <TasksView />;
      case 'reminders':
        return <RemindersView />;
      case 'expenses':
        return <ExpensesView />;
      case 'income':
        return <IncomeView />;
      case 'bills':
        return <BillsView />;
      case 'credit_cards':
        return <CreditCardsView />;
      case 'emi':
        return <EmiView />;
      case 'financial_summary':
        return <FinancialSummaryView />;
      case 'medicines':
        return <MedicinesView />;
      case 'health_appointments':
        return <HealthAppointmentsView />;
      case 'medical_records':
        return <MedicalRecordsView />;
      case 'blood_pressure':
        return <BloodPressureView />;
      case 'calendar':
        return <CalendarView />;
      case 'travel':
        return <TravelView />;
      case 'renewals':
        return <RenewalsView />;
      case 'reports':
        return <ReportsView />;
      case 'search':
        return <GlobalSearchView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div className={`min-h-screen bg-[#F9FAF7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col ${settings.elderlyMode ? 'text-base font-medium' : 'text-sm'}`}>
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header />

          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {renderActiveView()}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Drawers & Modals */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={closeNotificationDrawer}
      />

      <QuickAddModal />

      <VoiceInputModal />

      <VoiceAlarmActiveModal />

      {/* Dedicated Form Modals */}
      <HabitFormModal
        isOpen={Boolean(modalState?.isOpen && modalState?.type === 'habit')}
        onClose={closeModal}
        initialData={modalState?.data}
      />

      <TaskFormModal
        isOpen={Boolean(modalState?.isOpen && modalState?.type === 'task')}
        onClose={closeModal}
        initialData={modalState?.data}
      />

      <ReminderFormModal
        isOpen={Boolean(modalState?.isOpen && modalState?.type === 'reminder')}
        onClose={closeModal}
        initialData={modalState?.data}
      />

      <BillFormModal
        isOpen={Boolean(modalState?.isOpen && modalState?.type === 'bill')}
        onClose={closeModal}
        initialData={modalState?.data}
      />

      <EmiFormModal
        isOpen={Boolean(modalState?.isOpen && modalState?.type === 'emi')}
        onClose={closeModal}
        initialData={modalState?.data}
      />

      <CreditCardFormModal
        isOpen={Boolean(modalState?.isOpen && modalState?.type === 'credit_card')}
        onClose={closeModal}
        initialData={modalState?.data}
      />

      <ExpenseFormModal
        isOpen={Boolean(modalState?.isOpen && modalState?.type === 'expense')}
        onClose={closeModal}
        initialData={modalState?.data}
      />

      <IncomeFormModal
        isOpen={Boolean(modalState?.isOpen && modalState?.type === 'income')}
        onClose={closeModal}
        initialData={modalState?.data}
      />

      <MedicineFormModal
        isOpen={Boolean(modalState?.isOpen && modalState?.type === 'medicine')}
        onClose={closeModal}
        initialData={modalState?.data}
      />

      <HealthAppointmentFormModal
        isOpen={Boolean(modalState?.isOpen && modalState?.type === 'health')}
        onClose={closeModal}
        initialData={modalState?.data}
      />

      <BloodPressureFormModal
        isOpen={Boolean(modalState?.isOpen && (modalState?.type === 'blood_pressure' || modalState?.type === 'bp'))}
        onClose={closeModal}
        initialData={modalState?.data}
      />

      <MedicalRecordFormModal
        isOpen={Boolean(modalState?.isOpen && (modalState?.type === 'medical_record' || modalState?.type === 'medicalRecord'))}
        onClose={closeModal}
        initialData={modalState?.data}
      />

      <RenewalFormModal
        isOpen={Boolean(modalState?.isOpen && modalState?.type === 'renewal')}
        onClose={closeModal}
        initialData={modalState?.data}
      />

      <CalendarEventFormModal
        isOpen={Boolean(
          modalState?.isOpen &&
            (modalState?.type === 'event' || modalState?.type === 'calendarEvent')
        )}
        onClose={closeModal}
        initialData={modalState?.data}
      />

      <TripFormModal
        isOpen={Boolean(modalState?.isOpen && modalState?.type === 'trip')}
        onClose={closeModal}
        initialData={modalState?.data}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
