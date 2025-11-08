from flask import Blueprint, request, send_from_directory, make_response, jsonify, abort
from main import csrf
from elevenz import start_sound, end_sound, to_voice_settings
import os

views = Blueprint("views", __name__)

@views.route('/audio_files/<path:filename>', methods=['GET'])
def serve_audio_file(filename):
    audio_dir = os.path.join(os.path.dirname(__file__), '..', 'audio_files')
    response = send_from_directory(audio_dir, filename)
    response.headers['Access-Control-Allow-Origin'] = '*'
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
    voice_id = data.get("voiceId") or data.get("voice_id")
    voice_settings = data.get("voiceSettings") or {}
    vs = to_voice_settings(voice_settings)
    path, file_name = start_sound(voice_id=voice_id, voice_settings=vs)
    if not path:
        abort(404, description="Audio not generated.")
    url = request.host_url.rstrip("/") + "/audio_files/" + file_name
    response = jsonify({"audioUrl": url})
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

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
    voice_id = data.get("voiceId") or data.get("voice_id")
    voice_settings = data.get("voiceSettings") or {}
    vs = to_voice_settings(voice_settings)
    path, file_name = end_sound(voice_id=voice_id, voice_settings=vs)
    if not path:
        abort(404, description="Audio not generated.")
    url = request.host_url.rstrip("/") + "/audio_files/" + file_name
    response = jsonify({"audioUrl": url})
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@views.route('/api/upload', methods=["POST"])
@csrf.exempt
def upload_notes():
    from flash_cards import get_flashcards
    pass


@views.route('/api/generate-flashcards', methods=["POST"])
@csrf.exempt
def generate_flashcards():
    pass
