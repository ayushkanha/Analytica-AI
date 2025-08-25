import os
from supabase import create_client, Client
from dotenv import load_dotenv
load_dotenv()
# Get your Supabase project URL and anon key from environment variables
# (You can find these in your Supabase project's API settings)
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

# Create the Supabase client
supabase: Client = create_client(url, key)

# Fetch all rows from the 'messages' table
response = supabase.table('messages').select("*").execute()

# Print the data
if response.data:
    print("Successfully fetched data:")
    for row in response.data:
        print(row)
else:
    print("Could not fetch data.")