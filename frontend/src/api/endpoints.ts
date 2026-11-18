import { apiFetch } from './client';
import type {
  User,
  Subject,
  SubjectCreate,
  SubjectUpdate,
  Material,
  MaterialCreate,
  MaterialUpdate,
  Exam,
  ExamCreate,
  ExamUpdate,
  StudyAvailability,
  StudyAvailabilityCreate,
  StudyAvailabilityUpdate,
} from './types';

// Użytkownik
export function getMe(): Promise<User> {
  return apiFetch<User>('/auth/me');
}

// Przedmioty
export function getSubjects(): Promise<Subject[]> {
  return apiFetch<Subject[]>('/subjects');
}

export function createSubject(data: SubjectCreate): Promise<Subject> {
  return apiFetch<Subject>('/subjects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateSubject(id: number, data: SubjectUpdate): Promise<Subject> {
  return apiFetch<Subject>(`/subjects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteSubject(id: number): Promise<void> {
  return apiFetch<void>(`/subjects/${id}`, {
    method: 'DELETE',
  });
}

// Materiały (zagnieżdżone pod przedmiotem)
export function getMaterials(subjectId: number): Promise<Material[]> {
  return apiFetch<Material[]>(`/subjects/${subjectId}/materials`);
}

export function createMaterial(subjectId: number, data: MaterialCreate): Promise<Material> {
  return apiFetch<Material>(`/subjects/${subjectId}/materials`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateMaterial(
  subjectId: number,
  materialId: number,
  data: MaterialUpdate
): Promise<Material> {
  return apiFetch<Material>(`/subjects/${subjectId}/materials/${materialId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteMaterial(subjectId: number, materialId: number): Promise<void> {
  return apiFetch<void>(`/subjects/${subjectId}/materials/${materialId}`, {
    method: 'DELETE',
  });
}

// Egzaminy
export function getExams(subjectId?: number): Promise<Exam[]> {
  const query = subjectId !== undefined ? `?subject_id=${subjectId}` : '';
  return apiFetch<Exam[]>(`/exams${query}`);
}

export function createExam(data: ExamCreate): Promise<Exam> {
  return apiFetch<Exam>('/exams', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateExam(id: number, data: ExamUpdate): Promise<Exam> {
  return apiFetch<Exam>(`/exams/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteExam(id: number): Promise<void> {
  return apiFetch<void>(`/exams/${id}`, {
    method: 'DELETE',
  });
}

// Dostępność czasowa
export function getAvailability(): Promise<StudyAvailability[]> {
  return apiFetch<StudyAvailability[]>('/availability');
}

export function createAvailability(data: StudyAvailabilityCreate): Promise<StudyAvailability> {
  return apiFetch<StudyAvailability>('/availability', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateAvailability(
  id: number,
  data: StudyAvailabilityUpdate
): Promise<StudyAvailability> {
  return apiFetch<StudyAvailability>(`/availability/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteAvailability(id: number): Promise<void> {
  return apiFetch<void>(`/availability/${id}`, {
    method: 'DELETE',
  });
}
