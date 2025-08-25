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

def visualize(df,query):
    google_api_key = os.getenv("google_api_key")
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=google_api_key)
    summary = {
        "rows": df.shape[0],
        "columns": df.shape[1],
        "missing_values": df.isnull().sum().to_dict(),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "sample": df.head(5).to_dict(orient="records")
    }

    print("DataFrame Summary:", summary)
    prompt = PromptTemplate(
        input_variables=["query", "columns", "summary"],
        template="""
        You are a data visualization assistant.

        The dataset has these columns: {columns}.
        This is a summary of the dataframe: {summary}.
        The user request is: {query}

        Write Python code that generates a Plotly Express (px) visualization.

        ### Strict requirements:
        1. **Data handling**
        - Assume the dataframe is already available as `df`.
        - Do not create, modify, reload, or simulate the dataframe.
        - Only use column names that exist in {columns}.
        - If the user requests a column not in {columns}, raise a `ValueError` with a clear message inside the code.

        2. **Code structure**
        - Always import `plotly.express as px` at the top.
        - Create a Plotly Express figure and assign it to a variable named `fig`.
        - Do not call `fig.show()` or any display-related functions.
        - Do not include explanations, comments, or natural language in the output. Only output valid Python code.
        - Ensure the code is syntactically correct and executable.

        3. **Visualization rules**
        - Choose an appropriate Plotly Express function (`px.scatter`, `px.bar`, `px.histogram`, `px.line`, etc.) based on the user’s request.
        - Ensure all x-axis, y-axis, color, and facet arguments reference valid columns in `df`.
        - If aggregation or grouping is required, use Plotly Express arguments (`histfunc`, `marginal`, `facet_col`, etc.) instead of manually creating grouped data unless explicitly necessary.
        - Do not generate empty plots.

        4. **Error prevention**
        - Do not use non-existent Plotly functions.
        - Do not use `plotly_express` (the correct import is `plotly.express as px`).
        - Do not redefine `df` or import pandas.
        - Ensure variable `fig` is always defined.
        - Avoid chained operations that may raise ambiguity (e.g., `df.column` instead of `df['column']`).
        - If the request cannot be fulfilled with the provided columns, output code that raises a `ValueError` with an explanation.

        ### Output:
        Only output valid Python code that follows the above rules.
            """
    )


    chain = prompt | llm
    result = chain.invoke({
        "query": query,
        "columns": list(df.columns),
        "summary": summary
    })

    code = result.content
    print("Generated Code:\n", code)
    if code.startswith("```"):
        code = code.strip("`")       # remove backticks
        code = code.split("python")[-1].strip()
    # Execute safely
    local_env = {"pd": pd, "df": df, "px": px}
    exec(code, local_env)
    fig = local_env.get("fig")
    print("Generated Figure:", fig)
    fig_json = json.loads(fig.to_json())
    if fig is None:
        raise ValueError("No figure was generated")
    return {"type": "Graph", "plot": fig.to_json()}



