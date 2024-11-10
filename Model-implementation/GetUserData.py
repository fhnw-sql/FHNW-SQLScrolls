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
        return {"success": True, "data": history}
    else:
        return {"success": False, "error": f"User '{username}' not found."}


if __name__ == "__main__":
    try:
        username = sys.argv[1]  
        result = get_user_data(username)
        print(json.dumps(result))  
        if not result["success"]:
            sys.exit(1)  
    except Exception as e:
        error_message = {"success": False, "error": str(e)}
        print(json.dumps(error_message))
        sys.exit(1)