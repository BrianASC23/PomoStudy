from flask import Blueprint, request, send_file, abort, make_response
from main import csrf
from pathlib import Path
from elevenz import start_sound, end_sound, to_voice_settings

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
