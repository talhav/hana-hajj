# Hana Travels – Hajj 2027 Pre-Registration

A simple, user-friendly pre-registration form for Hajj 2027. Submissions are saved to MongoDB. After a user submits, Hana Travels completes their official government registration and sends the receipt via WhatsApp.

## Stack

- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **Frontend:** HTML, CSS, JavaScript (no build step)

## Prerequisites

- Python 3.9+
- MongoDB running locally (or a MongoDB Atlas connection string)

**Start MongoDB locally** (if not already running):

```bash
# macOS with Homebrew
brew services start mongodb-community

# Or with Docker
docker run -d -p 27017:27017 --name hana-mongo mongo:7
```

## Setup

1. **Create a virtual environment and install dependencies:**

```bash
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure environment variables:**

```bash
cp .env.example .env
```

Edit `.env` if needed:

```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=hana_travels
```

For MongoDB Atlas, use your connection string:

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

3. **Start the server:**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

4. **Open the form:**

Visit [http://localhost:8000](http://localhost:8000)

## API

**POST** `/api/register`

```json
{
  "full_name": "Muhammad Ali Khan",
  "father_or_husband_name": "Abdul Rehman",
  "date_of_birth": "1985-06-15",
  "cnic": "12345-1234567-1",
  "address": "House 12, Street 5, Lahore",
  "mobile": "03001234567"
}
```

## Form Fields

| Field | Description |
|-------|-------------|
| Full Name | As per CNIC |
| Father's / Husband's Name | As per CNIC |
| Date of Birth | Must be 18+ years |
| CNIC | Format: `12345-1234567-1` |
| Address | Full residential address |
| Mobile | Pakistani number (WhatsApp preferred) |

## Notes

- CNIC is stored with a unique index to prevent duplicate registrations.
- WhatsApp delivery is handled outside this app (manual or via a future integration).

## Railway Deployment

Railway uses [Railpack](https://railpack.com/languages/python/) and expects a start command. This project keeps the FastAPI app in `app/main.py`, so the start command is configured in `Procfile`, `railway.json`, and `railpack.json`.

**Required environment variables on Railway:**

| Variable | Example |
|----------|---------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority` |
| `MONGODB_DB` | `hana_travels` |

After connecting the GitHub repo, redeploy once these files are on `main`.
