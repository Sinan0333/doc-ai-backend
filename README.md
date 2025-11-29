# DocAI - Backend (Node.js + Express + MongoDB)

## Setup

1. copy `.env.example` → `.env` and fill values.
2. `npm install`
3. `npm run seed:doctor` (optional) to create an initial doctor
4. `npm run dev` (requires nodemon) or `npm start`

## Endpoints

- `POST /api/auth/register` — register patient
- `POST /api/auth/patient-login` — patient login
- `POST /api/auth/doctor-login` — doctor login
- `GET /api/patient/dashboard` — protected, role=patient
- `GET /api/doctor/dashboard` — protected, role=doctor
- `GET /api/health` — health check

## Notes

- Add additional models for Reports, Imaging etc. when integrating AI modules.
- Use HTTPS and strong JWT secret in production.
