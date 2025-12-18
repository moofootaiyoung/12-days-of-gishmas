import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore 
} from 'firebase/firestore';
import { 
  X,
  Trophy
} from 'lucide-react';
import { SusTest } from './SusTest';

// --- Firebase Initialization (Using Sandbox Globals) ---
const firebaseConfig = typeof __firebase_config === 'string' ? JSON.parse(__firebase_config) : __firebase_config;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Snowfall Component ---
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

// --- Landing Page Component ---
const LandingPage = ({ onEnter, onSusTest }: { onEnter: () => void, onSusTest: () => void }) => {
  return (
  <div className="min-h-screen bg-gradient-to-b from-red-700 to-green-900 flex flex-col items-center justify-center p-4 text-center font-sans uppercase relative overflow-hidden">
    <Snowfall />
    <div className="relative z-10">
      <div className="inline-block bg-white/95 border-4 border-red-600 shadow-[10px_10px_0_#15803d] p-12 rounded-[3rem] rotate-2 transform hover:rotate-0 transition-all duration-500 animate-[violent-shake_0.5s_infinite] mb-12">
        <h1 className="text-6xl md:text-8xl font-black text-red-700 tracking-tighter leading-none flex flex-col items-center gap-2 drop-shadow-sm">
          <span>12 DAYS OF</span>
          <span className="text-green-600">GISHMAS</span>
        </h1>
      </div>
      
      <div className="max-w-md mx-auto space-y-6 flex flex-col items-center">
        <button 
          onClick={onEnter}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-2xl md:text-4xl py-6 px-10 rounded-2xl border-b-8 border-red-800 active:border-b-0 active:translate-y-2 transition-all shadow-xl hover:scale-[1.02] flex items-center justify-center gap-4 group"
        >
          ENTER
        </button>
        <button 
          onClick={onSusTest}
          className="text-white/60 hover:text-white transition-colors text-sm font-bold tracking-widest uppercase underline underline-offset-4"
        >
          GISHMAS SUS TEST
        </button>
      </div>
    </div>
  </div>
  );
};

