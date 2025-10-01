#!/usr/bin/env python3
"""
Air Quality Services Management Script
Manages Docker services for the air quality data collection system
"""

import subprocess
import sys
import time
from pathlib import Path


def run_command(command, check=True):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            capture_output=True, 
            text=True, 
            check=check
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.CalledProcessError as e:
        return False, e.stdout, e.stderr


def start_scheduler():
    """Start the air quality scheduler service"""
    print("🚀 Starting Air Quality Scheduler...")
    success, stdout, stderr = run_command(
        "docker-compose up -d air-quality-scheduler"
    )
    
    if success:
        print("✅ Air Quality Scheduler started successfully")
        print("📊 Service will run collections every hour")
    else:
        print("❌ Failed to start scheduler:")
        print(stderr)
    
    return success


def stop_scheduler():
    """Stop the air quality scheduler service"""
    print("🛑 Stopping Air Quality Scheduler...")
    success, stdout, stderr = run_command(
        "docker-compose stop air-quality-scheduler"
    )
    
    if success:
        print("✅ Air Quality Scheduler stopped")
    else:
        print("❌ Failed to stop scheduler:")
        print(stderr)
    
    return success


def start_prisma_studio():
    """Start Prisma Studio"""
    print("🎨 Starting Prisma Studio...")
    success, stdout, stderr = run_command(
        "docker-compose --profile tools up -d prisma-studio"
    )
    
    if success:
        print("✅ Prisma Studio started successfully")
        print("🌐 Access at: http://localhost:5555")
    else:
        print("❌ Failed to start Prisma Studio:")
        print(stderr)
    
    return success


def stop_prisma_studio():
    """Stop Prisma Studio"""
    print("🛑 Stopping Prisma Studio...")
    success, stdout, stderr = run_command(
        "docker-compose --profile tools stop prisma-studio"
    )
    
    if success:
        print("✅ Prisma Studio stopped")
    else:
        print("❌ Failed to stop Prisma Studio:")
        print(stderr)
    
    return success


def show_status():
    """Show status of all services"""
    print("📊 Air Quality Services Status:")
    print("=" * 40)
    
    # Check scheduler
    success, stdout, stderr = run_command(
        "docker-compose ps air-quality-scheduler", check=False
    )
    if "Up" in stdout:
        print("🟢 Air Quality Scheduler: Running")
    else:
        print("🔴 Air Quality Scheduler: Stopped")
    
    # Check Prisma Studio
    success, stdout, stderr = run_command(
        "docker-compose ps prisma-studio", check=False
    )
    if "Up" in stdout:
        print("🟢 Prisma Studio: Running (http://localhost:5555)")
    else:
        print("🔴 Prisma Studio: Stopped")
    
    # Check PostgreSQL
    success, stdout, stderr = run_command(
        "docker-compose ps postgres", check=False
    )
    if "Up" in stdout:
        print("🟢 PostgreSQL: Running")
    else:
        print("🔴 PostgreSQL: Stopped")


def show_logs():
    """Show recent logs from the scheduler"""
    print("📋 Recent Air Quality Scheduler Logs:")
    print("=" * 40)
    
    success, stdout, stderr = run_command(
        "docker-compose logs --tail=20 air-quality-scheduler"
    )
    
    if success:
        print(stdout)
    else:
        print("❌ Failed to get logs:")
        print(stderr)


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Air Quality Services Management")
        print("=" * 40)
        print("Usage: python manage_services.py <command>")
        print()
        print("Commands:")
        print("  start-scheduler    Start the hourly data collection scheduler")
        print("  stop-scheduler     Stop the scheduler")
        print("  start-studio       Start Prisma Studio")
        print("  stop-studio        Stop Prisma Studio")
        print("  status             Show status of all services")
        print("  logs               Show recent scheduler logs")
        print("  start-all          Start scheduler and Prisma Studio")
        print("  stop-all           Stop all services")
        return
    
    command = sys.argv[1].lower()
    
    if command == "start-scheduler":
        start_scheduler()
    elif command == "stop-scheduler":
        stop_scheduler()
    elif command == "start-studio":
        start_prisma_studio()
    elif command == "stop-studio":
        stop_prisma_studio()
    elif command == "status":
        show_status()
    elif command == "logs":
        show_logs()
    elif command == "start-all":
        start_scheduler()
        time.sleep(2)
        start_prisma_studio()
    elif command == "stop-all":
        stop_scheduler()
        stop_prisma_studio()
    else:
        print(f"❌ Unknown command: {command}")
        print("Run without arguments to see available commands")


if __name__ == "__main__":
    main()

