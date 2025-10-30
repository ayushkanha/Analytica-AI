
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
import numpy as np

model_name: str=os.getenv("GOOGLE_MODEL_NAME")
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(url, key)
def analyze(df, query, chat_history=None):
    google_api_key = os.getenv("google_api_key")
    llm = ChatGoogleGenerativeAI(model=model_name, google_api_key=google_api_key)

    summary = {
        "rows": df.shape[0],
        "columns": df.shape[1],
        "missing_values": df.isnull().sum().to_dict(),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "sample": df.head(5).replace({np.nan: None}).to_dict(orient="records")
    }

    query_prompt = PromptTemplate(
        input_variables=["query", "columns", "summary", "chat_history"],
        template="""
        You are **Analytica-AI**, an intelligent and friendly data assistant designed to understand natural language and generate pandas-based data analysis code.
        Previous conversation context:
        {chat_history}
        The user might speak casually or ask analytical questions.
        Your task is to determine whether the request is conversational or analytical, and respond accordingly.

        **Dataset Details:**
        - Columns: {columns}
        - Summary: {summary}

        **User Query:** {query}

        ###Behavior Rules:

        1. **If the request is analytical** (data exploration, transformation, filtering, grouping, or visualization):
        - Generate valid, executable **Python (pandas)** code using the dataframe named `df`.
        - Always assign the final output to a variable named `result`.
        - Do **not** include print statements, explanations, or comments — return only pure code.

        2. **If the request is conversational** (e.g., greetings, introductions, or questions about your purpose):
        - Do **not** raise an error.
        - Instead, return a friendly, short response as a **string assigned to `result`**.
        - Keep the tone warm, professional, and approachable.
        - Example responses:
            ```python
            result = "Hey Ayush! 👋 I'm Analytica-AI, your data companion. Let's uncover insights from your dataset!"
            result = "Hi there! I'm ready to help you explore, visualize, and understand your data."
            result = "Hello! You can ask me things like 'show top 5 products by sales' or 'plot sales trend by month.'"
            ```

        3. **If the request is unclear or nonsensical** (e.g., gibberish or meaningless input):
        - Raise an explicit error:
            ```python
            raise ValueError("Sorry, I couldn't understand that request. Please rephrase or ask a data-related question.")
            ```

        ### Output Requirements:
        - Return **only** executable Python code.
        - The code must **always** assign something to `result`.
        - No comments, explanations, or print statements are allowed.
        """
    )


    chain_query = query_prompt | llm
    query_code = chain_query.invoke({
        "query": query,
        "columns": list(df.columns),
        "summary": summary,
        "chat_history": chat_history if chat_history else "No prior conversation."
    }).content.strip()

    if query_code.startswith("```"):
        query_code = query_code.strip("`")
        query_code = query_code.split("python")[-1].strip()
    print("Generated Query Code:\n", query_code)
    local_env = {"pd": pd, "df": df}
    exec(query_code, local_env)
    result_df = local_env.get("result")
    if hasattr(result_df, "to_dict"):
        result_for_llm = result_df.replace({np.nan: None}).to_dict()
    else:
        result_for_llm = str(result_df)

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
        "result": result_for_llm
    }).content.strip()
    return answer
