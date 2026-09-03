/**
 * Voice Alarm & Audio Synthesizer Service.
 * Provides:
 * 1. Web Audio API synthesized chime/alarm melody (elderly-friendly, clear, gentle attack).
 * 2. Web Speech API (SpeechSynthesis) spoken voice announcements.
 * 3. Active alarm state management with Stop / Snooze / Done lifecycle.
 * 4. Resilient browser autoplay handling & audio context recovery.
 */

import { VoiceAlarmMode } from '../types';

export interface ActiveAlarmInfo {
  id: string;
  title: string;
  body?: string;
  entityType: 'reminder' | 'task' | 'medicine' | 'health' | 'blood_pressure' | 'bill';
  entityId?: string;
  mode: VoiceAlarmMode;
  timestamp: string;
  snoozedCount?: number;
}

type AlarmListener = (alarm: ActiveAlarmInfo | null) => void;

class VoiceAlarmService {
  private audioCtx: AudioContext | null = null;
  private isAlarmPlaying = false;
  private alarmIntervalTimer: ReturnType<typeof setInterval> | null = null;
  private activeAlarm: ActiveAlarmInfo | null = null;
  private listeners: Set<AlarmListener> = new Set();
  private isAudioUnlocked = false;

  constructor() {
    // Attempt lazy init on first user interaction
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.ensureAudioContext();
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().then(() => {
            this.isAudioUnlocked = true;
          }).catch(() => {});
        } else {
          this.isAudioUnlocked = true;
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };

      window.addEventListener('click', unlockAudio, { passive: true, once: true });
      window.addEventListener('keydown', unlockAudio, { passive: true, once: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
    }
  }

  private ensureAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    return this.audioCtx;
  }

  public subscribe(listener: AlarmListener): () => void {
    this.listeners.add(listener);
    listener(this.activeAlarm);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    for (const l of this.listeners) {
      try {
        l(this.activeAlarm);
      } catch (err) {
        console.error('Error in alarm listener:', err);
      }
    }
  }

  public getActiveAlarm(): ActiveAlarmInfo | null {
    return this.activeAlarm;
  }

  /**
   * Plays a sequence of pleasant chime tones using Web Audio API.
   * Gentle, clear, elderly-friendly frequencies (523Hz - 659Hz - 784Hz - 1046Hz).
   */
  public playChimeNote(frequency: number, startTime: number, duration: number, volume = 0.7): void {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sine wave for smooth, non-harsh musical tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, startTime);

      // Envelope: smooth ramp up and soft decay
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.01, Math.min(1.0, volume)), startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch {
      // AudioContext failure fallback
    }
  }

  /**
   * Plays a single chime chord / melody pattern.
   */
  public playMelodyPattern(volume = 0.7): void {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Pleasant 4-note ascending chime: C5, E5, G5, C6
    const notes = [
      { freq: 523.25, time: 0.00, dur: 0.35 },
      { freq: 659.25, time: 0.20, dur: 0.35 },
      { freq: 783.99, time: 0.40, dur: 0.45 },
      { freq: 1046.50, time: 0.65, dur: 0.70 },
    ];

    for (const note of notes) {
      this.playChimeNote(note.freq, now + note.time, note.dur, volume);
    }
  }

  /**
   * Starts repeating alarm sound until stopped.
   */
  public startRepeatingAlarm(volume = 0.7): void {
    this.stopAlarmSound();
    this.isAlarmPlaying = true;
    this.playMelodyPattern(volume);

    // Repeat every 2 seconds
    this.alarmIntervalTimer = setInterval(() => {
      if (!this.isAlarmPlaying) return;
      this.playMelodyPattern(volume);
    }, 2000);
  }

  /**
   * Stops repeating alarm sound.
   */
  public stopAlarmSound(): void {
    this.isAlarmPlaying = false;
    if (this.alarmIntervalTimer) {
      clearInterval(this.alarmIntervalTimer);
      this.alarmIntervalTimer = null;
    }
  }

  /**
   * Speaks announcement text via SpeechSynthesis.
   */
  public speakText(text: string, volume = 0.85, lang = 'en-US'): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      // Cancel previous pending speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = Math.max(0.1, Math.min(1.0, volume));
      utterance.rate = 0.92; // Slightly slower for elderly clarity
      utterance.pitch = 1.0;
      utterance.lang = lang || 'en-US';

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis unavailable or blocked:', err);
    }
  }

  /**
   * Stop any active speech.
   */
  public stopSpeech(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Trigger a full alarm / voice reminder sequence.
   */
  public triggerAlarm(
    alarm: ActiveAlarmInfo,
    settings?: {
      voiceRemindersEnabled?: boolean;
      alarmSoundEnabled?: boolean;
      voiceAnnouncementEnabled?: boolean;
      alarmVolume?: number;
      voiceLanguage?: string;
    }
  ): void {
    this.activeAlarm = alarm;
    this.notifyListeners();

    const mode = alarm.mode || 'alarm_voice';
    if (mode === 'silent') {
      return;
    }

    const volume = settings?.alarmVolume ?? 0.8;
    const lang = settings?.voiceLanguage ?? 'en-US';

    const shouldPlaySound =
      (mode === 'alarm_only' || mode === 'alarm_voice') &&
      (settings?.alarmSoundEnabled !== false);

    const shouldSpeak =
      (mode === 'voice_only' || mode === 'alarm_voice') &&
      (settings?.voiceAnnouncementEnabled !== false);

    if (shouldPlaySound) {
      this.startRepeatingAlarm(volume);
    }

    if (shouldSpeak) {
      const speechBody = alarm.body ? `. ${alarm.body}` : '';
      const message = `Attention: ${alarm.title}${speechBody}`;

      // If sound is playing, give a 600ms gap then speak
      if (shouldPlaySound) {
        setTimeout(() => {
          if (this.activeAlarm && this.activeAlarm.id === alarm.id) {
            this.speakText(message, volume, lang);
          }
        }, 600);
      } else {
        this.speakText(message, volume, lang);
      }
    }
  }

  /**
   * Stop alarm sound and speech, and dismiss active alarm modal.
   */
  public stopAlarm(): void {
    this.stopAlarmSound();
    this.stopSpeech();
    this.activeAlarm = null;
    this.notifyListeners();
  }

  /**
   * Snoozes active alarm and stops current audio/speech.
   */
  public snoozeAlarm(_minutes = 5): void {
    this.stopAlarm();
  }

  /**
   * Test audio alarm chime (plays 1 cycle).
   */
  public testAlarmSound(volume = 0.8): void {
    this.playMelodyPattern(volume);
  }

  /**
   * Test speech synthesis.
   */
  public testVoiceSpeech(message = 'This is a test of your personal life dashboard voice reminders.', volume = 0.85, lang = 'en-US'): void {
    this.speakText(message, volume, lang);
  }
}

export const voiceAlarmService = new VoiceAlarmService();
