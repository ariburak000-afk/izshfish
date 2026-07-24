import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  FlaskConical,
  FileSpreadsheet,
  Printer,
  Copy,
  Check,
  Building2,
  PieChart,
} from 'lucide-react';
import { PathologyCase } from '../types';
import { formatDateTurkish, getWeekNumber } from '../utils/storage';

interface WeeklyReportViewProps {
  cases: PathologyCase[];
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({ cases }) => {
  const currentWeek = getWeekNumber();
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);
  const [copiedReport, setCopiedReport] = useState(false);

  // Filter cases by week
  const weekCases = cases.filter((c) => c.weekNumber === selectedWeek);

  const completedCount = weekCases.filter((c) => c.status === 'completed').length;
  const inProgressCount = weekCases.filter((c) => c.status === 'in_progress').length;
  const pendingCount = weekCases.filter((c) => c.status === 'pending').length;

  // Calculate test distribution counts
  const testStats: Record<string, number> = {};
  weekCases.forEach((c) => {
    c.tests.forEach((t) => {
      testStats[t] = (testStats[t] || 0) + 1;
    });
  });

  const sortedTestStats = Object.entries(testStats).sort((a, b) => b[1] - a[1]);

  // Generate plain text report
  const generateTextReport = () => {
    let report = `=== HAFTALIK PATOLOJİ VAKA & TEST RAPORU (Hafta ${selectedWeek} - 2026) ===\n\n`;
    report += `Toplam Vaka: ${weekCases.length}\n`;
    report += `Tamamlanan Çalışmalar: ${completedCount}\n`;
    report += `Devam Eden Çalışmalar: ${inProgressCount}\n\n`;
    report += `--- TAMAMLANAN VAKA LİSTESİ ---\n`;

    const completed = weekCases.filter((c) => c.status === 'completed');
    if (completed.length === 0) {
      report += `Bu hafta henüz tamamlanan vaka bulunmuyor.\n`;
    } else {
      completed.forEach((c, idx) => {
        report += `${idx + 1}. [${c.caseNumber}] - ${c.tests.join(' ')} - Tamamlandı (${formatDateTurkish(c.completedAt)})\n   Hekim: ${c.doctorName} (${c.department})\n   Doku: ${c.tissueSource}\n\n`;
      });
    }

    return report;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateTextReport());
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Haftalık Çalışma & İstatistik Raporu
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Laboratuvarda tamamlanan FISH (ALK, ROS1, HER2, 1p19q, BCL2, BCL6, CMYC) çalışmalarının haftalık ve bölüm bazlı istatistikleri.
          </p>
        </div>

        {/* Week Selector */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs font-bold">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="text-slate-600">Hafta Seçimi:</span>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            className="bg-white text-indigo-700 font-extrabold border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-600 shadow-2xs"
          >
            <option value={currentWeek}>Mevcut Hafta (Hafta {currentWeek})</option>
            <option value={currentWeek - 1}>Geçen Hafta (Hafta {currentWeek - 1})</option>
            <option value={currentWeek - 2}>2 Hafta Önce (Hafta {currentWeek - 2})</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            Haftalık Toplam Kayıt
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {weekCases.length} <span className="text-xs font-normal text-slate-400">vaka</span>
          </div>
          <span className="text-[10px] text-indigo-600 mt-1 block font-bold">
            Hafta {selectedWeek} kapsamındaki tüm istemler
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-bold text-emerald-700 block mb-1">
            Tamamlanan (Çalışıldı)
          </span>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {completedCount} <span className="text-xs font-normal text-slate-400">vaka</span>
          </div>
          <span className="text-[10px] text-emerald-600 mt-1 block font-semibold">
            Hekimlere bildirimi tamamlandı
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-bold text-amber-700 block mb-1">
            Devam Eden Çalışmalar
          </span>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {inProgressCount} <span className="text-xs font-normal text-slate-400">vaka</span>
          </div>
          <span className="text-[10px] text-amber-600 mt-1 block font-semibold">
            Laboratuvarda işlem aşamasında
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-bold text-indigo-700 block mb-1">
            Tamamlanma Oranı
          </span>
          <div className="text-2xl font-black text-indigo-600 font-mono">
            %{weekCases.length > 0 ? Math.round((completedCount / weekCases.length) * 100) : 0}
          </div>
          <span className="text-[10px] text-indigo-600 mt-1 block font-semibold">
            Verimlilik yüzdesi
          </span>
        </div>
      </div>

      {/* Test Distribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Count List */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-indigo-600" />
            Çalışılan Test Türü Dağılımı
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Hafta {selectedWeek} boyunca çalışılan FISH test sayıları:
          </p>

          <div className="space-y-2 pt-1">
            {sortedTestStats.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Henüz test verisi yok.</p>
            ) : (
              sortedTestStats.map(([testName, count]) => {
                const percentage = Math.round((count / weekCases.length) * 100) || 0;
                return (
                  <div key={testName} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-slate-800">{testName}</span>
                      <span className="text-indigo-600 font-mono font-black">{count} adet</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(percentage * 2, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Weekly Completed Cases List & Export */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Haftalık Tamamlanan Vaka Listesi
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Toplantı veya rapor sunumları için kopyalanabilir özet.
              </p>
            </div>

            <button
              onClick={handleCopyReport}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Rapor Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Raporu Kopyala</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {weekCases.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center font-medium">
                Seçilen haftada kayıtlı vaka bulunamadı.
              </p>
            ) : (
              weekCases.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900 text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                        {c.caseNumber}
                      </span>
                      <span className="text-xs text-indigo-700 font-bold">
                        {c.tests.join(' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      {c.tissueSource} • Hekim: {c.doctorName} ({c.department})
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                        c.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {c.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                      {formatDateTurkish(c.completedAt || c.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
