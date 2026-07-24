import { PathologyCase, NotificationLog } from '../types';
import { INITIAL_CASES, INITIAL_NOTIFICATIONS } from '../data/initialData';
import { saveNotificationToFirestore } from '../lib/firebase';

const CASES_STORAGE_KEY = 'patoloji_vaka_listesi_v3';
const NOTIFICATIONS_STORAGE_KEY = 'patoloji_bildirim_listesi_v3';

export function getStoredCases(): PathologyCase[] {
  try {
    const data = localStorage.getItem(CASES_STORAGE_KEY);
    if (!data) {
      saveCases(INITIAL_CASES);
      return INITIAL_CASES;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load cases from localStorage:', err);
    return INITIAL_CASES;
  }
}

export function saveCases(cases: PathologyCase[]): void {
  try {
    localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cases));
  } catch (err) {
    console.error('Failed to save cases to localStorage:', err);
  }
}

export function getStoredNotifications(): NotificationLog[] {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!data) {
      saveNotifications(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load notifications:', err);
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: NotificationLog[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}

export function createNotificationForCase(
  pCase: PathologyCase,
  actionMessage?: string,
  type: 'completed' | 'updated' | 'urgent' = 'completed'
): NotificationLog {
  const now = new Date();
  const dateFormatted = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;
  
  const testListStr = pCase.tests.join(' ');
  const message = actionMessage || `${pCase.caseNumber} numaralı vakanın ${testListStr} çalışması ${dateFormatted} tarihinde tamamlandı.`;

  const newNotif: NotificationLog = {
    id: 'notif-' + Date.now(),
    caseId: pCase.id,
    caseNumber: pCase.caseNumber,
    title: type === 'completed' ? 'Çalışma Tamamlandı' : 'Vaka Güncellendi',
    message,
    timestamp: now.toISOString(),
    read: false,
    type,
    doctorName: pCase.doctorName,
  };

  const currentNotifs = getStoredNotifications();
  const updated = [newNotif, ...currentNotifs];
  saveNotifications(updated);
  saveNotificationToFirestore(newNotif);

  return newNotif;
}

export function resetToInitialData(): { cases: PathologyCase[]; notifications: NotificationLog[] } {
  saveCases(INITIAL_CASES);
  saveNotifications(INITIAL_NOTIFICATIONS);
  return { cases: INITIAL_CASES, notifications: INITIAL_NOTIFICATIONS };
}

export function getWeekNumber(d: Date = new Date()): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function formatDateTurkish(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
