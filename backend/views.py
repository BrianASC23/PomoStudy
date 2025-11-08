from flask import Blueprint, request, session, send_file, abort, jsonify
import hashlib, os

views = Blueprint("views",__name__)

# @views.route('/api/
    
@views.route('/api/pomodoro-start', methods=["POST"])
def start_session():
    data = request.get_json(silent=True)
    
    personalizations = {
        "speed": data.get("speed"),
        "voice_id": data.get("voice_id"),
        "stability": data.get("stability"),
        "similarity_boost": data.get("similarity_boost"),
        "style": data.get("style"),
        "use_speaker_boost": data.get("use_speaker_boost")
    }

    from elevenz import start_sound
    path, file_name = start_sound(personalizations)
    try:
        resp = make_response(
            send_file(
                path,
                mimetype="audio/mpeg",
                as_attachment=False,
                download_name=file_name
            )
        )
    except FileNotFoundError:
        abort(404, description="File not found")

@views.route('/api/pomodoro-end', methods=["POST"])
def end_session():
    data = request.get_json(silent=True)
    
    personalizations = {
        "speed": data.get("speed"),
        "voice_id": data.get("voice_id"),
        "stability": data.get("stability"),
        "similarity_boost": data.get("similarity_boost"),
        "style": data.get("style"),
        "use_speaker_boost": data.get("use_speaker_boost")
    }

    from elevenz import end_sound
    path, file_name = end_sound()
    
    try:
        return send_file(
            path,
            mimetype="audio/mpeg",
            as_attachment=False,
            download_name=file_name
        )
    except FileNotFoundError:
        abort(404, description="Audio not found")

@views.route('/api/generate-notes', methods=["POST"])
def generate_notes():
    pass

def 
