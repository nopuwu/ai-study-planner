import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import type { Material, MaterialCreate } from '../../api/types';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MaterialCreate) => Promise<void>;
  initialData?: Material | null;
  subjectName?: string;
}

const MATERIAL_TYPES = [
  { value: 'pdf', label: 'Dokument PDF / Skrypt' },
  { value: 'notatki', label: 'Własne notatki' },
  { value: 'slajdy', label: 'Prezentacja / Slajdy' },
  { value: 'ksiazka', label: 'Podręcznik / Rozdział książki' },
  { value: 'artykul', label: 'Artykuł / Link internetowy' },
  { value: 'wideo', label: 'Nagranie wykładu / Wideo' },
  { value: 'inne', label: 'Inne' },
];

export function MaterialModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  subjectName,
}: MaterialModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('pdf');
  const [urlOrPath, setUrlOrPath] = useState('');
  const [estMinutes, setEstMinutes] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setType(initialData.type);
      setUrlOrPath(initialData.url_or_path);
      setEstMinutes(initialData.est_minutes ? String(initialData.est_minutes) : '');
    } else {
      setTitle('');
      setType('pdf');
      setUrlOrPath('');
      setEstMinutes('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Tytuł materiału jest wymagany.');
      return;
    }
    if (!urlOrPath.trim()) {
      setError('Ścieżka do pliku lub adres URL jest wymagany.');
      return;
    }

    const minutesNum = estMinutes ? parseInt(estMinutes, 10) : null;
    if (estMinutes && (isNaN(minutesNum!) || minutesNum! < 1)) {
      setError('Szacowany czas musi być liczbą całkowitą większą od zera.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        title: title.trim(),
        type,
        url_or_path: urlOrPath.trim(),
        est_minutes: minutesNum,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas zapisywania materiału.');
    } finally {
      setLoading(false);
    }
  };

  const modalTitle = initialData
    ? `Edytuj materiał${subjectName ? ` (${subjectName})` : ''}`
    : `Dodaj materiał${subjectName ? ` do: ${subjectName}` : ''}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tytuł materiału <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={255}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="np. Wykład 1: Wprowadzenie do macierzy"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Typ materiału <span className="text-red-500">*</span>
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition"
          >
            {MATERIAL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adres URL lub ścieżka do pliku <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="np. https://dysk.pwr.edu.pl/wyklady/w1.pdf lub C:/Materialy/w1.pdf"
            value={urlOrPath}
            onChange={(e) => setUrlOrPath(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Szacowany czas nauki (w minutach, opcjonalnie)
          </label>
          <input
            type="number"
            min={1}
            step={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="np. 45 (minut)"
            value={estMinutes}
            onChange={(e) => setEstMinutes(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Pomaga algorytmowi AI rozplanować zadania na optymalne sesje nauki.
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
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Zapisywanie...' : initialData ? 'Zapisz zmiany' : 'Dodaj materiał'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
