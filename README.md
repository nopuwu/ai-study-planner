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
├── .gitignore
└── README.md
```

Każdy katalog ma własny `README.md` z opisem zawartości i planowanego podziału.

## Uruchomienie

Na razie nie ma czego uruchamiać. Instrukcję uzupełnimy, gdy powstaną:

- środowisko lokalne z bazą danych i backendem (issue #4),
- szkielet backendu (issue #6),
- szkielet frontendu (issue #8).

Wymagania wstępne: [Wpisać tutaj]

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