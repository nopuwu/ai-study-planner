import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import type { User, Subject, Exam, StudyAvailability } from '../api/types';
import { getSubjects, getExams, getAvailability, getMaterials } from '../api/endpoints';
import type { ActiveTab } from '../components/Sidebar';

interface DashboardViewProps {
  user: User | null;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenSubjectModal: () => void;
  onOpenExamModal: () => void;
  onOpenAvailabilityModal: () => void;
}

export function DashboardView({
  user,
  onNavigateTab,
  onOpenSubjectModal,
  onOpenExamModal,
  onOpenAvailabilityModal,
}: DashboardViewProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [availabilities, setAvailabilities] = useState<StudyAvailability[]>([]);
  const [totalMaterialsCount, setTotalMaterialsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Studencie';

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [subs, exms, avails] = await Promise.all([
          getSubjects(),
          getExams(),
          getAvailability(),
        ]);
        setSubjects(subs);
        setExams(exms);
        setAvailabilities(avails);

        // Zlicz łączną liczbę materiałów
        let matCount = 0;
        await Promise.all(
          subs.map(async (s) => {
            try {
              const mats = await getMaterials(s.id);
              matCount += mats.length;
            } catch {
              // ignore
            }
          })
        );
        setTotalMaterialsCount(matCount);
      } catch (err) {
        console.error('Błąd pobierania danych pulpitu:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Obliczenie najbliższego egzaminu
  const upcomingExams = exams
    .filter((e) => new Date(e.exam_at).getTime() >= new Date().getTime())
    .sort((a, b) => new Date(a.exam_at).getTime() - new Date(b.exam_at).getTime());

  const nearestExam = upcomingExams[0];

  const getDaysDiff = (dateStr: string) => {
    const now = new Date();
    const examDate = new Date(dateStr);
    const diffMs = examDate.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Całkowity czas dostępności
  const totalWeeklyMinutes = availabilities.reduce((acc, a) => {
    const [h1, m1] = a.start_time.split(':').map(Number);
    const [h2, m2] = a.end_time.split(':').map(Number);
    return acc + (h2 * 60 + m2 - (h1 * 60 + m1));
  }, 0);

  const formatHours = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} min`;
    return m > 0 ? `${h}h ${m}m` : `${h} godz.`;
  };

  const getSubjectName = (subjectId: number) => {
    const found = subjects.find((s) => s.id === subjectId);
    return found ? found.name : 'Przedmiot';
  };

  return (
    <div className="space-y-8">
      {/* Powitanie i szybkie akcje */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dzień dobry, {firstName} 👋</h1>
          <p className="text-gray-500 mt-1">
            Wprowadź swoje przedmioty, materiały i terminy, a planer AI wygeneruje Twój plan nauki.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenSubjectModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <Plus size={15} />
            <span>Przedmiot</span>
          </button>
          <button
            onClick={onOpenExamModal}
            disabled={subjects.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <Plus size={15} />
            <span>Egzamin</span>
          </button>
          <button
            onClick={onOpenAvailabilityModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Dostępność</span>
          </button>
        </div>
      </div>

      {/* Karty statystyk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Przedmioty */}
        <div
          onClick={() => onNavigateTab('przedmioty')}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:border-blue-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Przedmioty
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mb-1">{subjects.length}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <span>Zobacz listę i materiały</span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition text-blue-600" />
          </div>
        </div>

        {/* Materiały */}
        <div
          onClick={() => onNavigateTab('przedmioty')}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:border-blue-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Materiały do nauki
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <FileText size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mb-1">{totalMaterialsCount}</div>
          <div className="text-xs text-gray-500">Skrypty, slajdy i notatki</div>
        </div>

        {/* Najbliższy egzamin */}
        <div
          onClick={() => onNavigateTab('egzaminy')}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:border-blue-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Najbliższy termin
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Calendar size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mb-1 truncate">
            {nearestExam ? `Za ${getDaysDiff(nearestExam.exam_at)} dni` : 'Brak'}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {nearestExam
              ? `${getSubjectName(nearestExam.subject_id)} · ${nearestExam.title}`
              : 'Dodaj termin egzaminu'}
          </div>
        </div>

        {/* Dostępność czasowa */}
        <div
          onClick={() => onNavigateTab('dostepnosc')}
          className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:border-blue-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Dostępność w tyg.
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mb-1">
            {formatHours(totalWeeklyMinutes)}
          </div>
          <div className="text-xs text-gray-500">
            {availabilities.length} {availabilities.length === 1 ? 'przedział' : 'przedziały'}
          </div>
        </div>
      </div>

      {/* Listy: Przedmioty oraz Nadchodzące egzaminy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolumna lewa (2 szerokości): Przedmioty użytkownika */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Twoje przedmioty</h2>
              <p className="text-xs text-gray-400">Komplet danych niezbędny do rozpoczęcia nauki</p>
            </div>
            <button
              onClick={() => onNavigateTab('przedmioty')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Wszystkie ({subjects.length}) <ArrowRight size={13} />
            </button>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-10 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <BookOpen size={28} className="text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">Nie dodałeś jeszcze żadnego przedmiotu</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Przedmioty są fundamentem planera. Dodaj pierwszy przedmiot, aby przejść do planowania.
              </p>
              <button
                onClick={onOpenSubjectModal}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                + Dodaj przedmiot
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {subjects.slice(0, 5).map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => onNavigateTab('przedmioty')}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-gray-50/70 px-2 rounded-xl transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <BookOpen size={16} />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-sm text-gray-900 truncate">
                        {subject.name}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {subject.description || 'Brak opisu'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full shrink-0">
                    Otwórz ›
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolumna prawa: Nadchodzące egzaminy */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-gray-900">Najbliższe egzaminy</h2>
            <button
              onClick={() => onNavigateTab('egzaminy')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Wszystkie ({exams.length}) <ArrowRight size={13} />
            </button>
          </div>

          {upcomingExams.length === 0 ? (
            <div className="text-center py-10 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Calendar size={28} className="text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">Brak zaplanowanych terminów</p>
              <p className="text-xs text-gray-400 mt-1">
                Wprowadź termin egzaminu, aby wyznaczyć cel nauki.
              </p>
              {subjects.length > 0 && (
                <button
                  onClick={onOpenExamModal}
                  className="mt-4 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  + Dodaj termin
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExams.slice(0, 4).map((exam) => {
                const daysDiff = getDaysDiff(exam.exam_at);
                const d = new Date(exam.exam_at);
                const dayNum = String(d.getDate()).padStart(2, '0');
                const monthName = d
                  .toLocaleString('pl-PL', { month: 'short' })
                  .toUpperCase()
                  .replace('.', '');

                return (
                  <div
                    key={exam.id}
                    onClick={() => onNavigateTab('egzaminy')}
                    className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition cursor-pointer border border-transparent hover:border-gray-100"
                  >
                    <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-2 text-center min-w-[3.25rem] shrink-0">
                      <div className="text-sm font-extrabold text-gray-900 leading-tight">
                        {dayNum}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {monthName}
                      </div>
                    </div>
                    <div className="truncate flex-1">
                      <div className="font-semibold text-sm text-gray-900 truncate">
                        {exam.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {getSubjectName(exam.subject_id)}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        daysDiff <= 3
                          ? 'bg-red-50 text-red-700'
                          : daysDiff <= 7
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {daysDiff === 0 ? 'Dziś!' : `Za ${daysDiff} d.`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
