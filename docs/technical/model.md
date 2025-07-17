# 🧠 Backend: Python Recommendation Model (FastAPI)

**[Dockerfile](backend/model/Dockerfile)**

## 🧰 Python Dependencies

```
MarkupSafe==2.1.3
flasgger==0.9.7.1
pymongo==4.7.2
gunicorn==22.0.0
scikit-learn==1.4.2 
fastapi==0.114.0
uvicorn==0.30.6
numpy==2.1.1
pandas==2.2.2
requests==2.26.0
```

## 🚀 Serving the Model

Start locally with:

```bash
    uvicorn app:app --host 0.0.0.0 --port 8000
```

Or using Gunicorn:

```bash
    gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app
```
