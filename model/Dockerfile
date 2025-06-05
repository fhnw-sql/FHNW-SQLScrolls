FROM python:3.12-slim

# Set working directory inside container
RUN mkdir -p /v1
WORKDIR /v1

# Copy model files from current folder (context is FHNW-SQL-Training-Game-API)
COPY ./model .
COPY ./tasks ./tasks

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port used by Uvicorn
EXPOSE 5001

# Run the app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5001", "--workers", "4"]
