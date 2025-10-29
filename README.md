# Analytica-AI

## Live Preview

*[Link to your deployed project will go here]*

> **Note:** Our backend is currently hosted on a free tier, so it may temporarily stop. If you don't see any changes after clicking buttons, don't be alarmed - just wait 30 seconds and the backend will automatically restart.

Analytica-AI is an intelligent, AI-powered data analysis and visualization tool. It allows users to upload datasets, perform advanced and automated data cleaning, and then interact with their data using natural language queries to generate both textual insights and interactive visualizations.

## Features

- **Data Upload**: Supports uploading data files like CSVs.
- **AI-Powered Cleaning**: An "AI Magic" feature that intelligently cleans data, handles missing values, and removes duplicates using AI.
- **Manual Cleaning**: Options to manually remove duplicates, handle missing values (fill or remove), and standardize formats.
- **Natural Language Querying**: Ask questions about your data in plain English.
- **AI-Powered Analysis**: Uses Google's Gemini model to understand queries and provide text-based answers.
- **Dynamic Graph Generation**: Automatically generates interactive Plotly graphs based on your queries.
- **Persistent Chat**: Chat history is saved to a Supabase database, allowing users to review past analyses.
- **Save Visualizations**: Users can save their favorite generated graphs for future reference.
- **User Authentication**: Secure sign-in and user management powered by Clerk.


## Tech Stack

| Area | Technology |
|------|------------|
| Backend | Python, FastAPI, Uvicorn |
| Frontend | React (Vite), React Router |
| Database | Supabase (PostgreSQL) |
| AI / LLM | Google Gemini, Groq Llama (via LangChain) |
| Data Handling | Pandas, Numpy |
| Visualization | Plotly (Python & JS) |
| Styling | Tailwind CSS, shadcn/ui |
| Authentication | Clerk |

-----

## Screenshots

### Home Page
<img width="1920" alt="Home Page" src="SS/home page.png" />

### Data Cleaning Page
<img width="1165" alt="Data Cleaning Page" src="SS/cleaning page.png" />

### Analysis Page
<img width="894" alt="Analysis Page" src="SS/chat bot.png" />

### Dashboard Page
![dashboard](https://github.com/user-attachments/assets/00edb49e-2575-43f3-ba7e-29d31b01a876)

-----

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Python 3.9+
- Node.js (v18 or newer)
- pnpm (or npm/yarn)
- Supabase Account (for database and storage)
- Clerk Account (for authentication)
- Google AI Studio API Key (for Gemini)

### Backend Setup

1. Navigate to the Backend Directory:
```bash
cd Backend
```

2. Create a Virtual Environment (Recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

3. Install Dependencies:
```bash
pip install -r requirements.txt
```

4. Set Up Environment Variables:
   - Create a file named `.env` in the Backend directory
   - Copy the contents of Backend/.env.example into it
   - Fill in the required values

5. Run the Server:
```bash
uvicorn app:app --reload
```

The backend API will be running at http://127.0.0.1:8000.

### Frontend Setup

1. Navigate to the Frontend Directory:
```bash
cd Frontend
```

2. Install Dependencies:
```bash
pnpm install
# or
# npm install
```

3. Set Up Environment Variables:
   - Create a file named `.env` in the Frontend directory
   - Copy the contents of Frontend/.env.example into it
   - Fill in the required values

4. Run the Development Server:
```bash
pnpm dev
# or
# npm run dev
```

The frontend application will be running at http://localhost:5173 (or another port if 5173 is in use).

## Environment Variables

You must create `.env` files for both the frontend and backend by copying the example files below.

### Backend Environment Example

File: `Backend/.env.example`
```env
# Get from your Supabase project settings (Project URL)
SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"

# Get from your Supabase project settings (API -> service_role Key)
SUPABASE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

# Get from Google AI Studio (https://aistudio.google.com/app/apikey)
google_api_key="YOUR_GOOGLE_GEMINI_API_KEY"

# Get from GroqCloud (https://console.groq.com/keys)
GROQ_API_KEY="YOUR_GROQ_API_KEY"
```

### Frontend Environment Example

File: `Frontend/.env.example`
```env
# Get from your Supabase project settings (API -> Project URL)
VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"

# Get from your Supabase project settings (API -> anon Key)
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

# Get from your Clerk project dashboard (API Keys -> Publishable key)
VITE_CLERK_PUBLISHABLE_KEY="YOUR_CLERK_PUBLISHABLE_KEY"

# The URL of your running FastAPI backend
VITE_API_BASE_URL="http://127.0.0.1:8000"
```



## Contributing

Contributions are welcome\! If you'd like to contribute to this project, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature`).
6.  Open a pull request.
