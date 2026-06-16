import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    
    // PASSWORD UPDATE SUB-STATES
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // INDIVIDUAL TOGGLE STATES FOR SHOW/HIDE PASSWORDS
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // THEME STATE CONTROL SYNCED WITH LOCALSTORAGE
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('themePreference');
        return savedTheme ? savedTheme === 'dark' : true;
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        const storedDob = localStorage.getItem('userDob');
        const storedGender = localStorage.getItem('userGender');
        const storedEmail = localStorage.getItem('userEmail'); 

        if (!token) {
            alert("Access Denied! Please login first.");
            navigate('/');
            return;
        }

        setUsername(storedUsername || 'Active Explorer');
        setGender(storedGender || 'Not Specified');
        setEmail(storedEmail || ''); 

        if (storedDob) {
            const dateObj = new Date(storedDob);
            if (!isNaN(dateObj.getTime())) {
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const year = dateObj.getFullYear();
                setDob(`${day}/${month}/${year}`);
            } else {
                setDob(storedDob);
            }
        } else {
            setDob('Not Specified');
        }

        // REAL-TIME STORAGE EVENT LISTENER FOR INSTANT LIGHT/DARK TOGGLE
        const handleStorageChange = () => {
            const savedTheme = localStorage.getItem('themePreference');
            setIsDarkMode(savedTheme ? savedTheme === 'dark' : true);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Validation Mismatch: New password fields do not match.');
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');
        const currentActiveEmail = email || localStorage.getItem('userEmail');

        if (!currentActiveEmail) {
            setError('Authentication Error: Please re-login to update password.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('https://project1-backend-c6re.onrender.com/api/auth/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: currentActiveEmail.trim(), 
                    oldPassword: oldPassword,
                    newPassword: newPassword
                })
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                setMessage('✓ Password updated successfully!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setError(data.message || 'Server rejected the update.');
            }
        } catch (err) {
            console.error("Frontend Fetch Error:", err);
            setError('Handshake Failure: Cannot connect to backend server. Check network connection.');
        } finally {
            setLoading(false);
        }
    };

    const theme = {
        bg: isDarkMode ? '#090d16' : '#ffb703',
        cardBg: isDarkMode ? 'rgba(51, 52, 53, 0.4)' : '#ffffff',
        border: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.12)',
        inputBg: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : '#f1f5f9',
        textMain: isDarkMode ? '#f8fafc' : '#0f172a',
        textMuted: isDarkMode ? '#64748b' : '#475569',
        accent: '#38bdf8',
        glassBtn: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.04)',
        gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.04)'
    };

    const inputContainerStyle = {
        position: 'relative',
        width: '100%',
        marginTop: '6px'
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 55px 12px 12px', 
        backgroundColor: theme.inputBg,
        border: `1px solid ${theme.border}`,
        borderRadius: '8px',
        color: theme.textMain,
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box'
    };

    const eyeButtonStyle = {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: theme.accent,
        fontSize: '11px',
        fontWeight: '700',
        cursor: 'pointer',
        outline: 'none',
        userSelect: 'none'
    };

    return (
        <div style={{ 
            backgroundColor: theme.bg, 
            minHeight: '100vh', 
            color: theme.textMain, 
            fontFamily: "'Urbanist', sans-serif", 
            padding: '40px 20px', 
            boxSizing: 'border-box', 
            transition: 'background-color 0.3s ease, color 0.3s ease',
            backgroundImage: `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}>
            
            <div style={{ maxWidth: '800px', margin: '0 auto 30px auto' }}>
                <button 
                    onClick={() => navigate('/landing')}
                    style={{ background: theme.glassBtn, border: `1px solid ${theme.border}`, color: theme.textMain, padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                >
                    ← Return to Dashboard
                </button>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* ACCOUNT PROFILE INFO CARD */}
                <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '36px', backdropFilter: 'blur(16px)', boxShadow: isDarkMode ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(15,23,42,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '20px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.1)', border: `1px solid ${theme.accent}`, display: 'grid', placeItems: 'center', fontSize: '28px' }}>
                            👤
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px', color: theme.textMain }}>My Account</h2>
                            <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px' }}>User registered</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                        <div>
                            <span style={{ fontSize: '12px', color: theme.textMuted, fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Username Tag</span>
                            <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px', color: theme.textMain }}>{username}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '12px', color: theme.textMuted, fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Email Allocation</span>
                            <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px', color: theme.accent }}>{email || 'Not Configured'}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '12px', color: theme.textMuted, fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Date of Birth</span>
                            <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px', color: theme.textMain }}>{dob}</div>
                        </div>
                        <div>
                            <span style={{ fontSize: '12px', color: theme.textMuted, fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Gender Mapping</span>
                            <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px', color: theme.textMain }}>{gender}</div>
                        </div>
                    </div>
                </div>

                {/* PASSWORD SECURITY CONTROL CARD */}
                <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '36px', backdropFilter: 'blur(16px)', boxShadow: isDarkMode ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(15,23,42,0.04)' }}>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.3px', color: theme.textMain }}>Password</h3>

                    {message && <div style={{ fontSize: '13.5px', color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.05)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '600', border: '1px solid rgba(52, 211, 153, 0.1)' }}>{message}</div>}
                    {error && <div style={{ fontSize: '13.5px', color: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.05)', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '600', border: '1px solid rgba(244, 63, 94, 0.1)' }}>{error}</div>}

                    <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: '700', color: theme.textMuted }}>Current Password</label>
                            <div style={inputContainerStyle}>
                                <input 
                                    type={showOldPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    value={oldPassword} 
                                    onChange={(e) => setOldPassword(e.target.value)} 
                                    required 
                                    style={inputStyle} 
                                />
                                <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} style={eyeButtonStyle}>
                                    {showOldPassword ? "HIDE" : "SHOW"}
                                </button>
                            </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '700', color: theme.textMuted }}>New Password</label>
                                <div style={inputContainerStyle}>
                                    <input 
                                        type={showNewPassword ? "text" : "password"} 
                                        placeholder="••••••••" 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                        required 
                                        style={inputStyle} 
                                    />
                                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={eyeButtonStyle}>
                                        {showNewPassword ? "HIDE" : "SHOW"}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '700', color: theme.textMuted }}>Confirm Password</label>
                                <div style={inputContainerStyle}>
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        placeholder="••••••••" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        required 
                                        style={inputStyle} 
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={eyeButtonStyle}>
                                        {showConfirmPassword ? "HIDE" : "SHOW"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ alignSelf: 'flex-start', padding: '12px 28px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)', marginTop: '6px' }}
                        >
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Profile;