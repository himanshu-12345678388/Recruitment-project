# Full-Stack Recruitment Assessment Portal

A decoupled, high-performance web platform designed to evaluate candidate engineering metrics over a multi-stage progression track. The application handles profile registration, dynamic aptitude evaluations, real-time spatial memory matrices, cryptographic text decryption challenges, and automatically saves and updates an indexed global scoreboard.

---

##  Tech Stack (AND WHY I CHOOSE IT)

### Frontend Architecture
* **React 18**:Very less use as i had just started learning it, It is handling asynchronous component lifecycles, and managing state across 5 distinct assessment stages without heavy routing overheard.
* **Custom Webpack 5 Bundle Layer**: used it as bundler for the frontend also installed webpack dev-server so we do not have to restart the server again and again it restarts whenever you press ctrl+c
* **Babel Layer**: Tailored with specialized presets (`@babel/preset-env`, `@babel/preset-react`) implementing modern automatic JSX transform engines.
* **Vanilla CSS (Inter Font UI)**: Used very less styling as time was less. This enforces a lightweight, slate-blue enterprise visual framework with zero dependency processing bottlenecks.

### Backend & Storage Architecture
* **Node.js & Express**: Provides a lightweight, stateless asynchronous event loop to handle concurrent candidate endpoint requests securely.
* **SQLite3 (Relational Embedded Engine)**: Selected for zero-configuration architectural efficiency. It handles robust structured queries on a flat filesystem, maintaining integrity through sequential tables.
* **CORS (Cross-Origin Resource Sharing)**: Structured using custom origin evaluation closures to allow secure browser handshakes between Port 3000 and Port 5000 loopbacks.

---

##  Setup & Installation Instructions

Ensure you have [Node.js](https://nodejs.org) installed. Run the system in two side-by-side terminal tabs:

### 1. Backend Server Setup
```bash
cd backend
npm install
npm run dev
```
*Note: On system boot, the backend automatically initializes `database.sqlite` and sequentially seeds the relational query tables with 10 pristine aptitude rows and 4 cryptographic message pairs.*

### 2. Frontend Server Setup
```bash
cd frontend
npm install
npm start
```
*Once initialized, point your browser to `http://localhost:3000` to interact with the assessment ecosystem.*

---

##  API Documentation & Endpoint Architecture

The application communicates over a centralized API service gateway assigned to `http://localhost:5000/api`.

### 1. Questions Endpoint
* **URL:** `/api/questions`
* **Method:** `GET`
* **Payload Response:** Returns an array of exactly 10 multiple-choice aptitude question rows, excluding correct answer fields to prevent client-side inspection cheating.

### 2. Answer Verification Endpoint
* **URL:** `/api/verify`
* **Method:** `POST`
* **Request Body:** `{ id: Integer, selectedAnswer: String }`
* **Payload Response:** `{ correct: Boolean }` (Performs server-side evaluation matching against the relational database).

### 3. Cryptographic Evaluation Endpoints
* **URL:** `/api/crypto/questions` | **Method:** `GET` (Pulls cryptographic string puzzle records)
* **URL:** `/api/crypto/verify` | **Method:** `POST` (Validates case-insensitive plaintext entries)

### 4. Leaderboard Records System
* **URL:** `/api/leaderboard` | **Method:** `POST` (Saves name, computed metrics score, tier allocation string, and latency metrics)
* **URL:** `/api/leaderboard` | **Method:** `GET` (Retrieves structural scoreboard array rows, explicitly ordered by `score DESC, time_taken ASC`)

---

## My Brain vs. AI: The Engineering Breakdown

To maintain transparency, this section defines the split between raw human logical engineering and strategic AI-assisted acceleration over this 3-day development window.

###  Where I Used My Own Brain (The Engineering Core)

* **Webpack Boilerplate Generation**: Used my knowledge to set up raw configuration strcture for Webpack loaders, standard Babel presets, and package dependency scripts. 

 **SQL Seeding Data Generation**: Manually seeded Questions to the database.sqlite file from config/db.js used sql qeries for it.

* **Debugging Build & Runtime Failures**: I spent significant effort reading browser developer consoles, identifying pathing errors (like locating misplaced `services` directories), spotting type-safety mismatches (like forcing SQLite string IDs into parsed integers), and diagnosing case-sensitive variable typos (such as resolving `setShowHint` tracking hooks).

* **Platform Workflow & Progression Rules**: I designed the architectural state layout that shifts candidates across stages. I established the gating validation parameters, ensuring that failing the Memory Matrix routes candidates straight to the leaderboard while clearing it unlocks the Cryptographic tier.

* **Product Direction & UX Optimization**: I vetoed complicated text-skipping systems and designed an elegant, interactive split-screen "Word Bank Options Grid". This kept the text input box secure while drastically enhancing usability.

###  Where I Leveraged the AI Agent (The Tactical Accelerator)
* **Bespoke UI styling**: I leveraged AI to convert my clean, functional HTML tags into an enterprise-grade Slate Blue CSS layout style block. This gave the interface a premium feel without requiring manual CSS layout configuration from scratch.
