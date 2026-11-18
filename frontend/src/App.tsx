import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import type { User, Subject } from './api/types';
import { getMe, getSubjects, createSubject, createExam, createAvailability } from './api/endpoints';
import { Sidebar } from './components/Sidebar';
import type { ActiveTab } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { SubjectsView } from './views/SubjectsView';
import { ExamsView } from './views/ExamsView';
import { AvailabilityView } from './views/AvailabilityView';
import { SubjectModal } from './components/forms/SubjectModal';
import { ExamModal } from './components/forms/ExamModal';
import { AvailabilityModal } from './components/forms/AvailabilityModal';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('access_token') ? 'dashboard' : 'login';
  });

  const navigate = (view: string) => setCurrentView(view);

  const handleLoginSuccess = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    navigate('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('login');
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      handleLogout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  if (currentView === 'login') {
    return <LoginScreen onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
  }
  if (currentView === 'register') {
    return <RegisterScreen onNavigate={navigate} />;
  }
  if (currentView === 'dashboard') {
    return <MainPanel onLogout={handleLogout} />;
  }

  return null;
}

// --- EKRANY AUTORYZACJI ---

function AuthLeftPane() {
  return (
    <div className="hidden lg:flex w-1/2 bg-blue-600 text-white flex-col justify-center px-16 xl:px-24">
      <div className="flex items-center gap-2 mb-12 text-xl font-medium">
        <BookOpen size={28} />
        Planer nauki
      </div>
      <h1 className="text-5xl font-semibold mb-6 leading-tight">
        Ucz się mądrzej, nie więcej.
      </h1>
      <p className="text-blue-100 text-lg mb-12">
        Plan nauki od dziś do egzaminu, quizy z wyjaśnieniami i jasny obraz tego, czy jesteś gotowa.
      </p>
      <div className="space-y-6">
        <div className="flex gap-4">
          <CheckCircle2 className="text-blue-300 shrink-0 mt-1" />
          <div>
            <h3 className="font-medium text-lg">Plan od terminu egzaminu</h3>
            <p className="text-blue-200">AI układa zadania w dniach, które masz do dyspozycji.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <CheckCircle2 className="text-blue-300 shrink-0 mt-1" />
          <div>
            <h3 className="font-medium text-lg">Quizy z wyjaśnieniami</h3>
            <p className="text-blue-200">Sprawdzaj wiedzę i rozumiej, dlaczego odpowiedź jest poprawna.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <CheckCircle2 className="text-blue-300 shrink-0 mt-1" />
          <div>
            <h3 className="font-medium text-lg">Gotowość do egzaminu</h3>
            <p className="text-blue-200">Widzisz postęp i obszary do powtórki.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onNavigate, onLoginSuccess }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.access_token, data.refresh_token);
      } else {
        setError(data.detail || 'Nieprawidłowy e-mail lub hasło');
      }
    } catch {
      setError('Błąd połączenia z serwerem. Upewnij się, że backend działa.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 w-full">
      <AuthLeftPane />
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">Zaloguj się</h2>
            <p className="text-gray-500">Wróć do swojego planu nauki.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres e-mail</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="anna.kowalska@student.pwr.edu.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Hasło</label>
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Nie pamiętasz hasła?
                </a>
              </div>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Logowanie...' : 'Zaloguj się'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600 text-sm">
            Nie masz jeszcze konta?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-blue-600 font-medium hover:underline cursor-pointer"
            >
              Zarejestruj się
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function RegisterScreen({ onNavigate }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) return setError('Hasła nie są identyczne');
    if (!terms) return setError('Musisz zaakceptować regulamin');

    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: name }),
      });

      const data = await response.json();

      if (response.ok) {
        onNavigate('login');
      } else {
        setError(data.detail || 'Wystąpił błąd podczas rejestracji');
      }
    } catch {
      setError('Błąd połączenia z serwerem. Upewnij się, że backend działa.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 w-full">
      <AuthLeftPane />
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 bg-white py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">Utwórz konto</h2>
            <p className="text-gray-500">Zacznij planować naukę w kilka minut.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imię i nazwisko</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Anna Kowalska"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres e-mail</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="anna.kowalska@student.pwr.edu.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasło</label>
              <input
                type="password"
                required
                minLength={8}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 znaków.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Powtórz hasło</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="terms"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                Akceptuję regulamin i politykę prywatności.
              </label>
            </div>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition mt-4 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Rejestracja...' : 'Utwórz konto'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600 text-sm">
            Masz już konto?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-600 font-medium hover:underline cursor-pointer"
            >
              Zaloguj się
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// --- GŁÓWNY PANEL STUDENTA (AUTH) ---

function MainPanel({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pulpit');
  const [user, setUser] = useState<User | null>(null);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);

  // Szybkie modale z poziomu Dashboardu
  const [quickSubjectOpen, setQuickSubjectOpen] = useState(false);
  const [quickExamOpen, setQuickExamOpen] = useState(false);
  const [quickAvailOpen, setQuickAvailOpen] = useState(false);

  useEffect(() => {
    const fetchProfileAndSubjects = async () => {
      try {
        const u = await getMe();
        setUser(u);
        const subs = await getSubjects();
        setSubjectsList(subs);
      } catch {
        onLogout();
      }
    };
    fetchProfileAndSubjects();
  }, [onLogout]);

  const handleQuickSubject = async (data: any) => {
    await createSubject(data);
    const updated = await getSubjects();
    setSubjectsList(updated);
    setActiveTab('przedmioty');
  };

  const handleQuickExam = async (data: any) => {
    await createExam(data);
    setActiveTab('egzaminy');
  };

  const handleQuickAvail = async (data: any) => {
    await createAvailability(data);
    setActiveTab('dostepnosc');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-gray-900 w-full">
      {/* Pasek Boczny */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={user}
        onLogout={onLogout}
      />

      {/* Główna zawartość widoku */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Górny pasek pomocniczy */}
        <header className="h-16 px-8 bg-white border-b border-gray-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <span className="capitalize">{activeTab}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/60">
            <Calendar size={14} className="text-blue-600" />
            <span>
              {new Date().toLocaleDateString('pl-PL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </span>
          </div>
        </header>

        {/* Zawartość zależna od wybranej zakładki */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'pulpit' && (
              <DashboardView
                user={user}
                onNavigateTab={setActiveTab}
                onOpenSubjectModal={() => setQuickSubjectOpen(true)}
                onOpenExamModal={() => setQuickExamOpen(true)}
                onOpenAvailabilityModal={() => setQuickAvailOpen(true)}
              />
            )}
            {activeTab === 'przedmioty' && <SubjectsView />}
            {activeTab === 'egzaminy' && <ExamsView />}
            {activeTab === 'dostepnosc' && <AvailabilityView />}
          </div>
        </main>
      </div>

      {/* Globalne modale dla szybkich akcji */}
      <SubjectModal
        isOpen={quickSubjectOpen}
        onClose={() => setQuickSubjectOpen(false)}
        onSubmit={handleQuickSubject}
      />

      <ExamModal
        isOpen={quickExamOpen}
        onClose={() => setQuickExamOpen(false)}
        onSubmit={handleQuickExam}
        subjects={subjectsList}
      />

      <AvailabilityModal
        isOpen={quickAvailOpen}
        onClose={() => setQuickAvailOpen(false)}
        onSubmit={handleQuickAvail}
      />
    </div>
  );
}
