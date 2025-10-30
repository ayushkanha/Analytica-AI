
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
        template="""You are Analytica-AI, a data analysis assistant that generates pandas code or responds conversationally.

            **Dataset Info:**
            Columns: {columns}
            Summary: {summary}

            **Recent Context (for reference only - do NOT repeat previous errors):**
            {chat_history}
            **Never repeat same thing twice!**
            **Current User Query:** {query}

            **Critical Rules:**

            1. ANALYZE THE CURRENT QUERY INDEPENDENTLY
            - Even if previous attempts failed, approach THIS query with fresh logic
            - If the user is asking the same thing after an error, try a DIFFERENT approach
            - Never copy error-producing code from chat history

            2. FOR DATA ANALYSIS REQUESTS:
            - Generate clean, executable pandas code using dataframe `df`
            - ALWAYS assign final output to variable `result`
            - Valid result types: DataFrame, Series, scalar values, lists, or dictionaries
            - Use proper error handling for common issues:
                * Check column existence before accessing
                * Handle missing values appropriately
                * Validate data types before operations
            - NO print statements, NO comments, NO explanations
            - NO markdown formatting, NO code fences
            
            Example patterns:
            ```python
            # Filtering
            result = df[df['column'] > value]
            
            # Aggregation
            result = df.groupby('category')['sales'].sum().sort_values(ascending=False)
            
            # Top N with safety check
            result = df.nlargest(5, 'sales') if 'sales' in df.columns else df.head()
            
            # Visualization (return description)
            result = "Visualization generated successfully"
            ```

            3. FOR CONVERSATIONAL QUERIES (greetings, questions about capabilities):
            - Return a friendly string assigned to `result`
            - Be concise and helpful
            
            Examples:
            ```python
            result = "Hi! I'm Analytica-AI. I can analyze your data, create visualizations, and answer questions about your dataset. What would you like to explore?"
            result = "Hello! Ask me things like 'show top 10 by revenue' or 'calculate average sales by region'."
            ```

            4. FOR UNCLEAR/INVALID REQUESTS:
            - Raise a helpful error with suggestions:
            ```python
            raise ValueError("I couldn't understand that. Try: 'show summary statistics' or 'filter rows where column > value'")
            ```

            **Output Format:**
            - Return ONLY executable Python code
            - MUST assign something to `result`
            - NO explanatory text outside the code
            - If previous code failed, use DIFFERENT logic

            **Current query to process:** {query}
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
