import React, { useState } from 'react';
import {
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  FlaskConical,
  User,
  Building2,
  FileText,
  Tag,
  Search,
  Sparkles,
  Zap,
  Check,
  Edit,
  Trash2,
  Send,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  LogOut,
} from 'lucide-react';
import { PathologyCase, CaseStatus, PriorityLevel } from '../types';
import {
  COMMON_TEST_PANELS,
  COMMON_DOCTORS,
  COMMON_DEPARTMENTS,
  COMMON_TISSUE_TYPES,
} from '../data/initialData';
import { formatDateTurkish, getWeekNumber } from '../utils/storage';

interface TechnicianPanelProps {
  cases: PathologyCase[];
  onAddCase: (newCase: PathologyCase) => void;
  onUpdateCaseStatus: (
    caseId: string,
    status: CaseStatus,
    completedTests?: string[],
    notes?: string
  ) => void;
  onDeleteCase: (caseId: string) => void;
}

export const TechnicianPanel: React.FC<TechnicianPanelProps> = ({
  cases,
  onAddCase,
  onUpdateCaseStatus,
  onDeleteCase,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Form State
  const [caseNumber, setCaseNumber] = useState('');
  const [patientInitials, setPatientInitials] = useState('');
  const [tissueSource, setTissueSource] = useState(COMMON_TISSUE_TYPES[0]);
  const [customTissue, setCustomTissue] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>(['FISH ALK', 'FISH ROS1']);
  const [customTestInput, setCustomTestInput] = useState('');
  const [doctorName, setDoctorName] = useState(COMMON_DOCTORS[0]);
  const [customDoctor, setCustomDoctor] = useState('');
  const [department, setDepartment] = useState(COMMON_DEPARTMENTS[0]);
  const [status, setStatus] = useState<CaseStatus>('completed');
  const [priority, setPriority] = useState<PriorityLevel>('urgent');
  const [blockNumber, setBlockNumber] = useState('A-1');
  const [technicianNotes, setTechnicianNotes] = useState(
    'FISH ALK ve ROS1 çalışması tamamlandı. Sinyaller sayıldı, değerlendirmeye hazır.'
  );

  // UI state
  const [activeTab, setActiveTab] = useState<'add' | 'quick_complete' | 'all'>('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Authentication Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    if ((u === 'admin' || u === 'tekniker') && (p === 'admin' || p === '123456')) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setAuthError('');
    } else {
      setAuthError('Hatalı kullanıcı adı veya şifre! Lütfen tekrar deneyiniz.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.setItem('admin_authenticated', 'false');
  };

  // Preset Handlers
  const handleApplyPreset = (presetName: string) => {
    if (presetName === 'alk_ros1') {
      setSelectedTests(['FISH ALK', 'FISH ROS1']);
      setCaseNumber('M' + Math.floor(100 + Math.random() * 900));
      setTechnicianNotes('FISH ALK ve FISH ROS1 çalışmaları tamamlandı.');
    } else if (presetName === 'lymphoma') {
      setSelectedTests(['FISH BCL2', 'FISH BCL6', 'FISH CMYC']);
      setCaseNumber('M' + Math.floor(100 + Math.random() * 900));
      setTechnicianNotes('FISH BCL2, BCL6 ve CMYC hibridizasyon çalışması.');
    } else if (presetName === 'her2') {
      setSelectedTests(['FISH HER2']);
      setCaseNumber('P2026-' + Math.floor(100 + Math.random() * 900));
      setTechnicianNotes('FISH HER2 gene amplifikasyon çalışması.');
    } else if (presetName === 'glioma') {
      setSelectedTests(['FISH 1p19q']);
      setCaseNumber('M' + Math.floor(100 + Math.random() * 900));
      setTechnicianNotes('FISH 1p19q ko-delesyon analizi.');
    } else if (presetName === 'all_fish') {
      setSelectedTests(['FISH ALK', 'FISH ROS1', 'FISH HER2', 'FISH 1p19q', 'FISH BCL2', 'FISH BCL6', 'FISH CMYC']);
      setCaseNumber('M' + Math.floor(100 + Math.random() * 900));
      setTechnicianNotes('Tüm FISH paneli çalışması.');
    }
  };

  const handleToggleTest = (test: string) => {
    if (selectedTests.includes(test)) {
      setSelectedTests(selectedTests.filter((t) => t !== test));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handleAddCustomTest = () => {
    if (customTestInput.trim() && !selectedTests.includes(customTestInput.trim())) {
      setSelectedTests([...selectedTests, customTestInput.trim()]);
      setCustomTestInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!caseNumber.trim()) {
      alert('Lütfen vaka numarasını giriniz (ör. M983).');
      return;
    }

    if (selectedTests.length === 0) {
      alert('Lütfen en az bir çalışma/test seçiniz.');
      return;
    }

    const finalTissue = customTissue.trim() || tissueSource;
    const finalDoctor = customDoctor.trim() || doctorName;
    const now = new Date();

    const newCase: PathologyCase = {
      id: 'case-' + Date.now(),
      caseNumber: caseNumber.trim().toUpperCase(),
      patientInitials: patientInitials.trim() || undefined,
      tissueSource: finalTissue,
      tests: selectedTests,
      completedTests: status === 'completed' ? [...selectedTests] : [],
      doctorName: finalDoctor,
      department,
      status,
      priority,
      createdAt: now.toISOString(),
      completedAt: status === 'completed' ? now.toISOString() : undefined,
      technicianNotes: technicianNotes.trim() || undefined,
      blockNumber: blockNumber.trim() || undefined,
      weekNumber: getWeekNumber(now),
      year: now.getFullYear(),
    };

    onAddCase(newCase);

    setToastMessage(
      `✅ ${newCase.caseNumber} numaralı vaka ve ${newCase.tests.join(', ')} çalışması sisteme eklendi ve hekimlere bildirildi!`
    );
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);

    // Reset fields for next entry
    setCaseNumber('');
    setPatientInitials('');
    setCustomTissue('');
    setCustomDoctor('');
    setTechnicianNotes('');
  };

  const filteredCases = cases.filter(
    (c) =>
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tests.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingOrInProgressCases = cases.filter(
    (c) => c.status === 'in_progress' || c.status === 'pending'
  );

  // Render Login Form if Not Authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tekniker & Admin Girişi</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Tekniker laboratuvar paneline erişmek ve FISH vakalarını düzenlemek için yetkili yönetici hesabınızla giriş yapınız.
            </p>
          </div>

          {authError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-700 font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="ör: admin"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Sisteme Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {showSuccessToast && (
        <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold shadow-xl border border-emerald-500 flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span className="text-sm">{toastMessage}</span>
          </div>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="text-white hover:text-slate-100 font-extrabold text-xs bg-emerald-700 px-2.5 py-1 rounded-lg"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Top Header & View Modes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
                <FlaskConical className="w-6 h-6 text-indigo-600" />
                Tekniker FISH Laboratuvar Giriş Paneli
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Admin Oturumu
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Vaka numarası ve FISH çalışmalarını (ALK, ROS1, HER2, 1p19q, BCL2, BCL6, CMYC) sisteme ekleyin veya "Çalışıldı" olarak güncelleyin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab('add')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'add'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Yeni FISH Çalışması Ekle
              </button>

              <button
                onClick={() => setActiveTab('quick_complete')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'quick_complete'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Hızlı "Çalışıldı" Yap ({pendingOrInProgressCases.length})
              </button>

              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                Tüm Kayıtlar ({cases.length})
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-2xs shrink-0"
              title="Admin Oturumunu Kapat"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: ADD NEW CASE FORM */}
      {activeTab === 'add' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Quick Preset Buttons */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Hızlı FISH Şablon Seçimi (Tek Tıkla Hazır Paneller):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('alk_ros1')}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-200" />
                Akciğer FISH (ALK + ROS1)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('lymphoma')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-xs transition-all shadow-2xs"
              >
                Lenfoma FISH (BCL2 + BCL6 + CMYC)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('her2')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-xs transition-all shadow-2xs"
              >
                Meme / Mide FISH (HER2)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('glioma')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-xs transition-all shadow-2xs"
              >
                Gliom FISH (1p19q)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('all_fish')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-xs transition-all shadow-2xs"
              >
                Tüm FISH Çalışmaları
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Vaka Numarası */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Vaka / Protokol Numarası <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="ör. M983, P2026-105"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white uppercase tracking-wide font-mono font-bold"
                  />
                </div>
              </div>

              {/* İsteyen / Takip Eden Hekim */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  İsteyen Hekim <span className="text-rose-500">*</span>
                </label>
                <select
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white font-semibold"
                >
                  {COMMON_DOCTORS.map((doc) => (
                    <option key={doc} value={doc}>
                      {doc}
                    </option>
                  ))}
                  <option value="Diğer">Diğer Hekim (Yazınız)</option>
                </select>
                {doctorName === 'Diğer' && (
                  <input
                    type="text"
                    placeholder="Hekim İsim Soyisim..."
                    value={customDoctor}
                    onChange={(e) => setCustomDoctor(e.target.value)}
                    className="w-full mt-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
                  />
                )}
              </div>

              {/* Aciliyet Durumu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Aciliyet Durumu
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                >
                  <option value="urgent">⚡ Acil Vaka (Öncelikli)</option>
                  <option value="routine">📄 Rutin Takip</option>
                </select>
              </div>
            </div>

            {/* Test Selection Badges */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Çalışılan Test / Panel Seçimi <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_TEST_PANELS.map((test) => {
                  const isSelected = selectedTests.includes(test);
                  return (
                    <button
                      key={test}
                      type="button"
                      onClick={() => handleToggleTest(test)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      {test}
                    </button>
                  );
                })}
              </div>

              {/* Custom test input */}
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Farklı bir test ekle (ör. MET Amplifikasyonu)..."
                  value={customTestInput}
                  onChange={(e) => setCustomTestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTest();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTest}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-all"
                >
                  Ekle
                </button>
              </div>

              {/* Selected List Summary */}
              {selectedTests.length > 0 && (
                <p className="text-xs text-indigo-600 mt-2 font-bold">
                  Seçilen çalışmalar: <span className="font-extrabold text-slate-900">{selectedTests.join(', ')}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vaka Durumu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mevcut Çalışma Durumu
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CaseStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                >
                  <option value="completed">🟢 Tamamlandı (Çalışıldı)</option>
                  <option value="in_progress">🟡 Devam Ediyor (İşlemde)</option>
                  <option value="pending">🔵 Beklemede (Pre-analitik)</option>
                  <option value="repeat_requested">🔴 Ek Boyama / Tekrar İstendi</option>
                </select>
              </div>

              {/* Açıklama / Not */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Açıklama / Tekniker Notu
                </label>
                <input
                  type="text"
                  placeholder="ör. Sinyaller sayıldı, değerlendirmeye hazır."
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Vakayı Kaydet & Hekimlere Bildir
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: QUICK "ÇALIŞILDI" COMPLETE LIST */}
      {activeTab === 'quick_complete' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Devam Eden / Bekleyen Vakaları "Çalışıldı" Olarak Tamamla
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Tek tıkla vakanın çalışmasını "Tamamlandı" olarak güncelleyebilir ve hekime anlık bildirim gönderebilirsiniz.
              </p>
            </div>
          </div>

          {pendingOrInProgressCases.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-bold text-slate-800">Harika! Bekleyen veya devam eden vaka yok.</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Tüm tanımlı çalışmalar tamamlandı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingOrInProgressCases.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-300 transition-all shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-base bg-white px-2.5 py-0.5 rounded border border-slate-200">
                          {c.caseNumber}
                        </span>
                        {c.priority === 'urgent' && (
                          <span className="bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-extrabold px-2 py-0.5 rounded">
                            ACİL
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {c.status === 'in_progress' ? 'Devam Ediyor' : 'Beklemede'}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-800">{c.tissueSource}</p>
                    <p className="text-xs text-indigo-700 font-bold mt-1">
                      İstenen Testler: <span className="text-slate-900 font-extrabold">{c.tests.join(', ')}</span>
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Hekim: {c.doctorName} ({c.department})</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-medium">Kayıt: {formatDateTurkish(c.createdAt)}</span>
                    <button
                      onClick={() => {
                        onUpdateCaseStatus(
                          c.id,
                          'completed',
                          [...c.tests],
                          `${c.tests.join(' ve ')} çalışması tamamlandı. Değerlendirmeye hazır.`
                        );
                        setToastMessage(
                          `📢 ${c.caseNumber} numaralı vakanın ${c.tests.join(' ')} çalışması tamamlandı olarak işaretlendi ve ${c.doctorName} hekimine bildirildi!`
                        );
                        setShowSuccessToast(true);
                        setTimeout(() => setShowSuccessToast(false), 4000);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-4 h-4 text-white" />
                      "Çalışıldı" Yap & Bildir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALL RECORDS LIST */}
      {activeTab === 'all' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Sistemdeki Tüm Vaka Kayıtları
            </h3>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Vaka no, hekim veya test ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Vaka No</th>
                  <th className="py-3 px-3">Doku & Testler</th>
                  <th className="py-3 px-3">Hekim / Bölüm</th>
                  <th className="py-3 px-3">Durum</th>
                  <th className="py-3 px-3">Tamamlanma Tarihi</th>
                  <th className="py-3 px-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      Aramanıza uygun vaka bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-all">
                      <td className="py-3 px-3 font-mono font-black text-slate-900">
                        {c.caseNumber}
                        {c.blockNumber && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Blok: {c.blockNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{c.tissueSource}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.tests.map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{c.doctorName}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{c.department}</div>
                      </td>
                      <td className="py-3 px-3">
                        {c.status === 'completed' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            Tamamlandı
                          </span>
                        )}
                        {c.status === 'in_progress' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold">
                            Devam Ediyor
                          </span>
                        )}
                        {c.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                            Beklemede
                          </span>
                        )}
                        {c.status === 'repeat_requested' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold">
                            Tekrar İstendi
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px] font-medium">
                        {formatDateTurkish(c.completedAt || c.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        {c.status !== 'completed' && (
                          <button
                            onClick={() => {
                              onUpdateCaseStatus(
                                c.id,
                                'completed',
                                [...c.tests],
                                'Çalışma tamamlandı.'
                              );
                            }}
                            title="Tamamlandı İşaretle"
                            className="p-1.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteCase(c.id)}
                          title="Vakayı Sil"
                          className="p-1.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-200 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
