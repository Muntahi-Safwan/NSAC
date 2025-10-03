#!/usr/bin/env python3
"""
TV Edge Server Service Management Script
Manages Docker services for the TV edge server
"""

import subprocess
import sys
import argparse
import os
from pathlib import Path


def run_command(command, check=True, capture_output=False):
    """Run a command and return the result"""
    print(f"🔧 Running: {' '.join(command)}")
    try:
        result = subprocess.run(
            command, 
            check=check, 
            capture_output=capture_output, 
            text=True
        )
        if capture_output:
            return result.stdout.strip()
        return result
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed with exit code {e.returncode}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        sys.exit(1)


def check_docker():
    """Check if Docker is installed and running"""
    try:
        run_command(["docker", "--version"], capture_output=True)
        run_command(["docker-compose", "--version"], capture_output=True)
        print("✅ Docker and Docker Compose are available")
        return True
    except subprocess.CalledProcessError:
        print("❌ Docker or Docker Compose not found. Please install them first.")
        sys.exit(1)


def check_env_file():
    """Check if .env file exists"""
    env_file = Path(".env")
    if not env_file.exists():
        print("⚠️ .env file not found. Creating from env.example...")
        if Path("env.example").exists():
            run_command(["cp", "env.example", ".env"])
            print("✅ Created .env file from env.example")
            print("📝 Please edit .env file with your configuration")
        else:
            print("❌ env.example file not found")
            sys.exit(1)
    else:
        print("✅ .env file found")


def build_services():
    """Build Docker images"""
    print("🏗️ Building Docker images...")
    run_command(["docker-compose", "build"])
    print("✅ Docker images built successfully")


def start_services(services=None):
    """Start Docker services"""
    command = ["docker-compose", "up", "-d"]
    if services:
        command.extend(services)
    
    print("🚀 Starting TV Edge Server services...")
    run_command(command)
    print("✅ Services started successfully")


def stop_services(services=None):
    """Stop Docker services"""
    command = ["docker-compose", "down"]
    if services:
        # For individual services, use stop instead of down
        command = ["docker-compose", "stop"] + services
    
    print("🛑 Stopping TV Edge Server services...")
    run_command(command)
    print("✅ Services stopped successfully")


def restart_services(services=None):
    """Restart Docker services"""
    stop_services(services)
    start_services(services)


def show_status():
    """Show status of Docker services"""
    print("📊 TV Edge Server Service Status:")
    run_command(["docker-compose", "ps"])


def show_logs(service=None, follow=False):
    """Show logs for services"""
    command = ["docker-compose", "logs"]
    if follow:
        command.append("-f")
    if service:
        command.append(service)
    
    print(f"📋 Showing logs for: {service or 'all services'}")
    run_command(command, check=False)


def cleanup():
    """Clean up Docker resources"""
    print("🧹 Cleaning up Docker resources...")
    run_command(["docker-compose", "down", "--volumes", "--remove-orphans"])
    print("✅ Cleanup completed")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Manage TV Edge Server Docker services")
    parser.add_argument("action", choices=[
        "build", "start", "stop", "restart", "status", "logs", "cleanup"
    ], help="Action to perform")
    parser.add_argument("--service", help="Specific service to target")
    parser.add_argument("--follow", "-f", action="store_true", help="Follow logs")
    
    args = parser.parse_args()
    
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Check prerequisites
    check_docker()
    
    # Perform action
    if args.action == "build":
        check_env_file()
        build_services()
    
    elif args.action == "start":
        check_env_file()
        start_services(args.service.split(",") if args.service else None)
    
    elif args.action == "stop":
        stop_services(args.service.split(",") if args.service else None)
    
    elif args.action == "restart":
        restart_services(args.service.split(",") if args.service else None)
    
    elif args.action == "status":
        show_status()
    
    elif args.action == "logs":
        show_logs(args.service, args.follow)
    
    elif args.action == "cleanup":
        cleanup()


if __name__ == "__main__":
    main()

