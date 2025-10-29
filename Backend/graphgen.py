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
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")


supabase: Client = create_client(url, key)

def visualize(df,query, error_feedback=None):
    google_api_key = os.getenv("google_api_key")
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=google_api_key)
    summary = {
        "rows": df.shape[0],
        "columns": df.shape[1],
        "missing_values": df.isnull().sum().to_dict(),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "sample": df.head(5).replace({np.nan: None}).to_dict(orient="records") 
    }

    print("DataFrame Summary:", summary)
    prompt = PromptTemplate(
    input_variables=["query", "columns", "summary", "error_section"],
    template="""
    You are a data visualization assistant.

    The dataset has these columns: {columns}.
    This is a summary of the dataframe: {summary}.
            
    {error_section} 


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
    - Apply a **dark theme** using `fig.update_layout(template="plotly_dark")`.
    - Apply a **fully transparent background** using:
        fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
    - **Hide all grid lines** to create a cleaner look using:
        fig.update_xaxes(showgrid=False)
        fig.update_yaxes(showgrid=False)
    - **Remove extra margins** around the plot for a tighter fit in the UI using:
        fig.update_layout(margin=dict(l=0, r=0, t=40, b=0))
    - Use a vivid color sequence such as `color_discrete_sequence=px.colors.qualitative.Plotly` when applicable.
    - Do not call `fig.show()` or any display-related functions.
    - Do not include explanations, comments, or natural language in the output. Only output valid Python code.
    - Ensure the code is syntactically correct and executable.
    3. **Visualization rules**
    - Choose an appropriate Plotly Express function (`px.scatter`, `px.bar`, `px.histogram`, `px.line`, etc.) based on the user’s request.
    - Ensure all x-axis, y-axis, color, and facet arguments reference valid columns in `df`.
    - If aggregation or grouping is required, use Plotly Express arguments (`histfunc`, `marginal`, `facet_col`, etc.) instead of manually creating grouped data unless explicitly necessary.
    - Make the graphs **informative** by:
        - Adding axis labels (`labels` argument).
        - Adding titles (`title` argument in `update_layout`).
        - Always **center the title** with `update_layout(title=dict(text="...", x=0.5))`.
        - Adding legends when multiple categories are shown.
        - **Shortening legend labels when possible** (e.g., replace long text with shorter forms).
        - **Repositioning legends** to avoid clutter using `update_layout(legend=dict(title="...", orientation="h", y=1.1, x=0.5, xanchor="center"))`.
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
    error_section_content = ""
    if error_feedback:
            error_section_content = f"""### CORRECTION REQUEST
                                The Python code you generated in the last attempt failed with the following error:
                                ---
                                {error_feedback}
                                ---
                                Please analyze the error and provide a corrected version of the Python code. Do not repeat the mistake.
                                """

    
    result = chain.invoke({
        "query": query,
        "columns": list(df.columns),
        "summary": summary,
        "error_section": error_section_content
    })

    code = result.content
    print("Generated Code:\n", code)
    if code.startswith("```"):
        code = code.strip("`")       # remove backticks
        code = code.split("python")[-1].strip()
    if code :
        return code
    else:
        raise ValueError("No code generated")


