# Simple Flashcard Generator API

A stateless Flask API that generates flashcards from uploaded files using Google Gemini AI. No database, no authentication - just upload and get flashcards!

## 🚀 Quick Setup

### 1. Install Dependencies

```powershell
cd backend

# Create virtual environment
python -m venv .venv

# Activate (PowerShell)
.\.venv\Scripts\Activate.ps1

# Install packages
pip install -r requirements.txt
```

### 2. Get Google Gemini API Key

1. Go to https://ai.google.dev/
2. Click "Get API key in Google AI Studio"
3. Sign in with Google account
4. Click "Get API Key" or "Create API key"
5. Copy the API key (starts with `AIza...`)

### 3. Create `.env` File

Create a `.env` file in the `backend` folder:

```env
GOOGLE_API_KEY=AIzaSy...your-key-here
ELEVENLABS_API_KEY=your-elevenlabs-key-if-using-audio
```

### 4. Run the Server

```powershell
python main.py
```

Server runs on: **http://localhost:8000**

---

## 📡 API Endpoints

### Generate Flashcards from File

**Upload a file and get flashcards:**

```http
POST /api/generate-flashcards
Content-Type: multipart/form-data

Form data:
- file: (your PDF, PPT, image, or text file)
- count: 10 (optional, default 10, max 50)
```

**Supported file types:**
- PDFs (`.pdf`)
- PowerPoint (`.ppt`, `.pptx`)
- Images (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`)
- Text files (`.txt`, `.md`)

**Response:**
```json
{
  "flashcards": [
    {
      "question": "What is the Pomodoro Technique?",
      "answer": "A time management method that uses 25-minute focused work intervals."
    },
    {
      "question": "Who developed the Pomodoro Technique?",
      "answer": "Francesco Cirillo in the late 1980s."
    }
  ]
}
```

### Generate Flashcards from Raw Text

**Send raw text instead of a file:**

```http
POST /api/generate-flashcards
Content-Type: application/json

{
  "text": "Your study notes here...",
  "count": 5
}
```

**Response:** Same as above

---

## 🧪 Testing

### Using PowerShell

```powershell
# Test with a file
$file = "C:\path\to\your\notes.pdf"
Invoke-RestMethod -Uri "http://localhost:8000/api/generate-flashcards" `
  -Method POST `
  -Form @{ file = Get-Item $file; count = 5 }

# Test with raw text
$body = @{
  text = "The Pomodoro Technique uses 25-minute work intervals called pomodoros."
  count = 3
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/generate-flashcards" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Using curl (Git Bash / WSL)

```bash
# Upload file
curl -X POST http://localhost:8000/api/generate-flashcards \
  -F "file=@notes.pdf" \
  -F "count=5"

# Send text
curl -X POST http://localhost:8000/api/generate-flashcards \
  -H "Content-Type: application/json" \
  -d '{"text": "Your notes here", "count": 5}'
```

---

## 🎨 Frontend Integration (React Example)

```tsx
// Upload file
const uploadFile = async (file: File, count: number = 10) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('count', count.toString());

  const response = await fetch('http://localhost:8000/api/generate-flashcards', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.flashcards;
};

// Send text
const generateFromText = async (text: string, count: number = 10) => {
  const response = await fetch('http://localhost:8000/api/generate-flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, count }),
  });

  const data = await response.json();
  return data.flashcards;
};
```

---

## ⚙️ Configuration

Edit `.env` file:

```env
# Required: Gemini API key
GOOGLE_API_KEY=AIza...

# Optional: ElevenLabs for audio (pomodoro timer)
ELEVENLABS_API_KEY=your-key

# Optional: Change Gemini model
GEMINI_MODEL=gemini-1.5-flash
```

---

## 🔧 Troubleshooting

### Error: "GOOGLE_API_KEY not set"
- Make sure you created `.env` file in `backend` folder
- Verify the key starts with `AIza`
- Restart the server after adding the key

### Error: "Failed to extract text from PDF"
- Make sure `PyPDF2` is installed: `pip install PyPDF2`
- Some PDFs are image-based - use OCR or convert to images first

### Error: "Import 'google.generativeai' could not be resolved"
- Install: `pip install google-generativeai`
- Make sure virtual environment is activated

### CORS errors from frontend
- CORS is already enabled for `localhost:5173` and `localhost:3000`
- Add your frontend URL in `main.py` if using different port

---

## 📚 How It Works

1. User uploads file or sends text
2. Backend extracts text/analyzes image:
   - PDFs: text extraction with PyPDF2
   - PowerPoint: text extraction with python-pptx
   - Images: Gemini vision model analyzes content
   - Text: direct processing
3. Gemini generates flashcards with structured JSON
4. Returns flashcards to user (no storage)

---

## 🎯 Hackathon Tips

- **Free tier**: Gemini API gives 60 requests/minute for free
- **File size limit**: Currently 16MB (configurable in `main.py`)
- **Stateless**: No database means easy deployment (Vercel, Railway, Render)
- **Fast iteration**: Change prompts in `services/gemini_client.py` to improve flashcard quality

---

## 🚀 Next Steps

- [ ] Add caching (Redis) to avoid regenerating same files
- [ ] Add flashcard editing endpoints
- [ ] Support more file formats (DOCX, XLSX)
- [ ] Add flashcard export (Anki, CSV)
- [ ] Add rate limiting for production

---

## 📄 Project Structure

```
backend/
├── main.py                      # Flask app entry
├── views.py                     # API routes
├── elevenz.py                   # ElevenLabs audio service
├── requirements.txt             # Dependencies
├── .env                         # Environment variables (create this!)
└── services/
    └── gemini_client.py         # Gemini AI integration
```

---

## 📄 License

MIT - Built for 2025 Hackathon
