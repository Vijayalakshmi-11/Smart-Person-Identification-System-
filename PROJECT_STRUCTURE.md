# Project Structure

Complete directory structure and file organization for the Missing Person Tracking System.

## Directory Tree

```
missing-person-tracker/
├── backend/                          # Python FastAPI Backend
│   ├── models/
│   │   └── face_model.py            # Face recognition model (FaceNet + MTCNN)
│   ├── utils/
│   │   ├── extract_frames.py        # Video frame extraction utilities
│   │   └── match_faces.py           # Face matching algorithms
│   ├── main.py                      # FastAPI application entry point
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Backend Docker configuration
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore                   # Backend git ignore rules
│   ├── start.sh                     # Linux/Mac startup script
│   └── start.bat                    # Windows startup script
│
├── src/                             # React Frontend Source
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.tsx           # Login form component
│   │   │   └── Register.tsx        # Registration form component
│   │   └── Dashboard/
│   │       ├── Dashboard.tsx       # Main dashboard layout
│   │       ├── ActiveCases.tsx     # Display active missing person cases
│   │       ├── RegisterCase.tsx    # Register new missing person form
│   │       ├── CCTVScanner.tsx     # CCTV video/image scanner
│   │       └── SightingsReview.tsx # Review and manage sightings
│   ├── contexts/
│   │   └── AuthContext.tsx         # Authentication context provider
│   ├── lib/
│   │   └── supabase.ts             # Supabase client configuration
│   ├── services/
│   │   └── api.ts                  # Backend API service functions
│   ├── App.tsx                     # Main app component
│   ├── main.tsx                    # React entry point
│   ├── index.css                   # Global styles (Tailwind)
│   └── vite-env.d.ts              # Vite type definitions
│
├── public/                          # Static assets (served by Vite)
│
├── dist/                           # Production build output (generated)
│
├── node_modules/                   # Node dependencies (generated)
│
├── .env                            # Environment variables (not in git)
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── docker-compose.yml              # Docker Compose configuration
├── Dockerfile                      # Frontend Docker configuration
├── nginx.conf                      # Nginx configuration for frontend
├── index.html                      # HTML entry point
├── package.json                    # Node dependencies and scripts
├── package-lock.json               # Locked dependency versions
├── vite.config.ts                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.app.json               # App-specific TypeScript config
├── tsconfig.node.json              # Node-specific TypeScript config
├── eslint.config.js                # ESLint configuration
├── README.md                       # Main documentation
├── QUICKSTART.md                   # Quick start guide
└── PROJECT_STRUCTURE.md            # This file
```

## Key Files Explained

### Backend Files

#### `backend/main.py`
FastAPI application with two main endpoints:
- `POST /generate-descriptor` - Generate face descriptor from image
- `POST /scan-video` - Scan video/image for missing persons
- Health check and CORS middleware

#### `backend/models/face_model.py`
Face recognition model class:
- MTCNN for face detection
- FaceNet (InceptionResnetV1) for embeddings
- Cosine similarity calculation
- 512-dimensional face descriptors

#### `backend/utils/extract_frames.py`
Video processing utilities:
- Extract frames from video files
- Support for multiple formats (MP4, MOV, AVI)
- Frame interval configuration
- Batch processing

#### `backend/utils/match_faces.py`
Face matching logic:
- Compare face descriptors
- Confidence threshold filtering (60%)
- Deduplication of matches
- Best match selection

### Frontend Files

#### `src/App.tsx`
Main application component:
- Authentication state management
- Route between login/register/dashboard
- Loading states

#### `src/contexts/AuthContext.tsx`
Authentication context:
- Supabase auth integration
- Sign up, sign in, sign out functions
- User session management
- Auth state listeners

#### `src/lib/supabase.ts`
Supabase client setup:
- Client initialization
- TypeScript interfaces for database tables
- Type-safe database queries

#### `src/services/api.ts`
Backend API service:
- `generateFaceDescriptor()` - Upload photo and get descriptor
- `scanVideo()` - Upload CCTV footage and get matches
- `checkBackendHealth()` - Health check
- Error handling

#### `src/components/Dashboard/ActiveCases.tsx`
Active cases display:
- Fetch and display all active missing persons
- Search/filter functionality
- Card-based layout with photos and details

#### `src/components/Dashboard/RegisterCase.tsx`
Missing person registration:
- Form with validation
- Photo upload to Supabase Storage
- Face descriptor generation
- Case number generation
- Database insertion

