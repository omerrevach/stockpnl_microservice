FROM python:3.9-slim

# Set a non-root user
RUN adduser --disabled-password --gecos '' appuser

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

RUN chown -R appuser:appuser /app

USER appuser
EXPOSE 5000
CMD ["python", "app.py"]





# FROM python:3.9
# WORKDIR /app
# COPY . .
# RUN pip install -r requirements.txt
# CMD ["python", "app.py"]
