import React, { useState, useEffect } from 'react';
import { BookOpen, LayoutDashboard, Calendar, HelpCircle, BarChart2, Zap, CheckCircle2, Circle, Clock, LogOut } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  
  // Funkcje do nawigacji i obsługi tokenów
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

  // Prosty router sterowany stanem
  if (currentView === 'login') return <LoginScreen onNavigate={navigate} onLoginSuccess={handleLoginSuccess} />;
  if (currentView === 'register') return <RegisterScreen onNavigate={navigate} />;
  if (currentView === 'dashboard') return <Dashboard onLogout={handleLogout} />;
  
  return null;
}

// --- KOMPONENTY WIDOKÓW ---

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
      // Endpoint /login wymaga danych wysłanych jako formularz (URLSearchParams)
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.access_token, data.refresh_token);
      } else {
        setError(data.detail || 'Nieprawidłowy e-mail lub hasło');
      }
    } catch (err) {
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
              <input type="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="anna.kowalska@student.pwr.edu.pl" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Hasło</label>
                <a href="#" className="text-sm text-blue-600 hover:underline">Nie pamiętasz hasła?</a>
              </div>
              <input type="password" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {isLoading ? 'Logowanie...' : 'Zaloguj się'}
            </button>
          </form>
          
          <p className="text-center mt-6 text-gray-600 text-sm">
            Nie masz jeszcze konta? <button onClick={() => onNavigate('register')} className="text-blue-600 font-medium hover:underline">Zarejestruj się</button>
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
      // Rejestracja wysyła zwykłego JSONa
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: name })
      });

      const data = await response.json();

      if (response.ok) {
        onNavigate('login');
      } else {
        setError(data.detail || 'Wystąpił błąd podczas rejestracji');
      }
    } catch (err) {
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
              <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Anna Kowalska" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres e-mail</label>
              <input type="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="anna.kowalska@student.pwr.edu.pl" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasło</label>
              <input type="password" required minLength={8} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 znaków.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Powtórz hasło</label>
              <input type="password" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="terms" checked={terms} onChange={e => setTerms(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">Akceptuję regulamin i politykę prywatności.</label>
            </div>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition mt-4 disabled:opacity-50">
              {isLoading ? 'Rejestracja...' : 'Utwórz konto'}
            </button>
          </form>
          
          <p className="text-center mt-6 text-gray-600 text-sm">
            Masz już konto? <button onClick={() => onNavigate('login')} className="text-blue-600 font-medium hover:underline">Zaloguj się</button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ onLogout }: any) {
  // Stan przechowujący dane pobranego użytkownika
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return onLogout();

      try {
        const response = await fetch('http://localhost:8000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          // Token wygasł lub jest zły - wyrzucamy do ekranu logowania
          onLogout();
        }
      } catch (err) {
        console.error('Błąd połączenia', err);
      }
    };

    fetchUser();
  }, [onLogout]);

  // Logika generowania tekstów do interfejsu
  const fullName = user?.full_name || user?.email || "Ładowanie...";
  const firstName = user?.full_name ? user.full_name.split(' ')[0] : "Studencie";
  const initials = user?.full_name 
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-gray-900 w-full">
      {/* Pasek Boczny */}
      <div className="w-64 bg-white border-r flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 flex items-center gap-2 text-xl font-semibold text-blue-600">
            <BookOpen size={24} /> Planer nauki
          </div>
          <nav className="px-4 space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-md font-medium"><LayoutDashboard size={20} /> Pulpit</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md font-medium"><BookOpen size={20} /> Przedmioty</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md font-medium"><Calendar size={20} /> Plan nauki</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md font-medium"><HelpCircle size={20} /> Quizy</a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md font-medium"><BarChart2 size={20} /> Postępy</a>
          </nav>
        </div>
        <div className="p-4 border-t space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg border">
            <div className="flex justify-between items-center text-sm font-medium text-gray-700 mb-1">Generowania AI <Zap size={16} className="text-blue-600"/></div>
            <div className="text-sm font-bold">3 z 10 w tym miesiącu</div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full mt-2 overflow-hidden"><div className="h-full bg-blue-600 w-3/12"></div></div>
          </div>
          
          {/* ZAKTUALIZOWANY PRZYCISK PROFILU */}
          <button onClick={onLogout} className="flex w-full items-center justify-between p-2 hover:bg-gray-50 rounded-md transition text-left group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                {initials}
              </div>
              <div className="text-sm truncate w-32">
                <div className="font-medium truncate">{fullName}</div>
                <div className="text-gray-500 text-xs">Wyloguj się</div>
              </div>
            </div>
            <LogOut size={16} className="text-gray-400 group-hover:text-red-500 transition" />
          </button>
        </div>
      </div>

      {/* Główna treść pulpitu */}
      <div className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 border-b pb-4">
          <div className="text-gray-500 font-medium">Moja nauka</div>
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium"><Calendar size={18} /> Dzisiaj</div>
        </header>

        <div className="flex justify-between items-end mb-8">
          <div>
            {/* ZAKTUALIZOWANE POWITANIE */}
            <h1 className="text-4xl font-bold mb-2">Dzień dobry, {firstName}</h1>
            <p className="text-gray-500">Oto Twój plan na dziś. Ucz się we własnym tempie.</p>
          </div>
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition">
            <Calendar size={18} /> Otwórz plan nauki
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center text-gray-500 mb-2"><span className="text-sm font-medium">Zadania na dziś</span> <CheckCircle2 size={18}/></div>
            <div className="text-3xl font-bold mb-1">1 z 3</div>
            <div className="text-sm text-gray-400">Jedno zadanie już za Tobą</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center text-gray-500 mb-2"><span className="text-sm font-medium">Nauka w tym tygodniu</span> <Clock size={18}/></div>
            <div className="text-3xl font-bold mb-1">5 godz.</div>
            <div className="text-sm text-gray-400">Z zaplanowanych 8 godz. 30 min</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center text-gray-500 mb-2"><span className="text-sm font-medium">Najbliższy egzamin</span> <Calendar size={18}/></div>
            <div className="text-3xl font-bold mb-1">Za 12 dni</div>
            <div className="text-sm text-gray-400">Algebra liniowa · 3 listopada</div>
          </div>
        </div>

        {/* Listy zadań i egzaminów */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">Dzisiaj do zrobienia</h2>
                  <p className="text-sm text-gray-500">Zaznacz zadanie, gdy skończysz naukę.</p>
                </div>
                <div className="text-right">
                  <a href="#" className="text-blue-600 text-sm font-medium hover:underline">Cały plan ›</a>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                  <CheckCircle2 className="text-blue-600 mt-1 shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold line-through text-gray-400">Macierze — zadania 1-8</div>
                    <div className="text-sm text-gray-400">Algebra liniowa</div>
                  </div>
                  <div className="text-sm font-medium text-gray-400">16:00-16:45</div>
                </div>
                <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition cursor-pointer">
                  <Circle className="text-gray-300 mt-1 shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold">Pętle i tablice — ćwiczenia</div>
                    <div className="text-sm text-gray-500">Podstawy programowania</div>
                  </div>
                  <div className="text-sm font-medium text-gray-500">17:00-18:00</div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">Nadchodzące egzaminy</h2>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="bg-gray-50 border rounded-lg p-2 text-center min-w-[3.5rem]">
                    <div className="text-sm font-bold">03</div>
                    <div className="text-xs text-gray-500 uppercase">LIS</div>
                  </div>
                  <div>
                    <div className="font-semibold">Algebra liniowa</div>
                    <div className="text-sm text-gray-500">Wtorek · 10:00 · sala 204</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-gray-50 border rounded-lg p-2 text-center min-w-[3.5rem]">
                    <div className="text-sm font-bold">06</div>
                    <div className="text-xs text-gray-500 uppercase">LIS</div>
                  </div>
                  <div>
                    <div className="font-semibold">Podstawy program.</div>
                    <div className="text-sm text-gray-500">Piątek · 09:00 · sala 112</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}