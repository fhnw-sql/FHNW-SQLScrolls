import re
import os
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd

sql_keywords_ordered = [
    "SELECT", "FROM", "WHERE", "AND", "OR", "ORDER", "BY", "GROUP", "HAVING",
    "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "DISTINCT", "JOIN",
    "INNER", "LEFT", "OUTER", "ON", "AS", "COUNT", "MAX", "MIN", "SUM",
    "AVG", "BETWEEN", "LIKE", "IN", "IS", "NOT", "NULL", 
    "CREATE", "TABLE", "ALTER", "ADD", "PRIMARY", "KEY", "FOREIGN",
    "REFERENCES", "INDEX", "UNION", "INTERSECT", "UNIQUE", "CHECK", "DEFAULT", "GROUP_CONCAT",
    "VIEW", "JSON_TREE", "JSON_GROUP_OBJECT", "JSON_EXTRACT", "JSON_INSERT", "JSON_SET", "JSON_REMOVE",
    "JSON_OBJECT", "JSON_ARRAY", "JSON_ARRAY_LENGTH", "->>", "JSON_TYPE", "SUBSTR", "LENGTH", "ROUND",
    "ASC", "DESC", "LIMIT", "*", "=", "<", ">", "COUNT(*)", "SELECT *", "COUNT *", "JSON_VALID", "JSON_EACH", "->>", "JSON_GROUP_ARRAY"
]

categories = {
    "Data Querying and Retrieval": ["SELECT", "FROM", "WHERE", "DISTINCT", "GROUP", "HAVING", "ORDER", "BY", "ASC", "DESC",
                                    "LIMIT", "JOIN", "INNER", "LEFT", "RIGHT", "OUTER", "ON", "AS", "*", "GROUP BY", "ORDER BY", "LEFT_OUTER_JOIN", "INNER_JOIN"],
    "Data Manipulation": ["INSERT", "UPDATE", "UPDATE SET", "DELETE", "INTO", "VALUES", "SET"],
    "Aggregation": ["COUNT", "SUM", "AVG", "MIN", "MAX", "ROUND", "LENGTH", "SUBSTR", "GROUP_CONCAT", "COUNT(*)"],
    "Filtering": ["WHERE", "BETWEEN", "LIKE", "IN", "IS", "NOT", "NULL", "AND", "OR", "<", "=", ">"],
    "Schema Management": ["CREATE", "ALTER", "ADD", "DROP", "TABLE", "VIEW", "INDEX", "PRIMARY", "KEY", "FOREIGN",
                          "REFERENCES", "UNIQUE", "CHECK", "DEFAULT", "CREATE_TABLE", "ALTER_TABLE", "PRIMARY_KEY", "SET", "CREATE VIEW", "CREATE_VIEW"],
    "Json Functions": ["JSON_ARRAY", "JSON_ARRAY_LENGTH", "JSON_EXTRACT", "JSON_GROUP_OBJECT", "JSON_INSERT", "JSON_OBJECT", "JSON_REMOVE", "JSON_SET", "JSON_TREE", "JSON_TYPE", "->>", "JSON", "JSON_VALID", "JSON_EACH", "JSON_GROUP_ARRAY"],
    "Set Operations": ["UNION", "INTERSECT"]
}

def assign_category(keyword_str):
    keywords = re.split(r',\s*', keyword_str)
    assigned_categories = set()

    for keyword in keywords:
        for category, words in categories.items():
            if keyword in words:
                assigned_categories.add(category)

    if "Json Functions" in assigned_categories:
        assigned_categories = {"Json Functions"}

    return ', '.join(sorted(assigned_categories))

def extract_task_info(content):
    id_pattern = re.compile(r'id:\s*(\w+-\d+)', re.IGNORECASE)
    name_pattern = re.compile(r'name:\s*(.+)', re.IGNORECASE)
    answer_pattern = re.compile(r'ANSWER\s*{\s*([\s\S]*?)\s*}', re.IGNORECASE)

    task_id = id_pattern.search(content).group(1)
    task_name = name_pattern.search(content).group(1).strip()
    task_answer = answer_pattern.search(content).group(1).strip()

    task_info = {
        "id": task_id,
        "name": task_name,
        "answer": task_answer
    }
    return task_info

def extract_and_sort_sql_keywords(answer):

    pattern = re.compile(r'\b(?:' + '|'.join(map(re.escape, sql_keywords_ordered)) + r')\b|\*|[<>=]|->>', re.IGNORECASE)
    found_keywords = pattern.findall(answer)
    found_keywords = [keyword.upper() for keyword in found_keywords]
    sorted_keywords = sorted(found_keywords, key=lambda k: sql_keywords_ordered.index(k) if k in sql_keywords_ordered else len(sql_keywords_ordered))
    sorted_keywords = list(dict.fromkeys(sorted_keywords))
    sorted_keywords_str = ', '.join(sorted_keywords)
    
    return sorted_keywords_str

