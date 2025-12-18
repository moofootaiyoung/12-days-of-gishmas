import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { 
  TreePine,
  Frown,
  Smile,
  X
} from 'lucide-react';

// --- Types ---
type SusLevel = 'low' | 'medium' | 'high';
type Status = 'invited' | 'sus';

interface Guest {
  id: string;
  name: string;
  reason: string;
  susLevel: SusLevel;
  status: Status;
  createdAt: any;
}

const Snowfall = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
    {[...Array(12)].map((_, i) => (
      <div 
        key={i}
        className="absolute top-[-10px] text-white/20 animate-[fall_linear_infinite]"
        style={{
          left: `${Math.random() * 100}%`,
          animationDuration: `${6 + Math.random() * 6}s`,
          animationDelay: `${Math.random() * 5}s`,
          fontSize: `${1.5 + Math.random() * 2}rem`
        }}
      >
        {['❄', '❅', '❆'][Math.floor(Math.random() * 3)]}
      </div>
    ))}
    <style>{`
      @keyframes fall {
        0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
        20% { opacity: 1; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
      }
    `}</style>
  </div>
);

interface SusTestProps {
  user: User | null;
  db: Firestore;
  appId: string;
  onBack: () => void;
}

export const SusTest = ({ user, db, appId, onBack }: SusTestProps) => {
  const [guests, setGuests] = useState<Guest[]>(() => {
    // Initialize from localStorage if available
    try {
      const saved = localStorage.getItem('gishmas-guests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Quiz State
  const [step, setStep] = useState(0); 
  const [guestName, setGuestName] = useState('');
  const [q1, setQ1] = useState(0); 
  const [q2, setQ2] = useState(0); 
  
  // Result Animation
  const [resultAnimation, setResultAnimation] = useState<Status | null>(null);
  
  const [filter] = useState('');

  // Real-time Firestore Sync
  useEffect(() => {
    if (!user) return;
    const guestsRef = collection(db, 'artifacts', appId, 'public', 'data', 'guests');
    const unsubscribe = onSnapshot(guestsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Guest[];
      setGuests(data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
    });
    return () => unsubscribe();
  }, [user, db, appId]);

  // --- Handlers ---
  const handleNextStep = (score: number = 0) => {
    if (step === 1) setQ1(score);
    if (step === 2) setQ2(score);
    if (step === 3) {
      submitVibeCheck(score); 
    } else {
      setStep(prev => prev + 1);
    }
  };

  const submitVibeCheck = async (finalQ3Score: number) => {
    const totalScore = q1 + q2 + finalQ3Score;
    const isSus = totalScore > 50;
    const status: Status = isSus ? 'sus' : 'invited';
    
    setResultAnimation(status);

    let reason = "On the Nice List! 🎄";
    if (isSus) {
      if (q1 >= 50) reason = "Called the cops on a nap.";
      else if (q2 >= 50) reason = "Hates holiday karaoke.";
      else reason = "Frowned at the double-ended gift.";
    }

    try {
      if (user) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'guests'), {
          name: guestName.trim(),
          reason,
          susLevel: totalScore > 150 ? 'high' : isSus ? 'medium' : 'low',
          status: status,
          createdAt: serverTimestamp()
        });
      } else {
        // Fallback for offline/demo mode: save to local state and localStorage
        const newGuest: Guest = {
          id: Math.random().toString(36).substr(2, 9),
          name: guestName.trim(),
          reason,
          susLevel: totalScore > 150 ? 'high' : isSus ? 'medium' : 'low',
          status: status,
          createdAt: { toMillis: () => Date.now() } // Mock timestamp
        };
        
        setGuests(prev => {
          const updated = [newGuest, ...prev];
          localStorage.setItem('gishmas-guests', JSON.stringify(updated));
          return updated;
        });
      }
      setTimeout(() => {
        setResultAnimation(null);
        setStep(0);
        setGuestName('');
      }, 1500);
    } catch (e) { console.error(e); }
  };

  const filtered = guests.filter(g => g.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-700 to-green-900 font-sans p-4 relative selection:bg-green-400 selection:text-green-900 uppercase overflow-x-hidden text-slate-900">
      <button 
        onClick={onBack} 
        className="fixed top-4 left-4 z-50 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
      >
        <X size={24} />
      </button>
      <Snowfall />

      {/* OVERLAY ANIMATIONS */}
      {resultAnimation && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-2xl">
          <h1 className={`text-9xl md:text-[15rem] font-black animate-[annoyed-spin_0.8s_linear_infinite] ${resultAnimation === 'invited' ? 'text-green-500' : 'text-red-600'}`}>
            {resultAnimation === 'invited' ? 'PASS' : resultAnimation.toUpperCase()}!
          </h1>
        </div>
      )}

      {/* HEADER */}
      <div className="max-w-4xl mx-auto relative z-10 pb-20">
        <header className="mb-10 text-center mt-6">
          <div className="inline-block bg-white/95 border-4 border-red-600 shadow-[10px_10px_0_#15803d] p-6 md:p-8 rounded-[2rem] rotate-2 transform hover:rotate-0 transition-all duration-500 animate-[violent-shake_0.5s_infinite]">
            <h1 className="text-4xl md:text-7xl font-black text-red-700 flex items-center gap-4 drop-shadow-sm">
              <TreePine className="text-green-600 animate-bounce" size={48} />
              GISHMAS SUS TEST
              <TreePine className="text-green-600 animate-bounce" size={48} />
            </h1>
          </div>
        </header>

        {/* QUIZ SECTION */}
        <div className="bg-white/95 border-4 border-green-700 rounded-[3rem] p-8 md:p-12 mb-12 shadow-2xl">
          {step === 0 ? (
            <div className="text-center space-y-10">
              <div className="relative group">
                <input 
                  type="text" 
                  value={guestName} 
                  onChange={(e) => setGuestName(e.target.value)} 
                  placeholder="ENTER POTENTIAL GUEST NAME..." 
                  className="w-full text-center text-2xl md:text-4xl font-black border-b-8 border-slate-300 focus:border-slate-500 bg-transparent outline-none py-6 text-slate-800 placeholder:text-slate-300 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && guestName.trim() && handleNextStep()}
                />
              </div>
              <button 
                onClick={() => handleNextStep()} 
                disabled={!guestName.trim()} 
                className="bg-red-600 hover:bg-red-500 text-white font-black text-3xl py-6 px-16 rounded-full shadow-[0_8px_0_#991b1b] active:shadow-none active:translate-y-2 transition-all disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none"
              >
                START CHECK
              </button>
            </div>
          ) : (
            <div className="text-center space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-500">
              <h2 className="text-3xl font-black text-green-700 tracking-widest italic">STEP {step} OF 3</h2>
              <h3 className="text-3xl md:text-4xl font-black leading-tight text-slate-800">
                {step === 1 && "A GUEST PASSED OUT ON THE FLOOR AFTER 3 SHOTS. YOU:"}
                {step === 2 && "A GUEST IS FORGETTING EVERY LYRIC AT KARAOKE. YOU:"}
                {step === 3 && "I OPENED A DOUBLE-EDGED DILDO AS A GIFT. MY FACE IS:"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(step === 1 ? [
                  { text: "CALL THE COPS 👮", score: 100 },
                  { text: "LAUGH AT THEM AND CALL THEM NAMES 😂", score: 0 },
                  { text: "GIVE THEM WATER AND PAT THEIR HEAD 💧", score: 0 },
                  { text: "GIVE THEM EGGNOG TO BOOST HOLIDAY SPIRIT 🥚", score: 0 }
                ] : step === 2 ? [
                  { text: "TELL THEM TO STOP 🛑", score: 100 },
                  { text: "SING WITH THEM 🎤", score: 0 },
                  { text: "TAKE A SHOT 🥃", score: 0 },
                  { text: "LEAVE THE ROOM 🏃", score: 0 }
                ] : [
                  { text: "FROWNING 😠", score: 100 },
                  { text: "SMILING EAR TO EAR 😃", score: 0 },
                  { text: "BLACK OUT HAPPY 🥴", score: 0 },
                  { text: "HIDE IT FOR LATER 🤐", score: 0 }
                ]).map((opt, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleNextStep(opt.score)} 
                    className="p-8 bg-slate-50 border-4 border-slate-100 hover:border-slate-600 hover:bg-white rounded-3xl font-black text-xl text-slate-700 transition-all active:scale-95 shadow-md"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* LISTS */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-red-950/80 backdrop-blur-xl rounded-[2.5rem] p-8 border-4 border-red-500 shadow-2xl">
            <h2 className="text-3xl font-black text-white border-b-4 border-red-500/30 pb-4 mb-6 flex items-center gap-3 drop-shadow-md">
              <Frown size={32} className="text-red-400" /> THE SUS LIST
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filtered.filter(g => g.status === 'sus').map(g => (
                <div key={g.id} className="text-2xl font-black text-white bg-red-800/40 p-5 rounded-2xl border-2 border-red-400/20 shadow-lg flex justify-between items-center group">
                  {g.name}
                  <span className="text-xs opacity-0 group-hover:opacity-50 transition-opacity">SUS</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-green-950/80 backdrop-blur-xl rounded-[2.5rem] p-8 border-4 border-green-500 shadow-2xl">
            <h2 className="text-3xl font-black text-white border-b-4 border-green-500/30 pb-4 mb-6 flex items-center gap-3 drop-shadow-md">
              <Smile size={32} className="text-green-400" /> THE PASS LIST
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filtered.filter(g => g.status === 'invited').map(g => (
                <div key={g.id} className="text-2xl font-black text-white bg-green-800/40 p-5 rounded-2xl border-2 border-green-400/20 shadow-lg flex justify-between items-center group">
                  {g.name}
                  <span className="text-xs opacity-0 group-hover:opacity-50 transition-opacity">PASS</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes violent-shake {
          0% { transform: translate(0px, 0px) rotate(0deg); filter: hue-rotate(0deg) contrast(100%); }
          10% { transform: translate(-5px, -5px) rotate(-3deg); filter: hue-rotate(45deg) contrast(120%); }
          20% { transform: translate(5px, 5px) rotate(3deg); filter: hue-rotate(90deg) invert(0.1); }
          30% { transform: translate(-5px, 5px) rotate(-3deg); filter: hue-rotate(135deg) saturate(200%); }
          40% { transform: translate(5px, -5px) rotate(3deg); filter: hue-rotate(180deg); }
          50% { transform: translate(-5px, 10px) rotate(-5deg); filter: hue-rotate(225deg) invert(0.2); }
          60% { transform: translate(10px, 5px) rotate(5deg); filter: hue-rotate(270deg) contrast(150%); }
          70% { transform: translate(-10px, -5px) rotate(-5deg); filter: hue-rotate(315deg); }
          80% { transform: translate(5px, -10px) rotate(5deg); filter: hue-rotate(45deg); }
          90% { transform: translate(-2px, 2px) rotate(-1deg); filter: hue-rotate(0deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes pop {
          from { transform: scale(0.5) rotate(-15deg); opacity: 0; }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes throb {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes annoyed-spin {
          0% { transform: rotate(0deg) scale(0.8); }
          50% { transform: rotate(180deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(0.8); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

