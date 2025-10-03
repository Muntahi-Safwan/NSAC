# 📖 Docker Database Setup Process - Step by Step Guide

This guide walks you through the entire process of setting up your PostgreSQL database with Docker.

## 🎯 What We're Building

A PostgreSQL database with:

- **PostGIS** for geospatial queries
- **TimescaleDB** for time-series optimization
- **Docker** for cross-platform compatibility
- **Automatic initialization** on first run

## 📂 Project Structure

```
NSAC/
├── database/                          # ← You are here
│   ├── .env.template                  # Template for configuration
│   ├── docker-compose.yml             # Docker services definition
│   ├── init-scripts/                  # Auto-run on first container start
│   │   └── 01-init-extensions.sql    # Enables PostGIS & TimescaleDB
│   ├── QUICKSTART.md                  # Fast 5-minute guide
│   ├── README.md                      # Complete documentation
│   └── SETUP_PROCESS.md              # This file
│
├── data-processing/                   # Pipeline code
│   ├── schema.prisma                  # Database schema definition
│   ├── setup_database.sql            # Manual setup (optional)
│   ├── main_pipeline.py              # Data collection script
│   └── requirements.txt              # Python dependencies
│
├── frontend/                          # React app
└── backend/                           # Node.js API
```

---

## 🚶 Step-by-Step Walkthrough

### Phase 1: Install Docker Desktop

#### Windows Users

1. **Download Docker Desktop**

   - Visit: https://www.docker.com/products/docker-desktop
   - Click "Download for Windows"

2. **Install Docker Desktop**

   - Run the installer
   - ✅ Enable WSL 2 when prompted
   - Restart your computer

3. **Start Docker Desktop**

   - Open Docker Desktop from Start Menu
   - Wait for the green "running" status
   - You'll see a whale icon in your system tray

4. **Verify Installation**
   ```bash
   docker --version
   docker-compose --version
   ```
   You should see version numbers (not errors).

#### macOS Users

1. Download from https://www.docker.com/products/docker-desktop
2. Drag to Applications folder
3. Open Docker Desktop
4. Verify with `docker --version`

#### Linux Users

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker $USER
# Log out and back in

# Verify
docker --version
```

---

### Phase 2: Configure Database

1. **Open Terminal/Command Prompt**

   ```bash
   cd D:\Work\NSAC
   cd database
   ```

2. **Create Configuration File**

   **Windows (Command Prompt):**

   ```bash
   copy .env.template .env
   ```

   **Windows (PowerShell):**

   ```powershell
   Copy-Item .env.template .env
   ```

   **macOS/Linux:**

   ```bash
   cp .env.template .env
   ```

3. **Review Configuration (Optional)**

   Open `.env` in any text editor (Notepad, VS Code, etc.)

   Default values:

   ```env
   POSTGRES_USER=postgres          # Username
   POSTGRES_PASSWORD=postgres      # ⚠️ Change for production
   POSTGRES_DB=air_quality_db     # Database name
   POSTGRES_PORT=5432             # Port (change if 5432 is busy)
   ```

   **For now, you can use defaults!**

---

### Phase 3: Start the Database

1. **Ensure you're in the database directory**

   ```bash
   pwd         # macOS/Linux - should show /path/to/NSAC/database
   cd          # Windows - should show D:\Work\NSAC\database
   ```

2. **Start PostgreSQL Container**

   ```bash
   docker-compose up -d postgres
   ```

   **What happens:**

   - Downloads TimescaleDB image (~300 MB, first time only)
   - Creates a container named `nsac_postgres`
   - Runs initialization scripts automatically
   - Starts database in background (detached mode)

3. **Wait for Initialization** (~30 seconds)

   First time setup takes a bit longer as it:

   - Initializes the database
   - Enables PostGIS extension
   - Enables TimescaleDB extension
   - Creates helper functions

4. **Verify Container is Running**

   ```bash
   docker-compose ps
   ```

   You should see:

   ```
   NAME            STATE       PORTS
   nsac_postgres   Up          0.0.0.0:5432->5432/tcp
   ```

5. **Check Initialization Logs**

   ```bash
   docker-compose logs postgres
   ```

   Look for these success messages:

   ```
   ✅ Database initialized successfully!
   📦 Installed extensions:
     - PostGIS (spatial queries)
     - TimescaleDB (time-series optimization)
   ```

---

### Phase 4: Connect Data Pipeline

Now configure your Python pipeline to use this database.

1. **Navigate to Data Processing Directory**

   ```bash
   cd ../data-processing
   ```

2. **Create Pipeline Configuration**

   Create a file named `.env` with:

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/air_quality_db?schema=public"
   ```

   **Quick commands:**

   **Windows (Command Prompt):**

   ```bash
   echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/air_quality_db?schema=public" > .env
   ```

   **macOS/Linux/Git Bash:**

   ```bash
   echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/air_quality_db?schema=public"' > .env
   ```

   **Or manually:** Create `.env` file and paste the DATABASE_URL line.

