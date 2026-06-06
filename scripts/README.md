# Scripts

Dev, build, migration, and CI helper scripts for the Sokos monorepo.

## Available Scripts

| Script | Description |
|--------|-------------|
| `dev.bat` / `dev.sh` | Start frontend + backend in development mode concurrently |
| `build.bat` / `build.sh` | Build both frontend (Vite) and backend (tsc/esbuild) for production |
| `migrate.bat` / `migrate.sh` | Run pending database migrations |
| `ci/` | Helper scripts used by GitHub Actions workflows |

## Usage

**Windows**
```bat
scripts\dev.bat
scripts\build.bat
scripts\migrate.bat
```

**Linux / macOS**
```bash
chmod +x scripts/*.sh
./scripts/dev.sh
./scripts/build.sh
./scripts/migrate.sh
```
