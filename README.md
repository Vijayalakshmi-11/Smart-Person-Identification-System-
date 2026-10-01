# Missing Person Tracking System

An AI-powered full-stack web application for tracking missing persons using facial recognition technology. The system allows users to register missing person cases, scan CCTV footage for potential matches, and review sightings.

## Features

- **User Authentication**: Secure email/password authentication with Supabase
- **Missing Person Registration**: Register cases with photos, descriptions, and last known details
- **AI Face Recognition**: Automatic face descriptor generation using FaceNet
- **CCTV Scanner**: Upload videos or images to scan for missing persons
- **Sightings Management**: Review, confirm, or dismiss potential matches
- **Real-time Dashboard**: Track all active cases and sightings

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│              React + TypeScript + Tailwind                   │
│  ┌────────────┬────────────┬────────────┬────────────┐     │
│  │Active Cases│Register    │CCTV Scanner│Sightings   │     │
│  │            │Case        │            │Review      │     │
│  └────────────┴────────────┴────────────┴────────────┘     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ├─── Supabase Auth
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                    Supabase Database                         │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │missing_persons   │      │sightings         │            │
│  │- id              │      │- id              │            │
│  │- name            │      │- missing_person_id           │
│  │- descriptor (AI) │      │- confidence_score│            │
│  │- photo_url       │      │- status          │            │
│  └──────────────────┘      └──────────────────┘            │
│                                                              │
│  Storage Bucket: missing-persons (photos)                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                     Backend API                              │
│              Python + FastAPI + PyTorch                      │
│  ┌────────────────────────────────────────────────┐         │
│  │ POST /generate-descriptor                      │         │
│  │   - Face detection with MTCNN                  │         │
│  │   - 512-d embedding with FaceNet               │         │
│  │                                                 │         │
│  │ POST /scan-video                               │         │
│  │   - Frame extraction with OpenCV               │         │
│  │   - Face detection and matching                │         │
│  │   - Cosine similarity scoring                  │         │
│  └────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Supabase Client** for database and auth
- **Lucide React** for icons

### Backend
- **FastAPI** - Modern Python web framework
- **PyTorch** - Deep learning framework
- **FaceNet (facenet-pytorch)** - Face recognition model
- **MTCNN** - Face detection
- **OpenCV** - Video processing
- **Uvicorn** - ASGI server

### Database & Storage
- **Supabase PostgreSQL** - Database
- **Supabase Storage** - File storage
- **Supabase Auth** - Authentication

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Supabase** account
- **Docker** (optional, for containerized deployment)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd missing-person-tracker
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. The database schema and storage buckets are already configured via migrations
3. Copy your project credentials:
   - Project URL
   - Anon/Public Key

### 3. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your Supabase credentials
# VITE_SUPABASE_URL=your_supabase_project_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# VITE_BACKEND_API_URL=http://localhost:8000
```

### 4. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python main.py
```

The backend will start on `http://localhost:8000`

### 5. Run the Frontend

```bash
# From the root directory
npm run dev
```

The frontend will start on `http://localhost:5173`

## Docker Deployment

For production deployment using Docker:

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

## Usage Guide

### 1. Create an Account
- Navigate to the application
- Click "Sign up"
- Enter your email and password
- Sign in with your credentials

### 2. Register a Missing Person
1. Click the "Register Case" tab
2. Fill in the details:
   - Full name
   - Age and gender
   - Last seen location and date
   - Physical description
   - Contact information
3. Upload a clear photo of the person
4. Submit the form
5. The system will automatically generate a face descriptor

### 3. Scan CCTV Footage
1. Go to the "CCTV Scanner" tab
2. Upload a video (.mp4, .mov, .avi) or image (.jpg, .png)
3. Optionally add a location
4. Click "Start Scan"
5. The system will:
   - Extract frames from video
   - Detect faces in each frame
   - Compare against all active cases
   - Show matches with confidence scores
6. Matches above 60% confidence are automatically saved as sightings

### 4. Review Sightings
1. Navigate to the "Sightings" tab
2. Review pending sightings
3. For each sighting, you can:
   - Confirm if it's a valid match
   - Dismiss if it's a false positive
4. View confirmed and dismissed sightings in their respective tabs

### 5. View Active Cases
- The "Active Cases" tab shows all registered missing persons
- Use the search bar to filter by name, case number, or location
- View details including photos, descriptions, and contact information