3. **Install Python Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

   This installs:

   - `prisma` - Database ORM
   - `netCDF4` - For reading NASA data files
   - `requests` - For downloading data
   - Other utilities

4. **Generate Prisma Client**

   ```bash
   prisma generate
   ```

   This creates Python code to interact with your database based on `schema.prisma`.

5. **Push Database Schema**

   ```bash
   prisma db push
   ```

   This creates the `air_quality_forecasts` table in your database.

---

### Phase 5: Verify Everything Works

1. **Check Table Was Created**

   ```bash
   docker-compose -f ../database/docker-compose.yml exec postgres psql -U postgres -d air_quality_db -c "\dt"
   ```

   You should see:

   ```
    Schema |         Name              | Type  |  Owner
   --------+---------------------------+-------+----------
    public | air_quality_forecasts     | table | postgres
   ```

2. **Check Extensions**

   ```bash
   docker-compose -f ../database/docker-compose.yml exec postgres psql -U postgres -d air_quality_db -c "\dx"
   ```

   Should list PostGIS and TimescaleDB.

3. **Test Pipeline**

   ```bash
   python main_pipeline.py --sample-rate 20
   ```

   This will:

   - Download a NASA air quality data file
   - Process the data
   - Insert into your database

   Wait for completion (may take a few minutes).

4. **Verify Data in Database**

   ```bash
   docker-compose -f ../database/docker-compose.yml exec postgres psql -U postgres -d air_quality_db -c "SELECT COUNT(*) FROM air_quality_forecasts;"
   ```

   You should see a count of records!

---

## 🎨 Optional: Install pgAdmin (Visual Database Tool)

pgAdmin provides a web-based GUI for managing your database.

1. **Start pgAdmin**

   ```bash
   cd ../database
   docker-compose --profile tools up -d pgadmin
   ```

2. **Access pgAdmin**

   - Open browser: http://localhost:5050
   - Login:
     - Email: `admin@nsac.local`
     - Password: `admin`

3. **Add Server Connection**

   - Right-click **Servers** → **Register** → **Server**
   - **General tab:** Name: `NSAC Air Quality DB`
   - **Connection tab:**
     - Host: `postgres`
     - Port: `5432`
     - Database: `air_quality_db`
     - Username: `postgres`
     - Password: `postgres`
   - Click **Save**

4. **Browse Your Data**
   - Navigate: Servers → NSAC Air Quality DB → Databases → air_quality_db → Schemas → public → Tables → air_quality_forecasts
   - Right-click table → View/Edit Data → First 100 Rows

---

## 📋 Daily Usage Commands

### Starting Your Work Session

```bash
# 1. Ensure Docker Desktop is running

# 2. Start database (if not already running)
cd database
docker-compose up -d postgres

# 3. Run your pipeline
cd ../data-processing
python main_pipeline.py
```

### Checking Database

```bash
# View logs
cd database
docker-compose logs -f postgres

# Check status
docker-compose ps

# Access database CLI
docker-compose exec postgres psql -U postgres -d air_quality_db
```

### Stopping for the Day

```bash
# Stop database (data is preserved)
cd database
docker-compose down

# Docker Desktop can keep running or you can quit it
```

---

## 🔧 Troubleshooting Guide

### Problem: Docker command not found

**Solution:**

- Ensure Docker Desktop is installed
- Windows: Check system tray for Docker whale icon
- Restart Docker Desktop
- Restart terminal/command prompt

### Problem: Port 5432 already in use

**Cause:** Another PostgreSQL instance is running.

**Solution A - Stop other PostgreSQL:**

```bash
# Windows (Services)
services.msc → Find PostgreSQL → Stop

# macOS
brew services stop postgresql

# Linux
sudo systemctl stop postgresql
```

