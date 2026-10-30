# ==========================================
# Stage 1: Build Frontend (Vite + React)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# Build production bundle into frontend/dist
RUN npm run build

# ==========================================
# Stage 2: Python Backend & Serving
# ==========================================
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required for OpenCV and MediaPipe
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt ./
# Use opencv-python-headless to avoid GUI/X11 requirements on server
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir opencv-python-headless

# Copy backend code, models, and preprocessed data
COPY backend/ ./backend/
COPY models/ ./models/
COPY config.py run_server.py ./
COPY preprocessing/ ./preprocessing/

# Copy built frontend from Stage 1 into /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port (default 8000)
ENV PORT=8000
EXPOSE 8000

# Start server using Uvicorn
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]