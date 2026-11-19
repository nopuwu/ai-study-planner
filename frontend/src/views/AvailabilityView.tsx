import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import type { StudyAvailability, StudyAvailabilityCreate } from '../api/types';
import {
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} from '../api/endpoints';
import { AvailabilityModal, WEEKDAYS } from '../components/forms/AvailabilityModal';

export function AvailabilityView() {
  const [availabilities, setAvailabilities] = useState<StudyAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAvail, setEditingAvail] = useState<StudyAvailability | null>(null);
  const [defaultWeekday, setDefaultWeekday] = useState<number>(0);

  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAvailability();
      setAvailabilities(data);
    } catch (err: any) {
      setError(err.message || 'Nie udało się pobrać dostępności.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const handleCreate = async (data: StudyAvailabilityCreate) => {
    const created = await createAvailability(data);
    setAvailabilities((prev) =>
      [...prev, created].sort(
        (a, b) => a.weekday - b.weekday || a.start_time.localeCompare(b.start_time)
      )
    );
  };

  const handleUpdate = async (data: StudyAvailabilityCreate) => {
    if (!editingAvail) return;
    const updated = await updateAvailability(editingAvail.id, data);
    setAvailabilities((prev) =>
      prev
        .map((a) => (a.id === updated.id ? updated : a))
        .sort((a, b) => a.weekday - b.weekday || a.start_time.localeCompare(b.start_time))
    );
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAvailability(id);
      setAvailabilities((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Błąd podczas usuwania przedziału.');
    }
  };

  const openAddForWeekday = (dayIndex: number) => {
    setDefaultWeekday(dayIndex);
    setEditingAvail(null);
    setModalOpen(true);
  };

  const openEdit = (avail: StudyAvailability) => {
    setEditingAvail(avail);
    setModalOpen(true);
  };

  // Obliczenie minut ze slotu
  const getDurationMinutes = (start: string, end: string) => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    return h2 * 60 + m2 - (h1 * 60 + m1);
  };

  const formatDuration = (mins: number) => {
    if (mins <= 0) return '0 min';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} min`;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  // Całkowita liczba godzin w tygodniu
  const totalWeeklyMinutes = availabilities.reduce(
    (acc, a) => acc + getDurationMinutes(a.start_time, a.end_time),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Harmonogram dostępności czasowej</h1>
          <p className="text-gray-500 text-sm mt-1">
            Określ w jakie dni i godziny tygodnia możesz uczyć się do egzaminów. Generator planu nie przydzieli zadań poza tymi ramami.
          </p>
        </div>
        <button
          onClick={() => {
            setDefaultWeekday(0);
            setEditingAvail(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition shadow-xs cursor-pointer"
        >
          <Plus size={18} />
          <span>Dodaj godziny</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Podsumowanie tygodniowe */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">
            Tygodniowa pula czasu
          </div>
          <div className="text-3xl font-extrabold">
            {formatDuration(totalWeeklyMinutes)} nauki / tydzień
          </div>
          <div className="text-blue-100 text-sm mt-1">
            Zadeklarowano {availabilities.length}{' '}
            {availabilities.length === 1
              ? 'przedział czasowy'
              : availabilities.length < 5
              ? 'przedziały czasowe'
              : 'przedziałów czasowych'}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/20 text-xs text-blue-50 max-w-xs">
          💡 Przedziały są cykliczne i powtarzają się w każdym tygodniu od dziś aż do dnia egzaminu.
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {WEEKDAYS.map((day) => {
            const daySlots = availabilities.filter((a) => a.weekday === day.value);
            const isWeekend = day.value === 5 || day.value === 6;
            const dayMinutes = daySlots.reduce(
              (acc, s) => acc + getDurationMinutes(s.start_time, s.end_time),
              0
            );

            return (
              <div
                key={day.value}
                className={`bg-white rounded-2xl border p-4 flex flex-col justify-between transition ${
                  daySlots.length > 0 ? 'border-gray-300 shadow-2xs' : 'border-gray-200/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    <div>
                      <h3
                        className={`text-sm font-bold ${
                          isWeekend ? 'text-indigo-600' : 'text-gray-900'
                        }`}
                      >
                        {day.label}
                      </h3>
                      {daySlots.length > 0 && (
                        <span className="text-[11px] text-gray-400 font-medium">
                          {formatDuration(dayMinutes)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => openAddForWeekday(day.value)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                      title={`Dodaj slot na ${day.label}`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {daySlots.length === 0 ? (
                    <div className="py-8 text-center text-gray-400">
                      <p className="text-xs">Brak godzin</p>
                      <button
                        onClick={() => openAddForWeekday(day.value)}
                        className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
                      >
                        + Dodaj
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {daySlots.map((slot) => {
                        const dur = getDurationMinutes(slot.start_time, slot.end_time);
                        return (
                          <div
                            key={slot.id}
                            className="bg-blue-50/60 border border-blue-100/80 rounded-xl p-2.5 text-xs text-blue-950 flex flex-col gap-1 group hover:bg-blue-100/60 transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold">
                                {slot.start_time.substring(0, 5)} – {slot.end_time.substring(0, 5)}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => openEdit(slot)}
                                  className="text-gray-500 hover:text-blue-700 p-0.5"
                                  title="Edytuj"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDelete(slot.id)}
                                  className="text-gray-400 hover:text-red-600 p-0.5"
                                  title="Usuń"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            <span className="text-[10px] text-blue-600 font-medium">
                              Czas: {formatDuration(dur)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AvailabilityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editingAvail ? handleUpdate : handleCreate}
        initialData={editingAvail}
        defaultWeekday={defaultWeekday}
      />
    </div>
  );
}
