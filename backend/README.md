# Backend

API aplikacji SPL: FastAPI (Python, asynchroniczne), PostgreSQL, SQLAlchemy 2.0 (async) i migracje Alembic.

## Zakres

- endpointy i walidacja żądań,
- logika biznesowa: plany, zadania, quizy, postępy,
- serwis generowania AI: prompty, wywołanie modelu, walidacja odpowiedzi schematem, limity i rejestr kosztów,
- dostęp do bazy danych i migracje.

## Zasady

- Model AI wywołuje wyłącznie backend. Klucz API jest tylko w zmiennych środowiskowych i nie trafia do repozytorium.
- Generowanie planu jest wieloetapowe, dlatego mieszka w osobnym serwisie, który da się później przenieść za kolejkę zdarzeń.
- Schemat bazy powstaje z migracji na podstawie diagramu ERD (zob. `docs/`).

## Planowany podział

Warstwy odpowiadają architekturze warstwowej: API, logika, dane. Ostateczny układ katalogów ustali zadanie „Szkielet backendu FastAPI” (issue #6).

## Uruchomienie

[uzupełnić po issue #4 i #6]