#### `src/components/Dashboard/CCTVScanner.tsx`
CCTV scanning interface:
- Video/image upload
- Progress indication
- Match results display
- Automatic sighting creation

#### `src/components/Dashboard/SightingsReview.tsx`
Sightings management:
- View pending/confirmed/dismissed sightings
- Confirm or dismiss matches
- Filter by status
- Display match confidence

## Configuration Files

### `package.json`
Node.js project configuration:
- Dependencies (React, Supabase, Tailwind, etc.)
- Scripts (dev, build, lint, preview)
- Project metadata

### `vite.config.ts`
Vite bundler configuration:
- React plugin
- Build optimization
- Dev server settings

### `tailwind.config.js`
Tailwind CSS configuration:
- Content paths for purging
- Theme customization
- Plugin configuration

### `tsconfig.json`
TypeScript configuration:
- Compiler options
- Path mappings
- Type checking strictness

### `docker-compose.yml`
Docker orchestration:
- Frontend service (port 3000)
- Backend service (port 8000)
- Network configuration
- Volume mounts
- Health checks

### `.env.example`
Environment variables template:
- Supabase URL and keys
- Backend API URL
- No sensitive data (template only)

## Data Flow

### Registration Flow
```
User → RegisterCase.tsx → Upload Photo → Supabase Storage
                       → Generate Descriptor → Backend API
                       → Save to Database → Supabase PostgreSQL
```

### Scanning Flow
```
User → CCTVScanner.tsx → Upload Video/Image
                      → Backend API → Extract Frames
                                  → Detect Faces
                                  → Generate Descriptors
                                  → Match Against Database
                      → Display Results
                      → Create Sightings → Supabase PostgreSQL
```

### Review Flow
```
User → SightingsReview.tsx → Fetch Sightings → Supabase PostgreSQL
                          → Confirm/Dismiss → Update Database
```

## Database Tables

### `missing_persons`
Stores missing person cases with face descriptors

### `sightings`
Stores potential matches from CCTV scans

### `storage.objects`
Stores uploaded photos via Supabase Storage

## API Endpoints

### Backend (Port 8000)
- `GET /` - API info
- `GET /health` - Health check
- `POST /generate-descriptor` - Face descriptor generation
- `POST /scan-video` - Video/image scanning

### Supabase (via SDK)
- Auth endpoints (sign up, sign in, sign out)
- Database CRUD via PostgREST
- Storage upload/download
- Real-time subscriptions (optional)

## Development vs Production

### Development
- Frontend: Vite dev server (port 5173)
- Backend: Uvicorn with hot reload (port 8000)
- Direct Supabase connection
- Source maps enabled

### Production (Docker)
- Frontend: Nginx serving static files (port 3000)
- Backend: Uvicorn in container (port 8000)
- Optimized builds
- Environment variable configuration

## Security Layers

1. **Authentication**: Supabase Auth (email/password)
2. **Row Level Security**: PostgreSQL RLS policies
3. **API Security**: CORS configuration
4. **Storage Security**: Bucket policies
5. **Environment Variables**: Sensitive data isolation

## Build Process

### Frontend Build
```
npm run build
  → Vite compiles TypeScript
  → Bundles with Rollup
  → Optimizes assets
  → Outputs to dist/
```

### Backend Build
```
docker build
  → Install system dependencies
  → Install Python packages
  → Copy application code
  → Set up uvicorn server
```

## Testing Strategy

### Frontend
- Component testing (optional)
- E2E testing (optional)
- Manual testing via dev server

### Backend
- Unit tests for face matching
- Integration tests for API endpoints
- Manual testing via Swagger UI at `/docs`

## Deployment Options

1. **Docker Compose** (Recommended)
   - Single command deployment
   - Isolated containers
   - Easy scaling

2. **Manual Deployment**
   - Build frontend → Deploy to CDN/hosting
   - Run backend → Deploy to server
   - Configure environment variables

3. **Cloud Platforms**
   - Frontend: Vercel, Netlify, Cloudflare Pages
   - Backend: Railway, Render, AWS, Google Cloud
   - Database: Supabase (already cloud-hosted)

## Maintenance Tasks

- Monitor Supabase usage and storage
- Update dependencies regularly
- Review and clean old sightings
- Backup database periodically
- Monitor API performance
- Update face recognition models

---

This structure is designed for scalability, maintainability, and clear separation of concerns.
