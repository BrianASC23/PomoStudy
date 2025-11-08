import os
from datetime import datetime
from elevenlabs import set_api_key, generate, Voice, VoiceSettings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
if not ELEVENLABS_API_KEY:
    raise ValueError("ELEVENLABS_API_KEY not found")

# Set API key
set_api_key(ELEVENLABS_API_KEY)

# Default configurations
DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"
DEFAULT_START_TEXT = "Pomodoro session starting now. Focus and be productive!"
DEFAULT_END_TEXT = "Pomodoro session complete. Take a break and recharge!"
DEFAULT_VOICE_SETTINGS = VoiceSettings(
    stability=0.5,
    similarity_boost=0.75,
    style=0.0,
    use_speaker_boost=True,
)

def generate_audio(text, voice_id=DEFAULT_VOICE_ID, voice_settings=None):
    """Generate audio using ElevenLabs API"""
    try:
        # Create voice object with settings
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
    """Save audio content to file"""
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
    """
    Generate and save pomodoro start sound
    
    Args:
        text (str): The text for the start sound
        voice_id (str): The voice ID to use
        voice_settings (VoiceSettings): Voice settings for the TTS
    
    Returns:
        tuple: (filepath, filename) or (None, None) if failed
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"pomodoro_start_{timestamp}.mp3"
    
    audio_content = generate_audio(text, voice_id, voice_settings)
    
    if audio_content:
        return save_audio(audio_content, filename)
    else:
        return None, None

def end_sound(text=DEFAULT_END_TEXT, voice_id=DEFAULT_VOICE_ID, voice_settings=None):
    """
    Generate and save pomodoro end sound
    
    Args:
        text (str): The text for the end sound
        voice_id (str): The voice ID to use
        voice_settings (VoiceSettings): Voice settings for the TTS
    
    Returns:
        tuple: (filepath, filename) or (None, None) if failed
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"pomodoro_end_{timestamp}.mp3"
    
    audio_content = generate_audio(text, voice_id, voice_settings)
    
    if audio_content:
        return save_audio(audio_content, filename)
    else:
        return None, None

# Additional helper function to list available voices
def list_voices():
    """
    List all available voices
    """
    try:
        from elevenlabs import voices
        all_voices = voices()
        return [{"voice_id": voice.voice_id, "name": voice.name} for voice in all_voices]
    except Exception as e:
        print(f"Error fetching voices: {e}")
        return []

# For testing purposes
if __name__ == "__main__":
    print("Testing ElevenLabs audio generation with SDK...")
    
    # Test with default parameters
    print("Generating start sound with defaults...")
    start_path, start_name = start_sound()
    if start_path:
        print(f"Start sound saved: {start_path}")
    else:
        print("Failed to generate start sound")
    
    # Test with custom parameters
    custom_text = "Let's begin our focused work session!"
    custom_voice_id = "21m00Tcm4TlvDq8ikWAM"
    custom_settings = VoiceSettings(
        stability=0.7,
        similarity_boost=0.8,
        style=0.2,
        use_speaker_boost=True,
    )
    
    print("Generating end sound with custom parameters...")
    end_path, end_name = end_sound(
        text=custom_text,
        voice_id=custom_voice_id,
        voice_settings=custom_settings
    )
    if end_path:
        print(f"End sound saved: {end_path}")
    else:
        print("Failed to generate end sound")
    
    # List available voices
    print("Available voices:")
    voices_list = list_voices()
    for voice in voices_list[:5]:  # Show first 5 voices
        print(f" - {voice['name']} (ID: {voice['voice_id']})")