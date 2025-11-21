# Crowd Count Using Analytics

A full-stack application for real-time crowd counting and analysis using YOLOv8 object detection. The system allows users to upload videos, define detection zones, and analyze crowd density with detailed analytics.

## Features

- **User Authentication**: Secure login and registration with role-based access (Admin/User)
- **Video Upload & Processing**: Upload videos for crowd analysis
- **Zone Drawing**: Define custom detection zones on videos
- **Real-time Detection**: YOLOv8-based crowd detection and counting
- **Analytics Dashboard**: View crowd statistics and trends
- **Admin Panel**: User management and system monitoring
- **Responsive UI**: Modern Next.js frontend with Tailwind CSS

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: MySQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT with python-jose
- **Object Detection**: YOLOv8 (Ultralytics)
- **Video Processing**: OpenCV, imageio
- **Server**: Uvicorn

### Frontend
- **Framework**: Next.js 15
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript

## Project Structure

```
crowd_count_project/
├── backend/
│   ├── core/
│   │   ├── config.py          # Configuration settings
│   │   └── security.py        # Security utilities
│   ├── routers/
│   │   ├── user_router.py     # User endpoints
│   │   ├── admin_router.py    # Admin endpoints
│   │   ├── video_router.py    # Video upload/management
│   │   ├── zone_router.py     # Zone management
│   │   └── analysis_router.py # Analytics endpoints
│   ├── services/
│   │   └── yolo_service.py    # YOLOv8 detection service
│   ├── auth.py                # Authentication logic
│   ├── database.py            # Database connection
│   ├── models.py              # SQLAlchemy models
│   ├── schemas.py             # Pydantic schemas
│   └── main.py                # FastAPI app entry point
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js app directory
│   │   │   ├── (auth)/        # Auth pages (login, register)
│   │   │   ├── (dashboard)/   # Dashboard pages
│   │   │   └── test-connection/
│   │   ├── components/        # React components
│   │   ├── lib/               # Utility functions
│   │   └── types/             # TypeScript types
│   ├── public/                # Static assets
│   └── package.json
├── data/
│   ├── uploads/               # Uploaded videos
│   └── results/               # Analysis results
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables
└── yolov8n.pt               # YOLOv8 model weights
```

## Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- MySQL 8.0+
- Git

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd crowd_count_project
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables in `.env`:
```
DATABASE_URL=mysql+pymysql://root:root@localhost:3306/crowd_db
```

5. Start the backend server:
```bash
uvicorn backend.main:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Or use the provided batch file on Windows:
```bash
start_frontend.bat
```

The frontend will be available at `http://localhost:3000`

## Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE crowd_db;
```

2. Tables will be automatically created when the backend starts (via SQLAlchemy)

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/admin-login` - Admin login

### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile

### Videos
- `POST /videos/upload` - Upload video
- `GET /videos` - List user's videos
- `GET /videos/{video_id}` - Get video details
- `DELETE /videos/{video_id}` - Delete video

### Zones
- `POST /zones` - Create detection zone
- `GET /zones/{video_id}` - Get zones for video
- `PUT /zones/{zone_id}` - Update zone
- `DELETE /zones/{zone_id}` - Delete zone

### Analysis
- `GET /analysis/{video_id}` - Get analysis results
- `POST /analysis/{video_id}/process` - Process video

### Admin
- `GET /admin/users` - List all users
- `DELETE /admin/users/{user_id}` - Delete user
- `GET /admin/stats` - System statistics

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Upload Video**: Go to Videos section and upload a video file
3. **Define Zones**: Draw detection zones on the video frame
4. **Process Video**: Start the analysis process
5. **View Analytics**: Check the analytics dashboard for results

## Configuration

### Backend Configuration
Edit `backend/core/config.py` for:
- Database settings
- JWT secret key
- CORS origins
- File upload limits

### Frontend Configuration
Edit `frontend/next.config.ts` for:
- API base URL
- Build settings
- Environment variables

## Development

### Running Tests
```bash
# Backend tests
pytest backend/

# Frontend tests
npm run test
```

### Linting
```bash
# Backend
pylint backend/

# Frontend
npm run lint
```

### Building for Production

Backend:
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Frontend:
```bash
npm run build
npm start
```

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Verify DATABASE_URL in `.env`
- Check MySQL user permissions

### Video Processing Issues
- Ensure YOLOv8 model file (`yolov8n.pt`) exists
- Check available disk space in `data/` directory
- Verify video format is supported (MP4, AVI, MOV)

### Frontend Connection Issues
- Ensure backend is running on `http://localhost:8000`
- Check CORS configuration in `backend/main.py`
- Clear browser cache and cookies

## Performance Optimization

- YOLOv8 nano model used for faster inference
- Video processing runs asynchronously
- Database queries optimized with indexes
- Frontend uses Next.js static generation where possible

## Security Considerations

- Passwords hashed with bcrypt
- JWT tokens for API authentication
- CORS configured for specific origins
- Input validation on all endpoints
- SQL injection prevention via SQLAlchemy ORM

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue in the repository.

## Future Enhancements

- Real-time WebSocket updates
- Multi-zone simultaneous processing
- Advanced analytics and reporting
- Mobile app support
- Cloud deployment options
