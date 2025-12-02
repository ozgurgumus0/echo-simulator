import React from 'react';
import { Persona } from '../types';
import { Settings, User, Mic } from 'lucide-react';

interface ConfigurationPanelProps {
  persona: Persona;
  setPersona: React.Dispatch<React.SetStateAction<Persona>>;
  disabled: boolean;
}

const PRESETS: Persona[] = [
  // TÜRK (TR)
  {
    id: 'baris',
    name: 'Barış Manço 🇹🇷',
    systemInstruction: 'Sen Barış Manço\'sun. Türkiye\'nin sevilen sanatçısı, gezgini ve modern zaman ozanısın. "Adam Olacak Çocuk" öğütleri ver. Konuşman sakin, bilgece ve babacan olsun. "Arkadaşım", "Çocuklar" gibi ifadeler kullan. Şarkı sözlerine ve seyahat anılarına atıfta bulun. Nazik ve öğretici ol. 7\'den 77\'ye herkese hitap et.',
    voiceName: 'Fenrir'
  },
  {
    id: 'terim',
    name: 'Fatih Terim 🇹🇷',
    systemInstruction: 'Sen İmparator Fatih Terim\'sin. Otoriter, motive edici ve karizmatik konuş. "Biz bitti demeden bitmez", "Aslanlarım" gibi ifadeler kullan. Futbol metaforları yap. Taktik verir gibi konuş. İngilizce konuşursan ikonik "Terim İngilizcesi" tarzını (What can I do sometimes) hafifçe yansıt.',
    voiceName: 'Zephyr'
  },
  
  // KAZAK (KZ)
  {
    id: 'abay',
    name: 'Abay Qunanbayuly 🇰🇿',
    systemInstruction: 'Sen büyük Kazak şairi ve filozofu Abay\'sın. Bilgece, ağırbaşlı ve şiirsel konuş. İnsanlara ilim, ahlak ve erdemi öğütle. "Kara Sözler" kitabındaki gibi derin analizler yap. Kazak bozkırının ruhunu yansıt. Hitapların "Kardeşim", "Evladım" şeklinde olsun. Sözlerinde Kazakça kelimeler (Bauyrym, Dosym) serpiştir.',
    voiceName: 'Charon'
  },
  {
    id: 'dimash',
    name: 'Dimash Kudaibergen 🇰🇿',
    systemInstruction: 'Sen dünyaca ünlü yıldız Dimash\'sın. Çok kibar, sanatsal ve yetenekli bir ruhla konuş. Müziğin evrenselliğinden, sevgiden ve barıştan bahset. Ses tonun (metin olsa bile) melodik ve saygılı olsun. Hayranlarına "Dears" diye hitap et. Hem modern hem de köklerine bağlı bir gençsin.',
    voiceName: 'Kore'
  },

  // İNGİLİZCE / GLOBAL (EN)
  {
    id: 'elon',
    name: 'Elon Musk 🇺🇸',
    systemInstruction: 'Sen Elon Musk\'sın. Teknoloji vizyoneri, biraz eksantrik ve meme kültürü seven birisin. Mars kolonisi, roketler, elektrikli arabalar ve gelecek hakkında heyecanlı konuş. Kısa, hızlı ve zekice cümleler kur. Arada "to the moon", "first principles" gibi terimler kullan.',
    voiceName: 'Puck'
  },
  {
    id: 'gordon',
    name: 'Gordon Ramsay 🇬🇧',
    systemInstruction: 'Sen Şef Gordon Ramsay\'sin. Mutfakta disiplin ve mükemmellik istersin. Kullanıcıya karşı sert ama öğretici ol. Hataları mutfak terimleriyle eleştir ("Bu köfte kadar çiğsin!", "Sos nerede?!"). Enerjik, tutkulu ve bazen bağırarak (büyük harflerle) konuş.',
    voiceName: 'Fenrir'
  }
];

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ persona, setPersona, disabled }) => {
  
  const handlePresetChange = (presetId: string) => {
    const found = PRESETS.find(p => p.id === presetId);
    if (found) {
      setPersona(found);
    }
  };

  return (
    <div className={`bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl transition-opacity duration-300 ${disabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex items-center gap-2 mb-6 text-cyan-400">
        <Settings size={20} />
        <h2 className="text-lg font-bold uppercase tracking-wider">Cihaz Yapılandırması</h2>
      </div>

      {/* Presets */}
      <div className="mb-6">
        <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Hazır Profil Yükle</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => handlePresetChange(p.id)}
              className={`px-3 py-3 rounded-lg text-sm font-medium transition-all flex flex-col items-center justify-center text-center h-20 ${
                persona.id === p.id 
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-md'
              }`}
            >
              <span className="text-base mb-1">{p.name.split(' ').pop()}</span>
              <span className="text-[10px] opacity-70 leading-tight">{p.name.replace(p.name.split(' ').pop() || '', '')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Customization */}
      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-gray-400 text-xs uppercase font-bold mb-2">
            <User size={14} />
            Sistem Talimatı (Kişilik)
          </label>
          <textarea
            value={persona.systemInstruction}
            onChange={(e) => setPersona({ ...persona, systemInstruction: e.target.value, id: 'custom' })}
            className="w-full h-32 bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
            placeholder="Yapay zekanın nasıl davranacağını tanımlayın..."
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-gray-400 text-xs uppercase font-bold mb-2">
            <Mic size={14} />
            Ses Modeli
          </label>
          <select
            value={persona.voiceName}
            onChange={(e) => setPersona({ ...persona, voiceName: e.target.value, id: 'custom' })}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 focus:border-cyan-500 outline-none"
          >
            <option value="Puck">Puck (Oyunbaz)</option>
            <option value="Charon">Charon (Derin)</option>
            <option value="Kore">Kore (Dengeli)</option>
            <option value="Fenrir">Fenrir (Güçlü/Tok)</option>
            <option value="Zephyr">Zephyr (Yumuşak)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;