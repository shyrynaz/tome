const compromise = require('compromise');
const nlp = compromise.default || compromise;
nlp.extend(require('compromise-dates'));
import { modelManager } from './model-manager';

export type Intent = 'TASK' | 'EVENT' | 'NOTE' | 'PLAN' | 'UNKNOWN';
export type Priority = 'low' | 'medium' | 'high';

export interface ParsedIntent {
  intent: Intent;
  confidence: number;
  entities: {
    text: string;
    type: 'DATE' | 'TIME' | 'PRIORITY' | 'PROJECT' | 'PERSON' | 'PLACE';
    start: number;
    end: number;
    value?: any;
  }[];
  cleanedText: string;
  priority: Priority;
}

export class LocalIntentParser {
  constructor() {
    // Start loading the model in the background (LiteRT if available)
    modelManager.loadModel();
  }

  async parse(text: string): Promise<ParsedIntent> {
    // 1. Attempt local LiteRT inference first (Privacy-first)
    const modelResult = await modelManager.runInference(text);

    if (modelResult && modelResult.confidence > 0.8) {
      const basicData = this.nlpParse(text);
      return {
        ...basicData,
        intent: modelResult.intent as Intent,
        confidence: modelResult.confidence,
      };
    }

    // 2. Fallback to Compromise (High-quality rule-based NLP)
    return this.nlpParse(text);
  }

  private nlpParse(text: string): ParsedIntent {
    const doc = nlp(text);
    const lowerText = text.toLowerCase();
    const entities: ParsedIntent['entities'] = [];

    // Extract Dates and Times
    if (doc.dates) {
      doc
        .dates()
        .json()
        .forEach((d: any) => {
          entities.push({
            text: d.text,
            type: 'DATE',
            start: text.indexOf(d.text),
            end: text.indexOf(d.text) + d.text.length,
          });
        });
    }

    // Extract People/Places
    if (doc.people) {
      doc
        .people()
        .json()
        .forEach((p: any) => {
          entities.push({
            text: p.text,
            type: 'PERSON',
            start: text.indexOf(p.text),
            end: text.indexOf(p.text) + p.text.length,
          });
        });
    }

    // Priority Detection
    let priority: Priority = 'medium';
    if (doc.has('(urgent|asap|important|immediately|now)')) {
      priority = 'high';
    } else if (doc.has('(later|whenever|low priority)')) {
      priority = 'low';
    }

    // Intent Classification Logic
    let intent: Intent = 'NOTE'; // Default to Note for longer text
    let confidence = 0.6;

    // Verb-first or Command patterns usually indicate a TASK
    if (doc.has('#Verb') || doc.has('(todo|buy|call|email|finish|remind|get|start|stop)')) {
      intent = 'TASK';
      confidence = 0.9;
    }

    // Time-heavy patterns indicate an EVENT
    if (doc.has('#Date') && doc.has('(at|on|during|meeting|appointment|schedule)')) {
      intent = 'EVENT';
      confidence = 0.85;
    }

    // Cleaned Text: Strip out common "command" prefixes
    let cleanedText = text.replace(/^(todo|remind me to|i need to|schedule|capture)\s+/i, '');

    return {
      intent,
      confidence,
      entities,
      priority,
      cleanedText: cleanedText.trim() || text,
    };
  }
}

export const intentParser = new LocalIntentParser();
