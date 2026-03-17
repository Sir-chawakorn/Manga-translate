from __future__ import annotations

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .gemini_service import DEFAULT_MODEL, translate_page
from .models import TranslateResponse


app = FastAPI(title="Manga Translate Studio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/translate", response_model=TranslateResponse)
async def translate_manga_page(
    file: UploadFile = File(...),
    api_key: str | None = Form(default=None),
    model: str = Form(default=DEFAULT_MODEL),
) -> TranslateResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    try:
        return translate_page(image_bytes=image_bytes, api_key=api_key, model=model)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini request failed: {exc}") from exc
