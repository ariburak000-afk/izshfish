import React, { useState } from 'react';
import { Microscope, Stethoscope, ClipboardList, BarChart3, Bell, CheckCheck, RefreshCw, Smartphone, Copy, Check } from 'lucide-react';
import { NotificationLog } from '../types';

interface HeaderProps {
  activeTab: 'doctor' | 'technician' | 'report';
  setActiveTab: (tab: 'doctor' | 'technician' | 'report') => void;
  notifications: NotificationLog[];
  onMarkAllNotifsAsRead: () => void;
  onResetData: () => void;
  lastSyncTime: Date;
  onManualSync: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  notifications,
  onMarkAllNotifsAsRead,
  onResetData,
  lastSyncTime,
  onManualSync,
  isSyncing = false,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleCopyAppUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand logo & title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-200">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  Patho<span className="text-indigo-600">Track</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 uppercase tracking-wide border border-indigo-100">
                  Patoloji Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                Hekim Anlık Sonuç & Laboratuvar Çalışma Takibi
              </p>
            </div>
          </div>

          {/* Quick Actions & Navigation Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Last Sync Indicator Badge */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/90 border border-emerald-200/90 text-emerald-950 text-xs font-bold shadow-2xs"
              title="Sistem periyodik ve anlık olarak canlı senkronize edilir"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-medium hidden md:inline">Son Senkronizasyon:</span>
                <span className="font-mono font-black text-emerald-900">
                  {lastSyncTime.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
              <button
                type="button"
                onClick={onManualSync}
                title="Şimdi Kontrol Et & Senkronize Et"
                className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700 transition-all active:scale-95 ml-0.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            </div>

            {/* Share / App Link button */}
            <button
              onClick={handleCopyAppUrl}
              title="Hekimler ile Web Bağlantısını Paylaş"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-all shadow-sm"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Link Kopyalandı</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Hekim Bağlantısı Paylaş</span>
                </>
              )}
            </button>

            {/* Notifications Menu Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all"
                aria-label="Bildirimler"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center animate-pulse shadow-md">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-bold text-slate-800">
                        Hekim Bildirim Akışı
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotifsAsRead}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Okundu İşaretle
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs font-medium">
                        Henüz bildirim bulunmuyor.
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 text-xs transition hover:bg-slate-50/80 ${
                            !n.read ? 'bg-indigo-50/40 border-l-4 border-indigo-600' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                              {n.caseNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(n.timestamp).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-700 leading-relaxed font-medium">{n.message}</p>
                          {n.doctorName && (
                            <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">
                              {n.doctorName}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reset / Sample Data reload option */}
            <button
              onClick={onResetData}
              title="Örnek Verileri Sıfırla / Yenile"
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex space-x-2 py-2 overflow-x-auto border-t border-slate-100 scrollbar-none">
          <button
            onClick={() => setActiveTab('doctor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'doctor'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Hekim Takip Portalı</span>
            {unreadCount > 0 && activeTab !== 'doctor' && (
              <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {unreadCount} yeni
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('technician')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'technician'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Tekniker Giriş & Güncelleme</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'report'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Haftalık Rapor & İstatistik</span>
          </button>
        </div>
      </div>
    </header>
  );
};
