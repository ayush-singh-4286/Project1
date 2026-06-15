import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    
    // DUAL LAYER TOGGLE MECHANISM (Login vs Signup)
    const [isSignUp, setIsSignUp] = useState(false);
    
    // Shared Operational Fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Signup Special Parameter Fields
    const [username, setUsername] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('Male');
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // TOGGLE ACCESS FOR LOGIN PASSWORD EYE
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // SUBMIT ACTIONS SELECTOR
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
        bg: '#090d16',
        cardBg: 'rgba(15, 23, 42, 0.4)',
        border: 'rgba(255, 255, 255, 0.08)',
        inputBg: 'rgba(30, 41, 59, 0.5)',
        textMain: '#f8fafc',
        textMuted: '#64748b',
        accent: '#6366f1'
    };

    const inputStyle = {
        width: '100%', 
        padding: '14px', 
        backgroundColor: theme.inputBg, 
        border: `1px solid ${theme.border}`, 
        borderRadius: '10px', 
        color: '#fff', 
        fontSize: '14px', 
        outline: 'none', 
        boxSizing: 'border-box'
    };

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', color: theme.textMain, fontFamily: "'Urbanist', sans-serif", display: 'grid', placeItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
            <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, padding: '40px 30px', borderRadius: '24px', width: '100%', maxWidth: '440px', boxSizing: 'border-box', backdropFilter: 'blur(16px)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
                
                <h3 style={{ fontSize: '26px', fontWeight: '900', textAlign: 'center', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>Traveller_LOG</h3>
                
                {/* 🔥 IMAGE FIXED: Heading texts changed to simple style */}
                <p style={{ color: theme.textMuted, fontSize: '13px', textAlign: 'center', margin: '0 0 24px 0' }}>
                    {isSignUp ? 'Welcome! Let\'s set up your account' : 'Welcome Back! Please login to your account'}
                </p>

                {errorMsg && <div style={{ fontSize: '13px', color: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.05)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontWeight: '600', border: '1px solid rgba(244, 63, 94, 0.1)' }}>{errorMsg}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* EMAIL INPUT FIELD */}
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

                    {/* SIGNUP ADDITIONAL INPUT LAYER */}
                    {isSignUp && (
                        <>
                            {/* 🔥 IMAGE FIXED: "Unique username tag" changed to "Enter username" */}
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
                                style={{ ...inputStyle, colorScheme: 'dark' }}
                            />
                            <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
                                <option value="Male" style={{ background: theme.bg }}>Male</option>
                                <option value="Female" style={{ background: theme.bg }}>Female</option>
                                <option value="Other" style={{ background: theme.bg }}>Other</option>
                            </select>
                        </>
                    )}

                    {/* PASSWORD CONTAINER WITH SHOW/HIDE ACTION */}
                    <div style={{ position: 'relative', width: '100%' }}>
                        {/* 🔥 IMAGE FIXED: Passwords placeholder changes according to login/signup */}
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
                    
                   

                    {/* 🔥 IMAGE FIXED: Buttons text changed to "Create Accout" and "Login" */}
                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)', marginTop: '8px' }}>
                        {loading ? 'Processing...' : isSignUp ? 'Create Accout' : 'Login'}
                    </button>
                </form>

                {/* 🔥 IMAGE FIXED: Lower toggle links labels updated */}
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