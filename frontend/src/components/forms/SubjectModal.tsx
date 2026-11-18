import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import type { Subject, SubjectCreate } from '../../api/types';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubjectCreate) => Promise<void>;
  initialData?: Subject | null;
}

export function SubjectModal({ isOpen, onClose, onSubmit, initialData }: SubjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nazwa przedmiotu jest wymagana.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas zapisywania przedmiotu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edytuj przedmiot' : 'Nowy przedmiot'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nazwa przedmiotu <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={255}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="np. Algebra liniowa, Bazy danych"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opis lub uwagi (opcjonalnie)
          </label>
          <textarea
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
            placeholder="np. Prowadzący dr hab. Kowalski, laboratorium we wtorki"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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
            {loading ? 'Zapisywanie...' : initialData ? 'Zapisz zmiany' : 'Dodaj przedmiot'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
