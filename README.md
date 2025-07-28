# 🕹️ FHNW SQL Training Game

This repository contains the full-stack implementation of the **FHNW SQL Training Game**, a gamified learning platform
developed as part of multiple studies for the Bachelor of Business Information Technology at FHNW. The goal is to
evaluate the effectiveness and acceptance of a learning game as an alternative method for teaching SQL, a core part of
the "Database Technology" course.

## ✨ Features

- 🎯 **AI-based Task Recommendation System**  
  Dynamically adjusts task difficulty based on user performance to keep players challenged and engaged.

- 📚 **Books & Task System**  
  Organize lessons into themed books. Supports rich HTML, SQL examples, and JSON-style tasks.

- 🎨 **Multiple Themes**  
  Books and tasks can be styled with different visual themes for varied learning experiences.

- 🧩 **SQL & JSON Task Support**  
  Create interactive SQL or JSON-based exercises with validation logic, results, and distractors.

- 🏆 **Points & Scoring System**  
  Earn points for correct answers and progress tracking.

- 📈 **Leaderboards**  
  Global or local leaderboards for a competitive edge and classroom motivation.

- ⚙️ **Admin Tools**  
  Includes a book/task editor (experimental), configuration controls, and a summary page (WIP).

---

## 🚀 Deployment with Docker

### ⚡ Quick Start: Production Ready

**1. Prerequisites**

- An internet connection to build the project (automatically downloads dependencies)
- **Virtualization must be enabled in your BIOS/UEFI**  
  Docker Desktop requires virtualization (Intel VT-x or AMD-V) to be enabled.  
  If virtualization is disabled, Docker Desktop will not start.

<details>
<summary><strong>How to Check if Virtualization is Enabled (Windows)</strong></summary>

1. Press <kbd>Win</kbd>+<kbd>R</kbd>, type <code>msinfo32</code>, and press <strong>Enter</strong>.
2. In the <strong>System Summary</strong> window, look for:
    - <strong>Virtualization Enabled In Firmware</strong> (should say <strong>Yes</strong>)
    - <strong>Virtualization-based Security Services Running</strong> (should say <strong>Yes</strong>)

</details>

<details>
<summary><strong>How to Enable Virtualization in BIOS/UEFI</strong></summary>

1. Restart your PC and enter BIOS/UEFI (usually by pressing <kbd>DEL</kbd>, <kbd>F2</kbd>, <kbd>F10</kbd>, or <kbd>
   F12</kbd> during startup).
2. Navigate to the <strong>Virtualization</strong> / <strong>Intel VT-x</strong> / <strong>AMD-V</strong> setting (often
   under "Advanced" or "CPU Configuration").
3. Set virtualization to <strong>Enabled</strong>.
4. Save changes and restart your computer.
5. Try running Docker Desktop again.

</details>

