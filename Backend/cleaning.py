import pandas as pd
import numpy as np
import os
import tempfile
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import re
from dotenv import load_dotenv
load_dotenv()

# 1. Remove Duplicates
def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    return df.drop_duplicates()

# 2. Handle Missing Values
def handle_missing(df: pd.DataFrame) -> pd.DataFrame:
    return df.fillna(method='ffill').fillna(method='bfill')  # simple strategy

# 3. Standardize Formats (dates, categorical casing, etc.)
def standardize_formats(df: pd.DataFrame) -> pd.DataFrame:
    for col in df.select_dtypes(include=["object"]):
        df[col] = df[col].str.strip().str.lower()
    for col in df.select_dtypes(include=["datetime", "object"]):
        try:
            df[col] = pd.to_datetime(df[col], errors="ignore")
        except:
            pass
    return df

# 4. Remove Outliers (z-score method)
def remove_outliers(df: pd.DataFrame) -> pd.DataFrame:
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        z_scores = (df[col] - df[col].mean()) / df[col].std()
        df = df[(z_scores.abs() < 3)]
    return df

# 5. Data Summary
def summarize_data(df: pd.DataFrame) -> dict:
    summary = {
        "rows": df.shape[0],
        "columns": df.shape[1],
        "missing_values": df.isnull().sum().to_dict(),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "sample": df.head(5).to_dict(orient="records")
    }
    return summary





def agent_cleaning(file_path, instruction=None):


    google_api_key = os.getenv("google_api_key")
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=google_api_key)

    # Prompt for autonomous cleaning
    if instruction:
        prompt = PromptTemplate(
            input_variables=["summary", "filepath", "instruction"],
            template="""
        You are a data cleaning assistant.
        The dataset is stored at {filepath}.
        Here is a summary of the dataset: {summary}
        The user has provided the following instruction: {instruction}
        Based on this summary and the user instruction:
        - Detect missing values, duplicates, inconsistent formats, and outliers.
        - Decide what cleaning steps are required (you choose!).
        - Write Python pandas code that:
        1. Loads the dataset from {filepath}
        2. Cleans the data appropriately, taking the user instruction into account.
        3. Saves the cleaned dataset as "output.csv" in the same directory
        4. Prints summary stats after cleaning (rows, columns, missing counts, dtypes)
        Only output valid Python code.
        """
        )
    else:
        prompt = PromptTemplate(
            input_variables=["summary", "filepath"],
            template="""
        You are a data cleaning assistant.
        The dataset is stored at {filepath}.
        Here is a summary of the dataset: {summary}
        Based on this summary:
        - Detect missing values, duplicates, inconsistent formats, and outliers.
        - Decide what cleaning steps are required (you choose!).
        - Write Python pandas code that:
        1. Loads the dataset from {filepath}
        2. Cleans the data appropriately
        3. Saves the cleaned dataset as "output.csv" in the same directory
        4. Prints summary stats after cleaning (rows, columns, missing counts, dtypes)
        Only output valid Python code.
        """
        )



    df = pd.read_csv(file_path)

    # Generate dataset summary for LLM
    summary = {
        "rows": df.shape[0],
        "columns": df.shape[1],
        "missing_counts": df.isnull().sum().to_dict(),
        "duplicates": df.duplicated().sum(),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "sample": df.head(5).replace({np.nan: None}).to_dict(orient="records")
    }
    print(summary)

    # Run LLMChain
    chain = LLMChain(llm=llm, prompt=prompt)
    if instruction:
        code = chain.run(summary=summary, filepath=file_path, instruction=instruction)[9:-4]
    else:
        code = chain.run(summary=summary, filepath=file_path)[9:-4]


    # Save generated code
    with open("generated_code.py", "w") as f:
        f.write(code)

    # Temporary file for cleaned data
    temp_fd, temp_path = tempfile.mkstemp(suffix=".csv")
    os.close(temp_fd)

    safe_code = code.replace("output.csv", temp_path)
    safe_code = safe_code.replace("\\", "/")

    safe_code = re.sub(r'["\\]([A-Z]:\[^"\\]*)["\\]', r'"\1"', safe_code)

    # Execute safely
    local_env = {"pd": pd, "input_path": file_path, "output_path": temp_path}
    exec(safe_code, local_env)

    # Reload cleaned data for final summary
    cleaned_df = pd.read_csv(temp_path)
    return cleaned_df