**Solution B - Use different port:**

1. Edit `database/.env`:
   ```env
   POSTGRES_PORT=5433
   ```
2. Update `data-processing/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/air_quality_db?schema=public"
   ```
3. Restart containers:
   ```bash
   cd database
   docker-compose down
   docker-compose up -d postgres
   ```

### Problem: Container starts but can't connect

**Solution:**

```bash
# Check container is healthy
docker-compose ps

# Wait a bit (may still be initializing)
sleep 10

# Test connection
docker-compose exec postgres pg_isready -U postgres

# If still failing, check logs
docker-compose logs postgres
```

### Problem: Prisma can't connect

**Checklist:**

- [ ] Database container is running: `docker-compose ps`
- [ ] `.env` file exists in `data-processing/`
- [ ] `DATABASE_URL` uses `localhost` (not `postgres`)
- [ ] Port matches (default 5432)
- [ ] Credentials match `database/.env`

**Test connection manually:**

```bash
docker-compose -f ../database/docker-compose.yml exec postgres psql -U postgres -d air_quality_db -c "SELECT 1;"
```

### Problem: Extensions not found

**Solution:**

```bash
# Manually enable extensions
docker-compose exec postgres psql -U postgres -d air_quality_db -c "CREATE EXTENSION IF NOT EXISTS postgis; CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"
```

### Problem: Need to start fresh

**Complete reset:**

```bash
cd database

# Stop and remove everything including data
docker-compose down -v

# Remove configuration
rm .env  # or 'del .env' on Windows Command Prompt

# Start over from Phase 2
cp .env.template .env
docker-compose up -d postgres

# Wait for init, then:
cd ../data-processing
prisma db push
```

---

## 👥 Team Workflow

### For New Team Members

1. **Clone repository**

   ```bash
   git clone https://github.com/Muntahi-Safwan/NSAC.git
   cd NSAC
   ```

2. **Install Docker Desktop** (see Phase 1)

3. **Setup database**

   ```bash
   cd database
   cp .env.template .env
   docker-compose up -d postgres
   ```

4. **Setup pipeline**

   ```bash
   cd ../data-processing
   echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/air_quality_db?schema=public"' > .env
   pip install -r requirements.txt
   prisma generate
   prisma db push
   ```

5. **Test**
   ```bash
   python main_pipeline.py
   ```

### What to Commit to Git

**✅ DO commit:**

- `database/docker-compose.yml`
- `database/init-scripts/*.sql`
- `database/.env.template`
- `database/*.md` (documentation)
- `data-processing/schema.prisma`
- `data-processing/requirements.txt`

**❌ DON'T commit:**

- `database/.env` (has credentials)
- `data-processing/.env` (has credentials)
- `data-processing/downloads/*.nc4` (large data files)
- `*.log` (log files)

---

## 🎓 Understanding the Setup

### What is Docker Compose?

Docker Compose defines and runs multi-container applications. Our `docker-compose.yml` defines:

- **postgres** service: The database
- **pgadmin** service: Visual management tool (optional)
- **volumes**: Persistent data storage
- **networks**: Container communication

### What are Init Scripts?

Files in `init-scripts/` run automatically when the container is **first created**:

- `01-init-extensions.sql` enables PostGIS and TimescaleDB
- Scripts run in alphabetical order
- Only run once (not on container restart)

### What is Prisma?

Prisma is an ORM (Object-Relational Mapping) tool:

- `schema.prisma` defines your database structure
- `prisma generate` creates Python code to interact with DB
- `prisma db push` creates/updates tables from schema
- Type-safe database queries in Python

### Data Flow

```
NASA Server → main_pipeline.py → PostgreSQL → Backend API → Frontend
              (downloads)       (stores)      (queries)    (displays)
```

---

## 📚 Next Steps

1. ✅ Database running
2. ✅ Pipeline configured
3. ✅ Data collecting
4. 🔜 Build backend API (Node.js + Prisma)
5. 🔜 Connect frontend to API
6. 🔜 Deploy to production

---

## 🆘 Still Need Help?

1. **Check logs:** `docker-compose logs postgres`
2. **Review full docs:** [README.md](./README.md)
3. **Quick reference:** [QUICKSTART.md](./QUICKSTART.md)
4. **Ask team members** - share error messages and logs

---

**You're all set! Happy coding! 🚀**

