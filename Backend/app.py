from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import cleaning
import querycheck
import graphgen
import texanswer
import pandas as pd
import json
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import tempfile
from cleaning import agent_cleaning
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

class ChatName(BaseModel):
    name: str

@app.post("/chat")
async def create_chat(chat_name: ChatName):
    try:
        response = supabase.table('Chat').insert({"name": chat_name.name}).execute()
        if response.data:
            return {"c_id": response.data[0]['c_id']}
        else:
            raise HTTPException(status_code=500, detail="Failed to create chat in Supabase")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error creating chat: {e}")

@app.get("/chats")
async def get_chats():
    try:
        response = supabase.table('Chat').select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/{c_id}/messages")
async def get_chat_messages(c_id: int):
    try:
        response = supabase.table('messages').select("*").eq('c_id', c_id).order('created_at').execute()
        return response.data
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
    
            import pandas as pd
            df = pd.DataFrame(content.data)
            
            # Create temporary file
            temp_fd, temp_path = tempfile.mkstemp(suffix=".csv")
            os.close(temp_fd)
            
            try:
                # Save data to temporary CSV
                df.to_csv(temp_path, index=False)
                
                # Use agent_cleaning function
                cleaned_df = agent_cleaning(temp_path)
                
                # Convert back to list of dictionaries
                cleaned_data = cleaned_df.to_dict('records')
                
                # Clean up temporary file
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
                # Clean up temporary file on error
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                # Fall back to basic AI magic
                cleaned_data = apply_ai_magic(content.data)
                return {
                    "status": "success", 
                    "message": f"AI Magic processed {len(cleaned_data)} rows (fallback mode)",
                    "cleaned_data": cleaned_data,
                    "original_count": len(content.data),
                    "cleaned_count": len(cleaned_data),
                    "ai_magic_applied": True
                }
        
        # Remove duplicates if selected
        if content.dictionary.get('removeDuplicates', 0) == 1:
            # Convert each row to a tuple for hashing, then back to dict
            seen = set()
            unique_data = []
            for row in cleaned_data:
                # Create a hashable representation of the row
                row_tuple = tuple(sorted(row.items()))
                if row_tuple not in seen:
                    seen.add(row_tuple)
                    unique_data.append(row)
            cleaned_data = unique_data
            print(f"Removed {len(content.data) - len(cleaned_data)} duplicate rows")
        
        # Handle missing values if selected
        if content.dictionary.get('handleMissing', 0) == 1:
            missing_strategy = content.dictionary.get('missingStrategy', 'fill')  # 'fill' or 'remove'
            if missing_strategy == 'remove':
                # Remove rows with missing values
                cleaned_data = [row for row in cleaned_data if not has_missing_values(row)]
                print(f"Removed rows with missing values. Remaining: {len(cleaned_data)} rows")
            else:
                # Fill missing values
                for row in cleaned_data:
                    for key, value in row.items():
                        if value is None or value == '' or (isinstance(value, str) and value.strip() == ''):
                            row[key] = '0' 
                print("Filled missing values with '0'")

        if content.dictionary.get('standardizeFormats', 0) == 1:
            for row in cleaned_data:
                for key, value in row.items():
                    if isinstance(value, str):
                        # Basic text standardization
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
    print(data)
    """Apply intelligent AI-powered data cleaning"""
    print("Applying AI Magic...")
    
    if not data:
        return data
    
    # Get sample data to understand structure
    sample_row = data[0]
    columns = list(sample_row.keys())
    
    cleaned_data = []
    
    for row in data:
        # Create a copy of the row
        cleaned_row = row.copy()
        
        # AI Magic: Intelligent missing value handling
        for col in columns:
            value = cleaned_row[col]
            
            # Check if value is missing
            if value is None or value == '' or (isinstance(value, str) and value.strip() == ''):
                # AI decision: Fill based on column context
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
        
        # AI Magic: Basic text standardization
        for col in columns:
            if isinstance(cleaned_row[col], str):
                cleaned_row[col] = cleaned_row[col].strip()
                # Don't title case names, but standardize other text
                if 'name' not in col.lower() and 'title' not in col.lower():
                    cleaned_row[col] = cleaned_row[col].title()
        
        cleaned_data.append(cleaned_row)
    
    # AI Magic: Remove obvious duplicates
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
        
        # Check if the query is for a graph
        is_graph = querycheck.pool(query)
        
        response_data = None
        if is_graph == "yes":
            # Generate graph
            graph_code = graphgen.visualize(df, query)
            
            # Execute the generated code
            exec_globals = {'pd': pd, 'df': df, 'go': None, 'px': None, 'fig': None}
            exec(graph_code, exec_globals)
            fig = exec_globals.get('fig')
            
            if fig:
                response_data = {"type": "plot", "data": json.loads(fig.to_json())}
            else:
                response_data = {"type": "text", "data": "Could not generate graph."}
        else:
            # Generate text answer
            text_answer = texanswer.analyze(df,query)
            response_data = {"type": "text", "data": text_answer}

        # Save message to Supabase
        supabase.table('messages').insert({
            "user_message": query,
            "response": response_data,
            "c_id": c_id
        }).execute()

        return response_data
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))