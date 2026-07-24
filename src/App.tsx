import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DoctorPortal } from './components/DoctorPortal';
import { TechnicianPanel } from './components/TechnicianPanel';
import { WeeklyReportView } from './components/WeeklyReportView';
import { CaseDetailModal } from './components/CaseDetailModal';
import { PathologyCase, NotificationLog, CaseStatus } from './types';
import {
  getStoredCases,
  saveCases,
  getStoredNotifications,
  saveNotifications,
  createNotificationForCase,
  resetToInitialData,
  formatDateTurkish,
} from './utils/storage';
import {
  subscribeToCases,
  subscribeToNotifications,
  saveCaseToFirestore,
  deleteCaseFromFirestore,
  saveNotificationToFirestore,
} from './lib/firebase';
import { Stethoscope, ClipboardList, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'doctor' | 'technician' | 'report'>('doctor');
  const [cases, setCases] = useState<PathologyCase[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [selectedCaseForTimeline, setSelectedCaseForTimeline] = useState<PathologyCase | null>(null);

  // Load initial local cache and subscribe to real-time Firestore
  useEffect(() => {
    // Initial local cache
    setCases(getStoredCases());
    setNotifications(getStoredNotifications());

    let isInitialCasesSync = true;
    let isInitialNotifsSync = true;

    // Subscribe to Firestore cases
    const unsubscribeCases = subscribeToCases((remoteCases) => {
      if (remoteCases.length > 0) {
        setCases(remoteCases);
        saveCases(remoteCases);
      } else if (isInitialCasesSync) {
        const localCases = getStoredCases();
        if (localCases.length > 0) {
          localCases.forEach((c) => saveCaseToFirestore(c));
        }
      } else {
        setCases([]);
        saveCases([]);
      }
      isInitialCasesSync = false;
    });

    // Subscribe to Firestore notifications
    const unsubscribeNotifs = subscribeToNotifications((remoteNotifs) => {
      if (remoteNotifs.length > 0) {
        setNotifications(remoteNotifs);
        saveNotifications(remoteNotifs);
      } else if (isInitialNotifsSync) {
        const localNotifs = getStoredNotifications();
        if (localNotifs.length > 0) {
          localNotifs.forEach((n) => saveNotificationToFirestore(n));
        }
      } else {
        setNotifications([]);
        saveNotifications([]);
      }
      isInitialNotifsSync = false;
    });

    return () => {
      unsubscribeCases();
      unsubscribeNotifs();
    };
  }, []);

  // Handler: Add new case (Technician)
  const handleAddCase = (newCase: PathologyCase) => {
    // Optimistic UI update
    setCases((prev) => [newCase, ...prev.filter((c) => c.id !== newCase.id)]);
    saveCases([newCase, ...getStoredCases().filter((c) => c.id !== newCase.id)]);

    saveCaseToFirestore(newCase);

    // If case is added as completed, create a notification
    if (newCase.status === 'completed') {
      const now = new Date();
      const dateFormatted = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;
      const msg = `${newCase.caseNumber} numaralı vakanın ${newCase.tests.join(' ')} çalışması ${dateFormatted} tarihinde tamamlandı.`;
      
      const notif = createNotificationForCase(newCase, msg, 'completed');
      setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
    } else {
      const notif = createNotificationForCase(
        newCase,
        `${newCase.caseNumber} vaka kaydı alındı.`,
        'updated'
      );
      setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
    }
  };

  // Handler: Update Case Status
  const handleUpdateCaseStatus = (
    caseId: string,
    status: CaseStatus,
    completedTests?: string[],
    notes?: string
  ) => {
    const now = new Date();
    const existing = cases.find((c) => c.id === caseId);
    if (!existing) return;

    const isNowCompleted = status === 'completed';
    const dateFormatted = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;

    const updatedCaseObj: PathologyCase = {
      ...existing,
      status,
      completedAt: isNowCompleted ? now.toISOString() : existing.completedAt,
      completedTests: completedTests || (isNowCompleted ? [...existing.tests] : existing.completedTests),
      technicianNotes: notes || existing.technicianNotes,
    };

    setCases((prev) => prev.map((c) => (c.id === caseId ? updatedCaseObj : c)));
    saveCases(getStoredCases().map((c) => (c.id === caseId ? updatedCaseObj : c)));

    saveCaseToFirestore(updatedCaseObj);

    const actionMsg = `${updatedCaseObj.caseNumber} numaralı vakanın ${updatedCaseObj.tests.join(' ')} çalışması ${dateFormatted} tarihinde tamamlandı.`;
    const notif = createNotificationForCase(updatedCaseObj, actionMsg, status === 'completed' ? 'completed' : 'updated');
    setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
  };

  // Handler: Edit full case
  const handleEditCase = (updatedCase: PathologyCase) => {
    setCases((prev) => prev.map((c) => (c.id === updatedCase.id ? updatedCase : c)));
    saveCases(getStoredCases().map((c) => (c.id === updatedCase.id ? updatedCase : c)));
    saveCaseToFirestore(updatedCase);

    const now = new Date();
    const dateFormatted = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;
    const actionMsg = `${updatedCase.caseNumber} numaralı vakanın bilgileri güncellendi (${dateFormatted}).`;
    const notif = createNotificationForCase(updatedCase, actionMsg, 'updated');
    setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
  };

  // Handler: Delete Case
  const handleDeleteCase = (caseId: string) => {
    if (confirm('Bu vakayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      setCases((prev) => prev.filter((c) => c.id !== caseId));
      saveCases(getStoredCases().filter((c) => c.id !== caseId));
      deleteCaseFromFirestore(caseId);
    }
  };

  // Handler: Mark all notifications as read
  const handleMarkAllNotifsAsRead = () => {
    notifications.forEach((n) => {
      if (!n.read) {
        saveNotificationToFirestore({ ...n, read: true });
      }
    });
  };

  // Handler: Reset Data
  const handleResetData = () => {
    if (confirm('Tüm yerel ve bulut veriler temizlensin mi?')) {
      cases.forEach((c) => deleteCaseFromFirestore(c.id));
      resetToInitialData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-16">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onMarkAllNotifsAsRead={handleMarkAllNotifsAsRead}
        onResetData={handleResetData}
      />

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Quick Role Switcher Info Ribbon */}
        <div className="mb-6 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-slate-600 font-medium">
              {activeTab === 'doctor' && (
                <>
                  <strong className="text-slate-900 font-bold">Hekim Portalı:</strong> Vakaların durumunu ve tamamlanma tarihlerini izleyebilirsiniz.
                </>
              )}
              {activeTab === 'technician' && (
                <>
                  <strong className="text-slate-900 font-bold">Tekniker Girişi:</strong> Vaka no ve FISH çalışmalarını (ALK, ROS1, HER2, 1p19q, BCL2, BCL6, CMYC) seçip "Çalışıldı" işaretleyin, hekimlere anlık bildirim gitsin.
                </>
              )}
              {activeTab === 'report' && (
                <>
                  <strong className="text-slate-900 font-bold">Haftalık Rapor:</strong> Tamamlanan vaka sayıları ve test istatistiklerinin haftalık dökümü.
                </>
              )}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('doctor')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                activeTab === 'doctor'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              Hekim Görünümü
            </button>
            <button
              onClick={() => setActiveTab('technician')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                activeTab === 'technician'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              Tekniker Girişi
            </button>
          </div>
        </div>

        {/* View Tabs */}
        {activeTab === 'doctor' && (
          <DoctorPortal
            cases={cases}
            onSelectCaseForTimeline={(c) => setSelectedCaseForTimeline(c)}
            onDeleteCase={handleDeleteCase}
          />
        )}

        {activeTab === 'technician' && (
          <TechnicianPanel
            cases={cases}
            onAddCase={handleAddCase}
            onUpdateCaseStatus={handleUpdateCaseStatus}
            onEditCase={handleEditCase}
            onDeleteCase={handleDeleteCase}
          />
        )}

        {activeTab === 'report' && <WeeklyReportView cases={cases} />}
      </main>

      {/* Case Timeline / Details Modal */}
      <CaseDetailModal
        pCase={selectedCaseForTimeline}
        onClose={() => setSelectedCaseForTimeline(null)}
      />

      {/* Sleek Interface Micro-Footer Ticker Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-10 bg-slate-900 text-white text-[11px] font-medium z-30 border-t border-slate-800 flex items-center px-4">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-slate-300">Sistem Aktif & Anlık Senkronize</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-400">
            <span>Toplam Vaka: <strong className="text-white">{cases.length}</strong></span>
            <span>Tamamlanan: <strong className="text-emerald-400">{cases.filter(c => c.status === 'completed').length}</strong></span>
            <span>İşlemde: <strong className="text-amber-400">{cases.filter(c => c.status === 'in_progress' || c.status === 'pending').length}</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
