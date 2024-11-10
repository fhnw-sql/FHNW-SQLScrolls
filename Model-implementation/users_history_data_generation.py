import json
from pymongo import MongoClient
import os

mongo_uri = os.getenv("MONGODB_URI")
if not mongo_uri:
    raise EnvironmentError("The MONGODB_URI environment variable is not set.")

client = MongoClient(mongo_uri)
db = client['stg-api']
collection = db['users']

data = list(collection.find({}))

users_data = []

for entry in data:
    user_entry = {
        "username": entry.get('username'),
        "history": entry.get('history', {}) 
    }
    users_data.append(user_entry)

users_data_sorted = sorted(users_data, key=lambda x: x['username'])

current_directory = os.path.dirname(os.path.abspath(__file__))
output_file_path = os.path.join(current_directory, 'users_history.json') 

with open(output_file_path, 'w') as json_file:
    json.dump(users_data_sorted, json_file, indent=4)