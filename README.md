# Analytica-AI

Analytica-AI is a powerful data analysis and visualization tool that leverages artificial intelligence to help you turn your data into dialogue. Clean, analyze, and report on your data with ease, and uncover hidden insights through an intuitive, conversational interface.

---

## Features

-   **Seamless Data Upload:** Easily upload your data in CSV or Excel formats.
-   **AI-Powered Data Cleaning:** Automatically clean and preprocess your data, handling missing values, duplicates, and inconsistencies.
-   **Interactive Data Analysis:** Ask questions in natural language and get intelligent insights and visualizations.
-   **Dynamic Visualizations:** Generate a variety of charts and graphs to explore your data visually.
-   **Automated Reporting:** Create comprehensive reports with visualizations and insights.

---

## Tech Stack

### Frontend

-   **React:** A JavaScript library for building user interfaces.
-   **Vite:** A fast build tool and development server for modern web projects.
-   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
-   **Plotly.js:** A high-level, declarative charting library.

### Backend

-   **Python:** A versatile programming language for backend development.
-   **FastAPI:** A modern, fast (high-performance) web framework for building APIs with Python.
-   **Pandas:** A powerful data manipulation and analysis library for Python.
-   **Langchain:** A framework for developing applications powered by language models.
-   **Google Generative AI:** Google's powerful models for generating text, code, and other creative content.
-   **Groq API:** A high-performance inference engine for large language models.

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   Node.js and npm (or pnpm/yarn) installed
-   Python 3.7+ and pip installed
-   A `.env` file with the required API keys (see `.env.example` for reference)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/ayushkanha/analytica-ai.git](https://github.com/ayushkanha/analytica-ai.git)
    cd analytica-ai
    ```

2.  **Set up the Frontend:**

    ```bash
    cd Frontend
    npm install
    ```

3.  **Set up the Backend:**

    ```bash
    cd ../Backend
    pip install -r requirements.txt
    ```

### Running the Application

1.  **Start the Backend Server:**

    ```bash
    cd Backend
    uvicorn app:app --reload
    ```

    The backend server will be running at `http://localhost:8000`.

2.  **Start the Frontend Development Server:**

    ```bash
    cd Frontend
    npm run dev
    ```

    The frontend development server will be running at `http://localhost:3000`.

---

## Screenshots

### Home Page

<img width="1920" height="923" alt="image" src="https://github.com/user-attachments/assets/03519526-bee3-43dc-a308-13323c1416fa" />


### Data Cleaning Page

<img width="1165" height="907" alt="image" src="https://github.com/user-attachments/assets/a267f60f-b9cf-4c73-9ccf-0520aab744cc" />


### Analysis Page
<img width="894" height="899" alt="image" src="https://github.com/user-attachments/assets/6467f940-2bd9-405b-99dd-935a6b85b004" />


---

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature`).
6.  Open a pull request.
