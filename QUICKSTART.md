# Quick Start Guide

Get the Missing Person Tracking System up and running in minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.11+ installed
- [ ] Supabase account created
- [ ] Git installed

## 5-Minute Setup

### Step 1: Get Supabase Credentials (2 minutes)

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project (or use existing)
3. Wait for database to be ready
4. Go to **Settings** → **API**
5. Copy:
   - **Project URL**
   - **anon/public key**

### Step 2: Configure Environment (1 minute)

Create a `.env` file in the root directory:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_BACKEND_API_URL=http://localhost:8000
```

### Step 3: Start Backend (1 minute)

**On macOS/Linux:**
```bash
cd backend
chmod +x start.sh
./start.sh
```

**On Windows:**
```cmd
cd backend
start.bat
```

The script will:
- Create a virtual environment
- Install all Python dependencies
- Start the FastAPI server on port 8000

**First time setup may take 5-10 minutes to download ML models!**

### Step 4: Start Frontend (1 minute)

In a new terminal:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## First Use

1. **Create Account**
   - Click "Sign up"
   - Enter email and password
   - Sign in

2. **Register a Missing Person**
   - Click "Register Case" tab
   - Fill in details
   - Upload a clear face photo
   - Submit

3. **Test CCTV Scanner**
   - Click "CCTV Scanner" tab
   - Upload a test image with a face
   - Click "Start Scan"
   - View matches

## Troubleshooting

### Backend won't start
```bash
# Ensure Python 3.11+ is installed
python --version

# Try manual installation
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py
```

### Frontend shows "Cannot connect to backend"
- Ensure backend is running on port 8000
- Check `VITE_BACKEND_API_URL` in `.env`
- Restart frontend dev server after changing `.env`

### "No face detected" error
- Use a clear, front-facing photo
- Ensure good lighting
- Face should be clearly visible
- Try a different photo

### Database tables not found
The migrations should run automatically. The database schema is already configured in your Supabase project.

## Test the System

### Test Image
Use a selfie or any clear face photo for testing.

### Sample Data
1. Register 2-3 test cases with different photos
2. Upload one of those photos to CCTV scanner
3. Should get a high-confidence match

## Production Deployment

### Using Docker

```bash
# Build and run
docker-compose up --build

# Access application
Frontend: http://localhost:3000
Backend: http://localhost:8000
```

### Environment Variables for Production

Update `.env` with production Supabase credentials:
```bash
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
VITE_BACKEND_API_URL=https://your-backend-domain.com
```

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review API documentation in README
- Check troubleshooting section
- Open an issue on GitHub

---

**Note**: First-time backend startup downloads ML models (~100MB) and may take 5-10 minutes. Subsequent starts are much faster.
