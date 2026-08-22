import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, RefreshCw, CheckCircle2, Lock, AlertCircle } from 'lucide-react';

interface SecurityCaptchaProps {
  onVerify: (isValid: boolean) => void;
  colorScheme?: 'emerald' | 'amber' | 'blue' | 'rose' | 'teal' | 'slate';
  className?: string;
  autoFocus?: boolean;
}

type ChallengeType = 'math' | 'code';

export const SecurityCaptcha: React.FC<SecurityCaptchaProps> = ({
  onVerify,
  colorScheme = 'emerald',
  className = '',
  autoFocus = false,
}) => {
  const [challengeType, setChallengeType] = useState<ChallengeType>('math');
  const [question, setQuestion] = useState('');
  const [expectedAnswer, setExpectedAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate a fresh random challenge
  const generateChallenge = useCallback(() => {
    setUserAnswer('');
    setIsVerified(false);
    setHasError(false);
    onVerify(false);

    // 70% math questions, 30% readable alphanumeric security codes
    const isMath = Math.random() > 0.3;
    if (isMath) {
      setChallengeType('math');
      const ops = ['+', '-', '+'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      let num1 = Math.floor(Math.random() * 9) + 2; // 2-10
      let num2 = Math.floor(Math.random() * 8) + 1; // 1-8

      if (op === '-' && num1 < num2) {
        // Swap so positive result
        const temp = num1;
        num1 = num2;
        num2 = temp;
      }

      let ans = 0;
      if (op === '+') ans = num1 + num2;
      else if (op === '-') ans = num1 - num2;

      setQuestion(`${num1} ${op} ${num2}`);
      setExpectedAnswer(String(ans));
    } else {
      setChallengeType('code');
      // Generate 4-character code (avoid confusing characters like 0/O, 1/I)
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
      let code = '';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setQuestion(code);
      setExpectedAnswer(code.toUpperCase());
    }
  }, [onVerify]);

  useEffect(() => {
    generateChallenge();
  }, [generateChallenge]);

  // Handle user input
  const handleInputChange = (val: string) => {
    setUserAnswer(val);
    const cleanedInput = val.trim().toUpperCase();
    const cleanedExpected = expectedAnswer.trim().toUpperCase();

    if (cleanedInput === cleanedExpected) {
      setIsVerified(true);
      setHasError(false);
      onVerify(true);
    } else {
      setIsVerified(false);
      onVerify(false);
      if (cleanedInput.length >= cleanedExpected.length && cleanedExpected.length > 0) {
        setHasError(true);
      } else {
        setHasError(false);
      }
    }
  };

  // Color classes map
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50/70 border-emerald-200/80',
      badge: 'bg-emerald-700 text-white',
      badgeSuccess: 'bg-emerald-600 text-white',
      focusRing: 'focus:ring-emerald-500 focus:border-emerald-500',
      text: 'text-emerald-900',
      icon: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50/70 border-amber-200/80',
      badge: 'bg-amber-700 text-white',
      badgeSuccess: 'bg-emerald-600 text-white',
      focusRing: 'focus:ring-amber-500 focus:border-amber-500',
      text: 'text-amber-900',
      icon: 'text-amber-600',
    },
    blue: {
      bg: 'bg-blue-50/70 border-blue-200/80',
      badge: 'bg-blue-700 text-white',
      badgeSuccess: 'bg-emerald-600 text-white',
      focusRing: 'focus:ring-blue-500 focus:border-blue-500',
      text: 'text-blue-900',
      icon: 'text-blue-600',
    },
    rose: {
      bg: 'bg-rose-50/70 border-rose-200/80',
      badge: 'bg-rose-700 text-white',
      badgeSuccess: 'bg-emerald-600 text-white',
      focusRing: 'focus:ring-rose-500 focus:border-rose-500',
      text: 'text-rose-900',
      icon: 'text-rose-600',
    },
    teal: {
      bg: 'bg-teal-50/70 border-teal-200/80',
      badge: 'bg-teal-700 text-white',
      badgeSuccess: 'bg-emerald-600 text-white',
      focusRing: 'focus:ring-teal-500 focus:border-teal-500',
      text: 'text-teal-900',
      icon: 'text-teal-600',
    },
    slate: {
      bg: 'bg-slate-50/90 border-slate-200',
      badge: 'bg-slate-700 text-white',
      badgeSuccess: 'bg-emerald-600 text-white',
      focusRing: 'focus:ring-slate-500 focus:border-slate-500',
      text: 'text-slate-900',
      icon: 'text-slate-600',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.emerald;

  return (
    <div
      className={`rounded-2xl border p-3.5 sm:p-4 transition-all duration-200 ${
        isVerified
          ? 'bg-emerald-50/90 border-emerald-300 shadow-2xs'
          : `${scheme.bg} shadow-2xs`
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <ShieldCheck
            className={`w-4 h-4 ${isVerified ? 'text-emerald-600' : scheme.icon}`}
          />
          <span className="text-xs font-bold text-slate-800 tracking-tight">
            Verifikasi Anti-Spam Warga
          </span>
        </div>

        {isVerified ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded-full animate-in fade-in duration-150">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Lolos Verifikasi
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full">
            <Lock className="w-2.5 h-2.5" />
            Keamanan Unggah
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Captcha Box Badge */}
        <div className="flex items-center gap-2 bg-white border border-slate-300/80 rounded-xl px-3 py-1.5 shadow-inner shrink-0 justify-between sm:justify-start">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
              {challengeType === 'math' ? 'Hitung Soal' : 'Ketik Kode'}
            </span>
            <span className="font-mono text-sm sm:text-base font-extrabold tracking-widest text-slate-900 select-none py-0.5">
              {challengeType === 'math' ? `${question} = ?` : question}
            </span>
          </div>

          <button
            type="button"
            onClick={generateChallenge}
            title="Ganti Soal Captcha"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Input answer */}
        <div className="relative flex-1">
          <input
            type="text"
            required
            autoFocus={autoFocus}
            value={userAnswer}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={
              challengeType === 'math'
                ? 'Ketik hasil hitungan...'
                : 'Ketik 4 digit kode...'
            }
            maxLength={6}
            className={`w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border bg-white transition-all outline-none ${
              isVerified
                ? 'border-emerald-400 bg-emerald-50/30 text-emerald-900 focus:ring-2 focus:ring-emerald-500'
                : hasError
                ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-2 focus:ring-rose-400'
                : `border-slate-200 ${scheme.focusRing} text-slate-800`
            }`}
          />

          {isVerified && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 flex items-center gap-1 pointer-events-none">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          )}
        </div>
      </div>

      {/* Helpful small footnote */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
        <span>Perlindungan dari bot & kiriman spam otomatis</span>
        {hasError && !isVerified && (
          <span className="text-rose-600 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Jawaban belum tepat
          </span>
        )}
      </div>
    </div>
  );
};
