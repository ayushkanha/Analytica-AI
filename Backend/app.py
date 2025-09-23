import os
from supabase import create_client, Client
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import cleaning
import querycheck
import graphgen
import texanswer
import pandas as pd
import json
import tempfile
from cleaning import agent_cleaning
import plotly.graph_objects as go
from dotenv import load_dotenv
import numpy as np 

load_dotenv()

# Supabase setup
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
if not url or not key:
    raise ValueError("Supabase URL and Key must be set in environment variables.")
supabase: Client = create_client(url, key)

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    try:
        # Check if the 'Chat' table exists
        supabase.table('Chat').select('*', head=True).execute()
    except Exception as e:
        print("Error connecting to Supabase or finding 'Chat' table:")
        print(e)
        # You might want to raise an exception here to prevent the app from starting
        # raise e

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class ContactForm(BaseModel):
    name: str
    email: str
    message: str

class ProcessRequest(BaseModel):
    data: List[Dict[str, Any]]
    dictionary: Dict[str, Any]
    c_id: str

class QueryRequest(BaseModel):
    query: str
    df: List[Dict[str, Any]]

class TextRequest(BaseModel):
    query: str
    df: List[Dict[str, Any]]
    c_id: str
    user_id: str | None = None
    filename: str | None = None

class ChatName(BaseModel):
    name: str
    user_id: str 

class GraphSaveRequest(BaseModel):
    c_id: str
    graph_json: Dict[str, Any]
@app.post("/s")
async def start():
    return {"message": "API is running"}

@app.post("/chat")
async def create_chat(chat_name: ChatName):
    try:
        insert_data = {"name": chat_name.name}
        if chat_name.user_id:
            insert_data["userid"] = chat_name.user_id
        response = supabase.table('Chat').insert(insert_data).execute()
        if response.data:
            return {"c_id": response.data[0]['c_id']}
        else:
            raise HTTPException(status_code=500, detail="Failed to create chat in Supabase")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error creating chat: {e}")

@app.get("/chats/{user_id}")
async def get_user_chats(user_id: str):
    """
    Fetches all chats associated with a specific user ID.
    """
    try:
        response = supabase.table('Chat').select("*").eq('userid', user_id).order('created_at').execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/{c_id}/messages")
async def get_chat_messages(c_id: str):
    try:
        response = supabase.table('messages').select("*").eq('c_id', c_id).order('created_at').execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/contact")
async def handle_contact_form(contact_form: ContactForm):
    try:
        response = supabase.table('query').insert(contact_form.dict()).execute()
        if response.data:
            return {"message": "Form submitted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save data to Supabase")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process")
