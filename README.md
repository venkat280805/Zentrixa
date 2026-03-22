# Zentrixa
Zentrixa is a modern, AI-powered data analysis platform that helps you unlock insights from your CSV files instantly.

## Prerequisites
- Node.js (v18+)
- Python (v3.10+)

## Quick Start

### 1. Start the Backend API

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Run the startup script (Windows):
   ```bash
   start.bat
   ```
3. The backend API will start at `http://localhost:8000`. 
   Wait for it to say `Application startup complete.`

### 2. Start the Frontend UI

1. Open a **new** terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Run the startup script (Windows):
   ```bash
   start.bat
   ```
3. The frontend development server will start at `http://localhost:3000`.

### 3. Usage

1. Open your web browser and visit `http://localhost:3000`.
2. You can drag and drop a CSV file into the upload area or click to browse.
3. Test with the provided `sample_data.csv` in the root directory.

## Troubleshooting

- **Backend fails to start**: Ensure you have Python installed and added to PATH. You might need to install `pip` globally or use a virtual environment.
- **Frontend fails to start**: Ensure Node is installed. If `npm install` fails, try deleting `node_modules` and running the script again.
- **Upload completely fails/CORS error**: Ensure your backend is running on `port 8000` and frontend on `port 3000`. The frontend must make requests to `http://localhost:8000`.
