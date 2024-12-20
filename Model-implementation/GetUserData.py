import pymongo
import sys
import json
import os

def get_user_data(username):
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        raise EnvironmentError("The MONGODB_URI environment variable is not set.")

    client = pymongo.MongoClient(mongo_uri)
    db = client["stg-api"]  
    collection = db["users"]  
    user_document = collection.find_one({"username": username})

    if user_document:
        history = user_document.get("history", {})
        user_data = history
        return user_data 
    else:
        return None 

if __name__ == "__main__":
    try:
        username = sys.argv[1]  
        result = get_user_data(username)
        if result:  
            print(json.dumps(result))  
        else:
            error_message = {"error": f"User '{username}' not found."}
            print(json.dumps(error_message))
            sys.exit(1)  
    except Exception as e:
        error_message = {"error": str(e)}
        print(json.dumps(error_message))
        sys.exit(1)
