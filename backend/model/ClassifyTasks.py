import os
import re

def extract_task_info(content):
    id_pattern = re.compile(r'id:\s*(\w+-\d+)')
    name_pattern = re.compile(r'name:\s*(.+)')
    answer_pattern = re.compile(r'ANSWER\s*{\s*([\s\S]*?)\s*}')

    task_id = id_pattern.search(content).group(1)
    task_name = name_pattern.search(content).group(1)
    task_answer = answer_pattern.search(content).group(1).strip()

    task_info = {
        "id": task_id,
        "name": task_name,
        "answer": task_answer
    }
    return task_info

def extract_sql_keywords(answer):
    keywords = set(re.findall(r'\b\w+\b', answer.upper()))
    return ', '.join(sorted(keywords))

def assign_category(keywords):
    categories_dict = {
        "Data Querying and Retrieval": ["SELECT", "FROM", "WHERE", "DISTINCT", "GROUP", "HAVING", "ORDER", "BY", "ASC", "DESC",
                                        "LIMIT", "JOIN", "INNER", "LEFT", "RIGHT", "OUTER", "ON", "AS", "*", "GROUP BY", "ORDER BY", "LEFT_OUTER_JOIN", "INNER_JOIN"],
        "Data Manipulation": ["INSERT", "UPDATE", "UPDATE SET", "DELETE", "INTO", "VALUES", "SET", "CARTESIAN_PRODUCT", "NESTED_QUERY"],
        "Aggregation": ["COUNT", "SUM", "AVG", "MIN", "MAX", "ROUND", "LENGTH", "SUBSTR", "GROUP_CONCAT", "COUNT(*)"],
        "Filtering": ["WHERE", "BETWEEN", "LIKE", "IN", "IS", "NOT", "NULL", "AND", "OR", "<", "=", ">"],
        "Schema Management": ["CREATE", "ALTER", "ADD", "DROP", "TABLE", "VIEW", "INDEX", "PRIMARY", "KEY", "FOREIGN",
                              "REFERENCES", "UNIQUE", "CHECK", "DEFAULT", "CREATE_TABLE", "ALTER_TABLE", "PRIMARY_KEY", "SET", "CREATE VIEW", "CREATE_VIEW"],
        "Json Functions": ["JSON_ARRAY", "JSON_ARRAY_LENGTH", "JSON_EXTRACT", "JSON_GROUP_OBJECT", "JSON_INSERT", "JSON_OBJECT", "JSON_REMOVE", "JSON_SET", "JSON_TREE", "JSON_TYPE", "->>", "JSON", "JSON_VALID", "JSON_EACH", "JSON_GROUP_ARRAY"],
        "Set Operations": ["UNION", "INTERSECT"]
    }
    
    keywords_set = set(keywords.split(', '))
    assigned_categories = set()

    for keyword in keywords_set:
        for category, words in categories_dict.items():
            if keyword in words:
                assigned_categories.add(category)

    return ', '.join(sorted(assigned_categories))

def categorize_difficulty(answer):
    keywords = extract_sql_keywords(answer)
    keywords_set = set(keywords.split(', '))
    
    num_select_columns = keywords.count("SELECT")
    num_from_tables = keywords.count("FROM")
    num_where_conditions = keywords.count("WHERE")
    num_and_conditions = keywords.count("AND")
    num_equals_conditions = keywords.count("=")
    num_group_by = keywords.count("GROUP")
    num_order_by = keywords.count("ORDER")
    has_intersect = "INTERSECT" in keywords_set
    has_except = "EXCEPT" in keywords_set
    has_json_function = any(func in answer.upper() for func in ["JSON_ARRAY", "JSON_ARRAY_LENGTH", "JSON_EXTRACT", "JSON_GROUP_OBJECT", "JSON_INSERT", "JSON_OBJECT", "JSON_REMOVE", "JSON_SET", "JSON_TREE", "JSON_TYPE", "->>", "JSON", "JSON_VALID", "JSON_EACH", "JSON_GROUP_ARRAY"])
    nested_query_pattern = re.search(r"\bSELECT\b.*?\bFROM\b.*?\bSELECT\b.*?\bFROM\b", answer, re.IGNORECASE) or re.search(r"\bSELECT\b.*?\(.*?\bSELECT\b.*?\bFROM\b", answer, re.IGNORECASE)
    num_joins = len(re.findall(r'\bJOIN\b', answer, re.IGNORECASE))
    has_having = len(re.findall(r'\bHAVING\b', answer, re.IGNORECASE))
    
    if nested_query_pattern or has_json_function:
        return "Extra-Hard"
    if num_select_columns <= 2 and num_where_conditions <= 2 and num_group_by == 0 and num_joins == 0:
        return "Easy"
    if num_select_columns > 2 or num_where_conditions > 2 or num_group_by > 1 or num_joins > 1 or has_having > 0:
        return "Hard"
    if num_select_columns <= 2 and num_where_conditions <= 2 and (num_group_by > 0 or num_order_by > 0 or num_joins > 0):
        return "Medium"
    
    return "Medium"

script_dir = os.path.dirname(os.path.abspath(__file__))
directory = os.path.join(script_dir, 'tasks', 'en')
task_files = [f for f in os.listdir(directory) if f.endswith('.task')]

def extract_task_number(filename):
    match = re.search(r'task-(\d+)', filename)
    return int(match.group(1)) if match else float('inf')

task_files.sort(key=extract_task_number)

print(f"Found {len(task_files)} task files.")

for filename in task_files:
    filepath = os.path.join(directory, filename)
   
    with open(filepath, 'r', encoding='latin-1') as file:
        content = file.read().strip()
        if not content:
            print(f"Skipping file {filename}, content is empty or invalid.")
            continue
        
        task_info = extract_task_info(content)
        
        category = assign_category(extract_sql_keywords(task_info['answer']))
        difficulty = categorize_difficulty(task_info['answer'])
        
        metadata_pattern = re.compile(r'METADATA\s*{([\s\S]*?)}', re.MULTILINE)
        match = metadata_pattern.search(content)
        
        if match:
            metadata_content = match.group(1)

            metadata_dict = {line.split(':')[0].strip(): line.split(':')[1].strip() for line in metadata_content.split('\n') if ':' in line}
            
            metadata_dict['category'] = category
            metadata_dict['difficulty'] = difficulty
            
            new_metadata_content = '\n    '.join([f"{key}: {value}" for key, value in metadata_dict.items()])
            new_metadata_content = f"METADATA {{\n    {new_metadata_content}\n}}"
            
            new_content = content.replace(match.group(0), new_metadata_content)
            
            with open(filepath, 'w', encoding='latin-1') as file:
                file.write(new_content)
            
            print(f"Updated {filename} with category {category} and difficulty {difficulty}.")
        else:
            print(f"No METADATA section found in {filename}.")

print("All tasks have been updated.")