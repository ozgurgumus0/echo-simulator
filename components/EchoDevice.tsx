import React, { useEffect, useState } from 'react';
import { ConnectionState } from '../types';

interface EchoDeviceProps {
  state: ConnectionState;
  isTalking: boolean;
  transcript: string;
}

const EchoDevice: React.FC<EchoDeviceProps> = ({ state, isTalking, transcript }) => {
  const [displayTranscript, setDisplayTranscript] = useState('');

  // Effect to handle fading or updating transcript
  useEffect(() => {
    setDisplayTranscript(transcript);
    // Optional: Clear after delay if needed, but continuous stream is better
    const timer = setTimeout(() => {
        // We could fade it out, but for now let's keep it until replaced or session ends
    }, 5000);
    return () => clearTimeout(timer);
  }, [transcript]);

  const getRingColor = () => {
    switch (state) {
      case ConnectionState.CONNECTING:
        return 'border-orange-500 shadow-orange-500/50 echo-spin';
      case ConnectionState.CONNECTED:
        return 'border-cyan-500 shadow-cyan-500/50';
      case ConnectionState.ERROR:
        return 'border-red-600 shadow-red-600/50';
      default:
        return 'border-gray-700';
    }
  };

  const getInnerLight = () => {
    if (state !== ConnectionState.CONNECTED) return 'bg-gray-800';
    if (isTalking) return 'bg-cyan-400/80 animate-pulse';
    return 'bg-blue-900/60';
  };

  return (
    <div className="relative flex items-center justify-center w-72 h-72 md:w-96 md:h-96 mx-auto my-8 select-none">
      {/* Outer Ring Effect */}
      <div 
        className={`absolute inset-0 rounded-full border-[6px] transition-all duration-500 ${getRingColor()} ${
          state === ConnectionState.CONNECTED && isTalking ? 'echo-ring-active' : ''
        }`} 
        style={{boxShadow: state === ConnectionState.CONNECTED ? '0 0 40px currentColor' : 'none'}}
      />
      
      {/* Device Body */}
      <div className="relative w-60 h-60 md:w-80 md:h-80 rounded-full bg-black border-[12px] border-gray-900 flex items-center justify-center shadow-2xl overflow-hidden z-10">
        
        {/* Fabric Texture Overlay */}
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/dark-denim.png')] pointer-events-none"></div>
        
        {/* Top Interface Buttons (Visual Only) */}
        <div className="absolute top-10 flex space-x-12 text-gray-700 z-20 opacity-50">
           <div className="w-5 h-5 rounded-full border-2 border-gray-700 bg-gray-900"></div>
           <div className="w-5 h-5 rounded-full border-2 border-gray-700 bg-gray-900"></div>
        </div>
        <div className="absolute bottom-10 flex space-x-12 text-gray-700 z-20 opacity-50">
           <div className="w-5 h-5 rounded-full border-2 border-gray-700 bg-gray-900"></div>
           <div className="w-5 h-5 rounded-full border-2 border-gray-700 bg-gray-900"></div>
        </div>

        {/* Center Light Ring (The Alexa Blue Ring) */}
        <div className={`absolute inset-0 m-auto w-40 h-40 rounded-full transition-all duration-300 blur-2xl opacity-50 ${getInnerLight()}`}></div>

        {/* Embedded Text Display (The "Hardcoded" Personalized LLM Output) */}
        <div className="absolute inset-8 flex items-center justify-center z-30">
          <div className="text-center transform transition-all duration-300">
            {state === ConnectionState.CONNECTED ? (
               <p className="text-cyan-50 font-medium text-lg leading-relaxed drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] line-clamp-5 px-4 animate-in fade-in zoom-in duration-300">
                 {displayTranscript || <span className="text-cyan-500/50 text-sm animate-pulse">Dinliyor...</span>}
               </p>
            ) : (
               <p className="text-gray-600 font-bold text-xs tracking-widest uppercase">
                 {state === ConnectionState.DISCONNECTED ? 'ÇEVRİMDIŞI' : state === ConnectionState.CONNECTING ? 'BAĞLANIYOR' : 'HATA'}
               </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EchoDevice;