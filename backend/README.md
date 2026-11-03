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

## Struktura katalogów

Układ aplikacji bazuje na architekturze warstwowej wewnątrz modułu `app/`:

```text
backend/
├── app/
│   ├── api/            # endpointy i routery FastAPI (np. health, plany, quizy)
│   │   └── health.py
│   ├── core/           # konfiguracja (Pydantic Settings), stałe, zabezpieczenia
│   │   └── config.py
│   ├── db/             # [planowane] konfiguracja sesji bazy danych i Alembic
│   ├── models/         # [planowane] modele tabel SQLAlchemy
│   ├── schemas/        # [planowane] schematy walidacji danych (Pydantic DTO)
│   ├── services/       # [planowane] logika biznesowa i integracja z LLM
│   └── main.py         # punkt startowy aplikacji FastAPI
├── .env.example        # wzorzec zmiennych środowiskowych
├── requirements.txt    # zależności projektu
└── README.md
```

## Uruchomienie lokalne
[uzupełnić po issue #6]

1. **Przygotowanie środowiska wirtualnego:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate       # Linux / macOS
   # venv\Scripts\activate        # Windows
   ```

2. **Instalacja zależności:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Konfiguracja zmiennych środowiskowych:**
   ```bash
   cp .env.example .env
   # W pliku .env uzupełnij brakujące wartości (np. AI_API_KEY)
   ```

4. **Uruchomienie serwera deweloperskiego:**
   ```bash
   uvicorn app.main:app --reload
   ```

Aplikacja będzie dostępna pod adresem: `http://127.0.0.1:8000`  
Interaktywna dokumentacja OpenAPI (Swagger UI): `http://127.0.0.1:8000/docs`