async def process_data(content: ProcessRequest):
    print("Received data:", len(content.data), "rows")
    print("Received dictionary:", content.dictionary)
    
    cleaned_data = content.data.copy()
    
    try:
        if content.dictionary.get('aiMagic', 0) == 1:
            print("AI Magic mode activated - applying intelligent data cleaning")
            
            df = pd.DataFrame(content.data)
            
            temp_fd, temp_path = tempfile.mkstemp(suffix=".csv")
            os.close(temp_fd)
            
            try:
                df.to_csv(temp_path, index=False)
                
                ai_instruction = content.dictionary.get('aiInstruction', '')
                cleaned_df = cleaning.agent_cleaning(temp_path, instruction=ai_instruction)
                cleaned_df = cleaned_df.replace({np.nan: None})
                cleaned_data = cleaned_df.to_dict('records')
                
                os.unlink(temp_path)
                
                return {
                    "status": "success", 
                    "message": f"AI Magic processed {len(cleaned_data)} rows using advanced AI cleaning",
                    "cleaned_data": cleaned_data,
                    "original_count": len(content.data),
                    "cleaned_count": len(cleaned_data),
                    "ai_magic_applied": True
                }
            except Exception as e:
                print(f"AI Magic error: {e}")
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                cleaned_data = apply_ai_magic(content.data)
                return {
                    "status": "success", 
                    "message": f"AI Magic processed {len(cleaned_data)} rows (fallback mode)",
                    "cleaned_data": cleaned_data,
                    "original_count": len(content.data),
                    "cleaned_count": len(cleaned_data),
                    "ai_magic_applied": True
                }
        
        if content.dictionary.get('removeDuplicates', 0) == 1:
            seen = set()
            unique_data = []
            for row in cleaned_data:
                row_tuple = tuple(sorted(row.items()))
                if row_tuple not in seen:
                    seen.add(row_tuple)
                    unique_data.append(row)
            cleaned_data = unique_data
            print(f"Removed {len(content.data) - len(cleaned_data)} duplicate rows")
        
        if content.dictionary.get('handleMissing', 0) == 1:
            missing_strategy = content.dictionary.get('missingStrategy', 'fill')
            if missing_strategy == 'remove':
                cleaned_data = [row for row in cleaned_data if not has_missing_values(row)]
                print(f"Removed rows with missing values. Remaining: {len(cleaned_data)} rows")
            else:
                for row in cleaned_data:
                    for key, value in row.items():
                        if value is None or value == '' or (isinstance(value, str) and value.strip() == ''):
                            row[key] = '0'
                print("Filled missing values with '0'")

        if content.dictionary.get('standardizeFormats', 0) == 1:
            for row in cleaned_data:
                for key, value in row.items():
                    if isinstance(value, str):
                        row[key] = value.strip().title()
            print("Standardized text formats")

        if content.dictionary.get('removeOutliers', 0) == 1:
            print("Outlier removal selected (basic implementation)")
        
        return {
            "status": "success", 
            "message": f"Processed {len(cleaned_data)} rows",
            "cleaned_data": cleaned_data,
            "original_count": len(content.data),
            "cleaned_count": len(cleaned_data)
        }
    except Exception as e:
        print(f"Error processing data: {e}")
        return {"status": "error", "message": str(e)}

def has_missing_values(row):
    """Check if a row has any missing values"""
    for value in row.values():
        if value is None or value == '' or (isinstance(value, str) and value.strip() == ''):
            return True
    return False

def apply_ai_magic(data):
    """Apply intelligent AI-powered data cleaning"""
    print("Applying AI Magic...")
    if not data:
        return data
    
    sample_row = data[0]
    columns = list(sample_row.keys())
    cleaned_data = []
    
    for row in data:
        cleaned_row = row.copy()
        
        for col in columns:
            value = cleaned_row[col]
            
            if value is None or value == '' or (isinstance(value, str) and value.strip() == ''):
                if 'name' in col.lower() or 'title' in col.lower():
                    cleaned_row[col] = 'Unknown'
                elif 'date' in col.lower():
                    cleaned_row[col] = 'N/A'
                elif 'price' in col.lower() or 'cost' in col.lower() or 'amount' in col.lower():
                    cleaned_row[col] = '0'
                elif 'rating' in col.lower() or 'score' in col.lower():
                    cleaned_row[col] = '0'
                else:
                    cleaned_row[col] = 'N/A'
        
        for col in columns:
            if isinstance(cleaned_row[col], str):
                cleaned_row[col] = cleaned_row[col].strip()
                if 'name' not in col.lower() and 'title' not in col.lower():
                    cleaned_row[col] = cleaned_row[col].title()
        
        cleaned_data.append(cleaned_row)
    
    seen = set()
    unique_data = []
    for row in cleaned_data:
        row_tuple = tuple(sorted(row.items()))
        if row_tuple not in seen:
            seen.add(row_tuple)
            unique_data.append(row)
    
    print(f"AI Magic: Removed {len(cleaned_data) - len(unique_data)} duplicate rows")
    return unique_data

