import React from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  FlaskConical,
  User,
  Building2,
  Calendar,
  FileText,
  Copy,
  Check,
  Share2,
  MessageSquare,
  Tag,
} from 'lucide-react';
import { PathologyCase } from '../types';
import { formatDateTurkish } from '../utils/storage';

interface CaseDetailModalProps {
  pCase: PathologyCase | null;
  onClose: () => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({ pCase, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!pCase) return null;

  const isCompleted = pCase.status === 'completed';
  const isInProgress = pCase.status === 'in_progress';

  const notificationFormattedText = `${pCase.caseNumber} numaralı vakanın ${pCase.tests.join(' ')} çalışması ${
    pCase.completedAt ? formatDateTurkish(pCase.completedAt) : formatDateTurkish(pCase.createdAt)
  } tarihinde tamamlandı. Doku: ${pCase.tissueSource}. Hekim: ${pCase.doctorName}. Not: ${pCase.technicianNotes || 'Yok'}`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(notificationFormattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-mono font-black text-lg">
              {pCase.caseNumber.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 font-mono tracking-wide">
                  {pCase.caseNumber}
                </h3>
                {pCase.priority === 'urgent' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                    ACİL VAKA
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">{pCase.tissueSource}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Box */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              isCompleted
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : isInProgress
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <Clock className="w-6 h-6 text-amber-600 animate-spin" />
              )}
              <div>
                <span className="text-xs font-black uppercase tracking-wide block">
                  {isCompleted ? 'Çalışma Tamamlandı' : 'İşlem Devam Ediyor'}
                </span>
                <span className="text-[11px] font-medium opacity-90">
                  {isCompleted
                    ? `Tamamlanma Tarihi: ${formatDateTurkish(pCase.completedAt)}`
                    : 'Laboratuvar çalışması sürüyor.'}
                </span>
              </div>
            </div>
          </div>

          {/* Test & Doctor Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-medium block mb-0.5">Sorumlu Hekim:</span>
              <span className="font-bold text-slate-900">{pCase.doctorName}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block mb-0.5">Anabilim Dalı:</span>
              <span className="font-bold text-slate-900">{pCase.department}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block mb-0.5">Hasta İnitial:</span>
              <span className="font-bold text-slate-900">{pCase.patientInitials || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block mb-0.5">Blok Numarası:</span>
              <span className="font-black text-indigo-700 font-mono">{pCase.blockNumber || 'A-1'}</span>
            </div>
          </div>

          {/* Studies / Panels */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-2">Çalışılan Testler / Paneller</h4>
            <div className="flex flex-wrap gap-2">
              {pCase.tests.map((test) => (
                <span
                  key={test}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
                  {test}
                </span>
              ))}
            </div>
          </div>

          {/* Laboratory Process Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-3">Laboratuvar Süreç Çizelgesi</h4>
            <div className="relative pl-6 space-y-4 border-l-2 border-slate-200">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                  ✓
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">1. Vaka Biyopsi Kabulü & Kayıt</span>
                  <span className="text-[10px] text-slate-500 block font-medium">{formatDateTurkish(pCase.createdAt)}</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                  ✓
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">2. Doku Takibi & Blok Hazırlığı</span>
                  <span className="text-[10px] text-slate-500 block font-medium">
                    Parafin Blok: {pCase.blockNumber || 'A-1'} kesitleri alındı.
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div
                  className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-xs ${
                    isCompleted || isInProgress
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted || isInProgress ? '✓' : '3'}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">
                    3. {pCase.tests.join(' / ')} FISH Çalışması
                  </span>
                  <span className="text-[10px] text-slate-500 block font-medium">
                    FISH prob hibridizasyonu ve sinyal sayımı tamamlandı.
                  </span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div
                  className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : '4'}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900">
                    4. Sonuç Onayı & Hekim Anlık Bildirimi
                  </span>
                  <span className="text-[10px] text-slate-500 block font-medium">
                    {isCompleted
                      ? `Tamamlandı: ${formatDateTurkish(pCase.completedAt)}`
                      : 'Çalışmanın bitimi bekleniyor.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Technician Note */}
          {pCase.technicianNotes && (
            <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs">
              <span className="text-indigo-700 font-extrabold block mb-1">Tekniker Laboratuvar Notu:</span>
              <p className="text-slate-800 font-medium">{pCase.technicianNotes}</p>
            </div>
          )}

          {/* Formatted Notification Text Copy Block */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Hekim Bildirim Metni (Kopyalanabilir Format):</span>
              <button
                onClick={handleCopyText}
                className="text-indigo-600 hover:text-indigo-700 text-[11px] font-bold flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Metni Kopyala</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs font-mono text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed select-all font-medium shadow-2xs">
              {notificationFormattedText}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            Kapat
          </button>

          <button
            onClick={() => {
              const text = encodeURIComponent(notificationFormattedText);
              window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4 text-white" />
            WhatsApp ile Paylaş
          </button>
        </div>
      </div>
    </div>
  );
};
