This project is designed with a **two-module architecture** for separate deployment and operation: the **Standalone Main Application** and the specialized **Chunker** service.

For the source code, please refer to the official repository: [https://github.com/matoBaron2601/diplomka_final](https://github.com/matoBaron2601/diplomka_final)

---

## Application Structure

The system is composed of two primary, independent modules:

* **Standalone Main Application:** The front-end interface and core logic layer, responsible for user interaction and orchestrating data flow.
* **Chunker Service:** A dedicated backend service for processing raw data into optimized chunks, typically using an external chunking utility.

---

## Local Deployment Guide

Follow these instructions to deploy and run the application modules locally. The **Chunker Service** should be started first.

### 1. Start the Chunker Service (Python/Flask)

The Chunker is a Python-based service running on Flask.

#### Environment Variable Setup for Chunker

1.  Navigate into the Chunker directory: `cd chunker`
2.  Locate the example configuration file, **`.env.example`**.
3.  **Copy** this file to create a new one named **`.env`** in the same directory.
4.  Fill in the required value for **`OPENAI_API_KEY=`** in the new `.env` file.

| Step | Instruction | Command Example | Notes |
| :--- | :--- | :--- | :--- |
| **1. Navigate** | Go to the Chunker directory. | `cd chunker` | Adjust path if necessary. |
| **2. Activate Venv** | Start the Python virtual environment. | `source venv/bin/activate` | Assumes a standard `venv` setup has been initialized. |
| **3. Install Framework**| Install the minimal web framework. | `pip install Flask` | Required for the service endpoint. |
| **4. Install Dependencies**| Install the core chunking library. | `pip install git+https://github.com/brandonstarxel/chunking_evaluation.git` | Installs the dependency directly from the GitHub repository. |
| **5. Run Service** | Execute the main startup script. | `python3 main.py` | Starts the Chunker service. |

> **Status:** The Chunker should be running and accessible at **http://127.0.0.1:5000** 

---

### 2. Start the Standalone Main Application (Bun/Docker)

This module uses **Bun** as its package manager and relies on **Docker Compose** to manage necessary infrastructure (database, bucket storage).

#### Environment Variable Setup for Main Application

1.  Navigate into the Main Application directory: `cd app`
2.  Locate the example configuration file, **`.env.example`**.
3.  **Copy** this file to create a new one named **`.env`** in the same directory.
4.  Fill in the required values in the new `.env` file:
    * `OPENAI_API_KEY=`
    * `GOOGLE_CLIENT_ID=`
    * `GOOGLE_CLIENT_SECRET=`

| Step | Instruction | Command Example | Notes |
| :--- | :--- | :--- | :--- |
| **1. Navigate** | Go to the Main Application directory. | `cd app` | Change into the main application folder. |
| **2. Install Dependencies** | Install the project dependencies using Bun. | `bun install` | Requires **Bun** to be installed on your system. |
| **3. Start Infrastructure** | Start necessary services (Typesense, S3-like bucket) using Docker Compose. | `docker compose up -d` | The `-d` flag runs containers in detached mode. |
| **4. Initialize Database** | Create the required Typesense collection schema. | `bun run createcol` | This ensures the search index is properly initialized. |
| **5. Run Application** | Start the main application server. | `bun run dev` | Runs the application in development mode. |

> **Status:** The Main Application should be running and accessible via your browser at **localhost:5173**

---

## Key Dependencies

This project relies on the following major tools and libraries:

* **Python 3** and **Flask** (for the Chunker Service)
* **Bun** (as the JavaScript Package Manager for the Main App)
* **Docker Compose** (for required infrastructure: Typesense search index and MinIO bucket storage)
* **`chunking_evaluation`** (A specific utility for data chunking/processing)