> For more troubleshooting, see
> the [Docker Desktop troubleshooting guide](https://docs.docker.com/desktop/troubleshoot/).

**2. Install Docker**

- **Windows / macOS:**
    - Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop).
    - Need help? See the [Windows install guide](https://docs.docker.com/desktop/install/windows-install/)
      or [Mac install guide](https://docs.docker.com/desktop/install/mac-install/).
    - ⚠️ **Windows users:** Make sure [WSL 2.0](https://docs.microsoft.com/en-us/windows/wsl/install) is enabled and set
      as the backend for Docker Desktop.

- **Linux:**
    - Install Docker and Docker Compose using your system’s package manager, e.g.:
      ```bash
      sudo apt update
      sudo apt install docker.io docker-compose
      ```
    - For more details, see the [Docker Engine Linux installation guide](https://docs.docker.com/engine/install/).

**3. Download the Repository**

- Use the `main` branch for stable builds.

**4. Create a `.env` File**

In the **root directory** of the project, create a file named `.env` with the following contents:

```env
# URL for the backend API (do not change unless you modified docker-compose.yml)
API_URL=http://localhost:4001

# URL for socket.io communications (frontend-backend real-time)
IO_URL=http://localhost:80

# Email provider API key (set to 'blank' if not using email features)
POSTMARK_API_KEY=blank

# The sender address for outgoing emails (used for password reset, etc)
FROM_SENDER=stg@github.io
```

Tips:

- Lines starting with # are comments.
- The default values above will work for most local setups using Docker Compose.
- Make sure your .env file is in the root folder (beside your docker-compose.yml).
- If you need to change ports or email setup, adjust these values accordingly.

<details>
<summary><strong>What is POSTMARK_API_KEY and how does email sending work?</strong></summary>

**Postmark** is a transactional email service used by the backend to send emails (e.g., password resets, notifications).

- By default, if you set `POSTMARK_API_KEY=blank` in your `.env`, email sending is disabled. This is fine for local
  development.
- To enable real email sending (e.g. for production or testing password resets):
    1. [Create a Postmark account](https://postmarkapp.com/), make a server, and copy your API key.
    2. Set `POSTMARK_API_KEY=your_real_postmark_key` in your `.env` file.
    3. Set `FROM_SENDER` to an email address you have verified in your Postmark account.

If you prefer a different email provider (SMTP or another service), you’ll need to adapt the backend code.

> For most local/dev work, you can leave the key as `blank` and ignore email errors.

</details>

**5. Build and Run**

```bash
    docker-compose build
    docker-compose up
```

---

### 💻 Quick Start: Development Ready

#### 🧪 Using `dev-compose.yml`

This is the fastest way to start developing: Follow the same steps as the regular deployment, **but
you can skip step 4 (setting environment variables)**.

```bash
    docker-compose build
    docker-compose -f dev-compose.yml up
```

#### 💡 JetBrains WebStorm

Includes a preconfigured [Dev_Compose.xml](.idea/runConfigurations/Dev_Compose.xml) to start via UI.

#### 🧑‍💻 Access

Once running, open your browser to [http://localhost](http://localhost) (or the port you configured).

#### 🐞 Debugging

- Use browser dev tools (`F12`) for live feedback
- Use container logs for backend issues

---

## 📖 Documentation Hub

Comprehensive technical documents, development notes, and further details to frontend and backend components can be
found in the
[**Documentation Hub**](docs/index.md).

---

## 📂 Repository Structure

```
/
├── backend/
│ ├── api/                                  # Backend REST API (Node.js server)
│ └── model/                                # Python AI/ML recommendation service
├── docs/                                   # Documentation hub (technical docs, development docs, etc.)
├── frontend/                               # Frontend web client (HTML, CSS, JS, localization, books and tasks)
└── *                                       # Root level files for configuration and documentation
```

---

## 🏗 Architecture

### 🧩 Services

```
├── Frontend                                # Port 80 | 3000
│   └── Javascript Application    
├── Backend API                             # Port 4001
│   └── Express.js + MongoDB
├── Recommendation ML Service               # Port 5001
│   └── FastAPI + Python
└── MongoDB                                 # Port 27017
```

### 💬 Communication Flow

```
1. Frontend (80/3000) ───► Backend API (4001)
   └──► ML Service (5001)
2. Backend API (4001) ───► ML Service (5001)
   └──► MongoDB (27017)
```

### 🐋 Docker Containers

```
├── stg-frontend                            # Frontend container
├── stg-api                                 # Main API container
├── stg-model                               # Recommendation service container
└── stg-mongo                               # Database container
```

---

## 🧰 Technologies

**Built with**

- JavaScript (Vanilla)
- HTML / CSS
- Python
- MongoDB

**Infrastructure**

- Docker (Node.js, Nginx)

**Supported Browsers**

- Chrome
- Firefox
- Safari
- Microsoft Edge (Chromium)

---

## 🔐 Data Usage

The collected data and their usage are explained within [PRIVACY.md](PRIVACY.md).

---

## 🙏 Credits

We would like to say thanks to **Aurora Lahtela** from Helsinki who created the original codebase called
SQL-Training-Game. This work is a customization of Aurora Lahtela's work, adapted to the needs of the FHNW. One can diff
the
changes between the original code base and the one of FHNW-SQL-Training-Game through the created tag
called `AuroraLS3/SQL-Training-Game-e755cc5` representing the state of the commit `e755cc5`

- [Compare the changes](https://github.com/FHNW-SQL-Training-Game/FHNW-SQL-Training-Game.github.io/compare/AuroraLS3/SQL-Training-Game-e755cc5...main)
- [AuroraLS3/SQL-Training-Game](https://github.com/AuroraLS3/SQL-Training-game)

**Sound effects from freesound.org (CC License):**

- book_page_turn: SmartWentCody, ["Book Page Turning.wav"](https://creativecommons.org/licenses/by/3.0/) (*edited
  version*)
- right_answer: rhodesmas, ["Coins Purchase 4.wav"](https://creativecommons.org/licenses/by/3.0/) (*edited version*)
- wrong_answer: Sjonas88, ["fail-sound.wav"](https://creativecommons.org/publicdomain/zero/1.0/) (*edited version*)
