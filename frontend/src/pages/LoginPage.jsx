import React, { useState } from 'react';
import { Bot, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigateToSignup }) {
  const { login, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch {
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in duration-300">
      <div className="apple-glass rounded-3xl p-7 sm:p-9 relative overflow-hidden border border-[#E5E5EA] shadow-xl">
        {/* Luminous Glow effect */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-[#0071E3]/15 to-[#7B61FF]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Logo and Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-[#0071E3] to-[#7B61FF] text-white shadow-lg shadow-[#0071E3]/20 mb-4">
            <Bot className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#1B1B1D]">Welcome back</h2>
          <p className="text-xs text-[#6E6E73] mt-1.5">
            Log in to your MockMate AI candidate account
          </p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-[#FF3B30] text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-[#1B1B1D] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6E6E73]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm text-[#1B1B1D] placeholder:text-[#6E6E73]/60 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1B1B1D] mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6E6E73]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-sm text-[#1B1B1D] placeholder:text-[#6E6E73]/60 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 focus:border-[#0071E3] transition shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6E6E73] hover:text-[#1B1B1D] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0071E3] to-[#7B61FF] hover:from-[#0059B5] hover:to-[#5B3CDD] text-white font-extrabold text-sm shadow-xl shadow-[#0071E3]/25 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Logging in...
              </span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('alex_candidate@mockmate.ai');
              setPassword('SecurePassword123!');
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#F6F3F5] hover:bg-[#EAE7EA] text-[#0071E3] border border-[#E5E5EA] text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Auto-Fill Demo Account (Alex Rivera)</span>
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-7 pt-5 border-t border-[#E5E5EA] text-center text-xs text-[#6E6E73] relative z-10">
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={onNavigateToSignup}
            className="text-[#0071E3] hover:underline font-semibold cursor-pointer ml-1"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}
