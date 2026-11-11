# SPL – AI Study Planner

Aplikacja webowa, w której model językowy (LLM) układa spersonalizowany plan nauki do egzaminu i generuje quizy z materiałów studenta. Projekt zespołowy realizowany na Politechnice Wrocławskiej.

## Status

Start projektu: ustalamy założenia i architekturę. Kod aplikacji jeszcze nie powstał, a zadania śledzimy na [tablicy projektu](https://github.com/users/nopuwu/projects/3).

## Zakres pierwszej wersji

Pierwsza wersja ma pięć funkcji:

1. plan nauki układany od terminu egzaminu,
2. quiz generowany z materiału, z wyjaśnieniami odpowiedzi,
3. postęp nauki i gotowość do egzaminu,
4. wyjaśnienie, dlaczego plan wygląda tak, a nie inaczej,
5. limity kosztów generowania i licznik zużycia.

Poza pierwszą wersją zostają: synchronizacja z zewnętrznym kalendarzem, panel nauczyciela i czat z asystentem AI. Jeden użytkownik ma jedną rolę.

## Technologie

| Warstwa | Technologia |
| --- | --- |
| Interfejs | React + Tailwind CSS (aplikacja jednostronicowa) |
| API | FastAPI (Python, asynchroniczne) |
| Dane | PostgreSQL, SQLAlchemy 2.0 (async), Alembic |
| Model AI | LLM przez API, wywoływany tylko z backendu |

## Struktura repozytorium

```
.
├── backend/     # API w FastAPI, logika biznesowa, dostęp do bazy, serwis generowania AI
├── frontend/    # aplikacja React + Tailwind
├── docs/        # założenia, model danych, architektura, materiały do prezentacji
├── docker/             # pliki Dockerfile backendu i frontendu
├── docker-compose.yml  # środowisko lokalne: baza, backend, frontend
├── .env.example        # wzór pliku konfiguracji .env
├── .gitignore
└── README.md
```

Każdy katalog ma własny `README.md` z opisem zawartości i planowanego podziału.

## Uruchomienie

Całe środowisko lokalne (baza PostgreSQL, backend FastAPI i frontend React) uruchamia się w Dockerze jedną komendą. Nie trzeba instalować Pythona ani Node.js.

Wymagania wstępne: Git oraz Docker Desktop (z Docker Compose v2).

1. Skopiuj wzór konfiguracji. W pliku `.env` ustaw własne hasło do bazy (pliku `.env` nie wrzucamy do repozytorium):

   ```bash
   cp .env.example .env
   ```

2. Zbuduj i uruchom wszystko. Pierwsze uruchomienie buduje obrazy, więc trwa kilka minut:

   ```bash
   docker compose up -d --build
   ```

3. Utwórz strukturę bazy danych. Pierwsze uruchomienie tworzy pustą bazę, więc musisz wykonać migrację, aby wygenerować tabele:

    ```bash
    docker compose exec backend alembic upgrade head
    ```

3. Sprawdź, czy usługi działają. Baza i backend powinny mieć status `healthy`:

   ```bash
   docker compose ps
   ```

| Usługa | Adres |
| --- | --- |
| Frontend | [http://localhost:5173](http://localhost:5173) |
| Backend (dokumentacja Swagger) | [http://localhost:8000/docs](http://localhost:8000/docs) |
| Backend (sprawdzenie działania) | [http://localhost:8000/api/health](http://localhost:8000/api/health) |
| Baza PostgreSQL | `localhost:5432` (dane z pliku `.env`) |

Porty zmienisz w pliku `.env` (`BACKEND_PORT`, `FRONTEND_PORT`, `POSTGRES_PORT`).

Przydatne polecenia:

- po zmianie kodu przebuduj obrazy: `docker compose up -d --build`,
- tworzenie nowej migracji po zmianie bazy: `docker compose exec backend alembic revision --autogenerate -m "nazwa_zmiany"`,
- aktualizacja bazy (aplikacja nowych migracji): `docker compose exec backend alembic upgrade head`,
- logi usługi: `docker compose logs -f backend`,
- zatrzymanie: `docker compose down`,
- zatrzymanie z usunięciem danych bazy: `docker compose down -v`.

Uruchomienie bez Dockera opisują pliki `README.md` w katalogach `backend/` i `frontend/`.

## Praca w zespole

Propozycja zasad, które można zmienić po ustaleniach zespołu:

- Każda zmiana zaczyna się od issue na tablicy projektu.
- Pracujemy na osobnych gałęziach, np. `feature/6-szkielet-backendu` (numer issue i krótki opis).
- Do gałęzi `main` trafiamy tylko przez pull request z dopiskiem `Closes #<numer issue>`.
- Pull request ogląda co najmniej jedna inna osoba.
- Klucze API i hasła nigdy nie trafiają do repozytorium, tylko do zmiennych środowiskowych.

## Zespół

- Maciej Grech-Wór (PM)
- Jakub Bednarczyk
- Michał Walecki
- Jędrzej Kozina

## Dokumentacja

Szczegóły projektu zbieramy w katalogu [`docs/`](docs/).