import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('Male');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('themePreference');
        return savedTheme ? savedTheme === 'dark' : true;
    });

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const nextMode = !prev;
            localStorage.setItem('themePreference', nextMode ? 'dark' : 'light');
            return nextMode;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        if (isSignUp) {
            try {
                const response = await fetch('https://project1-backend-c6re.onrender.com/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, username, dob, gender })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    alert('✓ Account deployed successfully! Please login with your credentials.');
                    setIsSignUp(false); 
                } else {
                    setErrorMsg(data.message || 'Registration rejected.');
                }
            } catch (err) {
                setErrorMsg('Server connection breakdown during account creation.');
            } finally {
                setLoading(false);
            }
        } else {
            try {
                const response = await fetch('https://project1-backend-c6re.onrender.com/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    const actualId = data?.user?.id || data?.user?._id || '';
                    const actualUsername = data?.user?.username || '';
                    const actualDob = data?.user?.dob || 'Not specified';
                    const actualGender = data?.user?.gender || 'Male';

                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', actualUsername);
                    localStorage.setItem('userId', actualId);
                    localStorage.setItem('userDob', actualDob);       
                    localStorage.setItem('userGender', actualGender); 
                    localStorage.setItem('userEmail', email); 
                    setTimeout(() => navigate('/landing'), 400);
                } else {
                    setErrorMsg(data.message || 'Invalid credentials.');
                }
            } catch (err) {
                setErrorMsg('Handshake failed. Backend server unreachable.');
            } finally {
                setLoading(false);
            }
        }
    };

    const theme = {
        bg: isDarkMode ? '#090d16' : '#ffb703', // Orange backdrop in light mode
        cardBg: isDarkMode ? 'rgba(15, 23, 42, 0.4)' : '#ffffff',
        border: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.12)',
        inputBg: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : '#f1f5f9',
        textMain: isDarkMode ? '#f8fafc' : '#0f172a',
        textMuted: isDarkMode ? '#64748b' : '#475569',
        accent: '#6366f1',
        gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.04)' // Subtle grid line colors
    };

    const inputStyle = {
        width: '100%', 
        padding: '14px', 
        backgroundColor: theme.inputBg, 
        border: `1px solid ${theme.border}`, 
        borderRadius: '10px', 
        color: theme.textMain, 
        fontSize: '14px', 
        outline: 'none', 
        boxSizing: 'border-box'
    };

    return (
        <div style={{ 
            backgroundColor: theme.bg, 
            minHeight: '100vh', 
            color: theme.textMain, 
            fontFamily: "'Urbanist', sans-serif", 
            display: 'grid', 
            placeItems: 'center', 
            padding: '20px', 
            boxSizing: 'border-box', 
            position: 'relative', 
            transition: 'background-color 0.3s ease, color 0.3s ease',
            // DYNAMIC CSS GRID PATTERN INJECTED HERE
            backgroundImage: `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}>
            
            <button 
                onClick={toggleTheme}
                style={{ position: 'absolute', top: '20px', right: '20px', background: theme.cardBg, border: `1px solid ${theme.border}`, padding: '10px 16px', borderRadius: '20px', cursor: 'pointer', color: theme.textMain, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', zIndex: 10 }}
            >
                {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>

            <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, padding: '40px 30px', borderRadius: '24px', width: '100%', maxWidth: '440px', boxSizing: 'border-box', backdropFilter: 'blur(16px)', boxShadow: isDarkMode ? '0 20px 50px rgba(0,0,0,0.4)' : '0 20px 50px rgba(15,23,42,0.1)' }}>
                
                {/* BRAND LOGO DISPLAY EMBEDDED */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <img 
                        src="/logo.png" 
                        alt="Traveller_LOG" 
                        style={{ width: '90px', height: '90px', objectFit: 'contain', borderRadius: '50%', border: `2px solid ${theme.border}` }} 
                    />
                </div>

                <h3 style={{ fontSize: '26px', fontWeight: '900', textAlign: 'center', margin: '0 0 6px 0', letterSpacing: '-0.5px', color: theme.textMain }}>Traveller_LOG</h3>
                
                <p style={{ color: theme.textMuted, fontSize: '13px', textAlign: 'center', margin: '0 0 24px 0' }}>
                    {isSignUp ? "Welcome! Let's set up your account" : 'Welcome Back! Please login to your account'}
                </p>

                {errorMsg && <div style={{ fontSize: '13px', color: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.05)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontWeight: '600', border: '1px solid rgba(244, 63, 94, 0.1)' }}>{errorMsg}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ width: '100%' }}>
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    {isSignUp && (
                        <>
                            <input 
                                type="text" 
                                placeholder="Enter username" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                style={inputStyle}
                            />
                            <input 
                                type="date" 
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                required
                                style={{ ...inputStyle, colorScheme: isDarkMode ? 'dark' : 'light' }}
                            />
                            <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
                                <option value="Male" style={{ background: theme.cardBg, color: theme.textMain }}>Male</option>
                                <option value="Female" style={{ background: theme.cardBg, color: theme.textMain }}>Female</option>
                                <option value="Other" style={{ background: theme.cardBg, color: theme.textMain }}>Other</option>
                            </select>
                        </>
                    )}

                    <div style={{ position: 'relative', width: '100%' }}>
                        <input 
                            type={showLoginPassword ? "text" : "password"} 
                            placeholder={isSignUp ? "Enter Password" : "Place Enter password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ ...inputStyle, paddingRight: '54px' }} 
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowLoginPassword(!showLoginPassword)} 
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', fontWeight: '700', cursor: 'pointer', outline: 'none' }}
                        >
                            {showLoginPassword ? "HIDE" : "SHOW"}
                        </button>
                    </div>
                    
                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)', marginTop: '8px' }}>
                        {loading ? 'Processing...' : isSignUp ? 'Create Accout' : 'Login'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: theme.textMuted }}>
                    {isSignUp ? 'Already have an account?' : 'First time here?'} {' '}
                    <span onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }} style={{ color: theme.accent, fontWeight: '700', cursor: 'pointer' }}>
                        {isSignUp ? 'Login here' : 'Create Account'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;