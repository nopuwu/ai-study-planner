import { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Clock,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import type { Exam, Subject, ExamCreate } from '../api/types';
import {
  getExams,
  createExam,
  updateExam,
  deleteExam,
  getSubjects,
} from '../api/endpoints';
import { ExamModal } from '../components/forms/ExamModal';

export function ExamsView() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [subs, allExams] = await Promise.all([getSubjects(), getExams()]);
      setSubjects(subs);
      setExams(allExams);
    } catch (err: any) {
      setError(err.message || 'Nie udało się pobrać listy egzaminów.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExam = async (data: ExamCreate) => {
    const created = await createExam(data);
    setExams((prev) => [...prev, created].sort((a, b) => new Date(a.exam_at).getTime() - new Date(b.exam_at).getTime()));
  };

  const handleUpdateExam = async (data: ExamCreate) => {
    if (!editingExam) return;
    const updated = await updateExam(editingExam.id, data);
    setExams((prev) =>
      prev
        .map((e) => (e.id === updated.id ? updated : e))
        .sort((a, b) => new Date(a.exam_at).getTime() - new Date(b.exam_at).getTime())
    );
  };

  const handleDeleteExam = async (id: number, title: string) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć egzamin "${title}"?`)) {
      return;
    }
    try {
      await deleteExam(id);
      setExams((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      alert(err.message || 'Błąd podczas usuwania egzaminu.');
    }
  };

  const getSubjectName = (subjectId: number) => {
    const found = subjects.find((s) => s.id === subjectId);
    return found ? found.name : 'Nieznany przedmiot';
  };

  const getDaysDiff = (dateStr: string) => {
    const now = new Date();
    const examDate = new Date(dateStr);
    const diffMs = examDate.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const formatExamDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredExams =
    selectedSubjectFilter === 'all'
      ? exams
      : exams.filter((e) => e.subject_id === parseInt(selectedSubjectFilter, 10));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Terminy egzaminów i kolokwiów</h1>
          <p className="text-gray-500 text-sm mt-1">
            Zdefiniuj punkty docelowe w kalendarzu. Model AI ułoży optymalną ścieżkę nauki wstecz od tych terminów.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingExam(null);
            setModalOpen(true);
          }}
          disabled={subjects.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <Plus size={18} />
          <span>Dodaj egzamin</span>
        </button>
      </div>

      {subjects.length === 0 && !loading && (
        <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-sm flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-semibold">Brak przedmiotów:</span> Aby dodać egzamin, musisz najpierw utworzyć co najmniej jeden przedmiot w zakładce <em>Przedmioty i materiały</em>.
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Pasek filtrów */}
      {subjects.length > 0 && exams.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">Filtruj wg przedmiotu:</span>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Wszystkie przedmioty ({exams.length})</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({exams.filter((e) => e.subject_id === s.id).length})
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak zaplanowanych egzaminów</h3>
          <p className="text-gray-500 text-sm mb-6">
            Dodaj terminy nadchodzących kolokwiów lub egzaminów, aby planer mógł rozłożyć materiał w czasie.
          </p>
          {subjects.length > 0 && (
            <button
              onClick={() => {
                setEditingExam(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition cursor-pointer"
            >
              <Plus size={18} />
              <span>Dodaj pierwszy egzamin</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((exam) => {
            const daysDiff = getDaysDiff(exam.exam_at);
            const subjectName = getSubjectName(exam.subject_id);

            let pillColor = 'bg-blue-50 text-blue-700 border-blue-200';
            let pillText = `Za ${daysDiff} ${daysDiff === 1 ? 'dzień' : 'dni'}`;

            if (daysDiff < 0) {
              pillColor = 'bg-gray-100 text-gray-500 border-gray-200';
              pillText = 'Zakończony';
            } else if (daysDiff === 0) {
              pillColor = 'bg-red-50 text-red-700 border-red-200 animate-pulse font-bold';
              pillText = 'Dzisiaj!';
            } else if (daysDiff <= 3) {
              pillColor = 'bg-red-50 text-red-700 border-red-200 font-semibold';
              pillText = `Za ${daysDiff} ${daysDiff === 1 ? 'dzień' : 'dni'}`;
            } else if (daysDiff <= 7) {
              pillColor = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
            }

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-1.5 truncate max-w-[65%]">
                      <BookOpen size={13} className="text-gray-500 shrink-0" />
                      <span className="truncate">{subjectName}</span>
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border font-medium shrink-0 ${pillColor}`}
                    >
                      {pillText}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{exam.title}</h3>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-gray-50 p-2.5 rounded-xl">
                    <Clock size={16} className="text-blue-600 shrink-0" />
                    <span className="font-medium">{formatExamDate(exam.exam_at)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setEditingExam(exam);
                      setModalOpen(true);
                    }}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                    title="Edytuj egzamin"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteExam(exam.id, exam.title)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Usuń egzamin"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <ExamModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editingExam ? handleUpdateExam : handleCreateExam}
        subjects={subjects}
        initialData={editingExam}
      />
    </div>
  );
}
