# 🪟 Windows Setup Guide - Quick Reference

## TL;DR - Copy/Paste Commands for Windows

### 1. Setup Database

```cmd
cd database
copy .env.template .env
docker-compose up -d postgres
```

Wait ~30 seconds, then verify:

```cmd
docker-compose ps
docker-compose logs postgres
```

### 2. Setup Data Pipeline

```cmd
cd ..\data-processing
echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/air_quality_db?schema=public" > .env
pip install -r requirements.txt
prisma generate
prisma db push
```

### 3. Run Pipeline

```cmd
python main_pipeline.py
```

---

## Common Windows Commands

| Task                 | Windows Command    | Linux/Mac Equivalent |
| -------------------- | ------------------ | -------------------- |
| Copy file            | `copy source dest` | `cp source dest`     |
| View file            | `type filename`    | `cat filename`       |
| Remove file          | `del filename`     | `rm filename`        |
| Change directory     | `cd dirname`       | `cd dirname`         |
| Go up one directory  | `cd ..`            | `cd ..`              |
| List files           | `dir`              | `ls`                 |
| Create directory     | `mkdir dirname`    | `mkdir dirname`      |
| Environment variable | `echo %VAR%`       | `echo $VAR`          |

---

## PowerShell vs Command Prompt

### Command Prompt (cmd.exe) - Recommended for this project

```cmd
# Copy file
copy .env.template .env

# Create .env file with content
echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/air_quality_db?schema=public" > .env
```

### PowerShell

```powershell
# Copy file
Copy-Item .env.template .env

# Create .env file with content
Set-Content -Path .env -Value 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/air_quality_db?schema=public"'

# Or use echo like cmd
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/air_quality_db?schema=public"' > .env
```

### Git Bash (if installed)

```bash
# Works like Linux
cp .env.template .env
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/air_quality_db?schema=public"' > .env
```

---

## Complete Windows Setup Steps

### Step 1: Open Command Prompt

Press `Win + R`, type `cmd`, press Enter

Or search for "Command Prompt" in Start menu

### Step 2: Navigate to Project

```cmd
cd D:\Work\NSAC
```

### Step 3: Setup Database

```cmd
cd database
copy .env.template .env
docker-compose up -d postgres
timeout /t 30
docker-compose logs postgres
```

Look for: `✅ Database initialized successfully!`

### Step 4: Setup Data Pipeline

```cmd
cd ..\data-processing
echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/air_quality_db?schema=public" > .env
pip install -r requirements.txt
prisma generate
prisma db push
```

### Step 5: Test the Pipeline

```cmd
python inspect_netcdf.py
python main_pipeline.py
```

---

## Troubleshooting Windows-Specific Issues

### "Docker is not recognized"

**Fix:** Ensure Docker Desktop is installed and running

- Download: https://www.docker.com/products/docker-desktop
- Start Docker Desktop application
- Wait for it to show "Docker Desktop is running"

### "python is not recognized"

**Fix:** Add Python to PATH or use full path

```cmd
# Option 1: Use full path
C:\Python311\python.exe main_pipeline.py

# Option 2: Add to PATH
# Windows Settings → System → Advanced → Environment Variables
# Add Python installation folder to PATH
```

### "prisma is not recognized"

**Fix:** Prisma is installed locally, not globally

```cmd
# Use pip to ensure it's installed
pip install prisma

# Or use python -m
python -m prisma generate
python -m prisma db push
```

### Port 5432 already in use

**Check what's using the port:**

```cmd
netstat -ano | findstr :5432
```

**Stop PostgreSQL service:**

```cmd
# Open Services (Win + R, type services.msc)
# Find PostgreSQL and stop it
```

**Or change the port in database/.env:**

```
POSTGRES_PORT=5433
```

Then update `data-processing/.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/air_quality_db?schema=public"
```

### Permission denied errors

**Run Command Prompt as Administrator:**

- Right-click Command Prompt
- Select "Run as administrator"

### Line endings issues (if using Git)

```cmd
git config core.autocrlf true
```

---

## Windows-Friendly File Paths

### Absolute paths (Windows style)

```
D:\Work\NSAC\database
D:\Work\NSAC\data-processing
```

### Relative paths (works everywhere)

```
.\database
..\data-processing
```

---

## Quick Commands Reference

### Database Management

```cmd
cd D:\Work\NSAC\database

:: Start database
docker-compose up -d postgres

:: Check status
docker-compose ps

:: View logs
docker-compose logs -f postgres

:: Stop database
docker-compose down

:: Access database CLI
docker-compose exec postgres psql -U postgres -d air_quality_db

:: Restart
docker-compose restart postgres
```

### Pipeline Management

```cmd
cd D:\Work\NSAC\data-processing

:: Inspect NetCDF files
python inspect_netcdf.py

:: Run pipeline
python main_pipeline.py

:: Run with options
python main_pipeline.py --sample-rate 20

:: Check what's downloaded
dir downloads
```

### Checking Environment

```cmd
:: Check Python version
python --version

:: Check Docker version
docker --version
docker-compose --version

:: Check if database is running
docker ps

:: View .env file
type .env
```

---

## Tips for Windows Users

1. **Use Command Prompt (cmd.exe)** - More straightforward than PowerShell for this project

2. **File paths**: Use backslashes `\` or forward slashes `/` (both work in most cases)

3. **Copy/paste in cmd**: Right-click to paste (or enable Ctrl+V in cmd properties)

4. **Tab completion**: Press Tab to autocomplete file/folder names

5. **Clear screen**: `cls` command

6. **Stop running script**: Press `Ctrl + C`

7. **View command history**: Press Up/Down arrows

---

## Complete Setup Script (Copy/Paste All at Once)

Save this as `setup_windows.bat`:

```batch
@echo off
echo ========================================
echo   NASA Air Quality Database Setup
echo ========================================
echo.

:: Setup Database
cd database
if not exist .env copy .env.template .env
docker-compose up -d postgres
echo Waiting for database to start...
timeout /t 30 /nobreak
docker-compose logs postgres

:: Setup Data Pipeline
cd ..\data-processing
if not exist .env (
    echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/air_quality_db?schema=public" > .env
)
pip install -r requirements.txt
prisma generate
prisma db push

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Run: python main_pipeline.py
pause
```

Then just run:

```cmd
setup_windows.bat
```

---

**Ready to go!** Follow the commands above to set up your system on Windows. 🚀
