from flask import Blueprint, request, send_from_directory, make_response, jsonify, abort
from elevenz import start_sound, end_sound
import os
from pathlib import Path
from werkzeug.utils import secure_filename

views = Blueprint("views", __name__)

@views.route('/audio_files/<path:filename>', methods=['GET'])
def serve_audio_file(filename):
    audio_dir = os.path.join(os.path.dirname(__file__), '..', 'audio_files')
    response = send_from_directory(audio_dir, filename)
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@views.route('/api/pomodoro-start', methods=["POST", "OPTIONS"])
def start_session():
    if request.method == 'OPTIONS':
        response = make_response('')
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
        return response

    data = request.get_json(silent=True) or {}
    voice_id = data.get("voiceId") or data.get("voice_id")
    voice_settings = data.get("voiceSettings") or {}
    path, file_name = start_sound(voice_id=voice_id)
    if not path:
        abort(404, description="Audio not generated.")
    url = request.host_url.rstrip("/") + "/audio_files/" + file_name
    response = jsonify({"audioUrl": url})
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@views.route('/api/pomodoro-end', methods=["POST", "OPTIONS"])
def end_session():
    if request.method == 'OPTIONS':
        response = make_response('')
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
        return response
    data = request.get_json(silent=True) or {}
    voice_id = data.get("voiceId") or data.get("voice_id")
    voice_settings = data.get("voiceSettings") or {}
    path, file_name = end_sound(voice_id=voice_id)
    if not path:
        abort(404, description="Audio not generated.")
    url = request.host_url.rstrip("/") + "/audio_files/" + file_name
    response = jsonify({"audioUrl": url})
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

def _check_ext(filename):
    allowed = ["ppt","png","pdf","pptx","jpg","jpeg","txt","md","gif","webp"]
    ext = Path(filename).suffix.lower().lstrip('.')
    return ext in allowed

@views.route('/api/generate-flashcards', methods=["POST", "OPTIONS"])
def generate_flashcards():
    if request.method == 'OPTIONS':
        response = make_response('')
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
        return response

    try:
        # Check if text input is provided
        text_input = None
        if request.is_json:
            data = request.get_json()
            text_input = data.get('text')
        elif request.form:
            text_input = request.form.get('text')

        # Get the count parameter
        count = 10  # default
        if request.is_json:
            count = request.get_json().get('count', 10)
        elif request.form:
            count = int(request.form.get('count', 10))

        # Validate count
        if not isinstance(count, int) or count < 1 or count > 50:
            return jsonify({"error": "Count must be between 1 and 50"}), 400

        # Import the service functions
        from services.flashcard_service import generate_flashcards_from_upload, generate_flashcards_from_raw_text, validate_file

        # Case 1: Text input
        if text_input:
            if not text_input.strip():
                return jsonify({"error": "Text input cannot be empty"}), 400

            flashcards = generate_flashcards_from_raw_text(text_input, count)
            return jsonify({
                "flashcards": flashcards,
                "count": len(flashcards),
                "source": "text"
            }), 200

        # Case 2: File upload
        file = request.files.get("file")
        if not file or file.filename == "":
            return jsonify({"error": "No file or text provided"}), 400

        if not _check_ext(file.filename):
            return jsonify({"error": "Unsupported file format. Supported: pdf, ppt, pptx, jpg, jpeg, png, gif, webp, txt, md"}), 415

        # Validate file
        is_valid, error_msg = validate_file(file)
        if not is_valid:
            return jsonify({"error": error_msg}), 400

        # Generate flashcards
        flashcards = generate_flashcards_from_upload(file, count)

        return jsonify({
            "flashcards": flashcards,
            "count": len(flashcards),
            "source": "file",
            "filename": file.filename
        }), 200

    except ValueError as e:
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": "Failed to generate flashcards", "detail": str(e)}), 500
