import pandas as pd
from collections import defaultdict
from pymongo import MongoClient
import os
import random
from datetime import datetime

mongo_uri = os.getenv("MONGODB_URI")
if not mongo_uri:
    raise EnvironmentError("The MONGODB_URI environment variable is not set.")

client = MongoClient(mongo_uri)
db = client['stg-api']
collection = db['users']

data = list(collection.find({}))

students = defaultdict(lambda: defaultdict(lambda: {'Average Time': 0, 'Attempts': 0}))

for entry in data:
    student_id = entry['username']
    task_history = entry.get('history', {}) 

    if 'history' in entry:
        task_history = entry['history']

        for task_id, attempts in task_history.items():
            total_time = 0
            for attempt in attempts:
                if 'startTime' in attempt and 'endTime' in attempt:
                    if isinstance(attempt['startTime'], str) and isinstance(attempt['endTime'], str):
                        start_time = datetime.fromisoformat(attempt['startTime'].replace('Z', '+00:00'))
                        end_time = datetime.fromisoformat(attempt['endTime'].replace('Z', '+00:00'))
                        total_time += (end_time - start_time).total_seconds()
                    elif isinstance(attempt['startTime'], int) and isinstance(attempt['endTime'], int):
                        start_time = attempt['startTime']
                        end_time = attempt['endTime']
                        total_time += (end_time - start_time)
                else:
                    random_time = random.randint(60, 300)
                    total_time += random_time
            
            attempts_count = len(task_history[task_id])
            average_time = total_time / attempts_count if attempts_count > 0 else 0
            
            students[student_id][task_id]['Average Time'] = average_time
            students[student_id][task_id]['Attempts'] = attempts_count
        else:
            continue

tasks = [f'task-{i:03d}' for i in range(180)]
rows = []

for student_id, task_data in students.items():
    attempt_row = [f'{student_id} Attempts'] + [task_data[task]['Attempts'] if task in task_data else 0 for task in tasks]
    time_row = [f'{student_id} Average Time'] + [task_data[task]['Average Time'] if task in task_data else 0.0 for task in tasks]
    rows.append(attempt_row)
    rows.append(time_row)

df = pd.DataFrame(rows, columns=['Student ID'] + tasks)

script_directory = os.path.dirname(os.path.abspath(__file__))
output_file = os.path.join(script_directory, 'student_task_summary_expanded.csv')
df.to_csv(output_file, index=False)