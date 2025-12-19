# 🎯 Crowd Count Using Analytics

<div align="center">

![Header](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=Crowd%20Count%20Analytics&fontSize=50&fontColor=ffffff&animation=twinkling&fontAlignY=35&desc=AI-Powered%20Real-Time%20Analytics&descAlignY=55&descSize=20)

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-FF6F00?style=for-the-badge&logo=yolo&logoColor=white)](https://ultralytics.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)

<br/>

[![Stars](https://img.shields.io/github/stars/Chandan-Yadav24/Crowd-Count-Using-Analytics?style=social)](https://github.com/Chandan-Yadav24/Crowd-Count-Using-Analytics/stargazers)
[![Forks](https://img.shields.io/github/forks/Chandan-Yadav24/Crowd-Count-Using-Analytics?style=social)](https://github.com/Chandan-Yadav24/Crowd-Count-Using-Analytics/network/members)
[![Issues](https://img.shields.io/github/issues/Chandan-Yadav24/Crowd-Count-Using-Analytics?color=red)](https://github.com/Chandan-Yadav24/Crowd-Count-Using-Analytics/issues)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

<br/>

**🚀 A powerful full-stack application for real-time crowd counting and analysis using state-of-the-art YOLOv8 object detection. Upload videos, define detection zones, analyze crowd density with detailed analytics, and interact with an AI chatbot for insights.**

[🌟 Features](#-features) •
[🛠️ Installation](#️-installation) •
[📖 Usage](#-usage) •
[🤝 Contributing](#-contributing)

<br/>

---

### 🎬 Demo Preview

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%">

</div>

<p align="center">
  <img src="https://user-images.githubusercontent.com/placeholder/demo.gif" alt="Demo Animation" width="80%" style="border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);"/>
</p>

<p align="center">
  <i>✨ Upload • Analyze • Visualize • Export ✨</i>
</p>

---

## 📋 Table of Contents

<details>
<summary>Click to expand</summary>

- [🌟 Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [💻 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🛠️ Installation](#️-installation)
- [🚀 Quick Start](#-quick-start)
- [📡 API Reference](#-api-reference)
- [📖 Usage Guide](#-usage-guide)
- [⚙️ Configuration](#️-configuration)
- [🔧 Development](#-development)
- [🛡️ Security](#️-security)
- [📈 Performance](#-performance)
- [🐛 Troubleshooting](#-troubleshooting)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [💬 Support](#-support)

</details>

---

## 🌟 Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🔐 **User Authentication** | Secure JWT-based login with role-based access (Admin/User) |
| 📹 **Video Processing** | Upload and process videos for crowd analysis |
| 🎯 **Zone Drawing** | Define custom detection zones on video frames |
| 🔍 **Real-time Detection** | YOLOv8-powered crowd detection and counting |
| 📊 **Analytics Dashboard** | Interactive charts and crowd statistics |
| 🤖 **AI Chatbot** | GROQ-powered insights and query assistance |
| 📤 **Data Export** | Export results in multiple formats (CSV, JSON, PDF) |
| 👨‍💼 **Admin Panel** | Complete user management and monitoring |
| 📱 **Responsive Design** | Beautiful UI that works on all devices |

</div>

<br/>

<div align="center">
  <table>
    <tr>
      <td align="center" width="33%">
        <img src="https://img.icons8.com/fluency/96/000000/artificial-intelligence.png" width="60"/>
        <br/>
        <b>AI-Powered Detection</b>
        <br/>
        <sub>State-of-the-art YOLOv8 model for accurate crowd counting</sub>
      </td>
      <td align="center" width="33%">
        <img src="https://img.icons8.com/fluency/96/000000/dashboard.png" width="60"/>
        <br/>
        <b>Real-time Analytics</b>
        <br/>
        <sub>Live statistics and beautiful visualizations</sub>
      </td>
      <td align="center" width="33%">
        <img src="https://img.icons8.com/fluency/96/000000/chatbot.png" width="60"/>
        <br/>
        <b>Smart Chatbot</b>
        <br/>
        <sub>AI assistant for insights and queries</sub>
      </td>
    </tr>
  </table>
</div>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        Next.js 15 Frontend                       │   │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │   │
│  │   │   Auth   │  │  Video   │  │ Analytics│  │   Chatbot    │   │   │
│  │   │  Pages   │  │  Upload  │  │Dashboard │  │  Interface   │   │   │
│  │   └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        FastAPI Backend                           │   │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │   │
│  │   │   Auth   │  │  Video   │  │ Analysis │  │   Chatbot    │   │   │
│  │   │  Router  │  │  Router  │  │  Router  │  │    Router    │   │   │
│  │   └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
             ┌──────────┐    ┌──────────┐    ┌──────────┐
             │  MySQL   │    │  YOLOv8  │    │   GROQ   │
             │ Database │    │  Model   │    │   API    │
             └──────────┘    └──────────┘    └──────────┘
```

---

## 💻 Tech Stack

<div align="center">

### Backend Technologies
  
<p>
  <img src="https://skillicons.dev/icons?i=python,fastapi,mysql" />
</p>

| Technology | Purpose | Version |
|:----------:|:-------:|:-------:|
| ![Python](https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white) | Core Language | 3.8+ |
| ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) | Web Framework | Latest |
| ![MySQL](https://img.shields.io/badge/-MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white) | Database | 8.0+ |
| ![SQLAlchemy](https://img.shields.io/badge/-SQLAlchemy-red?style=flat-square&logo=sqlalchemy&logoColor=white) | ORM | 2.0+ |
| ![JWT](https://img.shields.io/badge/-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) | Authentication | - |

### Frontend Technologies

<p>
  <img src="https://skillicons.dev/icons?i=nextjs,react,typescript,tailwind" />
</p>

| Technology | Purpose | Version |
|:----------:|:-------:|:-------:|
| ![Next.js](https://img.shields.io/badge/-Next.js-000000?style=flat-square&logo=next.js&logoColor=white) | React Framework | 15 |
| ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black) | UI Library | 19 |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | Language | 5+ |
| ![Tailwind](https://img.shields.io/badge/-Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | Styling | 3.4+ |
| ![Framer](https://img.shields.io/badge/-Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) | Animations | Latest |

### AI & ML Technologies

<p>
  <img src="https://skillicons.dev/icons?i=opencv,tensorflow" />
</p>

| Technology | Purpose |
|:----------:|:-------:|
| ![YOLOv8](https://img.shields.io/badge/-YOLOv8-FF6F00?style=flat-square&logo=yolo&logoColor=white) | Object Detection |
| ![OpenCV](https://img.shields.io/badge/-OpenCV-5C3EE8?style=flat-square&logo=opencv&logoColor=white) | Video Processing |
| ![GROQ](https://img.shields.io/badge/-GROQ_API-00A67E?style=flat-square&logo=openai&logoColor=white) | AI Chatbot |

</div>

---

## 📁 Project Structure

<details>
<summary>📂 Click to view full project structure</summary>

```
crowd_count_project/
│
├── 🔧 backend/
│   ├── 📂 core/
│   │   ├── ⚙️ config.py              # Configuration settings
│   │   └── 🔐 security.py            # Security utilities
│   │
│   ├── 📂 routers/
│   │   ├── 👤 user_router.py         # User endpoints
│   │   ├── 👨‍💼 admin_router.py        # Admin endpoints
│   │   ├── 🎥 video_router.py        # Video management
│   │   ├── 🎯 zone_router.py         # Zone management
│   │   ├── 📊 analysis_router.py     # Analytics endpoints
│   │   ├── 🤖 chatbot_router.py      # Chatbot endpoints
│   │   ├── 💬 user_chatbot_router.py # User chatbot
│   │   └── 📤 export_router.py       # Export endpoints
│   │
│   ├── 📂 services/
│   │   └── 🔍 yolo_service.py        # YOLOv8 service
│   │
│   ├── 🔑 auth.py                    # Authentication
│   ├── 🗄️ database.py               # Database connection
│   ├── 📋 models.py                  # SQLAlchemy models
│   ├── 📝 schemas.py                 # Pydantic schemas
│   └── 🚀 main.py                    # App entry point
│
├── 🎨 frontend/
│   ├── 📂 src/
│   │   ├── 📂 app/
│   │   │   ├── 📂 (auth)/            # Auth pages
│   │   │   ├── 📂 (dashboard)/       # Dashboard
│   │   │   └── 📂 test-connection/
│   │   ├── 📂 components/            # React components
│   │   ├── 📂 lib/                   # Utilities
│   │   └── 📂 types/                 # TypeScript types
│   ├── 📂 public/                    # Static assets
│   └── 📦 package.json
│
├── 📂 data/
│   ├── 📁 uploads/                   # Uploaded videos
│   └── 📁 results/                   # Analysis results
│
├── 📋 requirements.txt               # Python deps
├── 🔐 .env                          # Environment vars
└── 🤖 yolov8n.pt                    # Model weights
```

</details>

---

## 🛠️ Installation

### 📋 Prerequisites

<div align="center">

| Requirement | Minimum Version | Recommended |
|:-----------:|:---------------:|:-----------:|
| ![Python](https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white) | 3.8 | 3.11 |
| ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | 18 | 20 LTS |
| ![MySQL](https://img.shields.io/badge/-MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white) | 8.0 | 8.0+ |
| ![Git](https://img.shields.io/badge/-Git-F05032?style=flat-square&logo=git&logoColor=white) | 2.0 | Latest |

</div>

---

### ⚡ Quick Installation

<details>
<summary>🐧 Linux / macOS</summary>

```bash
# Clone the repository
git clone https://github.com/Chandan-Yadav24/Crowd-Count-Using-Analytics.git
cd crowd_count_project

# Setup Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup Frontend
cd frontend
npm install
cd ..

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start both servers (in separate terminals)
# Terminal 1 - Backend
uvicorn backend.main:app --reload

# Terminal 2 - Frontend
cd frontend && npm run dev
```

</details>

<details>
<summary>🪟 Windows</summary>

```powershell
# Clone the repository
git clone https://github.com/Chandan-Yadav24/Crowd-Count-Using-Analytics.git
cd crowd_count_project

# Setup Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Setup Frontend
cd frontend
npm install
cd ..

# Configure environment
copy .env.example .env
# Edit .env with your settings

# Start Backend (Terminal 1)
uvicorn backend.main:app --reload

# Start Frontend (Terminal 2)
cd frontend
npm run dev
```

</details>

---

### 🔧 Detailed Setup

<details>
<summary>📦 Backend Setup</summary>

#### 1️⃣ Clone Repository
```bash
git clone https://github.com/Chandan-Yadav24/Crowd-Count-Using-Analytics.git
cd crowd_count_project
```

#### 2️⃣ Create Virtual Environment
```bash
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on Linux/macOS
source venv/bin/activate
```

#### 3️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4️⃣ Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Database Configuration
DATABASE_URL=mysql+pymysql://root:root@localhost:3306/crowd_db

# GROQ API for Chatbot
GROQ_API_KEY=your_groq_api_key_here

# JWT Configuration
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

#### 5️⃣ Start Backend Server
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend available at: `http://localhost:8000`  
📚 API Docs: `http://localhost:8000/docs`

</details>

<details>
<summary>🎨 Frontend Setup</summary>

#### 1️⃣ Navigate to Frontend
```bash
cd frontend
```

#### 2️⃣ Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

#### 3️⃣ Start Development Server
```bash
npm run dev
```

✅ Frontend available at: `http://localhost:3000`

</details>

<details>
<summary>🗄️ Database Setup</summary>

#### Create MySQL Database
```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE crowd_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional)
CREATE USER 'crowd_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON crowd_db.* TO 'crowd_user'@'localhost';
FLUSH PRIVILEGES;
```

> 💡 Tables are automatically created when the backend starts via SQLAlchemy migrations.

</details>

---

## 🚀 Quick Start

<div align="center">

```mermaid
graph LR
    A[📝 Register] --> B[🔐 Login]
    B --> C[📹 Upload Video]
    C --> D[🎯 Define Zones]
    D --> E[⚙️ Process]
    E --> F[📊 View Analytics]
    F --> G[🤖 Chat with AI]
    G --> H[📤 Export Results]
```

</div>

### Step-by-Step Guide

| Step | Action | Description |
|:----:|:------:|:------------|
| 1️⃣ | **Register** | Create a new account with email and password |
| 2️⃣ | **Login** | Access your secure dashboard |
| 3️⃣ | **Upload** | Upload video files (MP4, AVI, MOV) |
| 4️⃣ | **Draw Zones** | Define detection areas on video frames |
| 5️⃣ | **Process** | Start AI-powered crowd analysis |
| 6️⃣ | **Analyze** | View real-time statistics and charts |
| 7️⃣ | **Chat** | Ask AI for insights about your data |
| 8️⃣ | **Export** | Download results in CSV, JSON, or PDF |

---

## 📡 API Reference

<details>
<summary>🔐 Authentication Endpoints</summary>

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | User login |
| `POST` | `/auth/admin-login` | Admin login |
| `POST` | `/auth/refresh` | Refresh token |
| `POST` | `/auth/logout` | User logout |

</details>

<details>
<summary>👤 User Endpoints</summary>

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `GET` | `/users/me` | Get current user profile |
| `PUT` | `/users/me` | Update user profile |
| `DELETE` | `/users/me` | Delete user account |

</details>

<details>
<summary>🎥 Video Endpoints</summary>

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `POST` | `/videos/upload` | Upload video |
| `GET` | `/videos` | List user's videos |
| `GET` | `/videos/{video_id}` | Get video details |
| `DELETE` | `/videos/{video_id}` | Delete video |
| `GET` | `/videos/{video_id}/thumbnail` | Get video thumbnail |

</details>

<details>
<summary>🎯 Zone Endpoints</summary>

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `POST` | `/zones` | Create detection zone |
| `GET` | `/zones/{video_id}` | Get zones for video |
| `PUT` | `/zones/{zone_id}` | Update zone |
| `DELETE` | `/zones/{zone_id}` | Delete zone |

</details>

<details>
<summary>📊 Analysis Endpoints</summary>

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `GET` | `/analysis/{video_id}` | Get analysis results |
| `POST` | `/analysis/{video_id}/process` | Process video |
| `GET` | `/analysis/{video_id}/status` | Get processing status |
| `GET` | `/analysis/{video_id}/frames` | Get analyzed frames |

</details>

<details>
<summary>🤖 Chatbot Endpoints</summary>

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `POST` | `/chatbot/query` | Send query to AI |
| `GET` | `/chatbot/history` | Get chat history |
| `DELETE` | `/chatbot/history` | Clear chat history |

</details>

<details>
<summary>📤 Export Endpoints</summary>

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `GET` | `/export/{video_id}` | Export analysis results |
| `POST` | `/export/batch` | Batch export |
| `GET` | `/export/formats` | List available formats |

</details>

<details>
<summary>👨‍💼 Admin Endpoints</summary>

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `GET` | `/admin/users` | List all users |
| `DELETE` | `/admin/users/{user_id}` | Delete user |
| `GET` | `/admin/stats` | System statistics |
| `GET` | `/admin/logs` | System logs |

</details>

---

## ⚙️ Configuration

<details>
<summary>🔧 Backend Configuration</summary>

Edit `backend/core/config.py`:

```python
class Settings:
    # Database
    DATABASE_URL: str = "mysql+pymysql://user:pass@localhost:3306/crowd_db"
    
    # JWT
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: list = ["http://localhost:3000"]
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 500 * 1024 * 1024  # 500MB
    ALLOWED_EXTENSIONS: list = [".mp4", ".avi", ".mov", ".mkv"]
    
    # YOLO
    MODEL_PATH: str = "yolov8n.pt"
    CONFIDENCE_THRESHOLD: float = 0.5
```

</details>

<details>
<summary>🎨 Frontend Configuration</summary>

Edit `frontend/next.config.ts`:

```typescript
const nextConfig = {
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8000',
  },
  images: {
    domains: ['localhost'],
  },
  // ... other configurations
};
```

</details>

---

## 🔧 Development

### Running Tests

```bash
# Backend tests
cd backend
pytest --cov=. --cov-report=html

# Frontend tests
cd frontend
npm run test
npm run test:coverage
```

### Linting & Formatting

```bash
# Backend
black backend/
isort backend/
pylint backend/

# Frontend
npm run lint
npm run lint:fix
npm run format
```

### Building for Production

```bash
# Backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4

# Frontend
cd frontend
npm run build
npm start
```

---

## 🛡️ Security

<div align="center">

| Feature | Implementation |
|:-------:|:---------------|
| 🔐 Password Hashing | bcrypt with salt |
| 🎫 Authentication | JWT tokens |
| 🌐 CORS | Configured for specific origins |
| ✅ Input Validation | Pydantic schemas |
| 💉 SQL Injection Prevention | SQLAlchemy ORM |
| 🔑 API Keys | Environment variables |
| 🔒 HTTPS | Recommended for production |

</div>

---

## 📈 Performance

- ⚡ **YOLOv8 Nano** model for faster inference
- 🔄 **Async processing** for video analysis
- 📊 **Database indexing** for optimized queries
- 🖼️ **Static generation** where possible in Next.js
- 💾 **Redis caching** support (optional)
- 🗜️ **Gzip compression** for API responses

---

## 🐛 Troubleshooting

<details>
<summary>❌ Database Connection Issues</summary>

```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify connection
mysql -u root -p -e "SHOW DATABASES;"

# Check .env configuration
cat .env | grep DATABASE_URL
```

</details>

<details>
<summary>❌ Video Processing Issues</summary>

```bash
# Verify YOLOv8 model exists
ls -la yolov8n.pt

# Check disk space
df -h data/

# Test video format
ffprobe your_video.mp4
```

</details>

<details>
<summary>❌ Chatbot Issues</summary>

```bash
# Verify GROQ API key
echo $GROQ_API_KEY

# Test API connection
curl -X POST https://api.groq.com/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json"
```

</details>

<details>
<summary>❌ Frontend Connection Issues</summary>

```bash
# Check backend is running
curl http://localhost:8000/health

# Clear Next.js cache
cd frontend
rm -rf .next
npm run dev
```

</details>

---


### Upcoming Features

- [ ] 🔄 Real-time WebSocket updates
- [ ] 🎯 Multi-zone simultaneous processing
- [ ] 📈 Advanced analytics and reporting
- [ ] 📱 Mobile app support (React Native)
- [ ] ☁️ Cloud deployment options (AWS, GCP, Azure)
- [ ] 🌍 Multi-language chatbot support
- [ ] 📝 Custom report generation
- [ ] 🔔 Push notifications
- [ ] 📊 Historical data comparison
- [ ] 🎨 Custom themes and branding

---

## 🤝 Contributing

Contributions are **greatly appreciated**! 🎉

<div align="center">

[![Contributors](https://contrib.rocks/image?repo=Chandan-Yadav24/Crowd-Count-Using-Analytics)](https://github.com/Chandan-Yadav24/Crowd-Count-Using-Analytics/graphs/contributors)

</div>

### How to Contribute

1. 🍴 **Fork** the repository
2. 🔧 **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 **Push** to the branch (`git push origin feature/AmazingFeature`)
5. 🔃 **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Be respectful and constructive

---

## 📄 License

<div align="center">

Distributed under the **MIT License**. See `LICENSE` for more information.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

</div>

---

## 💬 Support

<div align="center">

| Channel | Link |
|:-------:|:----:|
| 🐛 Issues | [GitHub Issues](https://github.com/Chandan-Yadav24/Crowd-Count-Using-Analytics/issues) |
| 💬 Discussions | [GitHub Discussions](https://github.com/Chandan-Yadav24/Crowd-Count-Using-Analytics/discussions) |
| 📧 Email | 24chandankumar03@gmail.com |

</div>

---

## 👨‍💻 Author

<div align="center">

<a href="https://github.com/Chandan-Yadav24">
  <img src="https://github.com/Chandan-Yadav24.png" width="100px" style="border-radius: 50%;" alt="Author"/>
</a>

**Chandan Kumar Yadav**

[![GitHub](https://img.shields.io/badge/-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Chandan-Yadav24)
[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/chandan-kumar-yadav-0196b82b7)

</div>

---

<div align="center">

### ⭐ Star this repository if you found it helpful!

<br/>

![Footer](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer)

<br/>

**Made with ❤️ and ☕ by [Chandan Kumar Yadav](https://github.com/Chandan-Yadav24)**

<sub>© 2025 Crowd Count Analytics. All rights reserved.</sub>

</div>
