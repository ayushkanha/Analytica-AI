
import pandas as pd
import plotly.express as px
import json
import tempfile

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
import os
from dotenv import load_dotenv
load_dotenv()
from supabase import create_client, Client



url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

# Create the Supabase client
supabase: Client = create_client(url, key)
def analyze(df, query):
    google_api_key = os.getenv("google_api_key")
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=google_api_key)

    summary = {
        "rows": df.shape[0],
        "columns": df.shape[1],
        "missing_values": df.isnull().sum().to_dict(),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "sample": df.head(5).to_dict(orient="records")
    }

    # Step 1: Ask LLM to generate a pandas query
    query_prompt = PromptTemplate(
        input_variables=["query", "columns", "summary"],
        template="""
        You are a pandas query generator.
        
        Dataset columns: {columns}
        Data summary: {summary}
        User request: {query}

        ### Rules:
        1. Assume dataframe is already loaded as `df`.
        2. Output only valid Python pandas code that assigns the result to a variable named `result`.
        3. Do not print, explain, or add comments. Only code.
        4. If impossible, raise a ValueError in code.
        """
    )
    chain_query = query_prompt | llm
    query_code = chain_query.invoke({
        "query": query,
        "columns": list(df.columns),
        "summary": summary
    }).content.strip()

    if query_code.startswith("```"):
        query_code = query_code.strip("`")
        query_code = query_code.split("python")[-1].strip()

    # Step 2: Execute the pandas query safely
    local_env = {"pd": pd, "df": df}
    exec(query_code, local_env)
    result_df = local_env.get("result")

    # Step 3: Ask LLM to summarize the result
    text_prompt = PromptTemplate(
        input_variables=["query", "result"],
        template="""
        You are a data interpretation assistant.

        User request: {query}
        Pandas query result: {result}

        Provide a short, clear answer (max 3 sentences).
        """
    )
    chain_text = text_prompt | llm
    answer = chain_text.invoke({
        "query": query,
        "result": result_df.to_dict(orient="records") if hasattr(result_df, "to_dict") else str(result_df)
    }).content.strip()

    # Step 4: Store in Supabase
    data, count = supabase.table("messages").insert({
        "user_message": query,
        "responce": {"type": "Text", "pandas_query": query_code, "answer": answer},
        "chat_id": 1,
        "error": None
    }).execute()

    print(data)

    return {"type": "Text", "pandas_query": query_code, "answer": answer}

