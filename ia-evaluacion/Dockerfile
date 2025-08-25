FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN pip install --no-cache-dir fastapi uvicorn
COPY main.py .
EXPOSE 3200
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3200"]
