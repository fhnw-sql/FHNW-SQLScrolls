import os
import subprocess

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, PlainTextResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.get("/")
async def redirect_to_api_docs():
    """
    Redirects to API documentation
    """
    return RedirectResponse(url="/docs")


@app.get("/user-data")
async def get_user_data(userid: str):
    """
    Retrieves user data based on userID and returns the raw output of the script
    """
    script_path = os.path.join(BASE_DIR, 'GetUserData.py')
    result = subprocess.run(['python', script_path, userid], capture_output=True, text=True)
    print(result.stdout)
    
    if result.returncode == 0:
        return PlainTextResponse(content=result.stdout.strip())
    else:
        raise HTTPException(status_code=500, detail=result.stderr)


@app.get("/recommend-task")
async def recommend_task(userID: str):
    """
    Recommends a task based on userID
    """
    script_path = os.path.join(BASE_DIR, 'RecommendTask.py')
    result = subprocess.run(['python', script_path, userID], capture_output=True, text=True)
    
    if result.returncode == 0:
        output = result.stdout.strip()

        return PlainTextResponse(content=output)
    else:
        raise HTTPException(status_code=500, detail=result.stderr)
    

@app.patch("/classify-tasks")
async def classify_tasks():
    """
    Classifies loaded tasks with category and difficulty
    """
    try:
        script_path = os.path.join(BASE_DIR, 'ClassifyTasks.py')
        result = subprocess.run(['python', script_path], capture_output=True, text=True)
        if result.returncode == 0:
            return {"message": "Tasks classified successfully"}
        else:
            raise HTTPException(status_code=500, detail=f"Error classifying tasks: {result.stderr}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/train-model")
async def train_model():
    """
    Trains the ML model
    """
    try:
        script_path = os.path.join(BASE_DIR, 'TrainModel.py')
        result = subprocess.run(['python', script_path], capture_output=True, text=True)
        if result.returncode == 0:
            return {"message": "Model trained successfully"}
        else:
            raise HTTPException(status_code=500, detail=f"Error training the model: {result.stderr}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.on_event("startup")
async def startup_event():
    """
    Runs classify_tasks when the app starts.
    """
    try:
        await classify_tasks()
        await train_model()
    except HTTPException as e:
        print(f"Error classifying tasks at startup: {e.detail}")