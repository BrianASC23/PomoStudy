# generate_default_audio.py
import os
from backend.src.elevenz import start_sound, end_sound, DEFAULT_START_TEXT, DEFAULT_END_TEXT

def generate_default_audio_files():
    """Generate audio files with all default settings"""
    print("Generating audio files with default settings...")
    print(f"Default start text: '{DEFAULT_START_TEXT}'")
    print(f"Default end text: '{DEFAULT_END_TEXT}'")

    # Generate start sound with all defaults
    print("\nGenerating default start sound...")
    start_path, start_filename = start_sound()
    if start_path:
        print(f"✓ Start sound saved: {start_path}")
    else:
        print("✗ Failed to generate start sound")

    # Generate end sound with all defaults
    print("\nGenerating default end sound...")
    end_path, end_filename = end_sound()
    if end_path:
        print(f"✓ End sound saved: {end_path}")
    else:
        print("✗ Failed to generate end sound")

    return start_path, end_path

if __name__ == "__main__":
    start_path, end_path = generate_default_audio_files()

    if start_path and end_path:
        print(f"\n🎉 Successfully generated both audio files!")
        print(f"Start: {os.path.basename(start_path)}")
        print(f"End: {os.path.basename(end_path)}")
        print(f"Files are saved in the 'audio_files' directory")
    else:
        print(f"\n❌ Some files failed to generate")