// --- Home Page Component (Day Selection) ---
const HomePage = ({ onBack }: { onBack: () => void }) => {
  const [showWheel, setShowWheel] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [prizeWon, setPrizeWon] = useState(false);

  // Gishmas Unlock Dates (Assuming Day 1 is Dec 18, 2025)
  const START_DATE = new Date('2025-12-18T00:00:00'); 
  const today = new Date();
  
  // Calculate unlocked day based on time difference from start date
  // Day 1 is unlocked on/after Dec 18
  // Day 2 is unlocked on/after Dec 19, etc.
  const daysSinceStart = Math.floor((today.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24));
  const unlockedDay = Math.max(1, daysSinceStart + 1);

  useEffect(() => {
    // Check if wheel has been spun in this session
    // const hasSpun = sessionStorage.getItem('gishmas_wheel_spun');
    // if (!hasSpun) {
    //   const timer = setTimeout(() => {
    //     // setShowWheel(true); // DISABLED: Auto-popup removed
    //   }, 3000);
    //   return () => clearTimeout(timer);
    // }
  }, []);

  const spinTheWheel = () => {
    if (spinning || prizeWon) return;
    setSpinning(true);
    const randomSpin = 2160 + Math.floor(Math.random() * 360); // min 6 full rotations
    setWheelRotation(randomSpin);
    setTimeout(() => {
      setSpinning(false);
      setPrizeWon(true);
      sessionStorage.setItem('gishmas_wheel_spun', 'true');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-700 to-green-900 font-sans p-4 relative selection:bg-green-400 selection:text-green-900 uppercase overflow-x-hidden text-slate-900 flex flex-col items-center">
      <Snowfall />
      
      {/* WHEEL MODAL */}
      {showWheel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="relative bg-white border-[10px] border-yellow-400 p-8 rounded-[4rem] shadow-2xl text-center max-w-sm w-full animate-[pop_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <button onClick={() => setShowWheel(false)} className="absolute -top-6 -right-6 bg-red-600 text-white p-3 rounded-full border-4 border-white shadow-xl hover:scale-110 transition-transform"><X size={28} /></button>
            
            <h2 className="text-4xl font-black text-red-600 leading-none mb-6 drop-shadow-sm">SPIN FOR<br/><span className="text-green-600">DAILY PRIZE!!</span></h2>
            
            <div className="relative w-56 h-56 md:w-64 md:h-64 mx-auto mb-10">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 text-4xl filter drop-shadow-lg">⬇️</div>
              <div 
                className="w-full h-full rounded-full border-4 border-black overflow-hidden shadow-inner transition-transform duration-[3000ms] ease-[cubic-bezier(0.1,0.7,0.1,1)]" 
                style={{ transform: `rotate(${wheelRotation}deg)` }}
              >
                <div className="absolute inset-0 w-full h-full" style={{ background: 'conic-gradient(#ef4444 0% 12.5%, #22c55e 12.5% 25%, #ef4444 25% 37.5%, #22c55e 37.5% 50%, #ef4444 50% 62.5%, #22c55e 62.5% 75%, #ef4444 75% 87.5%, #22c55e 87.5% 100%)' }} />
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`absolute top-1/2 left-1/2 w-1/2 text-[10px] md:text-[12px] font-black text-white origin-left transition-opacity duration-300 ${prizeWon ? 'opacity-100' : 'opacity-0'}`} 
                    style={{ transform: `translateY(-50%) rotate(${i * 45 + 22.5}deg)`, paddingLeft: '18%' }}
                  >
                    SUCK A DICK!
                  </div>
                ))}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-black z-10 flex items-center justify-center shadow-lg"><Trophy className="text-yellow-500" size={24} /></div>
            </div>

            {prizeWon ? (
              <div className="animate-[throb_0.5s_infinite]">
                <h3 className="text-4xl font-black text-red-600 mb-6 drop-shadow-lg">SUCK A DICK!</h3>
                <button onClick={() => { setShowWheel(false); }} className="bg-green-600 hover:bg-green-700 text-white font-black text-xl py-4 px-10 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95">CLAIM PRIZE</button>
              </div>
            ) : (
              <button onClick={spinTheWheel} disabled={spinning} className="bg-yellow-400 hover:bg-yellow-300 border-4 border-black font-black text-2xl py-4 px-12 rounded-full shadow-[0_6px_0_#000] active:shadow-none active:translate-y-1 transition-all disabled:opacity-50">
                {spinning ? 'SPINNING...' : 'SPIN!'}
              </button>
            )}
          </div>
        </div>
      )}

      <button 
        onClick={onBack} 
        className="fixed top-4 left-4 z-50 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
      >
        <X size={24} />
      </button>

      <div className="relative z-10 w-full max-w-4xl pt-12 flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-black text-green-600 tracking-tighter leading-none flex items-center gap-2 drop-shadow-sm mb-12 whitespace-nowrap" style={{ fontFamily: '"Mountains of Christmas", cursive' }}>
          <span>12 DAYS OF</span>
          <span>GISHMAS</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {/* Day 1 - Daily Spin */}
          <button 
            onClick={() => setShowWheel(true)}
            className={`p-8 rounded-[2rem] border-[6px] shadow-[0_8px_0_#854d0e] hover:scale-105 active:scale-95 active:shadow-none active:translate-y-2 transition-all group ${unlockedDay >= 1 ? 'bg-white border-yellow-400 hover:bg-yellow-100' : 'bg-black/20 border-white/10 opacity-60 pointer-events-none'}`}
          >
            {unlockedDay >= 1 ? (
              <>
                <div className="text-4xl mb-4 group-hover:animate-bounce">🎅</div>
                <h2 className="text-2xl font-black text-red-600 mb-2">DAY 1</h2>
                <p className="font-bold text-slate-600">DAILY SPIN 🎰</p>
              </>
            ) : (
               <div className="flex flex-col items-center justify-center h-full">
                <div className="text-4xl mb-4 opacity-50">🔒</div>
                <h2 className="text-2xl font-black text-white/50 mb-2">DAY 1</h2>
                <p className="font-bold text-white/30">LOCKED</p>
               </div>
            )}
          </button>

          {/* Days 2-12 */}
          {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((day) => {
             const isUnlocked = unlockedDay >= day;
             return (
              <div 
                key={day} 
                className={`p-8 rounded-[2rem] border-[6px] flex flex-col items-center justify-center relative overflow-hidden group transition-all ${isUnlocked ? 'bg-white border-green-500 shadow-[0_8px_0_#15803d]' : 'bg-black/20 border-white/10 opacity-60'}`}
              >
                {!isUnlocked && <div className="absolute inset-0 bg-repeating-linear-gradient-45 from-transparent to-transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px" />}
                
                <div className={`text-4xl mb-4 ${!isUnlocked && 'opacity-50'}`}>{isUnlocked ? '🎁' : '🔒'}</div>
                <h2 className={`text-2xl font-black mb-2 ${isUnlocked ? 'text-green-600' : 'text-white/50'}`}>DAY {day}</h2>
                <p className={`font-bold ${isUnlocked ? 'text-slate-600' : 'text-white/30'}`}>
                  {isUnlocked 
                    ? (day === 3 ? 'GTA 6' : '???')
                    : 'LOCKED'
                  }
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'home' | 'sus-test'>('landing');
  const [user, setUser] = useState<User | null>(null);
  
  // 1. Authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
        if (token && token !== "undefined") {
          await signInWithCustomToken(auth, token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth initialization failed", e);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  if (currentPage === 'landing') {
    return <LandingPage onEnter={() => setCurrentPage('home')} onSusTest={() => setCurrentPage('sus-test')} />;
  }

  if (currentPage === 'home') {
    return <HomePage onBack={() => setCurrentPage('landing')} />;
  }

  return <SusTest user={user} db={db} appId={appId} onBack={() => setCurrentPage('home')} />;
}