## API Documentation

### POST /generate-descriptor

Generate a face descriptor from an uploaded photo.

**Request:**
```
Content-Type: multipart/form-data
file: image file
```

**Response:**
```json
{
  "success": true,
  "descriptor": [0.123, -0.456, ...],
  "message": "Face descriptor generated successfully",
  "faces_detected": 1
}
```

### POST /scan-video

Scan a video or image for missing persons.

**Request:**
```
Content-Type: multipart/form-data
file: video/image file
database_persons: JSON array of missing persons
```

**Response:**
```json
{
  "success": true,
  "matches": [
    {
      "person_id": "uuid",
      "person_name": "John Doe",
      "confidence": 85.5,
      "case_number": "MP-123456",
      "bbox": [100, 100, 200, 200]
    }
  ],
  "frames_processed": 50,
  "total_faces_detected": 12,
  "message": "Scan completed"
}
```

## Database Schema

### missing_persons
- `id` - UUID primary key
- `case_number` - Unique case identifier
- `name` - Full name
- `age` - Age in years
- `gender` - Gender
- `description` - Physical description
- `last_seen_location` - Last known location
- `last_seen_date` - Date last seen
- `photo_url` - URL to photo
- `descriptor` - 512-d face embedding (JSON)
- `status` - Case status (active, found, closed)
- `contact_info` - Contact information
- `user_id` - User who created the case
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

### sightings
- `id` - UUID primary key
- `missing_person_id` - Reference to missing person
- `image_url` - URL to CCTV frame
- `confidence_score` - Match confidence (0-100)
- `location` - Sighting location
- `sighting_date` - Date of sighting
- `status` - Review status (pending_review, confirmed, dismissed)
- `bbox` - Bounding box coordinates (JSON)
- `notes` - Additional notes
- `reviewed_by` - User who reviewed
- `reviewed_at` - Review timestamp
- `created_at` - Creation timestamp

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Authenticated access** required for all operations
- **Secure file storage** with Supabase Storage
- **Password hashing** handled by Supabase Auth
- **CORS protection** on backend API

## Face Recognition Details

### Face Detection
- Uses **MTCNN** (Multi-task Cascaded Convolutional Networks)
- Detects faces with 90%+ confidence threshold
- Returns bounding box coordinates

### Face Descriptor Generation
- Uses **FaceNet** (InceptionResnetV1) pre-trained on VGGFace2
- Generates 512-dimensional embeddings
- Embeddings are L2-normalized for cosine similarity

### Matching Algorithm
- **Cosine similarity** between face descriptors
- Match threshold: 60% (0.60)
- Higher scores indicate better matches:
  - 80%+ : High confidence match
  - 70-80% : Medium confidence match
  - 60-70% : Low confidence match

## Troubleshooting

### Backend Issues

**Problem:** PyTorch installation fails
```bash
# Try installing with specific version
pip install torch==2.1.2 torchvision==0.16.2 --index-url https://download.pytorch.org/whl/cpu
```

**Problem:** OpenCV errors on Linux
```bash
# Install system dependencies
sudo apt-get update
sudo apt-get install libgl1-mesa-glx libglib2.0-0
```

### Frontend Issues

**Problem:** Environment variables not loading
- Ensure `.env` file is in the root directory
- Variables must start with `VITE_`
- Restart the dev server after changing `.env`

**Problem:** Cannot connect to backend
- Verify backend is running on port 8000
- Check `VITE_BACKEND_API_URL` in `.env`
- Ensure CORS is enabled in backend

## Performance Optimization

- Videos are processed at 30 frame intervals (1 frame per second for 30fps video)
- Maximum 50 frames processed per video
- Face detection confidence threshold set to 90%
- Matching confidence threshold set to 60%

## Future Enhancements

- [ ] Real-time CCTV integration
- [ ] Email/SMS notifications for matches
- [ ] Geographic heat maps of sightings
- [ ] Advanced search filters
- [ ] Multi-language support
- [ ] Mobile application
- [ ] Batch photo upload
- [ ] Enhanced face recognition models

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team

## Acknowledgments

- **FaceNet** - Face recognition model by Google
- **Supabase** - Backend as a Service platform
- **FastAPI** - Modern Python web framework
- **React** - UI library by Meta

---

Built with care for helping reunite missing persons with their families.