@app.post("/query")
async def check_query(request: QueryRequest):
    try:
        result = querycheck.handle_query(request.query, pd.DataFrame(request.df))
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analytics")
async def generate_graph(request: TextRequest):
    try:
        df = pd.DataFrame(request.df)
        query = request.query
        c_id = request.c_id
        user_id = request.user_id

        # Check if it's the first message for this chat
        messages_response = supabase.table('messages').select('id').eq('c_id', c_id).limit(1).execute()
        if not messages_response.data:
            if request.filename:
                supabase.table('Chat').update({'name': request.filename}).eq('c_id', c_id).execute()
        
        is_graph = querycheck.pool(query)
        
        response_data = None
        if is_graph == "yes":
            fig = None
            error_feedback = None
            max_retries = 3

            for attempt in range(max_retries):
                try:
                    print(f"Graph generation attempt {attempt + 1}")
                    # Pass the error feedback to the visualize function
                    graph_code = graphgen.visualize(df, query, error_feedback=error_feedback)
                    
                    exec_globals = {'pd': pd, 'df': df, 'go': None, 'px': None, 'fig': None}
                    exec(graph_code, exec_globals)
                    fig = exec_globals.get('fig')
                    
                    if fig:
                        print("Graph generated successfully.")
                        break 
                    else:
                        raise ValueError("Generated code did not produce a 'fig' object.")

                except Exception as e:
                    print(f"Attempt {attempt + 1} failed: {e}")
                    error_feedback = str(e)
                    if attempt == max_retries - 1:
                        response_data = {"type": "text", "data": "I'm sorry, I was unable to generate a valid visualization for your request."}
            
            if fig:
                response_data = {"type": "plot", "data": json.loads(fig.to_json())}
            
        else:
            text_answer = texanswer.analyze(df,query)
            response_data = {"type": "text", "data": text_answer}

        insert_data = {
            "user_message": query,
            "response": response_data,
            "c_id": c_id
        }
        if user_id:
            insert_data["user_id"] = user_id
        supabase.table('messages').insert(insert_data).execute()

        return response_data
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
class GraphCreate(BaseModel):
    c_id: str      
    graph_json: Dict[str, Any] 
    user_id: str | None = None

class GraphRecord(BaseModel):
    id: int
    created_at: str
    chat_id: str
    graph_data: Dict[str, Any]
    name: str | None = None

@app.post("/graphs", status_code=status.HTTP_201_CREATED)
def save_graph(graph_data: GraphCreate):
    try:
        print(f"Saving graph for chat ID: {graph_data.c_id}")
        fig_dict = graph_data.graph_json

        graph_title = None  
        if "layout" in fig_dict and "title" in fig_dict["layout"]:
            title_obj = fig_dict["layout"]["title"]
            if isinstance(title_obj, dict) and "text" in title_obj:
                graph_title = title_obj["text"]
            elif isinstance(title_obj, str):
                graph_title = title_obj
            
            fig_dict["layout"]["title"] = None

        fig = go.Figure(fig_dict)
        
        data_to_insert = {
            "chat_id": graph_data.c_id,
            "graph_data": json.loads(fig.to_json()),
            "userid": graph_data.user_id,
            "name": graph_title
        }

        response = supabase.table("graphs").insert(data_to_insert).execute()

        if len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save graph data in the database."
            )
        
        new_graph_record = response.data[0]
        
        print(f"Successfully saved graph with ID: {new_graph_record['id']}")

        return {
            "id": new_graph_record['id'],
            "chat_id": new_graph_record['chat_id'],
            "created_at": new_graph_record['created_at']
        }

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
    
@app.get("/graphs/{user_id}", response_model=List[GraphRecord])
def get_saved_graphs(user_id: str):
    try:
        response = supabase.table("graphs").select("*").eq("userid", user_id).execute()
        print(f"Found {len(response.data)} graphs for user ID: {user_id}")
        print(response.data)
        return response.data

    except Exception as e:
        print(f"An error occurred while fetching graphs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred: {str(e)}"
        )