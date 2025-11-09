"""Flashcard generation service - Business logic layer.

This service handles all flashcard generation logic including:
- File upload handling and validation
- Text extraction from various file types
- Gemini AI integration
- Error handling and cleanup
"""
import os
import tempfile
from typing import List, Dict, Tuple, Optional
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
from .gemini_client import generate_flashcards_from_file, generate_flashcards_from_text


# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'ppt', 'pptx', 'txt', 'md', 'jpg', 'jpeg', 'png', 'gif', 'webp'}


def validate_file(file: FileStorage) -> Tuple[bool, Optional[str]]:
    """Validate uploaded file.

    Args:
        file: Uploaded file from Flask request

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not file or file.filename == '':
        return False, "No file provided or empty filename"

    file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''

    if file_ext not in ALLOWED_EXTENSIONS:
        return False, f"File type not allowed. Supported: {', '.join(ALLOWED_EXTENSIONS)}"

    return True, None


def generate_flashcards_from_upload(file: FileStorage, count: int = 10) -> List[Dict]:
    """Generate flashcards from an uploaded file.

    Args:
        file: Uploaded file (PDF, PPT, image, or text)
        count: Number of flashcards to generate (default: 10)

    Returns:
        List of flashcard dicts: [{"question": "...", "answer": "..."}, ...]

    Raises:
        ValueError: If file is invalid or count is out of range
        RuntimeError: If flashcard generation fails
    """
    # Validate count
    if count < 1 or count > 50:
        raise ValueError("Count must be between 1 and 50")

    # Validate file
    is_valid, error_msg = validate_file(file)
    if not is_valid:
        raise ValueError(error_msg)

    # Save to temporary file
    filename = secure_filename(file.filename)
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, filename)

    try:
        file.save(temp_path)

        # Get MIME type
        mime_type = file.content_type or 'application/octet-stream'

        # Generate flashcards using Gemini
        flashcards = generate_flashcards_from_file(temp_path, mime_type, count)

        return flashcards

    except Exception as e:
        raise RuntimeError(f"Failed to generate flashcards: {str(e)}")

    finally:
        # Always clean up temp file
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass  # Ignore cleanup errors


def generate_flashcards_from_raw_text(text: str, count: int = 10) -> List[Dict]:
    """Generate flashcards from raw text input.

    Args:
        text: Raw text content
        count: Number of flashcards to generate (default: 10)

    Returns:
        List of flashcard dicts: [{"question": "...", "answer": "..."}, ...]

    Raises:
        ValueError: If text is empty or count is out of range
        RuntimeError: If flashcard generation fails
    """
    # Validate count
    if count < 1 or count > 50:
        raise ValueError("Count must be between 1 and 50")

    # Validate text
    if not text or not text.strip():
        raise ValueError("Text cannot be empty")

    try:
        # Generate flashcards using Gemini
        flashcards = generate_flashcards_from_text(text, count)
        return flashcards

    except Exception as e:
        raise RuntimeError(f"Failed to generate flashcards: {str(e)}")
