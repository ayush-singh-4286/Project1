import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // Step 1: Send OTP, Step 2: Verification & Reset
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            // Re-using the core OTP pipeline stream engine
            const response = await fetch('https://project1-backend-c6re.onrender.com/api/auth/send-otp-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setMessage('✓ Security verification token dispatched to your email address!');
                setStep(2);
            } else {
                setMessage(`❌ Error: ${data.message || 'OTP dispatch failed.'}`);
            }
        } catch (err) {
            setMessage('❌ Critical: Communication breakdown with authentication node.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const response = await fetch('https://project1-backend-c6re.onrender.com/api/auth/reset-password-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                alert('✓ Cryptographic shift locked. Password updated successfully!');
                navigate('/');
            } else {
                setMessage(`❌ Error: ${data.message || 'Verification sequence collapsed.'}`);
            }
        } catch (err) {
            setMessage('❌ Critical failure during account credentials re-writing phase.');
        } finally {
            setLoading(false);
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

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', color: theme.textMain, fontFamily: "'Urbanist', sans-serif", display: 'grid', placeItems: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '440px', boxSizing: 'border-box', backdropFilter: 'blur(16px)' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 8px 0', textAlign: 'center' }}>Account Recovery</h3>
                <p style={{ color: theme.textMuted, fontSize: '13px', textAlign: 'center', margin: '0 0 24px 0' }}>Bypass credential lockout vectors via isolated email encryption loop</p>

                {message && <div style={{ fontSize: '13px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', marginBottom: '20px', lineHeight: '1.4' }}>{message}</div>}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input 
                            type="email" 
                            placeholder="Enter Registered Email Address" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '14px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                            {loading ? 'Transmitting OTP request...' : 'Dispatch Verification Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input 
                            type="text" 
                            placeholder="Enter 6-Digit Verification Token" 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            style={{ width: '100%', padding: '14px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                        <input 
                            type="password" 
                            placeholder="Create New Strong Password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '14px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                        />
                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                            {loading ? 'Re-writing Encryption...' : 'Lock New Credentials'}
                        </button>
                    </form>
                )}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>← Return to Login Core</button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;