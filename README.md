# GreenWardrobe frontend

React and Vite frontend for the GreenWardrobe single-image analysis flow.

## Start the application

Start the FastAPI backend from the backend repository (`/Users/anishkakhati/GreenWardrobe`) using its project setup, then run its development server on `http://localhost:8000` (commonly `uvicorn app.main:app --reload --port 8000` from the backend directory).

From this directory, start the frontend:

```sh
npm install
npm run dev
```

The API base defaults to `http://localhost:8000`. To use another backend URL, create a local `.env` file with:

```sh
VITE_API_BASE_URL=http://localhost:8000
```

Vite reads this variable when it starts; restart the dev server after changing it.

## Verify the API

Check that the backend is running:

```sh
curl http://localhost:8000/health
```

The app also checks `GET /health` and displays whether the backend is reachable. To exercise analysis, choose one JPEG, PNG, or WEBP image up to 10 MB, then submit it in the Analyze view. The browser posts it as multipart field `image` to `POST /api/v1/analyze`; it does not set the multipart content type itself.

The backend classifies the single image automatically. `GARMENT` uses visual fabric analysis, `LABEL` extracts composition with OCR, and `UNKNOWN` returns an HTTP 422 message that the frontend displays. Upload a clear photo of the complete garment or a readable care label. No demo result is substituted if the API is unavailable.

## Checks

```sh
npm test
npm run lint
npm run build
```
