import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import type { Exam, ExamCreate, Subject } from '../../api/types';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExamCreate) => Promise<void>;
  subjects: Subject[];
  initialData?: Exam | null;
  defaultSubjectId?: number;
}

export function ExamModal({
  isOpen,
  onClose,
  onSubmit,
  subjects,
  initialData,
  defaultSubjectId,
}: ExamModalProps) {
  const [subjectId, setSubjectId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [examAt, setExamAt] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSubjectId(String(initialData.subject_id));
      setTitle(initialData.title);
      // Formatowanie ISO stringa "2026-12-15T09:00:00" do formatu datetime-local "YYYY-MM-DDTHH:MM"
      try {
        const d = new Date(initialData.exam_at);
        const pad = (n: number) => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setExamAt(formatted);
      } catch {
        setExamAt(initialData.exam_at.substring(0, 16));
      }
    } else {
      setSubjectId(defaultSubjectId ? String(defaultSubjectId) : subjects.length > 0 ? String(subjects[0].id) : '');
      setTitle('');
      setExamAt('');
    }
    setError('');
  }, [initialData, isOpen, defaultSubjectId, subjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) {
      setError('Wybierz przedmiot, do którego przypisany jest egzamin.');
      return;
    }
    if (!title.trim()) {
      setError('Tytuł egzaminu jest wymagany.');
      return;
    }
    if (!examAt) {
      setError('Termin egzaminu (data i godzina) jest wymagany.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // Przekształcamy do pełnego ISO 8601
      const isoDate = new Date(examAt).toISOString();
      await onSubmit({
        subject_id: parseInt(subjectId, 10),
        title: title.trim(),
        exam_at: isoDate,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas zapisywania egzaminu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edytuj termin egzaminu' : 'Dodaj nowy egzamin'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Przedmiot <span className="text-red-500">*</span>
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition"
          >
            {subjects.length === 0 ? (
              <option value="">Brak dostępnych przedmiotów — utwórz najpierw przedmiot</option>
            ) : (
              subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nazwa egzaminu / kolokwium <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={255}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="np. Egzamin podstawowy, Kolokwium 2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data i godzina egzaminu <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            value={examAt}
            onChange={(e) => setExamAt(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            AI wyznaczy plan nauki wstecz od tego terminu.
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={loading || subjects.length === 0}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Zapisywanie...' : initialData ? 'Zapisz zmiany' : 'Dodaj egzamin'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
