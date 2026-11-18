import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FolderOpen,
} from 'lucide-react';
import type { Subject, Material, SubjectCreate, MaterialCreate } from '../api/types';
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../api/endpoints';
import { SubjectModal } from '../components/forms/SubjectModal';
import { MaterialModal } from '../components/forms/MaterialModal';

export function SubjectsView() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materialsBySubject, setMaterialsBySubject] = useState<Record<number, Material[]>>({});
  const [expandedSubjects, setExpandedSubjects] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modale
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [materialSubjectId, setMaterialSubjectId] = useState<number | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      const subs = await getSubjects();
      setSubjects(subs);

      // Domyślnie rozwiń wszystkie przedmioty i pobierz ich materiały
      const initialExpanded: Record<number, boolean> = {};
      const materialsMap: Record<number, Material[]> = {};

      await Promise.all(
        subs.map(async (s) => {
          initialExpanded[s.id] = true;
          try {
            const mats = await getMaterials(s.id);
            materialsMap[s.id] = mats;
          } catch {
            materialsMap[s.id] = [];
          }
        })
      );

      setExpandedSubjects(initialExpanded);
      setMaterialsBySubject(materialsMap);
    } catch (err: any) {
      setError(err.message || 'Nie udało się pobrać listy przedmiotów.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const toggleExpand = (subjectId: number) => {
    setExpandedSubjects((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
  };

  // Obsługa Przedmiotów
  const handleCreateSubject = async (data: SubjectCreate) => {
    const created = await createSubject(data);
    setSubjects((prev) => [...prev, created]);
    setMaterialsBySubject((prev) => ({ ...prev, [created.id]: [] }));
    setExpandedSubjects((prev) => ({ ...prev, [created.id]: true }));
  };

  const handleUpdateSubject = async (data: SubjectCreate) => {
    if (!editingSubject) return;
    const updated = await updateSubject(editingSubject.id, data);
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSubject = async (id: number, name: string) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć przedmiot "${name}" oraz wszystkie powiązane z nim materiały i egzaminy?`)) {
      return;
    }
    try {
      await deleteSubject(id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      setMaterialsBySubject((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err: any) {
      alert(err.message || 'Błąd podczas usuwania przedmiotu.');
    }
  };

  // Obsługa Materiałów
  const openAddMaterial = (subjectId: number) => {
    setMaterialSubjectId(subjectId);
    setEditingMaterial(null);
    setMaterialModalOpen(true);
  };

  const openEditMaterial = (subjectId: number, mat: Material) => {
    setMaterialSubjectId(subjectId);
    setEditingMaterial(mat);
    setMaterialModalOpen(true);
  };

  const handleSaveMaterial = async (data: MaterialCreate) => {
    if (!materialSubjectId) return;

    if (editingMaterial) {
      const updated = await updateMaterial(materialSubjectId, editingMaterial.id, data);
      setMaterialsBySubject((prev) => ({
        ...prev,
        [materialSubjectId]: (prev[materialSubjectId] || []).map((m) =>
          m.id === updated.id ? updated : m
        ),
      }));
    } else {
      const created = await createMaterial(materialSubjectId, data);
      setMaterialsBySubject((prev) => ({
        ...prev,
        [materialSubjectId]: [...(prev[materialSubjectId] || []), created],
      }));
    }
  };

  const handleDeleteMaterial = async (subjectId: number, matId: number, title: string) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć materiał "${title}"?`)) {
      return;
    }
    try {
      await deleteMaterial(subjectId, matId);
      setMaterialsBySubject((prev) => ({
        ...prev,
        [subjectId]: (prev[subjectId] || []).filter((m) => m.id !== matId),
      }));
    } catch (err: any) {
      alert(err.message || 'Błąd podczas usuwania materiału.');
    }
  };

  const formatEstMinutes = (mins: number | null) => {
    if (!mins) return null;
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  const currentSubjectForMaterial = subjects.find((s) => s.id === materialSubjectId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Przedmioty i materiały</h1>
          <p className="text-gray-500 text-sm mt-1">
            Wprowadź przedmioty akademickie oraz przypisz do nich materiały naukowe (skrypty, slajdy, notatki).
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSubject(null);
            setSubjectModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition shadow-xs cursor-pointer"
        >
          <Plus size={18} />
          <span>Dodaj przedmiot</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak zdefiniowanych przedmiotów</h3>
          <p className="text-gray-500 text-sm mb-6">
            Dodaj swój pierwszy przedmiot (np. Analiza matematyczna, Fizyka), aby móc przypisywać do niego materiały i terminy egzaminów.
          </p>
          <button
            onClick={() => {
              setEditingSubject(null);
              setSubjectModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition cursor-pointer"
          >
            <Plus size={18} />
            <span>Utwórz pierwszy przedmiot</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {subjects.map((subject) => {
            const materials = materialsBySubject[subject.id] || [];
            const isExpanded = !!expandedSubjects[subject.id];
            const totalEstMinutes = materials.reduce((acc, m) => acc + (m.est_minutes || 0), 0);

            return (
              <div
                key={subject.id}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden transition"
              >
                {/* Nagłówek przedmiotu */}
                <div className="p-5 flex items-start justify-between gap-4 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-900">{subject.name}</h2>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200/70 text-gray-700 rounded-full">
                          {materials.length} {materials.length === 1 ? 'materiał' : 'materiałów'}
                        </span>
                        {totalEstMinutes > 0 && (
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock size={12} />
                            {formatEstMinutes(totalEstMinutes)} łącznie
                          </span>
                        )}
                      </div>
                      {subject.description && (
                        <p className="text-gray-600 text-sm mt-1">{subject.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openAddMaterial(subject.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                      title="Dodaj materiał do tego przedmiotu"
                    >
                      <Plus size={15} />
                      <span>Materiał</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingSubject(subject);
                        setSubjectModalOpen(true);
                      }}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                      title="Edytuj przedmiot"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject.id, subject.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Usuń przedmiot"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => toggleExpand(subject.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                      title={isExpanded ? 'Zwiń materiały' : 'Rozwiń materiały'}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Sekcja materiałów */}
                {isExpanded && (
                  <div className="p-5">
                    {materials.length === 0 ? (
                      <div className="text-center py-6 px-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <FolderOpen size={24} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">Brak materiałów dla tego przedmiotu</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Dodaj skrypt, prezentację lub notatki, aby model AI mógł ułożyć plan ich przyswajania.
                        </p>
                        <button
                          onClick={() => openAddMaterial(subject.id)}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          <Plus size={14} />
                          Dodaj pierwszy materiał
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {materials.map((mat) => (
                          <div
                            key={mat.id}
                            className="py-3 flex items-center justify-between gap-4 hover:bg-gray-50/50 px-2 rounded-lg transition"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                                <FileText size={16} />
                              </div>
                              <div className="truncate">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-gray-900 truncate">
                                    {mat.title}
                                  </span>
                                  <span className="text-[11px] font-medium uppercase px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                    {mat.type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5 truncate">
                                  <span className="truncate max-w-md">{mat.url_or_path}</span>
                                  {mat.est_minutes && (
                                    <span className="shrink-0 flex items-center gap-1 text-blue-600 font-medium">
                                      <Clock size={12} />
                                      {formatEstMinutes(mat.est_minutes)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {mat.url_or_path.startsWith('http') && (
                                <a
                                  href={mat.url_or_path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="Otwórz link"
                                >
                                  <ExternalLink size={15} />
                                </a>
                              )}
                              <button
                                onClick={() => openEditMaterial(subject.id, mat)}
                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                                title="Edytuj materiał"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteMaterial(subject.id, mat.id, mat.title)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Usuń materiał"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modale */}
      <SubjectModal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        onSubmit={editingSubject ? handleUpdateSubject : handleCreateSubject}
        initialData={editingSubject}
      />

      <MaterialModal
        isOpen={materialModalOpen}
        onClose={() => setMaterialModalOpen(false)}
        onSubmit={handleSaveMaterial}
        initialData={editingMaterial}
        subjectName={currentSubjectForMaterial?.name}
      />
    </div>
  );
}
