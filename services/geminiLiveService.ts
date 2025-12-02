import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, base64ToUint8Array, decodeAudioData } from '../utils/audioUtils';

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private outputNode: GainNode | null = null;
  private nextStartTime: number = 0;
  private sources: Set<AudioBufferSourceNode> = new Set();
  private sessionPromise: Promise<any> | null = null;
  
  // Callbacks
  public onTranscript: (text: string, isUser: boolean, isFinal: boolean) => void = () => {};
  public onStateChange: (state: string) => void = () => {};
  public onError: (error: string) => void = () => {};

  constructor(apiKey: string) {
    // Buraya kendi AIza ile başlayan uzun şifreni tırnak içine yapıştır:
    const mySecretKey = "AIzaSyAIcnOr7Dg67eEbHYce7PoSDlgfDup00YU"; 
    
    // Artık dışarıdan gelen apiKey'i değil, senin hardcoded şifreni kullanacak
    this.ai = new GoogleGenAI({ apiKey: mySecretKey });
  }

  async connect(systemInstruction: string, voiceName: string = 'Kore') {
    try {
      this.onStateChange('CONNECTING');

      // 1. Setup Audio Contexts
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      this.outputNode = this.outputAudioContext.createGain();
      this.outputNode.connect(this.outputAudioContext.destination);

      // 2. Setup Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 3. Connect to Gemini Live
      this.sessionPromise = this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            this.onStateChange('CONNECTED');
            this.startAudioInput(stream);
          },
          onmessage: (message: LiveServerMessage) => this.handleMessage(message),
          onerror: (e: ErrorEvent) => {
            console.error(e);
            this.onError('Connection error occurred.');
            this.disconnect();
          },
          onclose: () => {
            this.onStateChange('DISCONNECTED');
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: systemInstruction,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      });
      
    } catch (err) {
      console.error(err);
      this.onError('Failed to initialize audio or connection.');
      this.disconnect();
    }
  }

  private startAudioInput(stream: MediaStream) {
    if (!this.inputAudioContext) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
    // 4096 buffer size offers a balance between latency and performance for script processor
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = createBlob(inputData);
      
      if (this.sessionPromise) {
        this.sessionPromise.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      }
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    // Handle Audio Output
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && this.outputAudioContext && this.outputNode) {
      try {
        // Ensure we don't schedule in the past
        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);

        const audioBuffer = await decodeAudioData(
          base64ToUint8Array(base64Audio),
          this.outputAudioContext,
          24000
        );

        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputNode);
        
        source.addEventListener('ended', () => {
          this.sources.delete(source);
        });

        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
        this.sources.add(source);
      } catch (e) {
        console.error("Error decoding audio", e);
      }
    }

    // Handle Interruption
    if (message.serverContent?.interrupted) {
      this.sources.forEach(source => {
        try { source.stop(); } catch(e) {}
      });
      this.sources.clear();
      this.nextStartTime = 0;
    }

    // Handle Transcription (Input)
    if (message.serverContent?.inputTranscription) {
       this.onTranscript(message.serverContent.inputTranscription.text ?? '', true, false);
    }
    
    // Handle Transcription (Output)
    if (message.serverContent?.outputTranscription) {
        this.onTranscript(message.serverContent.outputTranscription.text ?? '', false, false);
    }

    // Turn complete? We might use this to finalize transcripts if we were building a chat log history manually
    if (message.serverContent?.turnComplete) {
       // Logic to finalize transcript if needed
    }
  }

  disconnect() {
    this.onStateChange('DISCONNECTED');
    
    if (this.inputSource) {
      this.inputSource.disconnect();
      this.inputSource = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.inputAudioContext) {
      this.inputAudioContext.close();
      this.inputAudioContext = null;
    }
    if (this.outputAudioContext) {
      this.outputAudioContext.close();
      this.outputAudioContext = null;
    }
    
    this.sources.forEach(s => s.stop());
    this.sources.clear();
    this.nextStartTime = 0;
    
    // There is no explicit .close() on sessionPromise session object in the current SDK 
    // unless the promise resolves to an object with close(). 
    // Usually standard WebSocket clean up happens on GC or we can try to close if method exists.
    // Based on prompt examples, we just stop sending data and release media streams.
    this.sessionPromise = null; 
  }
}
