# Participacion Logica

Aplicacion local para controlar participaciones en clase por paralelo.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Polling cada 1 segundo, sin Socket.io

## Configuracion local

1. Ajusta `.env` con tu PostgreSQL local:

```env
DATABASE_URL="postgresql://usuario:clave@localhost:5432/participacion_logica?schema=public"
TEACHER_PIN="1234"
```

2. Si usas Docker Desktop, puedes levantar PostgreSQL con:

```bash
docker compose up -d
```

3. Crea las tablas:

```bash
npm run db:migrate -- --name init
```

4. Ejecuta la app:

```bash
npm run dev
```

## Rutas

- `/`: entrada principal
- `/docente`: panel docente
- `/estudiante`: ingreso y panel del estudiante
- `/pantalla`: vista para proyector

## Uso inicial

1. Entra a `/docente`.
2. Usa la clave definida en `TEACHER_PIN`; por defecto es `1234`.
3. Crea los paralelos.
4. Los estudiantes entran a `/estudiante`, crean su registro y luego ingresan con su clave.
5. El docente abre una ronda, valida correcto/incorrecto y puede mostrar el podio en `/pantalla`.
