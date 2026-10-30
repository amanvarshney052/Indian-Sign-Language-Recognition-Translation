"""
ISL Vision AI - Server Starter Script
Runs the FastAPI web server hosting the real-time Indian Sign Language recognition engine and modern web frontend.
"""

import argparse
import sys
import uvicorn

def main():
    parser = argparse.ArgumentParser(description="Run the ISL Vision AI Application Server.")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host address (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8000, help="Port number (default: 8000)")
    parser.add_argument("--reload", action="store_true", help="Enable automatic reload on file changes")
    args = parser.parse_args()

    print("=" * 70)
    print(" Indian Sign Language (ISL) Recognition - Web Application")
    print(f" Web Interface: http://{args.host}:{args.port}")
    print(f" REST API Docs: http://{args.host}:{args.port}/docs")
    print(f" Real-time WebSocket: ws://{args.host}:{args.port}/ws/predict")
    print("=" * 70)

    uvicorn.run(
        "backend.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level="info"
    )

if __name__ == "__main__":
    main()
