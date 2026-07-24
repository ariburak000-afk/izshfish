import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Stethoscope,
  Filter,
  Share2,
  Calendar,
  Sparkles,
  ChevronRight,
  Send,
  MessageSquare,
  Copy,
  Check,
  Building2,
  User,
  FlaskConical,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { PathologyCase, FilterState } from '../types';
import { COMMON_DOCTORS, COMMON_DEPARTMENTS } from '../data/initialData';
import { formatDateTurkish } from '../utils/storage';

interface DoctorPortalProps {
  cases: PathologyCase[];
  onSelectCaseForTimeline: (c: PathologyCase) => void;
  onDeleteCase?: (caseId: string) => void;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({
  cases,
  onSelectCaseForTimeline,
  onDeleteCase,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    statusFilter: 'all',
    doctorFilter: 'all',
    departmentFilter: 'all',
    testFilter: 'all',
    timeRange: 'all',
  });

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Filtering Logic
  const filteredCases = cases.filter((c) => {
    // Search text match
    const q = filters.searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.caseNumber.toLowerCase().includes(q) ||
      c.doctorName.toLowerCase().includes(q) ||
      c.tissueSource.toLowerCase().includes(q) ||
      (c.patientInitials && c.patientInitials.toLowerCase().includes(q)) ||
      c.tests.some((t) => t.toLowerCase().includes(q));

    // Status match
    const matchesStatus =
      filters.statusFilter === 'all' ||
      (filters.statusFilter === 'completed' && c.status === 'completed') ||
      (filters.statusFilter === 'in_progress' && c.status === 'in_progress') ||
      (filters.statusFilter === 'pending' && c.status === 'pending') ||
      (filters.statusFilter === 'urgent' && c.priority === 'urgent');

    // Doctor match
    const matchesDoctor =
      filters.doctorFilter === 'all' || c.doctorName === filters.doctorFilter;

    // Department match
    const matchesDept =
      filters.departmentFilter === 'all' || c.department === filters.departmentFilter;

    return matchesSearch && matchesStatus && matchesDoctor && matchesDept;
  });

  // Share text builder
  const getWhatsAppShareText = (c: PathologyCase) => {
    const completedDateStr = c.completedAt ? formatDateTurkish(c.completedAt) : formatDateTurkish(c.createdAt);
    const testsStr = c.tests.join(' ');
    
    return `${c.caseNumber} numaralı vakanın ${testsStr} çalışması ${completedDateStr} tarihinde tamamlandı. Durum: ${
      c.status === 'completed' ? 'Tamamlandı (Çalışıldı)' : 'İşlemde / Devam Ediyor'
    }. Hekim: ${c.doctorName}.`;
  };

