# Employee Management System (EMS)

A full-stack Employee Management System with JWT authentication, role-based access control, organizational hierarchy, and a dashboard — built as part of a Full Stack Developer hiring assignment.

## Tech Stack

- **Frontend:** React.js, TypeScript
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **Auth:** JWT + bcrypt
- **Bonus:** Docker, CSV Import, Pagination, Soft Delete

## Project Structure

```
.
├── backend/          # Express + Prisma + PostgreSQL API
├── frontend/         # React client
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+) — or Docker, if you'd rather not install it locally
- npm

## Setup — Local (without Docker)

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd employee-management-system
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (see `.env.example` below for the exact contents):
```bash
cp .env.example .env
```
Then edit `DATABASE_URL` and `JWT_SECRET` to match your local Postgres setup.

Run migrations and generate the Prisma client:
```bash
npx prisma migrate dev
npx prisma generate
```

Seed an initial Super Admin user so you have something to log in with:
```bash
npx tsx prisma/seed.ts
```
This creates:
- Email: `admin@example.com`
- Password: `password123`
- Role: `SUPER_ADMIN`

Start the backend:
```bash
npm run dev
```
The API will be running at `http://localhost:5000`.

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm start
```
The frontend runs at `http://localhost:3000` by default and expects the API at `http://localhost:5000/api`.

## Setup — With Docker

From the project root:
```bash
docker-compose up --build
```
This spins up PostgreSQL and the backend together. The backend will be available at `http://localhost:5000`.

You'll still need to run migrations and the seed script once, either by exec-ing into the container or running them locally against the containerized DB:
```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx tsx prisma/seed.ts
```

## Environment Variables

### `backend/.env`
| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://myuser:mypassword@localhost:5432/ems_db` |
| `JWT_SECRET` | Secret used to sign JWTs | any long random string |
| `PORT` | Port the API listens on | `5000` |

See `.env.example` in `backend/` for a ready-to-copy template.

## Roles & Access

| Role | Permissions |
|---|---|
| `SUPER_ADMIN` | Full CRUD, assign any role (including Super Admin), assign managers, delete employees |
| `HR` | Create/edit/view employees, cannot delete employees, cannot assign the Super Admin role |
| `EMPLOYEE` | Can view and edit their own profile only (limited fields: phone, profileImage, password) |

## API Documentation

See [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) for the full list of endpoints, request/response shapes, and auth requirements.

## Bonus Features Implemented

- ✅ Pagination (`GET /api/employees?page=&limit=`)
- ✅ Soft delete (employees are marked `isDeleted`, not removed)
- ✅ CSV bulk import (`POST /api/employees/import`)
- ✅ Docker (`docker-compose.yml` + `Dockerfile`)

## Known Limitations

- No automated test suite yet.
- CORS is currently open (`app.use(cors())` with no origin restriction) — fine for local dev, should be locked down for production.