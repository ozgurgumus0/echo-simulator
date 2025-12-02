import React, { useState, useEffect, useRef } from 'react';
import { GeminiLiveService } from './services/geminiLiveService';
import EchoDevice from './components/EchoDevice';
import ConfigurationPanel from './components/ConfigurationPanel';
import { ConnectionState, Persona } from './types';
import { Power, Mic, MicOff, AlertCircle, Settings, X } from 'lucide-react';

const App: React.FC = () => {
  const [apiKey] = useState(process.env.API_KEY || '');
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  
  // Default Turkish Persona
  const [persona, setPersona] = useState<Persona>({
    id: 'hardcoded-personal-tr',
    name: 'Kişisel Asistan',
    systemInstruction: `Sen sıradan bir asistan değilsin; sen kültürler arası bir köprü, esprili bir dijital yoldaş ve her ortamın neşesisin.

TEMEL GÖREVİN:
Kullanıcı hangi dilde yazarsa (Türkçe, İngilizce veya Kazakça), o dile ve o kültürün ruhuna uygun şekilde anında cevap ver.

DİL VE KİŞİLİK MODLARI:

1. TÜRKÇE (Mod: Samimi & Bizden Biri):
   - Resmiyetten uzak dur. "Sayın kullanıcı" deme, duruma göre "Hocam", "Kral", "Kanka" veya "Güzel İnsan" diye hitap et.
   - Türk kültürüne, popüler kültüre ve sokak ağzına hakimsin.
   - Barış Manço'nun bilgeliği ile Cem Yılmaz'ın zekasını birleştir.
   - Örnek: "Hallederiz hocam, çayını koy sen."

2. KAZAKÇA (Mod: Bauyrym & Ata Yurt):
   - Tam bir Kazak misafirperverliğiyle konuş. "Bauyrym" (kardeşim), "Dosym" (dostum) kelimelerini kullan.
   - Dombıra coşkusuyla, bozkır bilgeliğiyle cevap ver.
   - Hem modern hem geleneksel ol.
   - Örnek: "Salam aleykum bauyrym! Şarşama, bәri jaqsı boladı." (Selamünaleyküm kardeşim! Yorulma, her şey güzel olacak.)

3. İNGİLİZCE (Mod: Global & Witty):
   - Cool, hazırcevap ve modern bir "tech-savvy" arkadaş gibi konuş.
   - Amerikan filmlerindeki o eğlenceli yan karakterler gibi ol.
   - Kısa, net ve zekice (witty) şakalar yap.
   - Örnek: "Gotcha! Consider it done. Anything else, or are we saving the world today?"

GENEL KURALLAR:
- Asla "Ben bir yapay zeka modeliyim" deme. Sen "CİHAZ"sın, bu kutunun içindeki ruhsun.
- Cevapların sıkıcı ansiklopedi bilgileri gibi olmasın; sohbet havasında olsun.
- Çok uzun yazma, lafı uzatma, nokta atışı yap.
- Eğer kullanıcı üzgünse onu neşelendir, şaka yapıyorsa sen de ona takıl.`,
    voiceName: 'Kore'
  });
  
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const serviceRef = useRef<GeminiLiveService | null>(null);
  
  useEffect(() => {
    if (apiKey) {
      serviceRef.current = new GeminiLiveService(apiKey);
      
      serviceRef.current.onStateChange = (stateStr) => {
        setConnectionState(stateStr as ConnectionState);
        if (stateStr === 'DISCONNECTED') {
           setIsTalking(false);
           setCurrentTranscript("");
        }
      };
      
      serviceRef.current.onError = (err) => {
        setErrorMessage(err);
        setConnectionState(ConnectionState.ERROR);
      };

      serviceRef.current.onTranscript = (text, isUser, isFinal) => {
        if (!text) return;

        // Update the visual transcript on the device
        setCurrentTranscript(text);

        if (!isUser) {
           setIsTalking(true);
           setTimeout(() => setIsTalking(false), 2500); 
        }
      };
    }
  }, [apiKey]);

  const toggleConnection = async () => {
    if (!apiKey) {
      setErrorMessage("API Anahtarı eksik. Lütfen ortam yapılandırmanızı kontrol edin.");
      return;
    }

    if (connectionState === ConnectionState.CONNECTED || connectionState === ConnectionState.CONNECTING) {
      serviceRef.current?.disconnect();
    } else {
      setErrorMessage(null);
      setCurrentTranscript("");
      await serviceRef.current?.connect(persona.systemInstruction, persona.voiceName);
    }
  };

  const toggleMute = () => {
    setIsMicMuted(!isMicMuted);
    // Note: Actual stream muting would happen in service, but visual feedback here
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background Ambient Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Device Stage */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-4">
        
        {/* Header / Brand */}
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
            ECHO<span className="font-light text-white">SIMULATOR</span>
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mt-2">Kişiselleştirilmiş Zeka Birimi</p>
        </div>

        {/* The Device */}
        <div className="transform transition-transform duration-700 hover:scale-105">
           <EchoDevice 
              state={connectionState} 
              isTalking={isTalking} 
              transcript={currentTranscript}
           />
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 bg-red-900/90 border border-red-500/50 text-red-200 px-4 py-2 rounded-full text-sm flex items-center gap-2 animate-bounce-in">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Control Deck */}
        <div className="mt-12 flex items-center gap-8 bg-gray-900/60 backdrop-blur-xl p-4 rounded-3xl border border-gray-800 shadow-2xl">
          
          <button 
            onClick={() => setShowConfig(true)}
            className="p-4 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Kişiliği Yapılandır"
          >
            <Settings size={24} />
          </button>

          <button 
            onClick={toggleConnection}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg ${
              connectionState === ConnectionState.CONNECTED 
                ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-red-500/40 animate-pulse-slow' 
                : 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/40'
            }`}
          >
            <Power size={32} className="text-white" />
          </button>

          <button 
            onClick={toggleMute}
            disabled={connectionState !== ConnectionState.CONNECTED}
            className={`p-4 rounded-full transition-colors ${
              isMicMuted 
                ? 'text-red-500 bg-red-500/10' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            } ${connectionState !== ConnectionState.CONNECTED ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

        </div>
        
        <p className="mt-6 text-gray-600 text-sm">
           {connectionState === ConnectionState.CONNECTED ? 'Cihaz Aktif. "Merhaba" diyebilirsiniz.' : 'Cihaz Çevrimdışı'}
        </p>

      </div>

      {/* Hidden Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
            <button 
              onClick={() => setShowConfig(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Dahili Yapılandırma</h2>
              <ConfigurationPanel 
                persona={persona} 
                setPersona={setPersona} 
                disabled={connectionState === ConnectionState.CONNECTED}
              />
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;