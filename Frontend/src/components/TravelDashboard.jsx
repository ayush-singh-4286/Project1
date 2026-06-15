import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TravelDashboard = () => {
    const navigate = useNavigate();
    const [memories, setMemories] = useState([]);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        if (!token) {
            alert("Access Denied! Please login first.");
            navigate('/');
            return;
        }
        setUsername(storedUsername || 'User');
        fetchMemories(token);
    }, []);

    const fetchMemories = async (token) => {
        try {
            const response = await fetch('https://project1-backend-c6re.onrender.com/api/posts', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setMemories(data.posts); 
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.clear();
            navigate('/');
        }
    };

    const formatTimestamp = (isoString) => {
        if (!isoString) return 'Date unknown';
        const dateObj = new Date(isoString);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const theme = {
        bg: '#090d16',
        cardBg: 'rgba(15, 23, 42, 0.4)',
        border: 'rgba(255, 255, 255, 0.08)',
        textMain: '#f8fafc',
        textMuted: '#64748b',
        accent: '#6366f1',
        glassBtn: 'rgba(255, 255, 255, 0.03)'
    };

    const navBtnStyle = {
        background: theme.glassBtn,
        border: `1px solid ${theme.border}`,
        color: '#f8fafc',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '13px',
        padding: '8px 16px',
        borderRadius: '20px',
        transition: 'all 0.3s ease'
    };

    if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px', backgroundColor: theme.bg }}>Wait for a while...</div>;

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', color: theme.textMain, fontFamily: "'Urbanist', sans-serif", padding: '0 0 40px 0', boxSizing: 'border-box' }}>
            
            {/* UNIVERSAL HEADER */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: `1px solid ${theme.border}`, backdropFilter: 'blur(10px)', marginBottom: '40px' }}>
                <div 
                    onClick={() => navigate('/landing')}
                    style={{ padding: '8px 20px', border: `1px solid ${theme.border}`, borderRadius: '30px', fontWeight: '900', fontSize: '14px', letterSpacing: '1px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', cursor: 'pointer' }}
                >
                    Traveller_LOG
                </div>
                
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8' }}>
                    Travel Vault Memories
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button style={navBtnStyle} onClick={() => navigate('/landing')}>Home</button>
                    <button style={{ ...navBtnStyle, color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }} onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button style={navBtnStyle} onClick={() => navigate('/create-post')}>Upload New</button>
                    <button style={{ ...navBtnStyle, color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.2)' }} onClick={handleLogout}>Logout</button>
                </div>
            </header>

            {/* MAIN CONTAINER WINDOW */}
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                
                {/* 🔥 STRICT SIDE-BY-SIDE GRID (2 PHOTOS PER ROW MAX) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px' }}>
                    {memories.map((item) => {
                        
                        // PARSING FALLBACK LOGIC FOR CAPTION SYSTEM
                        const hasPipe = item.caption && item.caption.includes(' | ');
                        const parts = hasPipe ? item.caption.split(' | ') : [];
                        
                        // Mapping real fields or strings extracted from caption channel
                        const finalTitle = item.title || (hasPipe ? parts[0] : (item.caption || 'Untitled Memory'));
                        const finalLocation = item.folderName || (hasPipe ? parts[1]?.replace('📍 ', '') : 'Global Node');
                        const finalSummary = item.summary || (hasPipe ? parts[2] : '');

                        return (
                            <div key={item._id} style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', backdropFilter: 'blur(12px)' }}>
                                
                                {/* Photo Container Box */}
                                <div style={{ width: '100%', height: '280px', backgroundColor: '#05070c', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: `1px solid ${theme.border}` }}>
                                    <img src={item.image} alt={finalTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                
                                {/* Photo Details Meta Content Area */}
                                <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                                    <div>
                                        {/* 🔥 PHOTO TITLE */}
                                        <h4 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0', color: '#fff', letterSpacing: '-0.3px' }}>
                                            {finalTitle}
                                        </h4>
                                        
                                        {/* Folder Location tag */}
                                        <div style={{ margin: '0 0 14px 0' }}>
                                            <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700', backgroundColor: 'rgba(56, 189, 248, 0.08)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                                                📁 {finalLocation}
                                            </span>
                                        </div>

                                        {/* 🔥 PHOTO SUMMARY */}
                                        {finalSummary && (
                                            <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '12px 0 0 0', lineHeight: '1.6', backgroundColor: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                                                {finalSummary}
                                            </p>
                                        )}
                                    </div>
                                    
                                    {/* Upload Date stamp footer */}
                                    <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#34d399', fontWeight: '600', borderTop: `1px solid ${theme.border}`, paddingTop: '12px', marginTop: '6px' }}>
                                        ⏱️ RECORDED: {formatTimestamp(item.createdAt)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export default TravelDashboard;