def count_keyword_occurrences(text):
    keyword_counts = {}
    pattern = re.compile(r'\b(?:' + '|'.join(map(re.escape, sql_keywords_ordered)) + r')\b|\*|[<>=]', re.IGNORECASE)
    
    for match in pattern.finditer(text):
        keyword = match.group().upper()
        keyword_counts[keyword] = keyword_counts.get(keyword, 0) + 1
    
    return keyword_counts

def categorize_difficulty_based_on_errors(answer):
    keywords = extract_and_sort_sql_keywords(answer)
    keywords_set = set(keywords.split(', '))

    has_json_function = any(func in answer.upper() for func in sql_keywords_ordered if func.startswith("JSON_") or func == "->>")
    
    nested_query_pattern = re.search(r"\bSELECT\b.*?\bFROM\b.*?\bSELECT\b.*?\bFROM\b", answer, re.IGNORECASE) or \
                           re.search(r"\bSELECT\b.*?\(.*?\bSELECT\b.*?\bFROM\b", answer, re.IGNORECASE)
    
    if nested_query_pattern or has_json_function or "INTERSECT" in keywords_set or "UNION" in keywords_set:
        return "Extra-Hard"
    
    if any(kw in keywords_set for kw in categories["Schema Management"]):
        return "Hard"
    
    if any(kw in keywords_set for kw in categories["Data Manipulation"] + categories["Aggregation"]):
        return "Medium"

    if any(kw in keywords_set for kw in categories["Data Querying and Retrieval"] + categories["Filtering"]):
        return "Easy"
    
def count_keyword_occurrences(text):
    keyword_counts = {}
    pattern = r'\b(?:' + '|'.join(map(re.escape, sql_keywords_ordered)) + r')\b|\*|[<>=]'
    for match in re.finditer(pattern, text.upper()):
        keyword = match.group()
        keyword_counts[keyword] = keyword_counts.get(keyword, 0) + 1
    return keyword_counts

total_keyword_counts = {}

root_path = os.path.dirname(os.path.abspath(__file__))
directory_path = os.path.join(root_path, 'tasks', 'en')
contents = os.listdir(directory_path)
task_data_list = []

for filename in contents:
    file_path = os.path.join(directory_path, filename)
    with open(file_path, 'r', encoding='latin-1') as file:
        content = file.read().strip()
        if not content:
            print(f"Skipping file {filename}, content is empty or invalid.")
            continue
        
        task_info = extract_task_info(content)
        task_info['answer'] = re.sub(r'\s+', ' ', task_info['answer']).strip()
        sorted_keywords = extract_and_sort_sql_keywords(task_info['answer'])
        keyword_counts = count_keyword_occurrences(task_info['answer'])
        keyword_counts_str = ', '.join(f"{kw} = {count}" for kw, count in keyword_counts.items())

        category = assign_category(sorted_keywords)
        difficulty = categorize_difficulty_based_on_errors(task_info['answer'])

        task_data = {
            "Task ID": task_info['id'],
            "Name": task_info['name'],
            "Keywords": sorted_keywords,
            "Answer": task_info['answer'],
            "Keyword_Count": keyword_counts_str,
            "Categories": category,
            "Difficulty": difficulty
        }
        task_data_list.append(task_data)

task_data_list = sorted(task_data_list, key=lambda x: x['Task ID'])

task_data_df = pd.DataFrame(task_data_list)

keywords = [
    'add', 'alter', 'and', 'as', 'asc', 'avg', 'between', 'by', 'check', 'count', 
    'create', 'default', 'delete', 'desc', 'distinct', 'foreign', 'from', 'group', 
    'having', 'in', 'index', 'inner', 'insert', 'intersect', 'into', 'is', 'join', 
    'json_array', 'json_array_length', 'json_each', 'json_extract', 'json_group_array', 
    'json_group_object', 'json_insert', 'json_object', 'json_remove', 'json_set', 
    'json_tree', 'json_type', 'json_valid', 'key', 'left', 'length', 'like', 'limit', 
    'max', 'min', 'not', 'null', 'on', 'or', 'order', 'outer', 'primary', 'references', 
    'round', 'select', 'set', 'substr', 'sum', 'table', 'union', 'unique', 'update', 
    'values', 'where'
]

documents = task_data_df['Keywords'].tolist()

vectorizer = TfidfVectorizer(vocabulary=keywords)

tfidf_matrix = vectorizer.fit_transform(documents)

tfidf_df = pd.DataFrame(tfidf_matrix.toarray(), columns=vectorizer.get_feature_names_out())

task_data_df_with_tfidf = pd.concat([task_data_df, tfidf_df], axis=1)

output_file_path_with_tfidf = os.path.join(root_path, 'difficulty_with_tfidf.csv') 
task_data_df_with_tfidf.to_csv(output_file_path_with_tfidf, index=False)