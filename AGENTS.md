# AI Agent Instructions for Quito Turismo Attractions System

A full-stack Vue.js + Express + MySQL web application for managing Ecuador's tourism attractions, experiences, and routes. **Keycloak-authenticated** with role-based access control.

## Quick Setup

```bash
# Backend (Express on :3000)
cd backend && npm install && npm run dev

# Frontend (Vue+Vite on :5173)
cd frontend && npm install && npm run dev

# Database: Load database/atractivos_turisticos.sql into MySQL
# Environment: Copy backend/.env.example to .env, configure Keycloak + MySQL
```

**Key Ports**: Backend `3000`, Frontend `5173`, Keycloak required for auth, MySQL `3306`

---

## Tech Stack & Architecture

| Layer | Tech | Notes |
|-------|------|-------|
| **Frontend** | Vue 3 + Vite + Pinia | Component-based, Axios with interceptors for token refresh |
| **Backend** | Express 4.19.2 + Node.js | REST API with 7 route modules |
| **Database** | MySQL 8.0+ | 15+ catalog tables, parameterized queries |
| **Auth** | Keycloak Direct Grant | HTTP-only cookies, auto-refresh on 401 |
| **State** | Pinia (auth) + API calls | Centralized auth state, domain services for data |

---

## Project Structure & Conventions

### Backend Routes
All API endpoints prefixed `/api/`:
- **Auth**: `/api/auth/{login, logout, refresh, me}` → [backend/src/routes/auth.js](backend/src/routes/auth.js)
- **Data**: `/api/{atractivos, experiencias, rutas, dashboard}` → [backend/src/routes/](backend/src/routes/)
- **Catalogs**: `/api/catalogos` (read) + `/api/catalogos-admin` (write) → [backend/src/routes/catalogos.js](backend/src/routes/catalogos.js)

### Frontend Services
Domain-based service modules in [frontend/src/services/](frontend/src/services/). Each service exports CRUD methods:
```javascript
// Pattern: atractivosService.getAll(params), .getById(id), .create(data), .update(id, data), .delete(id)
import atractivosService from './services/atractivos.js';
const atractivos = await atractivosService.getAll({ limit: 10 });
```

### Frontend Components
- **Sections**: [frontend/src/views/sections/](frontend/src/views/sections/) — Feature-based Vue components (AtractivosSection.vue, ExperienciasSection.vue, etc.)
- **Reusable UI**: [AppTable.vue](frontend/src/components/AppTable.vue), [AppModal.vue](frontend/src/components/AppModal.vue)
- **Routing**: [frontend/src/router/index.js](frontend/src/router/index.js) — Vue Router with role-based guards

### Database Entities
Primary feature tables:
- **Atractivos** (attractions): Main entities with catalogs (categories, types), locations, codes
- **Experiencias** (experiences): Activities/tours related to attractions
- **Rutas** (routes): Multi-attraction itineraries
- **Catalogs**: 15+ master tables (categories, types, parishes, zones, etc.)

---

## Common Development Patterns

### Adding a New API Endpoint
1. Create/modify route file in [backend/src/routes/](backend/src/routes/)
2. Ensure queries use parameterized statements: `db.query(sql, [param1, param2])`
3. Add corresponding service method in [frontend/src/services/](frontend/src/services/)
4. Create/update section component in [frontend/src/views/sections/](frontend/src/views/sections/)

### Modifying Frontend UI
- Section components use `AppTable.vue` for grids and `AppModal.vue` for dialogs
- State: Auth stored in [Pinia auth store](frontend/src/stores/auth.js), data fetched via services
- Routing: Update [frontend/src/router/index.js](frontend/src/router/index.js) for new views

### Database Changes
- Modify schema in [database/atractivos_turisticos.sql](database/atractivos_turisticos.sql)
- Update backend queries in [backend/src/routes/](backend/src/routes/)
- Update frontend services in [frontend/src/services/](frontend/src/services/)
- Python data loaders in [scripts/](scripts/) may need updates

---

## Key Architectural Decisions

