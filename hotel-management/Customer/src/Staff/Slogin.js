import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Hotel } from 'lucide-react';

const SLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // Added for visual feedback
  const navigate = useNavigate();

  // Define your default credentials here
  const DEFAULT_EMAIL = "admin@luxe.com";
  const DEFAULT_PASSWORD = "staff123";

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(''); // Clear previous errors

    // 1. Check against default credentials
    if (email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
      // Create a mock user object
      const mockUser = {
        name: "Admin Staff",
        role: "staff",
        email: DEFAULT_EMAIL
      };

      // Save to localStorage as your App.js expects
      localStorage.setItem('token', 'mock-jwt-token-12345');
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Redirect to staff dashboard
      setTimeout(() => {
        setIsLoading(false);
        navigate('/staff/dashboard');
      }, 1000); // Small delay for "realistic" feel
      
      return; // Stop execution here since login was successful
    }

    // 2. Optional: If not default, try the real API
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.user.role === 'staff') {
          navigate('/staff/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setErrorMessage(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setErrorMessage('Connection failed. Please try again.');
      console.error('Login failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden border border-white/20">
          <div className="p-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg shadow-blue-500/30">
                <Hotel className="text-white w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Staff Portal</h2>
              <p className="text-gray-500 mt-2">Sign in with your staff credentials.</p>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="mb-6 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm animate-pulse">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transform transition-all active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-slate-100 rounded-lg text-xs text-slate-500">
               <p className="font-bold mb-1">Demo Credentials:</p>
               <p>User: admin@luxe.com</p>
               <p>Pass: staff123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLogin;