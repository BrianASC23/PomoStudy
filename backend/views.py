from flask import Blueprint, request, session, send_file, abort

views = Blueprint("views",__name__)

@views.route('/api/pomodoro-end', methods=["POST"])
def get_end_sound():
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
    
