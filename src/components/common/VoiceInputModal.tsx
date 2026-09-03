import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Modal } from './Modal';
import { useApp } from '../../context/AppContext';
import { isSpeechRecognitionSupported, parseVoiceInput, ParsedVoiceCommand } from '../../utils/speech';

export const VoiceInputModal: React.FC = () => {
  const {
    voiceModalOpen,
    setVoiceModalOpen,
    addReminder,
    addTask,
    addExpense,
    addBill,
    addCalendarEvent,
  } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedVoiceCommand | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const recognitionRef = useRef<any>(null);
  const supported = isSpeechRecognitionSupported();

  useEffect(() => {
    if (!voiceModalOpen) {
      stopListening();
      setTranscript('');
      setManualText('');
      setErrorMessage('');
      setParsedResult(null);
      setSaveSuccess(false);
    } else {
      if (supported) {
        startListening();
      }
    }
  }, [voiceModalOpen, supported]);

  const startListening = () => {
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setErrorMessage('Speech recognition is not supported in this browser.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. You can type your command below.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech detected. Please try speaking again.');
        } else {
          setErrorMessage(`Recognition note: ${event.error}. You can also type below.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.warn('Recognition start error:', err);
      setErrorMessage('Could not access microphone. You can type your command below.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Whenever transcript or manual text changes, parse
  const handleParse = (textToParse: string) => {
    if (!textToParse.trim()) return;
    const parsed = parseVoiceInput(textToParse);
    setParsedResult(parsed);
  };

  const handleConfirmSave = () => {
    if (!parsedResult) return;

    const { detectedType, title, date, time, amount } = parsedResult;

    if (!title.trim()) {
      setErrorMessage('Please provide a title or description.');
      return;
    }

    if (detectedType === 'task') {
      addTask({
        title,
        date,
        time,
        priority: 'medium',
        category: 'General',
        repeat: 'none',
        reminder: true,
        completed: false,
        important: false,
      });
    } else if (detectedType === 'expense') {
      addExpense({
        amount: amount || 0,
        date,
        time,
        category: 'other',
        paymentMethod: 'cash',
        description: title,
      });
    } else if (detectedType === 'bill') {
      addBill({
        name: title,
        amount: amount || 0,
        dueDate: date,
        frequency: 'monthly',
        paymentStatus: 'unpaid',
        category: 'other',
      });
    } else if (detectedType === 'calendar') {
      addCalendarEvent({
        title,
        date,
        startTime: time,
        category: 'General',
        repeat: 'none',
        reminder: true,
      });
    } else {
      // Default: reminder
      addReminder({
        title,
        date,
        time,
        repeat: 'none',
        category: 'personal',
        notificationMethod: 'browser',
        completed: false,
      });
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setVoiceModalOpen(false);
    }, 1200);
  };

  return (
    <Modal
      id="voice-command-modal"
      isOpen={voiceModalOpen}
      onClose={() => setVoiceModalOpen(false)}
      title="Voice Assistant"
      subtitle="Speak naturally to create tasks, reminders, expenses, or bills"
      maxWidth="md"
    >
      <div className="flex flex-col items-center justify-center py-4 text-center">
        {/* Animated Microphone button */}
        <div className="relative mb-6">
          {isListening && (
            <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
          )}
          <button
            id="voice-toggle-recording-btn"
            onClick={isListening ? stopListening : startListening}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-500/30 ${
              isListening
                ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? <Mic className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
        </div>

        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
          {isListening ? 'Listening... Speak your reminder or command' : 'Tap microphone to speak'}
        </p>

        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mb-4">
          Example: &quot;Remind me tomorrow at 9 AM to pay electricity bill&quot; or &quot;Add task to buy groceries today&quot;
        </p>

        {/* Live Transcript */}
        {transcript && (
          <div className="w-full p-3.5 mb-4 text-left rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Captured Speech
            </span>
            <p className="text-sm text-slate-800 dark:text-slate-100 italic">
              &quot;{transcript}&quot;
            </p>
            <button
              onClick={() => handleParse(transcript)}
              className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Parse this speech
            </button>
          </div>
        )}

        {/* Error / info notice */}
        {errorMessage && (
          <div className="w-full flex items-center gap-2 p-3 mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Manual text fallback */}
        <div className="w-full text-left pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            Or type your command:
          </label>
          <div className="flex gap-2">
            <input
              id="voice-manual-command-input"
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="e.g. Remind me tomorrow at 9 AM to call mom"
              className="flex-1 px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleParse(manualText);
              }}
            />
            <button
              id="voice-parse-manual-btn"
              onClick={() => handleParse(manualText)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm transition-colors"
            >
              Parse
            </button>
          </div>
        </div>

        {/* Parsed Result Preview and Confirmation */}
        {parsedResult && (
          <div className="w-full mt-4 p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Ready to Save ({parsedResult.detectedType})
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium capitalize">
                {parsedResult.detectedType}
              </span>
            </div>

            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Title</label>
              <input
                type="text"
                value={parsedResult.title}
                onChange={(e) =>
                  setParsedResult({ ...parsedResult, title: e.target.value })
                }
                className="w-full px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  value={parsedResult.date}
                  onChange={(e) =>
                    setParsedResult({ ...parsedResult, date: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Time</label>
                <input
                  type="time"
                  value={parsedResult.time || '09:00'}
                  onChange={(e) =>
                    setParsedResult({ ...parsedResult, time: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {(parsedResult.detectedType === 'expense' || parsedResult.detectedType === 'bill') && (
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Amount</label>
                <input
                  type="number"
                  value={parsedResult.amount || ''}
                  onChange={(e) =>
                    setParsedResult({ ...parsedResult, amount: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                  className="w-full px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            )}

            <button
              id="voice-confirm-save-btn"
              onClick={handleConfirmSave}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Confirm &amp; Save</span>
            </button>
          </div>
        )}

        {saveSuccess && (
          <div className="w-full mt-4 p-3 rounded-xl bg-emerald-600 text-white text-sm font-medium flex items-center justify-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Successfully saved to your dashboard!</span>
          </div>
        )}
      </div>
    </Modal>
  );
};
