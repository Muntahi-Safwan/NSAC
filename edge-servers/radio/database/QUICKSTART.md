# 🚀 Quick Start - 5 Minutes to Running Database

Follow these steps to get your PostgreSQL database running with Docker.

## Prerequisites Check

✅ Docker Desktop installed and running  
✅ Located in project root directory

---

## 🏃 Let's Go!

### 1. Navigate to Database Folder

```bash
cd database
```

### 2. Create Your Config File

**Windows (Command Prompt or PowerShell):**

```cmd
copy .env.template .env
```

**macOS/Linux/Git Bash:**

```bash
cp .env.template .env
```

### 3. Start the Database

```bash
docker-compose up -d postgres
```

**Wait ~30 seconds for initialization...**

### 4. Verify It's Running

```bash
docker-compose ps
```

Should show `nsac_postgres` as `Up`

### 5. Check the Logs

```bash
docker-compose logs postgres
```

Look for: `✅ Database initialized successfully!`

---

## 🎯 Setup Data Pipeline

Now configure your Python pipeline to connect:

### 1. Go to Data Processing Directory

```bash
cd ../data-processing
```

### 2. Create Pipeline Config

**Windows PowerShell or Command Prompt:**

```bash
echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/air_quality_db?schema=public" > .env
```

**macOS/Linux or Windows Git Bash:**

```bash
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/air_quality_db?schema=public"' > .env
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Setup Prisma

```bash
prisma generate
prisma db push
```

### 5. Test Connection

```bash
docker-compose -f ../database/docker-compose.yml exec postgres psql -U postgres -d air_quality_db -c "\dt"
```

You should see the `air_quality_forecasts` table!

### 6. Run Your Pipeline

```bash
python main_pipeline.py
```

---

## ✅ Done!

Your database is now running and ready to collect air quality data!

**View data:**

```bash
docker-compose -f ../database/docker-compose.yml exec postgres psql -U postgres -d air_quality_db -c "SELECT COUNT(*) FROM air_quality_forecasts;"
```

**Stop database:**

```bash
cd ../database
docker-compose down
```

**Restart database:**

```bash
cd database
docker-compose up -d postgres
```

---

## 🆘 Something Wrong?

Check the full guide: [README.md](./README.md)

Common issues:

- **Port 5432 in use?** Change `POSTGRES_PORT` in `.env` to `5433`
- **Docker not running?** Start Docker Desktop
- **Can't connect?** Ensure container is running: `docker-compose ps`
