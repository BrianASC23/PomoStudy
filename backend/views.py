from flask import Blueprint, request, send_file, abort, make_response
from backend.src.main import csrf
from pathlib import Path
from backend.src.elevenz import start_sound, end_sound, to_voice_settings

views = Blueprint("views", __name__)

# CATCH-ALL OPTIONS route for preflight (CORS)
@views.route('/api/<path:dummy>', methods=['OPTIONS'])
def options_dummy(dummy):
    response = make_response('')
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
    return response

@views.route('/api/pomodoro-start', methods=["POST", "OPTIONS"])
@csrf.exempt
def start_session():
    if request.method == 'OPTIONS':
        response = make_response('')
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
        return response

    data = request.get_json(silent=True) or {}
    voice_id = data.get("voice_id")
    voice_settings_dict = {
        "stability": data.get("stability"),
        "similarity_boost": data.get("similarity_boost"),
        "style": data.get("style"),
        "use_speaker_boost": data.get("use_speaker_boost")
    }
    voice_settings = to_voice_settings(voice_settings_dict)
    path, file_name = start_sound(voice_id=voice_id, voice_settings=voice_settings)
    if not path:
        abort(404, description="Audio not generated.")
    try:
        response = send_file(
            path,
            mimetype="audio/mpeg",
            as_attachment=False,
            download_name=file_name
        )
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    except FileNotFoundError:
        abort(404, description="File not found")

@views.route('/api/pomodoro-end', methods=["POST", "OPTIONS"])
@csrf.exempt
def end_session():
    if request.method == 'OPTIONS':
        response = make_response('')
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
        return response

    data = request.get_json(silent=True) or {}
    voice_id = data.get("voice_id")
    voice_settings_dict = {
        "stability": data.get("stability"),
        "similarity_boost": data.get("similarity_boost"),
        "style": data.get("style"),
        "use_speaker_boost": data.get("use_speaker_boost")
    }
    voice_settings = to_voice_settings(voice_settings_dict)
    path, file_name = end_sound(voice_id=voice_id, voice_settings=voice_settings)
    if not path:
        abort(404, description="Audio not generated.")
    try:
        response = send_file(
            path,
            mimetype="audio/mpeg",
            as_attachment=False,
            download_name=file_name
        )
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    except FileNotFoundError:
        abort(404, description="Audio not found")

# Skeleton for /api/generate-notes (not modified)
@views.route('/api/generate-notes', methods=["POST"])
@csrf.exempt
def generate_notes():
    from flash_cards import get_flashcards
    pass


@views.route('/api/generate-flashcards', methods=["POST"])
def generate_flashcards():
    """Upload a file and generate flashcards using Gemini AI.

    Accepts:
    - multipart/form-data with 'file' field (PDF, PPT, images, text)
    - application/json with 'text' field (raw text)

    Optional: 'count' parameter (default: 10)

    Returns: {"flashcards": [{"question": "...", "answer": "..."}, ...]}
    """
    import tempfile
    from werkzeug.utils import secure_filename
    from services.gemini_client import generate_flashcards_from_file, generate_flashcards_from_text

    # Get count parameter
    count = 10
    if request.is_json:
        count = request.json.get('count', 10)
    elif request.form:
        count = int(request.form.get('count', 10))

    # Validate count
    if count < 1 or count > 50:
        return jsonify({"error": "Count must be between 1 and 50"}), 400

    # Check if it's a file upload
    if 'file' in request.files:
        file = request.files['file']

        if file.filename == '':
            return jsonify({"error": "Empty filename"}), 400

        # Allowed extensions
        allowed_extensions = {'pdf', 'ppt', 'pptx', 'txt', 'md', 'jpg', 'jpeg', 'png', 'gif', 'webp'}
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''

        if file_ext not in allowed_extensions:
            return jsonify({
                "error": f"File type not allowed. Supported: {', '.join(allowed_extensions)}"
            }), 400

        try:
            # Save to temporary file
            filename = secure_filename(file.filename)
            temp_dir = tempfile.gettempdir()
            temp_path = os.path.join(temp_dir, filename)
            file.save(temp_path)

            # Get MIME type
            mime_type = file.content_type or 'application/octet-stream'

            # Generate flashcards
            flashcards = generate_flashcards_from_file(temp_path, mime_type, count)

            # Clean up temp file
            try:
                os.remove(temp_path)
            except:
                pass

            return jsonify({"flashcards": flashcards}), 200

        except Exception as e:
            return jsonify({"error": f"Failed to generate flashcards: {str(e)}"}), 500

    # Check if it's raw text
    elif request.is_json and 'text' in request.json:
        text = request.json['text']

        if not text or not text.strip():
            return jsonify({"error": "Text cannot be empty"}), 400

        try:
            flashcards = generate_flashcards_from_text(text, count)
            return jsonify({"flashcards": flashcards}), 200
        except Exception as e:
            return jsonify({"error": f"Failed to generate flashcards: {str(e)}"}), 500

    else:
        return jsonify({
            "error": "No file or text provided. Send either a 'file' (multipart) or 'text' (JSON)"
        }), 400
