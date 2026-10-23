# MockMate AI - Backend Dockerfile
# Python 3.11 with FFmpeg for audio processing and Faster-Whisper

FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies (ffmpeg is essential for whisper audio decoding)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Ensure audio uploads directory exists
RUN mkdir -p uploads/audio

# Expose server port
EXPOSE 8000

# Start FastAPI server with Uvicorn (configured for Render & container platforms)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
