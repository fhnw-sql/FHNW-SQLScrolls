FROM python:3.10-slim

RUN mkdir -p /v1
WORKDIR /v1

COPY ./model .
COPY ./tasks ./tasks

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5001

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5001", "--workers", "4"]