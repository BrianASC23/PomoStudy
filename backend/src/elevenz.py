import os
from datetime import datetime
import elevenlabs  # import the package, not just methods
from elevenlabs import Voice, VoiceSettings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
if not ELEVENLABS_API_KEY:
    raise ValueError("ELEVENLABS_API_KEY not found")

# Modern way to set API key
elevenlabs.api_key = ELEVENLABS_API_KEY

DEFAULT_VOICE_ID = "NcJuO1kJ19MefFnxN1Ls"
DEFAULT_START_TEXT = "Pomodoro session starting now. Focus and be productive!"
DEFAULT_END_TEXT = "Pomodoro session complete. Take a break and recharge!"
DEFAULT_VOICE_SETTINGS = VoiceSettings(
    stability=0.5,
    similarity_boost=0.75,
    style=0.0,
    use_speaker_boost=True,
)

def to_voice_settings(settings_dict):
    """Convert a settings dict to a VoiceSettings object with fallbacks."""
    if not settings_dict:
        return DEFAULT_VOICE_SETTINGS
    return VoiceSettings(
        stability=settings_dict.get("stability", DEFAULT_VOICE_SETTINGS.stability) if settings_dict.get("stability") is not None else DEFAULT_VOICE_SETTINGS.stability,
        similarity_boost=settings_dict.get("similarity_boost", DEFAULT_VOICE_SETTINGS.similarity_boost) if settings_dict.get("similarity_boost") is not None else DEFAULT_VOICE_SETTINGS.similarity_boost,
        style=settings_dict.get("style", DEFAULT_VOICE_SETTINGS.style) if settings_dict.get("style") is not None else DEFAULT_VOICE_SETTINGS.style,
        use_speaker_boost=settings_dict.get("use_speaker_boost", DEFAULT_VOICE_SETTINGS.use_speaker_boost) if settings_dict.get("use_speaker_boost") is not None else DEFAULT_VOICE_SETTINGS.use_speaker_boost,
    )

def generate_audio(text, voice_id=DEFAULT_VOICE_ID, voice_settings=None):
    try:
        voice = Voice(
            voice_id=voice_id,
            settings=voice_settings or DEFAULT_VOICE_SETTINGS
        )

        audio = generate(
            text=text,
            voice=voice,
            model="eleven_monolingual_v1"
        )
        return audio
    except Exception as e:
        print(f"Error generating audio: {e}")
        return None

def save_audio(audio_content, filename):
    audio_dir = "audio_files"
    os.makedirs(audio_dir, exist_ok=True)
    filepath = os.path.join(audio_dir, filename)
    try:
        with open(filepath, "wb") as f:
            f.write(audio_content)
        return filepath, filename
    except Exception as e:
        print(f"Error saving audio: {e}")
        return None, None

def start_sound(text=DEFAULT_START_TEXT, voice_id=DEFAULT_VOICE_ID, voice_settings=None):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"pomodoro_start_{timestamp}.mp3"
    audio_content = generate_audio(text, voice_id, voice_settings)
    if audio_content:
        return save_audio(audio_content, filename)
    else:
        return None, None

def end_sound(text=DEFAULT_END_TEXT, voice_id=DEFAULT_VOICE_ID, voice_settings=None):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"pomodoro_end_{timestamp}.mp3"
    audio_content = generate_audio(text, voice_id, voice_settings)
    if audio_content:
        return save_audio(audio_content, filename)
    else:
        return None, None

def list_voices():
    try:
        from elevenlabs import voices
        all_voices = voices()
        return [{"voice_id": voice.voice_id, "name": voice.name} for voice in all_voices]
    except Exception as e:
        print(f"Error fetching voices: {e}")
        return []
