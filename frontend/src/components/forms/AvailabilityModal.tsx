import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import type { StudyAvailability, StudyAvailabilityCreate } from '../../api/types';

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudyAvailabilityCreate) => Promise<void>;
  initialData?: StudyAvailability | null;
  defaultWeekday?: number;
}

export const WEEKDAYS = [
  { value: 0, label: 'Poniedziałek' },
  { value: 1, label: 'Wtorek' },
  { value: 2, label: 'Środa' },
  { value: 3, label: 'Czwartek' },
  { value: 4, label: 'Piątek' },
  { value: 5, label: 'Sobota' },
  { value: 6, label: 'Niedziela' },
];

export function AvailabilityModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultWeekday = 0,
}: AvailabilityModalProps) {
  const [weekday, setWeekday] = useState<number>(0);
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('18:00');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setWeekday(initialData.weekday);
      // Backend może zwrócić "16:00:00" - obcinamy do "16:00" dla <input type="time" />
      setStartTime(initialData.start_time.substring(0, 5));
      setEndTime(initialData.end_time.substring(0, 5));
    } else {
      setWeekday(defaultWeekday);
      setStartTime('16:00');
      setEndTime('18:00');
    }
    setError('');
  }, [initialData, isOpen, defaultWeekday]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime) {
      setError('Podaj godziny rozpoczęcia i zakończenia nauki.');
      return;
    }

    if (startTime >= endTime) {
      setError('Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // Zapewniamy format "HH:MM:SS" wymagany przez backend SQLAlchemy Time
      const formatTime = (t: string) => (t.length === 5 ? `${t}:00` : t);
      await onSubmit({
        weekday,
        start_time: formatTime(startTime),
        end_time: formatTime(endTime),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas zapisywania dostępności.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edytuj godziny dostępności' : 'Dodaj slot dostępności na naukę'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dzień tygodnia <span className="text-red-500">*</span>
          </label>
          <select
            value={weekday}
            onChange={(e) => setWeekday(parseInt(e.target.value, 10))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition"
          >
            {WEEKDAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Godzina od <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Godzina do <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Wskazówka: Przedziały w ramach tego samego dnia nie mogą na siebie nachodzić.
        </p>

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
            {loading ? 'Zapisywanie...' : initialData ? 'Zapisz zmiany' : 'Dodaj przedział'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
