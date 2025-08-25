from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import os
from dotenv import load_dotenv
load_dotenv()
def pool(query):
    groq_api_key = os.getenv("GROQ_API_KEY")
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",   # or "llama3-70b-8192" depending on your access
        temperature=0,                # deterministic output
        max_tokens=5,
        groq_api_key=groq_api_key
    )

    # Prompt template: force strict yes/no
    prompt = PromptTemplate(
        input_variables=["query"],
        template="""
    You are a strict classifier for data queries.

    Rules:
    1. Answer ONLY with "yes" or "no".
    2. "yes" → if the query asks for trends, comparisons, correlations, distributions, patterns, or anything best shown with a chart/graph.
    3. "no" → if the query can be answered directly with text, a number, a fact, or a short explanation without needing a visualization.
    4. Do not explain your choice.

    User query: {query}
    Answer:
    """
    )


    # Create chain
    chain = LLMChain(llm=llm, prompt=prompt)


    result = chain.run({"query": query})
    print("Classifier result:", result.strip().lower())
    return result.strip().lower()
