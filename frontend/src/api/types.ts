export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export interface Subject {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
}

export interface SubjectCreate {
  name: string;
  description?: string | null;
}

export interface SubjectUpdate {
  name?: string;
  description?: string | null;
}

export interface Material {
  id: number;
  subject_id: number;
  uploaded_by: number | null;
  title: string;
  type: string;
  url_or_path: string;
  est_minutes: number | null;
}

export interface MaterialCreate {
  title: string;
  type: string;
  url_or_path: string;
  est_minutes?: number | null;
}

export interface MaterialUpdate {
  title?: string;
  type?: string;
  url_or_path?: string;
  est_minutes?: number | null;
}

export interface Exam {
  id: number;
  subject_id: number;
  created_by: number;
  title: string;
  exam_at: string;
}

export interface ExamCreate {
  subject_id: number;
  title: string;
  exam_at: string;
}

export interface ExamUpdate {
  subject_id?: number;
  title?: string;
  exam_at?: string;
}

export interface StudyAvailability {
  id: number;
  user_id: number;
  weekday: number; // 0=Poniedziałek, 6=Niedziela
  start_time: string; // "HH:MM:SS" lub "HH:MM"
  end_time: string;
}

export interface StudyAvailabilityCreate {
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface StudyAvailabilityUpdate {
  weekday?: number;
  start_time?: string;
  end_time?: string;
}
