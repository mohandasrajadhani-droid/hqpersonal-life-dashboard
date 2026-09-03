/**
 * Web Speech API recognition and natural language entity extraction
 */

import { getTodayString } from './dateUtils';

export interface ParsedVoiceCommand {
  rawText: string;
  detectedType: 'reminder' | 'task' | 'expense' | 'bill' | 'calendar' | 'general';
  title: string;
  date: string;
  time?: string;
  amount?: number;
  category?: string;
}

// Check speech recognition availability
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function parseVoiceInput(transcript: string): ParsedVoiceCommand {
  const clean = transcript.trim();
  const lower = clean.toLowerCase();

  let detectedType: ParsedVoiceCommand['detectedType'] = 'reminder';
  if (lower.startsWith('expense') || lower.includes('spent') || lower.includes('paid ') || lower.includes('cost')) {
    detectedType = 'expense';
  } else if (lower.startsWith('bill') || lower.includes('electricity bill') || lower.includes('water bill')) {
    detectedType = 'bill';
  } else if (lower.startsWith('task') || lower.startsWith('todo') || lower.includes('need to') || lower.includes('have to')) {
    detectedType = 'task';
  } else if (lower.startsWith('event') || lower.startsWith('calendar') || lower.includes('meeting')) {
    detectedType = 'calendar';
  } else if (lower.startsWith('remind') || lower.includes('reminder')) {
    detectedType = 'reminder';
  }

  // Date parsing
  let date = getTodayString();
  const today = new Date();

  if (lower.includes('tomorrow')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    date = `${y}-${m}-${day}`;
  } else if (lower.includes('day after tomorrow')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    date = `${y}-${m}-${day}`;
  } else if (lower.includes('next week')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    date = `${y}-${m}-${day}`;
  }

  // Time parsing: e.g. "at 9 AM", "at 9:30 PM", "at 14:00"
  let time: string | undefined = undefined;
  const timeRegex = /(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const timeMatch = lower.match(/(?:at\s+)(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i) || lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);

  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? String(timeMatch[2]).padStart(2, '0') : '00';
    const ampm = timeMatch[3]?.toLowerCase();

    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;

    time = `${String(hour).padStart(2, '0')}:${minute}`;
  }

  // Amount parsing: e.g. "$50", "50 dollars", "50 rupees", "amount 50"
  let amount: number | undefined = undefined;
  const amountMatch = lower.match(/(?:[$€£₹]|amount\s+)?\s*(\d+(?:\.\d{1,2})?)\s*(?:dollars|bucks|rupees|usd|inr|eur|euro)?/i);
  if (amountMatch && amountMatch[1]) {
    const val = parseFloat(amountMatch[1]);
    if (!isNaN(val) && val > 0 && (detectedType === 'expense' || detectedType === 'bill')) {
      amount = val;
    }
  }

  // Extract cleaned title
  let title = clean
    .replace(/^remind\s+(me\s+)?(to\s+)?/i, '')
    .replace(/^(add\s+)?(a\s+)?(new\s+)?(task|reminder|expense|bill|event|calendar)\s*(to|for|:)?\s*/i, '')
    .replace(/tomorrow/gi, '')
    .replace(/day after tomorrow/gi, '')
    .replace(/today/gi, '')
    .replace(/next week/gi, '')
    .replace(/(?:at\s+)?\d{1,2}(?::\d{2})?\s*(am|pm)?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  } else {
    title = clean;
  }

  return {
    rawText: clean,
    detectedType,
    title,
    date,
    time: time || '09:00',
    amount,
  };
}
