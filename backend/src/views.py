from flask import Blueprint, request, send_from_directory, make_response, jsonify, abort
from elevenz import start_sound, end_sound
import os
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
    allowed = ["ppt","png","pdf","pptx","jpg","jpeg"]
    return Path(filename).suffix.lower() in allowed

@views.route('/api/generate-flashcards', methods=["POST"])
def generate_flashcards():
    file = request.files.get("file")
    if not file or file.filename == "":
        return jsonify({"error": "no file given"}), 400

    if not _allowed(file.filename):
        return jsonify({"error": "unsupported file format"}), 415
    
    from services.gemini_client import generate_flashcards_from_file
    safe_name = secure_filename(file.filename)
    
    try:
        cards = generate_flash_from_file(file.stream, file.filename)
    except Exception as e:
        return jsonify({"error": "Failed to generate cards", "detail": str(e)}), 500

    return jsonify(cards), 200

@views.route('/api/generate-problems', methods=["POST"])
def generate_problems():
    file = request
    if not file or file.filename == "":
        return jsonify({"error": "no file given"}), 400

    if not _allowed(file.filename):
        return jsonify({"error": "unsupported file format"}), 415
    
    from services.gemini_client import generate_problems_from_file
    safe_name = secure_filename(file.filename)
    
    try:
        cards = generate_problems_from_file(file.stream, file.filename)
    except Exception as e:
        return jsonify({"error": "Failed to generate cards", "detail": str(e)}), 500

    return jsonify(cards), 200