| Decision | Implementation |
|----------|----------------|
| **Authentication Flow** | Keycloak Direct Grant (ROPC) → HTTP-only cookies → Auto-refresh on 401 with Axios interceptor |
| **State Management** | Pinia for auth (centralized), API services for data (decoupled) |
| **Database Queries** | Async/await with `mysql2/promise`, parameterized to prevent SQL injection |
| **Frontend Dev Proxy** | Vite proxies `/api/*` to `localhost:3000` (dev only; production uses reverse proxy) |
| **Data Hierarchies** | Categories group Types; Locations contain Parishes/Zones |

---

## Common Tasks & Files

| Task | Primary Files |
|------|----------------|
| Add new data entity | [backend/src/routes/](backend/src/routes/) + [frontend/src/services/](frontend/src/services/) + [database/atractivos_turisticos.sql](database/atractivos_turisticos.sql) |
| Modify API response | [backend/src/routes/](backend/src/routes/) → update query/response |
| Add/update frontend view | [frontend/src/views/sections/](frontend/src/views/sections/) → use AppTable/AppModal |
| Change authentication logic | [backend/src/config/keycloak.js](backend/src/config/keycloak.js) + [frontend/src/stores/auth.js](frontend/src/stores/auth.js) |
| Update Keycloak config | [backend/.env](backend/.env) → requires Keycloak restart |
| Load/seed database | [scripts/load_excel_mysql.py](scripts/load_excel_mysql.py) or [scripts/load_catalogo_mysql.py](scripts/load_catalogo_mysql.py) |

---

## Critical Setup & Pitfalls

⚠️ **Before Development**:
1. **Keycloak must be running** with a Direct Grant client enabled (not localhost default)
2. **MySQL** must have database/atractivos_turisticos.sql loaded
3. **Backend .env**: Copy [backend/.env.example](backend/.env.example), fill in Keycloak realm/client/secret + MySQL credentials (timezone: `America/Guayaquil`)
4. **Python scripts** have hardcoded credentials in code (SECURITY RISK — use env vars in production)
5. **Frontend Vite proxy** only works in dev mode (`npm run dev`); production requires reverse proxy

⚠️ **Rate Limiting**: Login is rate-limited to 20 attempts per 15 minutes per IP

⚠️ **Database**: Uses `utf8mb4` charset; ensure MySQL `max_connections ≥ 20` and pool size `10`

---

## File Reference Guide

**Backend**:
- [backend/package.json](backend/package.json) — dependencies, npm scripts
- [backend/.env.example](backend/.env.example) — required environment variables
- [backend/src/app.js](backend/src/app.js) — Express app setup
- [backend/src/config/](backend/src/config/) — Database, Keycloak config
- [backend/src/middleware/auth.js](backend/src/middleware/auth.js) — Token validation middleware
- [backend/src/routes/](backend/src/routes/) — API endpoint handlers

**Frontend**:
- [frontend/package.json](frontend/package.json) — dependencies, npm scripts
- [frontend/vite.config.js](frontend/vite.config.js) — Vite config + dev proxy setup
- [frontend/src/main.js](frontend/src/main.js) — App initialization
- [frontend/src/services/](frontend/src/services/) — API client methods
- [frontend/src/stores/auth.js](frontend/src/stores/auth.js) — Pinia auth state
- [frontend/src/views/sections/](frontend/src/views/sections/) — Feature components
- [frontend/src/router/index.js](frontend/src/router/index.js) — Vue Router setup

**Database & Data**:
- [database/atractivos_turisticos.sql](database/atractivos_turisticos.sql) — Schema + setup
- [scripts/](scripts/) — Python data loaders for Excel/catalogs

---

## Useful Commands

```bash
# Backend
npm run dev            # Development server with hot reload
npm start              # Production server

# Frontend
npm run dev            # Dev server (Vite, hot reload)
npm run build          # Production build
npm run preview        # Preview production build

# Database
mysql -u root -p < database/atractivos_turisticos.sql

# Data Loading
python scripts/load_excel_mysql.py
python scripts/load_catalogo_mysql.py
```

---

## Notes for AI Agents

- **Favored patterns**: Express middleware + Vue components + service layer architecture
- **Avoid**: Mixing async/await patterns inconsistently; SQL concatenation (always parameterize)
- **When adding features**: Follow domain-based file naming (e.g., `migracionesService.js`, `MigracionesSection.vue`)
- **Testing**: No test suite present; recommend Jest (backend) + Vitest (frontend) if adding tests
- **Type safety**: No TypeScript; consider when refactoring critical paths
