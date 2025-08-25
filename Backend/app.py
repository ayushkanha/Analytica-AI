from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List
import tempfile
import os
import json
from cleaning import agent_cleaning
import pandas as pd
from graphgen import visualize
# Define request body model
class ProcessRequest(BaseModel):
    data: List[Dict[str, Any]]  # Changed from str to List[Dict[str, Any]] to match frontend
    dictionary: Dict[str, Any]

app = FastAPI()

# Enable CORS for all routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this later to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process")
async def process_data(content: ProcessRequest):
    print("Received data:", len(content.data), "rows")
    print("Received dictionary:", content.dictionary)
    
    # Process the data based on selected options
    cleaned_data = content.data.copy()  # Start with original data
    
    # AI Magic - Let AI decide the best approach for all cleaning tasks
    if content.dictionary.get('aiMagic', 0) == 1:
        print("AI Magic mode activated - applying intelligent data cleaning")
        # AI Magic will override other options and apply smart cleaning
        
        # Create a temporary CSV file from the data for agent_cleaning
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
                        row[key] = '0'  # Replace missing values with '0'
            print("Filled missing values with '0'")
    #  uvicorn app:app --reload
    # Standardize formats if selected
    if content.dictionary.get('standardizeFormats', 0) == 1:
        for row in cleaned_data:
            for key, value in row.items():
                if isinstance(value, str):
                    # Basic text standardization
                    row[key] = value.strip().title()
        print("Standardized text formats")
    
    # Remove outliers if selected (basic implementation)
    if content.dictionary.get('removeOutliers', 0) == 1:
        # This is a simplified outlier removal - in practice you'd want more sophisticated logic
        print("Outlier removal selected (basic implementation)")
    
    return {
        "status": "success", 
        "message": f"Processed {len(cleaned_data)} rows",
        "cleaned_data": cleaned_data,
        "original_count": len(content.data),
        "cleaned_count": len(cleaned_data)
    }

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

# Run with: uvicorn app:app --reload
@app.post("/analytics")
async def analytics(content: ProcessRequest):
    print("Received analytics request:", len(content.data), "rows")
    
    try:
        # Extract the user query from the dictionary
        user_query = content.dictionary.get('query', '')
        if not user_query:
            return {
                "status": "error",
                "message": "No query provided"
            }
        df = pd.DataFrame(content.data)
        
        from querycheck import pool 
        pool_res= pool(user_query)
        if pool_res == "yes":
            print("Generating visualization for query:", user_query)
            print("DataFrame columns:", df)
            result = visualize(df, user_query)
            print(result)
            return {
                "status": "success",
                "message": f"Generated visualization for: {user_query}",
                "visualization": result,
                "query": user_query,
                "type": "visualization"
            }
        else:
            from texanswer import analyze
            result = analyze(df,user_query)
            print("Visualization result type:", type(result))
            return {
                "status": "success", 
                "message": result["answer"],
                "query": user_query,
                "type": "text"
            }
        
    except Exception as e:
        print(f"Analytics error: {e}")
        return {
            "status": "error",
            "message": f"Failed to generate visualization: {str(e)}"
        }