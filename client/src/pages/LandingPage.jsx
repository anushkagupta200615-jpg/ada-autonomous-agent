import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Activity } from 'lucide-react';

// --- Custom Hooks ---
function useTypewriter(text, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeoutId;
    let intervalId;
    let currentIndex = 0;
    setDisplayed('');
    setDone(false);

    timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayed(text.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(intervalId);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}

function Navbar({ onLaunch }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = ['Feed', 'Memory', 'System Logs', 'Settings'];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-10 px-5 sm:px-8 py-4 sm:py-5 flex flex-row justify-between items-center">
        <div className="flex flex-row gap-3 items-center">
          <span className="font-heading text-[21px] sm:text-[26px] tracking-tight text-black">
            Ada®
          </span>
          <span className="text-[25px] sm:text-[30px] text-black select-none tracking-[-0.02em]">
            ✳︎
          </span>
        </div>
        <div className="hidden md:flex flex-row text-[23px] text-black">
          {/* Removed dummy links for cleaner look */}
        </div>
        <button onClick={onLaunch} className="hidden md:block text-[23px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity">
          Launch Agent
        </button>
        <button 
          className="md:hidden flex flex-col gap-[5px] z-20 relative w-6 h-4 justify-center"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <div className={`w-6 h-[2px] bg-black transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <div className={`w-6 h-[2px] bg-black transition-all duration-300 ${mobileOpen ? 'opacity-0' : 'opacity-100'}`} />
          <div className={`w-6 h-[2px] bg-black transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </nav>

      <div 
        className={`fixed inset-0 bg-white/95 backdrop-blur-sm z-[9] flex flex-col justify-center px-8 gap-8 transition-opacity duration-300 md:hidden ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <button onClick={onLaunch} className="text-[32px] text-left font-medium text-black underline">Launch Agent</button>
      </div>
    </>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const targetTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const prevXRef = useRef(null);

  const { displayed, done } = useTypewriter("System initialized. Memory pathways active. I am Ada, your sovereign editorial agent. Ready to evaluate.");
  const [pillsVisible, setPillsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPillsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const video = videoRef.current;
      if (!video || isNaN(video.duration)) return;

      const currentX = e.clientX;
      if (prevXRef.current === null) {
        prevXRef.current = currentX;
        return;
      }

      const delta = currentX - prevXRef.current;
      prevXRef.current = currentX;

      const sensitivity = 0.8;
      const offset = (delta / window.innerWidth) * sensitivity * video.duration;
      
      let newTarget = targetTimeRef.current + offset;
      newTarget = Math.max(0, Math.min(newTarget, video.duration));
      
      targetTimeRef.current = newTarget;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = targetTimeRef.current;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.05) {
      video.currentTime = targetTimeRef.current;
    } else {
      isSeekingRef.current = false;
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("hello@mainframe.co");
  };

  const handleLaunch = () => {
    navigate('/dashboard');
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4"
        muted
        playsInline
        preload="auto"
        onSeeked={handleSeeked}
        className="fixed inset-0 z-0 object-cover w-full h-full"
        style={{ objectPosition: '70% center' }}
      />
      <Navbar onLaunch={handleLaunch} />
      <main className="relative z-[1] h-screen flex flex-col overflow-hidden px-5 sm:px-8 md:px-10 justify-end pb-12 md:justify-center md:pb-0">
        <div className="max-w-xl relative z-10 w-full">
          <h1 
            className="text-black mb-5 sm:mb-6 font-normal min-h-[54px]"
            style={{ fontSize: 'clamp(18px, 4vw, 26px)', lineHeight: 1.35 }}
          >
            {displayed}
            {!done && <span className="inline-block w-[2px] h-[1.1em] bg-black align-middle ml-[2px] animate-blink" />}
          </h1>
          <div 
            className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 ease-out mt-8 ${pillsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLaunch}
              className="relative group overflow-hidden flex items-center justify-center gap-3 bg-black text-white rounded-full text-sm sm:text-base px-8 py-4 font-bold tracking-wide shadow-[0_0_40px_rgba(0,0,0,0.3)] border border-white/10"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Zap size={18} className="text-white group-hover:text-blue-400 transition-colors" />
                Initialize Agent Core
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.9)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/feed')}
              className="flex items-center justify-center gap-2 bg-white/70 backdrop-blur-md text-black border border-black/10 rounded-full text-sm sm:text-base px-8 py-4 font-semibold tracking-wide hover:shadow-lg transition-all"
            >
              <Activity size={18} />
              View Public News Feed
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
}
