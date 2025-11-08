export interface AudioConfig {
    voiceId: string;
    speed: number;
    stability: number;
    similarity: number;
    styleExaggeration: number;
    speakerBoost: boolean;
}

export const defaultAudioConfig: AudioConfig = {
    voiceId: 'rachel',
    speed: 1.0,
    stability: 0.5,
    similarity: 0.75,
    styleExaggeration: 0.0,
    speakerBoost: true,
};

function mapAudioConfigForApi(config: AudioConfig) {
    return {
        voiceId: config.voiceId,
        voiceSettings: {
            stability: config.stability,
            similarityBoost: config.similarity,
            style: config.styleExaggeration,
            speakerBoost: config.speakerBoost,
        },
        speed: config.speed,
    };
}

export async function fetchPomodoroStartAudio(
    config: AudioConfig = defaultAudioConfig
): Promise<string | null> {
    try {
        const resp = await fetch('http://localhost:8001/api/pomodoro-start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mapAudioConfigForApi(config)),
        });
        if (!resp.ok) throw new Error('Failed to fetch start audio');
        const data = await resp.json();
        return data.audioUrl as string;
    } catch (err) {
        console.error('Start audio fetch error:', err);
        return null;
    }
}

export async function fetchPomodoroEndAudio(
    config: AudioConfig = defaultAudioConfig
): Promise<string | null> {
    try {
        const resp = await fetch('http://localhost:8001/api/pomodoro-end', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mapAudioConfigForApi(config)),
        });
        if (!resp.ok) throw new Error('Failed to fetch end audio');
        const data = await resp.json();
        return data.audioUrl as string;
    } catch (err) {
        console.error('End audio fetch error:', err);
        return null;
    }
}