  const handleCopyNotificationText = (c: PathologyCase) => {
    const text = getWhatsAppShareText(c);
    navigator.clipboard.writeText(text);
    setCopiedMessageId(c.id);
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  const handleOpenWhatsApp = (c: PathologyCase) => {
    const text = encodeURIComponent(getWhatsAppShareText(c));
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Stats
  const totalCompleted = cases.filter((c) => c.status === 'completed').length;
  const totalInProgress = cases.filter((c) => c.status === 'in_progress').length;
  const totalPending = cases.filter((c) => c.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Main Search & Stat Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
              <Stethoscope className="w-6 h-6 text-indigo-600" />
              Hekim Vaka & Test Takip Portalı
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Vaka numarası (ör: M983) ile anlık FISH (ALK, ROS1, HER2, 1p19q, BCL2, BCL6, CMYC) çalışma sonuçlarını sorgulayın.
            </p>
          </div>

          {/* Quick Counter Badges */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-500">Tamamlanan:</span>
              <span className="text-emerald-700 font-bold">{totalCompleted}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-slate-500">Devam Eden:</span>
              <span className="text-amber-700 font-bold">{totalInProgress}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-slate-500">Bekleyen:</span>
              <span className="text-indigo-700 font-bold">{totalPending}</span>
            </div>
          </div>
        </div>

        {/* Big Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Vaka No ile ara (ör: M983), Hekim İsmi veya FISH Testi (ör: ALK, ROS1, HER2)..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white font-medium transition-all shadow-inner"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters({ ...filters, searchQuery: '' })}
              className="absolute right-4 top-3 text-xs text-slate-500 hover:text-slate-900 bg-slate-200 px-2.5 py-1 rounded-lg font-semibold"
            >
              Temizle
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-500 flex items-center gap-1 font-bold text-[11px] shrink-0">
            <Filter className="w-3.5 h-3.5 text-indigo-600" /> Filtrele:
          </span>

          <button
            onClick={() => setFilters({ ...filters, statusFilter: 'all' })}
            className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
              filters.statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            Tüm Vakalar ({cases.length})
          </button>

          <button
            onClick={() => setFilters({ ...filters, statusFilter: 'completed' })}
            className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
              filters.statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            🟢 Tamamlananlar ({totalCompleted})
          </button>

          <button
            onClick={() => setFilters({ ...filters, statusFilter: 'in_progress' })}
            className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
              filters.statusFilter === 'in_progress'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            🟡 Devam Edenler ({totalInProgress})
          </button>

          <button
            onClick={() => setFilters({ ...filters, statusFilter: 'urgent' })}
            className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
              filters.statusFilter === 'urgent'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            ⚡ Acil Vakalar
          </button>

          {/* Doctor Dropdown */}
          <select
            value={filters.doctorFilter}
            onChange={(e) => setFilters({ ...filters, doctorFilter: e.target.value })}
            className="bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-600 shrink-0 font-semibold"
          >
            <option value="all">👨‍⚕️ Tüm Hekimler</option>
            {COMMON_DOCTORS.map((doc) => (
              <option key={doc} value={doc}>
                {doc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CASES CARDS LIST */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold text-slate-500">
            Listelenen Vaka Sayısı: <span className="text-slate-900 font-bold">{filteredCases.length}</span>
          </span>
          {filters.searchQuery && (
            <span className="text-xs text-indigo-600 font-semibold">
              "{filters.searchQuery}" için sonuçlar
            </span>
          )}
        </div>

        {filteredCases.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">Aradığınız kriterlere uygun vaka bulunamadı.</p>
            <p className="text-xs text-slate-500 font-medium">
              Vaka numarasını (ör. M983) kontrol edebilir veya arama filtresini temizleyebilirsiniz.
            </p>
            <button
              onClick={() => setFilters({ searchQuery: '', statusFilter: 'all', doctorFilter: 'all', departmentFilter: 'all', testFilter: 'all', timeRange: 'all' })}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
            >
              Tüm Filtreleri Sıfırla
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCases.map((c) => {
              const isCompleted = c.status === 'completed';
              const isInProgress = c.status === 'in_progress';
              const isUrgent = c.priority === 'urgent';

              return (
                <div
                  key={c.id}
                  className={`border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden ${
                    isUrgent && !isCompleted
                      ? 'bg-rose-50/60 border-2 border-rose-500 shadow-rose-100/80 ring-2 ring-rose-300/40 hover:border-rose-600'
                      : isCompleted
                      ? 'bg-white border-emerald-200/80 hover:border-emerald-400'
                      : isInProgress
                      ? 'bg-white border-amber-200/80 hover:border-amber-400'
                      : 'bg-white border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {isUrgent && !isCompleted && (
                    <div className="-mx-5 -mt-5 mb-3 px-4 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 text-white text-[11px] font-black flex items-center justify-between shadow-xs">
                      <span className="flex items-center gap-1.5 tracking-wide">
                        <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce" />
                        YÜKSEK ACİL VAKA
                      </span>
                      <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                        <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping inline-block"></span>
                        Öncelikli
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-mono text-lg font-black tracking-wider px-2.5 py-1 rounded-lg border ${
                            isUrgent ? 'bg-rose-100 text-rose-950 border-rose-300' : 'bg-slate-100 text-slate-900 border-slate-200'
                          }`}>
                            {c.caseNumber}
                          </span>
                          {c.patientInitials && (
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                              {c.patientInitials}
                            </span>
                          )}
                          {isUrgent && (
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-600 text-white shadow-xs flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-amber-300" />
                              ACİL
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-2">
                          {c.tissueSource}
                        </p>
                      </div>

                      {/* Status Badge & Actions */}
                      <div className="flex items-center gap-1.5">
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Tamamlandı
                          </span>
                        )}
                        {isInProgress && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shadow-xs">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                            Devam Ediyor
                          </span>
                        )}
                        {c.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
                            Beklemede
                          </span>
                        )}
                        {c.status === 'repeat_requested' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                            Tekrar İstendi
                          </span>
                        )}

                        {onDeleteCase && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCase(c.id);
                            }}
                            title="Vakayı Sil"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Test Panels Chips */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 my-3">
                      <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center justify-between">
                        <span>Çalışılan FISH Testleri:</span>
                        {c.blockNumber && (
                          <span className="text-slate-400 font-mono text-[10px]">
                            Blok: {c.blockNumber}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {c.tests.map((test) => {
                          const testCompleted = isCompleted || (c.completedTests && c.completedTests.includes(test));
                          return (
                            <span
                              key={test}
                              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 border ${
                                testCompleted
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
                              }`}
                            >
                              {testCompleted ? (
                                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                              ) : (
                                <Clock className="w-3 h-3 text-amber-600" />
                              )}
                              {test}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Doctor & Dept */}
                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-slate-900 font-bold">{c.doctorName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{c.department}</span>
                      </div>
                    </div>

                    {/* Technician Note */}
                    {c.technicianNotes && (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 italic">
                        <span className="text-indigo-600 font-bold not-italic">Laboratuvar Notu: </span>
                        "{c.technicianNotes}"
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Kayıt: {formatDateTurkish(c.createdAt)}</span>
                      {c.completedAt && (
                        <span className="text-emerald-700 font-bold">
                          Bitiş: {formatDateTurkish(c.completedAt)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* Copy notification text / WhatsApp */}
                      <button
                        onClick={() => handleCopyNotificationText(c)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition flex items-center justify-center gap-1.5"
                      >
                        {copiedMessageId === c.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Metni Kopyala</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenWhatsApp(c)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onSelectCaseForTimeline(c)}
                      className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1"
                    >
                      <span>Süreç Zaman Çizelgesi & Detaylar</span>
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
