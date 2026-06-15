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
    const [otp, setOtp] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // TOGGLE ACCESS FOR LOGIN PASSWORD EYE
    const [showLoginPassword, setShowLoginPassword] = useState(false);

   
    // TRIGGER 1: SEND OTP LOGIC FOR SIGNUP WITH SPAM FILTER WARNING ALERT
const handleSendOTP = async () => {
    console.log("Get OTP Button Clicked");

    if (!email) {
        setErrorMsg('Please enter an email address first.');
        return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
        console.log("Before Fetch");

        const res = await fetch(
            'http://localhost:3000/api/auth/send-otp',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email.trim()
                })
            }
        );

        console.log("After Fetch");
        console.log("Status:", res.status);

        const data = await res.json();
        console.log("Response Data:", data);

        if (res.ok && data.success) {
            setOtpSent(true);
            alert("📩 OTP Sent successfully!");
        } else {
            setErrorMsg(data.message || 'Failed to send OTP');
        }

    } catch (err) {
        console.log("FETCH ERROR:", err);
        setErrorMsg('Handshake failed. Backend server engine unresponsive.');
    } finally {
        setLoading(false);
    }
};
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
                    body: JSON.stringify({ email, password, otp, username, dob, gender })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    alert('✓ Account deployed successfully! Please login with your credentials.');
                    setIsSignUp(false); 
                    setOtpSent(false);
                } else {
                    setErrorMsg(data.message || 'Registration pipeline configuration rejected.');
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
                    // LocalStorage mapping section ke andar bas ye line add kar do:
                    localStorage.setItem('userEmail', email); 
                    setTimeout(() => navigate('/landing'), 400);
                } else {
                    setErrorMsg(data.message || 'Security parameters match failed.');
                }
            } catch (err) {
                setErrorMsg('Handshake failed. Encryption node unreachable.');
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
                <p style={{ color: theme.textMuted, fontSize: '13px', textAlign: 'center', margin: '0 0 24px 0' }}>
                    {isSignUp ? 'Initialize account security onboarding parameters' : 'Access traveler database isolated environment'}
                </p>

                {errorMsg && <div style={{ fontSize: '13px', color: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.05)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontWeight: '600', border: '1px solid rgba(244, 63, 94, 0.1)' }}>{errorMsg}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* EMAIL INPUT FIELD */}
                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                        />
                        {isSignUp && (
                            <button type="button" onClick={handleSendOTP} disabled={loading || otpSent} style={{ padding: '0 12px', border: 'none', borderRadius: '10px', backgroundColor: otpSent ? 'rgba(34, 197, 94, 0.2)' : theme.accent, color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', minWidth: '90px' }}>
                                {otpSent ? 'Sent ✓' : 'Get OTP'}
                            </button>
                        )}
                    </div>

                    {/* SIGNUP ADDITIONAL INPUT LAYER */}
                    {isSignUp && (
                        <>
                            <input 
                                type="text" 
                                placeholder="Verification OTP Code" 
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                style={inputStyle}
                            />
                            <input 
                                type="text" 
                                placeholder="Unique Username Tag" 
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
                        <input 
                            type={showLoginPassword ? "text" : "password"} 
                            placeholder={isSignUp ? "Define Access Password" : "Security Password"} 
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
                    
                    {!isSignUp && (
                        <div style={{ textAlign: 'right', marginTop: '-6px' }}>
                            <span onClick={() => navigate('/forgot-password')} style={{ color: '#38bdf8', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>Forgot password?</span>
                        </div>
                    )}

                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)', marginTop: '8px' }}>
                        {loading ? 'Processing Workspace Hook...' : isSignUp ? 'Compile & Initialize Account' : 'Authorize Login Entry'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: theme.textMuted }}>
                    {isSignUp ? 'Already mapped into index?' : 'New explorer track?'} {' '}
                    <span onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setOtpSent(false); }} style={{ color: theme.accent, fontWeight: '700', cursor: 'pointer' }}>
                        {isSignUp ? 'Authorize Login' : 'Initialize Account'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;