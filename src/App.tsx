import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  X,
  Trophy,
  Play,
  Pause
} from 'lucide-react';
import { SusTest } from './SusTest';
import { SusTestV2 } from './SusTestV2';

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
      @keyframes pop {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
    `}</style>
  </div>
);

// --- Landing Page Component ---
const LandingPage = ({ onEnter, onLogin, onSignup }: { onEnter: () => void, onLogin: (e: string, p: string) => Promise<void>, onSignup: (e: string, p: string) => Promise<void> }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignup) {
        await onSignup(email, password);
      } else {
        await onLogin(email, password);
      }
      setShowLogin(false);
    } catch (err: any) {
      console.error(err);
      setError('Authentication Failed');
    }
  };

  const handleEnter = () => {
    // Fire confetti
    const duration = 1500;
    const end = Date.now() + duration;

    // Launch a burst of confetti from the sides
    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#dc2626', '#16a34a', '#ffffff'], // Red-600, Green-600, White
        zIndex: 100
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#dc2626', '#16a34a', '#ffffff'],
        zIndex: 100
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
    
    // Also a big burst from the center for impact
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#dc2626', '#16a34a', '#ffffff'],
      zIndex: 100
    });

    onEnter();
  };

  return (
  <div className="min-h-screen bg-gradient-to-b from-red-700 to-green-900 relative overflow-hidden flex flex-col items-center justify-center p-4 text-center font-sans uppercase">
    {/* Content */}
    <div className="relative z-10 w-full flex flex-col items-center">
      <div className="inline-block bg-white/95 border-4 border-red-600 shadow-[10px_10px_0_#15803d] p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] rotate-2 transform hover:rotate-0 transition-all duration-500 animate-[violent-shake_0.5s_infinite] mb-8 md:mb-12">
        <h1 className="text-5xl md:text-8xl font-black text-red-700 tracking-tighter leading-none flex flex-col items-center gap-2 drop-shadow-sm">
          <span>12 DAYS OF</span>
          <span className="text-green-600">GISHMAS</span>
        </h1>
      </div>
      
      <div className="max-w-md mx-auto space-y-6 flex flex-col items-center w-full">
        <button
          onClick={handleEnter}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-2xl md:text-4xl py-6 px-10 rounded-2xl border-b-8 border-red-800 active:border-b-0 active:translate-y-2 transition-all shadow-xl hover:scale-[1.02] flex items-center justify-center gap-4 group"
        >
          ENTER
        </button>
      </div>
    </div>

    {/* Login Trigger - DISABLED */}
    {false && (
    <button 
      onClick={() => setShowLogin(true)}
      className="absolute top-4 right-4 text-white/40 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors z-20 px-4 py-2"
    >
      Login
    </button>
    )}

    {/* Login Modal */}
    {false && showLogin && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
        <div className="bg-white p-8 rounded-3xl w-full max-w-sm relative shadow-2xl border-4 border-slate-100">
          <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"><X /></button>
          <h2 className="text-2xl font-black text-slate-800 mb-6 border-b-4 border-slate-100 pb-2">{isSignup ? 'Sign Up' : 'Login'}</h2>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-red-500 focus:bg-white transition-all placeholder:text-slate-300"
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-red-500 focus:bg-white transition-all placeholder:text-slate-300"
            />
            {error && <p className="text-red-600 font-black text-sm animate-pulse">{error}</p>}
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xl py-4 rounded-xl shadow-lg transition-transform active:scale-95">
              {isSignup ? 'Create Account' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="w-full text-center text-sm font-bold text-slate-500 hover:text-red-600 transition-colors"
            >
              {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
            </button>
          </form>
        </div>
      </div>
    )}
  </div>
  );
};

// --- Home Page Component (Day Selection) ---
const HomePage = ({ onBack, onSusTestV2, onGta6 }: { onBack: () => void; onSusTestV2: () => void; onGta6: () => void }) => {
  const [showWheel, setShowWheel] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [prizeWon, setPrizeWon] = useState(false);

  const unlockedDay = 3; // UNLOCK DAY 1, DAY 2, AND DAY 3

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

      <div className="relative z-10 w-full max-w-4xl mt-4 md:-mt-20 flex flex-col items-center">
        <img 
          src="/assets/Untitled.png" 
          alt="12 Days of Gishmas" 
          className="max-w-full h-auto mb-4 md:-mb-20 px-4 drop-shadow-lg"
          style={{ maxHeight: '350px' }}
        />

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
                <p className="font-bold text-slate-600">SPIN THE WHEEL</p>
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
             
             // Day 2 is clickable when unlocked
             if (day === 2 && isUnlocked) {
               return (
                 <button
                   key={day}
                   onClick={onSusTestV2}
                   className="p-8 rounded-[2rem] border-[6px] flex flex-col items-center justify-center relative overflow-hidden group transition-all bg-white border-green-500 shadow-[0_8px_0_#15803d] hover:scale-105 active:scale-95 active:shadow-none active:translate-y-2"
                 >
                   <div className="text-4xl mb-4 group-hover:animate-bounce">🎁</div>
                   <h2 className="text-2xl font-black mb-2 text-green-600">DAY {day}</h2>
                   <p className="font-bold text-slate-600 text-xs tracking-tighter">GISHMAS SUS CHECKER V2</p>
                 </button>
               );
             }
             
             // Day 3 is clickable when unlocked - GTA 6
             if (day === 3 && isUnlocked) {
               return (
                 <button
                   key={day}
                   onClick={onGta6}
                   className="p-8 rounded-[2rem] border-[6px] flex flex-col items-center justify-center relative overflow-hidden group transition-all bg-white border-green-500 shadow-[0_8px_0_#15803d] hover:scale-105 active:scale-95 active:shadow-none active:translate-y-2"
                 >
                   <div className="text-4xl mb-4 group-hover:animate-bounce">🎁</div>
                   <h2 className="text-2xl font-black mb-2 text-green-600">DAY {day}</h2>
                   <p className="font-bold text-slate-600">GTA 6</p>
                 </button>
               );
             }
             
             return (
              <div 
                key={day} 
                className={`p-8 rounded-[2rem] border-[6px] flex flex-col items-center justify-center relative overflow-hidden group transition-all ${isUnlocked ? 'bg-white border-green-500 shadow-[0_8px_0_#15803d]' : 'bg-black/20 border-white/10 opacity-60'}`}
              >
                {!isUnlocked && <div className="absolute inset-0 bg-repeating-linear-gradient-45 from-transparent to-transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px" />}
                
                <div className={`text-4xl mb-4 ${!isUnlocked && 'opacity-50'}`}>{isUnlocked ? '🎁' : '🔒'}</div>
                <h2 className={`text-2xl font-black mb-2 ${isUnlocked ? 'text-green-600' : 'text-white/50'}`}>DAY {day}</h2>
                <p className={`font-bold ${isUnlocked ? 'text-slate-600' : 'text-white/30'} ${day === 2 && !isUnlocked ? 'text-xs tracking-tighter' : ''}`}>
                  {isUnlocked 
                    ? (day === 3 ? 'GTA 6' : '???')
                    : (day === 2 ? 'GISHMAS SUS CHECKER V2' : (day === 3 ? 'GTA 6' : '???'))
                  }
                </p>
              </div>
            );
          })}
        </div>

        {/* Goofy Copyright Footer */}
        <div className="mt-4 mb-24 text-center text-white/30 text-[10px] font-mono px-4">
          <p>© 1847-2099 GISHMAS INTERNATIONAL HOLDINGS LLC™ | All Rights Reserved (lol not really)</p>
          <p className="mt-1 flex flex-wrap justify-center gap-2">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white/60 underline">Privacy Policy</a>
            <span>|</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white/60 underline">Terms of Surrender</a>
            <span>|</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white/60 underline">Cookie Preferences (we ate them all)</a>
            <span>|</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white/60 underline">Contact Santa</a>
            <span>|</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white/60 underline">Careers (we're not hiring)</a>
          </p>
          <p className="mt-1 italic">This site is definitely not a front for elves. Trust us.</p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'home' | 'sus-test' | 'sus-test-v2' | 'gta6'>('landing');
  const [user, setUser] = useState<User | null>(null);
  
  // Global Audio State (persists across pages)
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioInitialized = useRef(false);

  // Initialize audio once when leaving landing page
  useEffect(() => {
    if (currentPage !== 'landing' && !audioInitialized.current) {
      audioInitialized.current = true;
      const themeAudio = new Audio('/assets/gishmas-theme.mp3');
      themeAudio.loop = false;
      themeAudio.volume = 0.5;
      audioRef.current = themeAudio;

      const playAudio = async () => {
        try {
          await themeAudio.play();
          setIsPlaying(true);
        } catch (e) {
          console.log('Autoplay blocked');
          setIsPlaying(false);
        }
      };
      playAudio();
    }
  }, [currentPage]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Listen for goBack message from GTA6 iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'goBack') {
        setCurrentPage('home');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  // 1. Authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
        if (token && token !== "undefined") {
          await signInWithCustomToken(auth, token);
        } else {
          if (!auth.currentUser) {
             try {
               await signInAnonymously(auth);
             } catch (authError: any) {
               console.warn("Auth skipped/failed (likely demo key):", authError.code);
             }
          }
        }
      } catch (e) {
        console.error("Auth initialization failed", e);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const handleSignUp = async (email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    // Save basic user info in Firestore
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      createdAt: serverTimestamp()
    });
  };

  if (currentPage === 'landing') {
    return <LandingPage onEnter={() => setCurrentPage('home')} onLogin={handleLogin} onSignup={handleSignUp} />;
  }

  // Wrap all non-landing pages with persistent audio player
  return (
    <>
      {currentPage === 'home' && (
        <HomePage onBack={() => setCurrentPage('landing')} onSusTestV2={() => setCurrentPage('sus-test-v2')} onGta6={() => setCurrentPage('gta6')} />
      )}
      {currentPage === 'gta6' && (
        <div className="fixed inset-0 z-50">
          <iframe 
            src="/gta6.html" 
            className="w-full h-full border-0"
            title="GTA VI"
          />
        </div>
      )}
      {currentPage === 'sus-test-v2' && (
        <SusTestV2 user={user} db={db} appId={appId} onBack={() => setCurrentPage('home')} />
      )}
      {currentPage === 'sus-test' && (
        <SusTest user={user} db={db} appId={appId} onBack={() => setCurrentPage('home')} />
      )}
      
      {/* Persistent Audio Player */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] bg-white/50 text-slate-900 text-xs md:text-sm font-bold px-3 py-2 md:px-5 md:py-3 rounded-full border border-white/40 shadow-lg flex items-center gap-3 backdrop-blur-md">
        <button
          onClick={togglePlay}
          className="p-2 bg-white/50 hover:bg-white/70 rounded-full text-slate-900 transition-colors active:scale-95"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </div>
    </>
  );
}
