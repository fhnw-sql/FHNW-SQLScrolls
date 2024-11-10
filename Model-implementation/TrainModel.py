import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA
import json
import pickle
import os
import subprocess

def call_generate_file():
    subprocess.run(['python', 'task_data_generation.py'])
    subprocess.run(['python', 'student_data_average_generation.py'])

def load_datasets():

    current_directory = os.getcwd()
    tasks_data = os.path.join(current_directory, 'difficulty_with_tfidf.csv') 
    tasks_data_loaded = pd.read_csv(tasks_data)

    student_data = os.path.join(current_directory, 'student_task_summary_expanded.csv') 
    student_data_loaded = pd.read_csv(student_data)

    return tasks_data, tasks_data_loaded, student_data, student_data_loaded

def transform_user_data(student_data_loaded):
    student_data_loaded['Student ID'].value_counts()
    users = student_data_loaded.set_index('Student ID')
    users['metric'] = users.index
    users['metric'] = users['metric'].apply(lambda x: 'avg' if 'Average Time' in x else 'attempts')
    users['user'] = users.index
    users['user'] = users['user'].apply(lambda x: x.split()[0])
    users['task'] = users.index 
    users['task'] =users['task'].apply(lambda x: 'task-' + x.split()[-1])
    users = users.melt(id_vars=['user', 'metric'], var_name='task', value_name='value')
    users = users.pivot_table(index='user', columns=['task', 'metric'], values='value', aggfunc='first')
    users.columns = ['_'.join(col).strip() for col in users.columns.values]
    users.reset_index(inplace=True)
    return users

def assert_data_transformation_shape_two_columns_per_task(users, student_data_loaded):
    original_shape = student_data_loaded.shape
    new_shape = users.shape
    expected_rows = original_shape[0] // 2
    assert new_shape[0] == expected_rows
    assert np.unique(
        np.unique([col.split("_")[0] for col in users.columns if "task-" in col], return_counts=True)[1]
        )[0] == 2, "We don't have exactly two columns for each task" 
    users = users.loc[:, users.columns != 'task_attempts']
    users = users.loc[:, users.columns != 'task_avg']
    return users
    
def average_task_extraction(users):
    users = users.loc[:, users.columns != 'task_attempts']
    users = users.loc[:, users.columns != 'task_avg']
    list_of_column_to_avg = [col for col in users.columns if "_avg" in col]
    task_avg =  users[list_of_column_to_avg].mean().values
    return task_avg

def vectorize_tasks(tasks_data_loaded, task_avg):
    num_rows = len(tasks_data_loaded)
    task_avg_length = len(task_avg)
    zeros_to_add = num_rows - task_avg_length
    task_avg = np.concatenate([task_avg, np.zeros(zeros_to_add)])

    print(f"New length of task_avg: {len(task_avg)}")

    difficulty_index = tasks_data_loaded.columns.get_loc('Difficulty')
    tasks_data_loaded.insert(difficulty_index + 1, 'task_avg', task_avg)
    tasks_data_loaded['Categories_list'] = tasks_data_loaded['Categories'].apply(lambda x: x.split(', '))
    all_categories = set(sum(tasks_data_loaded['Categories_list'].tolist(), []))

    for category in all_categories:
        tasks_data_loaded[category] = tasks_data_loaded['Categories_list'].apply(lambda x: 1 if category in x else 0)

    tasks_data_loaded = tasks_data_loaded.drop(columns=['Categories_list','Keywords','Answer','Name','Keyword_Count','Categories'])
    tasks_data_loaded['Difficulty'] = tasks_data_loaded['Difficulty'].astype(str).str.strip().str.title()
    tasks_data_loaded['Difficulty'] = tasks_data_loaded['Difficulty'].str.strip().str.title()

    difficulty_mapping = {
        'Easy': 1,
        'Medium': 2,
        'Hard': 3,
        'Extra-Hard': 4
    }

    tasks_data_loaded['Difficulty'] = tasks_data_loaded['Difficulty'].map(difficulty_mapping)
    tasks_data_loaded['Task ID'] = tasks_data_loaded['Task ID'].apply(lambda x: int(x.replace('task-', '')))

    return tasks_data_loaded

def vectorize_and_standardize_tasks(tasks_data_loaded):

    numerical_columns = tasks_data_loaded.select_dtypes(include=['number']).columns
    numerical_data = tasks_data_loaded[numerical_columns]

    combined_data = numerical_data.to_numpy()
    print("Shape of the combined data matrix:", combined_data.shape)

    final_dataframe = numerical_data.copy()

    numerical_data = numerical_data.drop(columns=['Task ID'], errors='ignore')

    scaler = StandardScaler()

    standardized_data = scaler.fit_transform(numerical_data)

    standardized_dataframe = pd.DataFrame(standardized_data, columns=numerical_data.columns)

    return standardized_dataframe

def pca_and_cosine_similarity(standardized_dataframe, tasks_data_loaded):

    pca = PCA(n_components=0.95)
    reduced_data = pca.fit_transform(standardized_dataframe)

    reduced_dataframe = pd.DataFrame(reduced_data)

    cosine_sim_matrix = cosine_similarity(reduced_dataframe)
    cosine_sim_df = pd.DataFrame(cosine_sim_matrix, index=reduced_dataframe.index, columns=reduced_dataframe.index)

    cosine_sim_df = cosine_sim_df.drop(columns=['Task ID'], errors='ignore')

    cosine_sim_df = tasks_data_loaded[['Task ID']].join(cosine_sim_df)

    vectorized_tasks = cosine_sim_df
    np.argsort(vectorized_tasks.to_numpy()[0,:])
    return vectorized_tasks


def task_vectors_and_task_ids_list(vectorized_tasks):
    task_ids_list = vectorized_tasks['Task ID']
    task_vectors = vectorized_tasks.drop(columns=['Task ID']).to_numpy()
    return task_ids_list, task_vectors

def save_model(task_vectors, task_ids_list):

    model_data = {
        'task_vectors': task_vectors,
        'task_ids_list': task_ids_list,
    }

    with open('recommendation_model.pkl', 'wb') as file:
        pickle.dump(model_data, file)

    print("Model has been serialized and saved.")

call_generate_file()
tasks_data, tasks_data_loaded, student_data, student_data_loaded = load_datasets()
users = transform_user_data(student_data_loaded)
users = assert_data_transformation_shape_two_columns_per_task(users, student_data_loaded)
task_avg = average_task_extraction(users)
tasks_data_loaded = vectorize_tasks(tasks_data_loaded, task_avg)
standardized_dataframe = vectorize_and_standardize_tasks(tasks_data_loaded)
vectorized_tasks = pca_and_cosine_similarity(standardized_dataframe, tasks_data_loaded)
task_ids_list, task_vectors = task_vectors_and_task_ids_list(vectorized_tasks)
save_model(task_vectors, task_ids_list)