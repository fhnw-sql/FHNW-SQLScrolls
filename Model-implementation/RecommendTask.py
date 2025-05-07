import pickle
import numpy as np
import requests
from sklearn.metrics.pairwise import cosine_similarity
import pymongo
import sys
import pandas as pd
import random
import datetime
from datetime import datetime
import os

with open('recommendation_model.pkl', 'rb') as file:
    model_data = pickle.load(file)

def build_user_profile(task_ids, correctness, time_taken, task_vectors, task_ids_list):

    completed_mask = np.isin(task_ids_list, task_ids)
    completed_vectors = task_vectors[completed_mask]

    if len(completed_vectors) != len(correctness):
        raise ValueError(f"Length mismatch: {len(completed_vectors)} vectors, {len(correctness)} correctness entries")
    weights = np.array(correctness) + 1 / (np.array(time_taken) + 1)
    user_profile_vector = np.average(completed_vectors, axis=0, weights=weights)

    return user_profile_vector

def extract_user_history(user_history):
    task_ids = []
    correctness = []
    time_taken = []
    
    if not user_history:
        return task_ids, correctness, time_taken
    
    for task_id, attempts in user_history.items():
        last_attempt = attempts[-1] 
        numeric_task_id = int(task_id.split('-')[1])
        task_ids.append(numeric_task_id) 
        correctness.append(1 if last_attempt['correct'] else 0)
        time_taken = 0
        for attempt in attempts:
            if 'startTime' in attempt and 'endTime' in attempt:
                if isinstance(attempt['startTime'], str) and isinstance(attempt['endTime'], str):
                    start_time = datetime.fromisoformat(attempt['startTime'].replace('Z', '+00:00'))
                    end_time = datetime.fromisoformat(attempt['endTime'].replace('Z', '+00:00'))
                    time_taken += (end_time - start_time).total_seconds()
                elif isinstance(attempt['startTime'], int) and isinstance(attempt['endTime'], int):
                    start_time = attempt['startTime']
                    end_time = attempt['endTime']
                    time_taken += (end_time - start_time)
            else:
                random_time = random.randint(60, 300)
                time_taken += random_time
    
    
    return task_ids, correctness, time_taken

def get_user_data(username):
    hostname = os.getenv("HOSTNAME")
    if not hostname:
        print("HOSTNAME environment variable is not set.")
        return None
    
    api_url = f"http://{hostname}:5001/user-data"
    
    try:
        response = requests.get(api_url, params={"userid": username})
        response.raise_for_status()  
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error calling the API: {e}")
        return None
    
def recommend_next_task_content_based(user_profile_vector, task_vectors, task_ids_list, completed_tasks):
    try:
        not_completed_mask = ~np.isin(task_ids_list, completed_tasks)
        filtered_task_vectors = task_vectors[not_completed_mask]
        filtered_task_ids = task_ids_list[not_completed_mask]

        similarities = cosine_similarity([user_profile_vector], filtered_task_vectors)[0]

        most_similar_index = np.argmax(similarities)
        next_task_id = filtered_task_ids.iloc[most_similar_index] if isinstance(filtered_task_ids, pd.Series) else filtered_task_ids[most_similar_index]
        
        return next_task_id
    except KeyError as e:
        print(f"KeyError encountered: {e}")
        print(f"Completed Tasks: {completed_tasks}")
        raise e
    except IndexError as e:
        print(f"IndexError encountered: {e}")
        print("Filtered task IDs may be empty or incorrectly accessed.")
        raise e

def format_task_number(next_task):
    formatted_number = f"task-{next_task:03}"
    print(formatted_number)
    return formatted_number

def validate_task_completion_threshold(user_history):
    required_tasks = ["task-003", "task-005", "task-042"]
    for task_id in required_tasks:
        if task_id not in user_history or not user_history[task_id]:
            return task_id
    return True

if __name__ == "__main__":
    task_vectors = model_data['task_vectors']
    task_ids_list = model_data['task_ids_list']
    user_history_example = get_user_data(sys.argv[1])
    task_completion_threshold = validate_task_completion_threshold(user_history_example)
    if task_completion_threshold == True:
        completed_tasks, correctness, time_taken = extract_user_history(user_history_example)
        user_profile_vector = build_user_profile(completed_tasks, correctness, time_taken, task_vectors, task_ids_list)
        next_task = recommend_next_task_content_based(user_profile_vector, task_vectors, task_ids_list, completed_tasks)
        format_task_number(next_task)
    else:
        print(task_completion_threshold)