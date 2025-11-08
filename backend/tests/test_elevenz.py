import unittest
import os
import tempfile
import shutil
from unittest.mock import patch, MagicMock

# Import the module to test
from backend.src.elevenz import generate_audio, save_audio, start_sound, end_sound, DEFAULT_START_TEXT, DEFAULT_END_TEXT, DEFAULT_VOICE_ID, DEFAULT_VOICE_SETTINGS
from elevenlabs import VoiceSettings

class TestElevenz(unittest.TestCase):

    def setUp(self):
        # Create a temporary directory for test files
        self.test_dir = tempfile.mkdtemp()
        self.original_audio_dir = "audio_files"

    def tearDown(self):
        # Clean up temporary directory
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
        # Clean up audio_files directory if it was created during tests
        if os.path.exists(self.original_audio_dir) and os.path.isdir(self.original_audio_dir):
            shutil.rmtree(self.original_audio_dir)

    @patch('elevenz.generate')
    def test_generate_audio_success(self, mock_generate):
        # Mock successful audio generation
        mock_generate.return_value = b"fake_audio_content"

        # Test audio generation with custom settings
        custom_settings = VoiceSettings(
            stability=0.8,
            similarity_boost=0.9,
            style=0.1,
            use_speaker_boost=False,
        )

        audio_content = generate_audio("Test text", "test_voice_id", custom_settings)

        self.assertIsNotNone(audio_content)
        self.assertEqual(audio_content, b"fake_audio_content")
        mock_generate.assert_called_once()

    @patch('elevenz.generate')
    def test_generate_audio_with_default_settings(self, mock_generate):
        # Mock successful audio generation
        mock_generate.return_value = b"fake_audio_content"

        # Test audio generation with default settings (None passed)
        audio_content = generate_audio("Test text", "test_voice_id", None)

        self.assertIsNotNone(audio_content)
        mock_generate.assert_called_once()

    @patch('elevenz.generate')
    def test_generate_audio_failure(self, mock_generate):
        # Mock failed audio generation
        mock_generate.side_effect = Exception("API Error")

        # Test audio generation failure
        audio_content = generate_audio("Test text", "test_voice_id")

        self.assertIsNone(audio_content)

    def test_save_audio(self):
        # Test saving audio content
        test_content = b"test_audio_data"
        test_filename = "test_audio.mp3"

        # Mock the file operations
        with patch('elevenz.os.makedirs') as mock_makedirs, \
             patch('builtins.open', unittest.mock.mock_open()) as mock_file:

            filepath, filename = save_audio(test_content, test_filename)

            # Check if directory was created
            mock_makedirs.assert_called_once_with("audio_files", exist_ok=True)

            # Check if file was written to
            mock_file.assert_called_once_with(os.path.join("audio_files", test_filename), "wb")

            # Verify the filepath construction
            self.assertIn("audio_files", filepath)
            self.assertEqual(filename, test_filename)

    @patch('elevenz.generate_audio')
    @patch('elevenz.datetime')
    def test_start_sound_default_params(self, mock_datetime, mock_generate_audio):
        # Mock datetime and audio generation
        mock_datetime.now.return_value.strftime.return_value = "20231201_120000"
        mock_generate_audio.return_value = b"start_audio_content"

        with patch('elevenz.save_audio') as mock_save_audio:
            mock_save_audio.return_value = ("/fake/path/start.mp3", "pomodoro_start_20231201_120000.mp3")

            path, filename = start_sound()

            self.assertEqual(path, "/fake/path/start.mp3")
            self.assertEqual(filename, "pomodoro_start_20231201_120000.mp3")
            mock_generate_audio.assert_called_once_with(
                DEFAULT_START_TEXT, DEFAULT_VOICE_ID, None
            )

    @patch('elevenz.generate_audio')
    @patch('elevenz.datetime')
    def test_start_sound_custom_params(self, mock_datetime, mock_generate_audio):
        # Mock datetime and audio generation
        mock_datetime.now.return_value.strftime.return_value = "20231201_120000"
        mock_generate_audio.return_value = b"start_audio_content"

        custom_text = "Custom start message"
        custom_voice_id = "custom_voice_123"
        custom_settings = VoiceSettings(
            stability=0.9,
            similarity_boost=0.8,
        )

        with patch('elevenz.save_audio') as mock_save_audio:
            mock_save_audio.return_value = ("/fake/path/start.mp3", "pomodoro_start_20231201_120000.mp3")

            path, filename = start_sound(
                text=custom_text,
                voice_id=custom_voice_id,
                voice_settings=custom_settings
            )

            self.assertEqual(path, "/fake/path/start.mp3")
            mock_generate_audio.assert_called_once_with(
                custom_text, custom_voice_id, custom_settings
            )

    @patch('elevenz.generate_audio')
    def test_start_sound_generation_failure(self, mock_generate_audio):
        # Test when audio generation fails
        mock_generate_audio.return_value = None

        path, filename = start_sound()

        self.assertIsNone(path)
        self.assertIsNone(filename)

# Helper function to run specific test files
def run_audio_generation_tests():
    """Run actual audio generation tests and return file paths"""
    import backend.src.elevenz as elevenz
    from elevenlabs import VoiceSettings

    test_files = []

    # Show where files will be saved
    current_dir = os.getcwd()
    audio_dir = os.path.join(current_dir, "audio_files")
    print(f"Audio files will be saved to: {audio_dir}")

    # Generate test files with different speed settings
    speed_settings = [
        {"stability": 0.3, "similarity_boost": 0.7, "label": "low_stability"},
        {"stability": 0.7, "similarity_boost": 0.9, "label": "high_stability"},
        {"stability": 0.5, "similarity_boost": 0.8, "label": "balanced"}
    ]

    for settings in speed_settings:
        voice_settings = VoiceSettings(
            stability=settings["stability"],
            similarity_boost=settings["similarity_boost"],
            style=0.0,
            use_speaker_boost=True,
        )

        # Generate start sound
        path, filename = elevenz.start_sound(
            text=f"Test with {settings['label']} settings",
            voice_settings=voice_settings
        )

        if path and os.path.exists(path):
            test_files.append({
                "path": path,
                "filename": filename,
                "settings": settings['label'],
                "type": "start"
            })
            print(f"Generated {settings['label']} start sound: {path}")

        # Generate end sound
        path, filename = elevenz.end_sound(
            text=f"Test with {settings['label']} settings",
            voice_settings=voice_settings
        )

        if path and os.path.exists(path):
            test_files.append({
                "path": path,
                "filename": filename,
                "settings": settings['label'],
                "type": "end"
            })
            print(f"Generated {settings['label']} end sound: {path}")

    return test_files

if __name__ == '__main__':
    # Run unit tests
    unittest.main(verbosity=2, exit=False)

    # Generate actual test audio files
    print("\n" + "="*50)
    print("GENERATING ACTUAL AUDIO FILES:")
    print("="*50)
    test_files = run_audio_generation_tests()

    if test_files:
        print(f"\nGenerated {len(test_files)} audio files:")
        for file_info in test_files:
            print(f" - {file_info['type']} sound ({file_info['settings']}): {file_info['path']}")
    else:
        print("No audio files were generated")