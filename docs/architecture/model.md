# 🧠 Backend: Python Recommendation Model (Machine Learning)

**[Dockerfile](../../backend/model/Dockerfile)**

## 📂 Component Folder Structure

```
backend/model/
├── app.py                              # Main application entry point for the ML service
├── ClassifyTasks.py                    # Task classification and categorization logic
├── Dockerfile                          # Docker container configuration for ML service
├── GetUserData.py                      # User data retrieval and processing
├── RecommendTask.py                    # Task recommendation algorithm and logic
├── requirements.txt                    # Python dependencies for the ML service
├── student_data_average_generation.py  # Student performance data generation and analysis
├── task_data_generation.py            # Task-related data generation utilities
└── TrainModel.py                      # ML model training and configuration
```

--- 

## 🚗 Runtime Environment

- Python 3.12 (slim)
- Uvicorn ASGI Server
    - Port: 5001
    - Workers: 4
    - Host: 0.0.0.0

---

## ⚒️ Core Components

```
├── app.py                # FastAPI/ASGI application entry point
├── ClassifyTasks.py      # Task classification engine
├── GetUserData.py        # User data processing
├── RecommendTask.py      # Recommendation system
├── TrainModel.py         # ML model training
└── Data Generation
  ├── student_data_average_generation.py
  └── task_data_generation.py
```

---

## 🗃️️ Data Sources

- MongoDB Connection: Shared with main API (stg-mongo:27017)
- Tasks Data: Mounted from frontend/tasks

--- 

## 📦 Dependencies

**Managing dependencies:**

- To update or add packages, edit `requirements.txt` and rebuild the container.
- Packages are automatically installed during Docker container build using `pip`.

**Key Packages:**

- `fastapi` – Fast, modern web framework for building APIs in Python.
- `uvicorn` – ASGI server for running FastAPI apps.
- `scikit-learn` – Machine learning algorithms and tools.
- `pymongo` – MongoDB driver for Python.
- `flasgger` – API documentation for Flask/FastAPI (Swagger UI).
- `gunicorn` – Production WSGI server (not required for FastAPI+Uvicorn, but may be used for historical reasons).
- `numpy`, `pandas` – Data analysis and manipulation.
- `requests` – HTTP library for Python.
- `MarkupSafe` – String handling for web applications.
