import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const Feed = () => {
    const navigate = useNavigate();
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Default dynamic folder name stream tracking
    const [streamName, setStreamName] = useState('Shimla trip');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Access Denied! Please login first.");
            navigate('/');
            return;
        }
        fetchFeedMemories(token);
    }, []);

    const fetchFeedMemories = async (token) => {
        try {
            const response = await fetch('https://project1-backend-c6re.onrender.com/api/posts', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                // Agar aap kisi specific folder ko filter karna chahte hain toh filter laga sakte hain
                // Abhi ke liye saare posts ko clean stream layout de rahe hain
                setMemories(data.posts);
                if(data.posts.length > 0 && data.posts[0].folderName) {
                    setStreamName(data.posts[0].folderName);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
        bg: '#050811',
        cardBg: 'rgba(15, 23, 42, 0.4)',
        border: 'rgba(255, 255, 255, 0.08)',
        textMain: '#f8fafc',
        textMuted: '#64748b',
        accent: '#38bdf8'
    };

    if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px', backgroundColor: theme.bg }}>Loading Exploration Stream...</div>;

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', color: theme.textMain, fontFamily: "'Urbanist', sans-serif", padding: '40px', boxSizing: 'border-box' }}>
            
            {/* TOP ACTIONS CONTROL HEADER BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${theme.border}`, color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                    >
                        ← Return to Grid
                    </button>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>
                        Exploration stream: <span style={{ color: theme.accent }}>{streamName}</span>
                    </h2>
                </div>
                
                <button 
                    onClick={() => navigate('/create-post')} 
                    style={{ width: '45px', height: '45px', borderRadius: '50%', border: 'none', backgroundColor: '#6366f1', color: '#fff', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}
                >
                    +
                </button>
            </div>

            {/* MAIN CORE GRAPHICS GRID CONTAINER */}
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* 🔥 FIXED GRID LAYOUT: SIDE-BY-SIDE (EXACTLY MAXIMUM 2 COLS) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px' }}>
                    {memories.map((item) => {
                        
                        // PARSE PIPES IN CAPTION IF ANY EXISTS
                        const hasPipe = item.caption && item.caption.includes(' | ');
                        const parts = hasPipe ? item.caption.split(' | ') : [];
                        
                        const displayTitle = item.title || (hasPipe ? parts[0] : (item.caption || 'Untitled Entry Space'));
                        const displaySummary = item.summary || (hasPipe ? parts[2] : '');

                        return (
                            <div key={item._id} style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(12px)', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
                                
                                {/* Photo Framework Render */}
                                <div style={{ width: '100%', height: '320px', backgroundColor: '#02040a', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <img src={item.image} alt={displayTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>

                                {/* Details Segment Box (Title & Summary Output System) */}
                                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    
                                    {/* 🔥 REAL LIVE VISIBLE TITLE */}
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '-0.3px' }}>
                                        {displayTitle}
                                    </h3>

                                    {/* 🔥 REAL LIVE VISIBLE SUMMARY BLOCK */}
                                    {displaySummary ? (
                                        <p style={{ margin: '4px 0 0 0', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6', backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            {displaySummary}
                                        </p>
                                    ) : (
                                        <p style={{ margin: '4px 0 0 0', color: theme.textMuted, fontSize: '13px', fontStyle: 'italic' }}>
                                            No summary breakdown provided for this log node.
                                        </p>
                                    )}

                                    {/* Upload Time info footer */}
                                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#34d399', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '6px', fontWeight: '600' }}>
                                        ⏱️ BUCKET REPLICA LOGGED: {formatTimestamp(item.createdAt)}
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

export default Feed;