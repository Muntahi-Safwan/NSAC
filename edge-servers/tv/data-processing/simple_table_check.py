#!/usr/bin/env python3
"""
Simple table check script
"""
import asyncio
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()
    
    try:
        tables = await db.query_raw("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")
        print("Tables in database:")
        for t in tables:
            print(f"  - {t['table_name']}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())


