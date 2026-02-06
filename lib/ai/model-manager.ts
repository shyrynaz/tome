import { Asset } from 'expo-asset';

// Safe import for native modules
let loadTensorflowModel: any = null;
try {
  const { loadTensorflowModel: loadFn } = require('react-native-fast-tflite');
  loadTensorflowModel = loadFn;
} catch (e) {
  console.log('react-native-fast-tflite not available in this environment');
}

export type ModelOutput = {
  intent: string;
  confidence: number;
};

export class LocalModelManager {
  private static instance: LocalModelManager;
  private model: any = null;
  private isLoaded: boolean = false;
  private vocab: Map<string, number> = new Map();

  private constructor() {
    // Basic vocabulary for a simple intent classifier
    const commonWords = ['todo', 'buy', 'call', 'meet', 'schedule', 'remind', 'at', 'tomorrow', 'today', 'urgent'];
    commonWords.forEach((word, i) => this.vocab.set(word, i + 1));
  }

  static getInstance() {
    if (!LocalModelManager.instance) {
      LocalModelManager.instance = new LocalModelManager();
    }
    return LocalModelManager.instance;
  }

  async loadModel() {
    if (this.isLoaded) return;

    try {
      console.log('Searching for local AI model in assets...');
      
      // Note: You need to place an 'intent_classifier.tflite' in assets/models/
      // For now, this is wired up to expect that file.
      const modelAsset = Asset.fromModule(require('@/assets/models/intent_classifier.tflite'));
      
      if (!modelAsset.localUri) {
        await modelAsset.downloadAsync();
      }

      this.model = await loadTensorflowModel(modelAsset.localUri!);
      this.isLoaded = true;
      console.log('✅ Local LiteRT model loaded successfully');
    } catch (error) {
      // We expect this to fail initially since the file doesn't exist yet
      console.log('ℹ️ Local model not found or failed to load. Using heuristic fallback.');
      this.isLoaded = false;
    }
  }

  /**
   * Simple tokenizer to convert text to a fixed-size tensor [1, 32]
   */
  private tokenize(text: string): Float32Array {
    const tokens = text.toLowerCase().split(/\W+/).filter(t => t.length > 0);
    const sequence = new Float32Array(32).fill(0);
    
    for (let i = 0; i < Math.min(tokens.length, 32); i++) {
      sequence[i] = this.vocab.get(tokens[i]) || 0;
    }
    
    return sequence;
  }

  async runInference(input: string): Promise<ModelOutput | null> {
    if (!this.model || !this.isLoaded) {
      return null;
    }

    try {
      const inputTensor = this.tokenize(input);
      // Run inference on the model
      const output = await this.model.run([inputTensor]);
      
      // Assuming the model output is [1, num_classes] probabilities
      const probabilities = output[0] as Float32Array;
      const maxIndex = probabilities.indexOf(Math.max(...Array.from(probabilities)));
      
      const intents = ['TASK', 'EVENT', 'NOTE', 'PLAN', 'UNKNOWN'];
      
      return {
        intent: intents[maxIndex] || 'UNKNOWN',
        confidence: probabilities[maxIndex]
      };
    } catch (error) {
      console.error('Inference error:', error);
      return null;
    }
  }

  get status() {
    return this.isLoaded ? 'LOCAL' : 'FALLBACK';
  }
}

export const modelManager = LocalModelManager.getInstance();
