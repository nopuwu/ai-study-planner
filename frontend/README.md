# Frontend

Interfejs aplikacji SPL: React + Tailwind CSS (aplikacja jednostronicowa).

## Zakres

- rejestracja i logowanie,
- formularze przedmiotów, materiałów, egzaminów i dostępności czasowej,
- widok planu nauki z wyjaśnieniem i oznaczaniem zadań,
- ekrany quizu z wyjaśnieniami odpowiedzi,
- widok postępów i gotowości do egzaminu, licznik zużycia generowań.

## Zasady

- Frontend rozmawia tylko z API backendu i nigdy nie wywołuje modelu AI bezpośrednio.
- Wygląd ekranów opieramy na zatwierdzonych makietach (issue #11).

## Uruchomienie

### Wymagania wstępne

- [Node.js](https://nodejs.org/) (wersja LTS, zalecana v20 lub nowsza)
- Menedżer pakietów `npm` (dostarczany z Node.js)

### Krok po kroku

1. Przejdź do katalogu frontendu:
   ```bash
   cd frontend
   ```

2. Zainstaluj zależności:
   ```bash
   npm install
   ```

3. Uruchom serwer deweloperski:
   ```bash
   npm run dev
   ```
   Aplikacja będzie dostępna pod adresem: [http://localhost:5173](http://localhost:5173).

### Dostępne skrypty

| Polecenie | Opis |
| --- | --- |
| `npm run dev` | Uruchamia serwer deweloperski Vite z hot-reloadingiem |
| `npm run build` | Sprawdza typy (`tsc -b`) i buduje zoptymalizowaną wersję produkcyjną do katalogu `dist/` |
| `npm run preview` | Podgląd lokalny zbudowanej aplikacji produkcyjnej |
| `npm run lint` | Sprawdza jakość kodu za pomocą lintera (oxlint) |
