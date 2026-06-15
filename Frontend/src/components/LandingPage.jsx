import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState({}); 
    const [selectedFolder, setSelectedFolder] = useState(null); 
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); 
    
    // FULL SCREEN METADATA MEDIA LIGHTBOX OVERLAY IMAGES
    const [fullscreenImage, setFullscreenImage] = useState(null);

    // MAIN HOMEPAGE PLUS INJECTION PIPELINE FORM CONTROLLERS
    const [showMainUploadModal, setShowMainUploadModal] = useState(false);
    const [mainTitle, setMainTitle] = useState('');
    const [mainFolder, setMainFolder] = useState('');
    const [mainSummary, setMainSummary] = useState(''); 
    const [mainDescription, setMainDescription] = useState('');
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainUploading, setMainUploading] = useState(false);

    // IN-FOLDER MODAL SYSTEM STATES
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalDescription, setModalDescription] = useState('');
    const [modalImageFile, setModalImageFile] = useState(null);
    const [modalUploading, setModalUploading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');

        if (!token || !storedUsername) {
            alert("Unauthorised access! Please login first.");
            navigate('/'); 
            return;
        }

        setUsername(storedUsername);
        fetchUserAssets(token);
    }, []);

    const fetchUserAssets = async (token) => {
        const activeToken = token || localStorage.getItem('token');
        try {
            const response = await fetch('https://project1-backend-c6re.onrender.com/api/posts', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${activeToken}` }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                const groups = {};
                
                data.posts.forEach(post => {
                    let folder = post.folderName || 'Uncategorized';
                    if(!groups[folder]) {
                        groups[folder] = [];
                    }
                    groups[folder].push(post);
                });

                Object.keys(groups).forEach(folderName => {
                    groups[folderName].sort((a, b) => {
                        if (a.isThumbnail && !b.isThumbnail) return -1;
                        if (!a.isThumbnail && b.isThumbnail) return 1;
                        return 0; 
                    });
                });

                setTrips(groups);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (e, postId) => {
        e.stopPropagation(); 
        if (!window.confirm("🚨 WARNING: Are you sure you want to permanently delete this photo record?")) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`https://project1-backend-c6re.onrender.com/api/posts/delete/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                alert("✓ Memory cleared from database index.");
                await fetchUserAssets(token);
                
                const updatedFolder = selectedFolder;
                setTimeout(() => {
                    if (!trips[updatedFolder] || trips[updatedFolder].length <= 1) {
                        setSelectedFolder(null);
                    }
                }, 400);
            } else {
                alert(`❌ Deletion Failed: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Network Handshake failure with deletion engine.");
        }
    };

    const handleMainFormSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const savedUserId = localStorage.getItem('userId');

        if (!mainImageFile || !mainFolder.trim()) return;
        setMainUploading(true);

        const finalCaption = `${mainTitle} | 📍 ${mainFolder.trim()} | ${mainDescription} | SUMMARY_MARKER: ${mainSummary.trim()}`;

        const formData = new FormData();
        formData.append('caption', finalCaption);
        formData.append('image', mainImageFile); 
        formData.append('userId', savedUserId);
        formData.append('folderName', mainFolder.trim());
        formData.append('isThumbnail', true); 

        try {
            const response = await fetch('https://project1-backend-c6re.onrender.com/api/posts/create', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData 
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setMainTitle('');
                setMainFolder('');
                setMainSummary('');
                setMainDescription('');
                setMainImageFile(null);
                setShowMainUploadModal(false);
                await fetchUserAssets(token);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setMainUploading(false);
        }
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const savedUserId = localStorage.getItem('userId');
        if (!modalImageFile) return;

        setModalUploading(true);
        const finalCaption = `${modalTitle} | 📍 ${selectedFolder} | ${modalDescription}`;

        const formData = new FormData();
        formData.append('caption', finalCaption);
        formData.append('image', modalImageFile); 
        formData.append('userId', savedUserId);
        formData.append('folderName', selectedFolder);
        formData.append('isThumbnail', false); 

        try {
            const response = await fetch('https://project1-backend-c6re.onrender.com/api/posts/create', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData 
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setModalTitle('');
                setModalDescription('');
                setModalImageFile(null);
                setShowModal(false);
                await fetchUserAssets(token);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setModalUploading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out, Ayush?")) {
            localStorage.clear(); 
            navigate('/');
        }
    };

    const theme = {
        bg: '#090d16',
        cardBg: 'rgba(15, 23, 42, 0.4)',
        border: 'rgba(255, 255, 255, 0.08)',
        inputBg: 'rgba(30, 41, 59, 0.5)',
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

    // MODERN SOCIAL BUTTON GENERATOR STYLE
    const socialBtnStyle = (hoverColor) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        borderRadius: '12px',
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        border: `1px solid ${theme.border}`,
        color: '#fff',
        fontSize: '14px',
        fontWeight: '700',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    });

    if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px', backgroundColor: theme.bg }}>Syncing workspace...</div>;

    const extractFolderSummary = (postsArray) => {
        if (!postsArray || postsArray.length === 0) return 'No summary data compiled.';
        const primaryCoverDoc = postsArray.find(p => p.isThumbnail) || postsArray[0];
        if (primaryCoverDoc && primaryCoverDoc.caption && primaryCoverDoc.caption.includes('SUMMARY_MARKER:')) {
            return primaryCoverDoc.caption.split('SUMMARY_MARKER:')[1]?.trim();
        }
        return 'Exploring sequential geographic data stream parameters.';
    };

    const totalFoldersExist = Object.keys(trips).length;

    return (
        <div style={{ backgroundColor: theme.bg, minHeight: '100vh', color: theme.textMain, fontFamily: "'Urbanist', sans-serif", display: 'flex', flexDirection: 'column' }}>
            
            {/* TOP HEADER */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: `1px solid ${theme.border}`, backdropFilter: 'blur(10px)', position: 'relative', zIndex: 100 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div onClick={() => { setSelectedFolder(null); setMobileMenuOpen(false); }} style={{ padding: '8px 20px', border: `1px solid ${theme.border}`, borderRadius: '30px', fontWeight: '900', fontSize: '14px', letterSpacing: '1px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', cursor: 'pointer' }}>
                        Traveller_LOG
                    </div>
                    <span style={{ fontSize: '10px', color: theme.textMuted, fontWeight: '700', letterSpacing: '0.5px', marginTop: '5px', marginLeft: '8px' }}>
                        Made by Ayush
                    </span>
                </div>
                
                <div style={{ fontSize: '16px', fontWeight: '700' }} className="desktop-only">
                    Welcome, <span style={{ color: '#38bdf8', fontWeight: '800' }}>{username}</span>! 👋
                </div>

                <div onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'flex', flexDirection: 'column', gap: '5px', cursor: 'pointer', padding: '5px' }} className="hamburger-menu">
                    <div style={{ width: '24px', height: '2px', backgroundColor: '#fff', transition: '0.3s', transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></div>
                    <div style={{ width: '24px', height: '2px', backgroundColor: '#fff', transition: '0.3s', opacity: mobileMenuOpen ? 0 : 1 }}></div>
                    <div style={{ width: '24px', height: '2px', backgroundColor: '#fff', transition: '0.3s', transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></div>
                </div>

                <nav style={{ display: mobileMenuOpen ? 'flex' : 'none', flexDirection: 'column', position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#090d16', padding: '20px', gap: '12px', borderBottom: `1px solid ${theme.border}` }} className="mobile-nav-links">
                    <button style={{ ...navBtnStyle, width: '100%' }} onClick={() => { setSelectedFolder(null); setMobileMenuOpen(false); }}>Home</button>
                    <button style={{ ...navBtnStyle, width: '100%' }} onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button style={{ ...navBtnStyle, width: '100%' }} onClick={() => navigate('/create-post')}>Upload New</button>
                    <button style={{ ...navBtnStyle, width: '100%' }} onClick={() => navigate('/profile')}>👤 Profile</button>
                    <button style={{ ...navBtnStyle, width: '100%', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.2)' }} onClick={handleLogout}>Logout</button>
                </nav>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }} className="desktop-nav-links">
                    <button style={{ ...navBtnStyle, color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }} onClick={() => setSelectedFolder(null)}>Home</button>
                    <button style={navBtnStyle} onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button style={navBtnStyle} onClick={() => navigate('/create-post')}>Upload New</button>
                    <button style={{ ...navBtnStyle, color: '#a5b4fc', borderColor: 'rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.05)' }} onClick={() => navigate('/profile')}>👤 Profile</button>
                    <button style={{ ...navBtnStyle, color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.2)' }} onClick={handleLogout}>Logout</button>
                </div>
            </header>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-nav-links, .desktop-only { display: none !important; }
                    .hamburger-menu { display: flex !important; }
                    .folder-grid { grid-template-columns: 1fr !important; }
                    .footer-btns { flex-direction: column !important; gap: 12px !important; width: 100% !important; }
                    .footer-btns a { width: 100% !important; justify-content: center !important; }
                }
                @media (min-width: 769px) {
                    .hamburger-menu, .mobile-nav-links { display: none !important; }
                    .desktop-nav-links { display: flex !important; }
                }
                .social-link-btn:hover {
                    transform: translateY(-4px) !important;
                    background-color: rgba(255, 255, 255, 0.08) !important;
                    box-shadow: 0 8px 24px rgba(56, 189, 248, 0.2) !important;
                }
            `}</style>

            {/* MAIN CONTENT CONTAINER */}
            <main style={{ width: '100%', padding: '30px 40px', boxSizing: 'border-box', flexGrow: 1 }}>
                {totalFoldersExist === 0 && !selectedFolder ? (
                    <div style={{ display: 'grid', placeItems: 'center', height: '55vh', width: '100%' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '70px', marginBottom: '10px' }}>📦</div>
                            <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>You have no postss</h2>
                            <p style={{ color: theme.textMuted, fontSize: '15px', margin: '0 0 30px 0', maxWidth: '400px', lineHeight: '1.5' }}>Initialize your first memory pipeline by creating an active target album directory bucket.</p>
                            <button onClick={() => setShowMainUploadModal(true)} style={{ padding: '14px 32px', borderRadius: '30px', border: 'none', backgroundColor: theme.accent, color: '#fff', fontSize: '14px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.35)' }}>+ Create Your First Folder</button>
                        </div>
                    </div>
                ) : (
                    <>
                        {!selectedFolder ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                    <h3 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>All of your postss</h3>
                                    <button onClick={() => setShowMainUploadModal(true)} style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#38bdf8', border: 'none', color: '#090d16', fontSize: '22px', fontWeight: '900', cursor: 'pointer', display: 'grid', placeItems: 'center', boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)' }}>+</button>
                                </div>

                                <div style={{ maxHeight: '78vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '40px' }}>
                                    {Object.keys(trips).map((locationName) => {
                                        const currentFolderSummary = extractFolderSummary(trips[locationName]);
                                        return (
                                            <div key={locationName} onClick={() => setSelectedFolder(locationName)} style={{ width: '100%', height: '380px', backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '24px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                                                <div style={{ width: '100%', height: '100%', backgroundColor: '#05070c', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <img src={trips[locationName][0]?.image} alt={locationName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                </div>
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '30px 40px', background: 'linear-gradient(to top, rgba(9,13,22,1) 0%, rgba(9,13,22,0.6) 70%, transparent 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <h2 style={{ margin: 0, fontSize: '30px', fontWeight: '800' }}>📍 {locationName}</h2>
                                                        <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '13px', fontWeight: '600', maxWidth: '700px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📝 Summary: {currentFolderSummary}</p>
                                                    </div>
                                                    <span style={{ backgroundColor: theme.accent, padding: '8px 20px', borderRadius: '30px', fontSize: '13px', fontWeight: '700' }} className="desktop-only">{trips[locationName].length} Photos Locked</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <button onClick={() => setSelectedFolder(null)} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.border}`, borderRadius: '12px', color: '#fff', cursor: 'pointer' }}>← Return to Grid</button>
                                        <h3 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Exploration stream: <span style={{ color: '#38bdf8' }}>{selectedFolder}</span></h3>
                                    </div>
                                    <button onClick={() => setShowModal(true)} style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: theme.accent, border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>+</button>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '30px', marginBottom: '40px' }} className="folder-grid">
                                    {trips[selectedFolder].map((item) => {
                                        const hasPipe = item.caption && item.caption.includes(' | ');
                                        const parts = hasPipe ? item.caption.split(' | ') : [];
                                        
                                        const displayTitle = item.title || (hasPipe ? parts[0] : (item.caption || 'Logged Asset Frame'));
                                        const displaySummary = item.summary || (hasPipe ? parts[2] : '');

                                        return (
                                            <div key={item._id} style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 12px 32px rgba(0,0,0,0.3)', position: 'relative' }}>
                                                
                                                <button 
                                                    onClick={(e) => handleDeletePost(e, item._id)}
                                                    style={{ position: 'absolute', top: '16px', right: '16px', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(244, 63, 94, 0.9)', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer', zIndex: 10, display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', transition: 'all 0.2s' }}
                                                    title="Purge photo memory records permanently"
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e11d48'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.9)'}
                                                >
                                                    🗑️
                                                </button>

                                                <div onClick={() => setFullscreenImage(item.image)} style={{ width: '100%', height: '300px', backgroundColor: '#05070c', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'zoom-in', overflow: 'hidden' }}>
                                                    <img src={item.image} alt={displayTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>

                                                <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1, justifyContent: 'space-between' }}>
                                                    <div>
                                                        <h4 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 6px 0', color: '#fff', letterSpacing: '-0.2px' }}>{displayTitle}</h4>
                                                        {displaySummary ? (
                                                            <p style={{ color: '#cbd5e1', fontSize: '13.5px', margin: '8px 0 0 0', lineHeight: '1.5', backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: `1px solid rgba(255,255,255,0.04)` }}>{displaySummary}</p>
                                                        ) : (
                                                            <p style={{ color: theme.textMuted, fontSize: '12.5px', margin: '8px 0 0 0', fontStyle: 'italic' }}>No deep narrative description tagged on this log block.</p>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#34d399', borderTop: `1px solid ${theme.border}`, paddingTop: '10px', marginTop: '10px', fontWeight: '600' }}>⏱️ BUCKET NODE ENCRYPTED SYNCED</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>

            {/* 🔥 HIGHLY UPGRADED ABOUT US SOCIAL FOOTER */}
            <footer style={{ borderTop: `1px solid ${theme.border}`, padding: '40px 20px', backgroundColor: 'rgba(4, 7, 13, 0.7)', backdropFilter: 'blur(12px)', marginTop: 'auto' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    
                    <h3 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', color: '#38bdf8', margin: 0 }}>
                        About Us
                    </h3>

                    {/* DYNAMIC ROW OF INTERACTIVE SOCIAL BUTTONS */}
                    <div className="footer-btns" style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
                        
                        {/* GITHUB BUTTON */}
                        <a 
                            href="https://github.com/ayush-singh-4286" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-link-btn"
                            style={socialBtnStyle('#24292e')}
                        >
                            <span></span> GitHub
                        </a>

                        {/* LEETCODE BUTTON */}
                        <a 
                            href="https://leetcode.com/u/Ayush4286/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-link-btn"
                            style={socialBtnStyle('#ffa116')}
                        >
                            <span></span> LeetCode
                        </a>

                        {/* LINKEDIN BUTTON */}
                        <a 
                            href="https://www.linkedin.com/in/ayush-k-singh-cse/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="social-link-btn"
                            style={socialBtnStyle('#0077b5')}
                        >
                            <span></span> LinkedIn
                        </a>

                    </div>

                    
                </div>
            </footer>

            {/* FULL SCREEN LIGHTBOX */}
            {fullscreenImage && (
                <div onClick={() => setFullscreenImage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(2, 4, 8, 0.96)', zIndex: 100000, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'zoom-out', padding: '20px' }}>
                    <button style={{ position: 'absolute', top: '30px', right: '40px', background: 'none', border: 'none', color: '#fff', fontSize: '32px', fontWeight: '300', cursor: 'pointer' }}>✕</button>
                    <img src={fullscreenImage} alt="Macro full view" style={{ maxWidth: '100%', maxHeight: '92vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }} />
                </div>
            )}

            {/* MAIN MASTER UPLOAD MODAL */}
            {showMainUploadModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(4, 7, 13, 0.85)', display: 'grid', placeItems: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }}>
                    <div style={{ backgroundColor: '#0f172a', border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '30px', width: '90%', maxWidth: '520px', boxSizing: 'border-box', position: 'relative' }}>
                        <button onClick={() => setShowMainUploadModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: theme.textMuted, fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0' }}>Initialize New Discovery Core</h3>
                        <form onSubmit={handleMainFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                            <input type="text" placeholder="Folder Geographic Name (e.g. Bali Trip)" value={mainFolder} onChange={(e) => setMainFolder(e.target.value)} required style={{ width: '100%', padding: '12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                            <input type="text" placeholder="Short Folder Summary (e.g. 5 days beach journey)" value={mainSummary} onChange={(e) => setMainSummary(e.target.value)} required style={{ width: '100%', padding: '12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: '#34d399', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontWeight: '600' }} />
                            <input type="text" placeholder="Primary Image Title / Heading" value={mainTitle} onChange={(e) => setMainTitle(e.target.value)} required style={{ width: '100%', padding: '12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                            <textarea placeholder="Narrative description text parameters..." value={mainDescription} onChange={(e) => setMainDescription(e.target.value)} required rows="3" style={{ width: '100%', padding: '12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                            <div style={{ border: `1px dashed #38bdf8`, borderRadius: '8px', padding: '16px', textAlign: 'center', cursor: 'pointer' }}>
                                <input type="file" accept="image/*" required onChange={(e) => setMainImageFile(e.target.files[0])} style={{ display: 'none' }} id="main-modal-upload" />
                                <label htmlFor="main-modal-upload" style={{ cursor: 'pointer', fontSize: '13px', color: '#38bdf8', fontWeight: '700' }}>{mainImageFile ? `✓ ${mainImageFile.name}` : '📂 ATTACH ALBUM COVER PHOTO'}</label>
                            </div>
                            <button type="submit" disabled={mainUploading} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>{mainUploading ? 'Syncing transmission layer...' : 'Compile Asset Cluster'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* IN-FOLDER UPLOAD MODAL */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(4, 7, 13, 0.85)', display: 'grid', placeItems: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }}>
                    <div style={{ backgroundColor: '#0f172a', border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '30px', width: '90%', maxWidth: '500px', boxSizing: 'border-box', position: 'relative' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: theme.textMuted, fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 20px 0' }}>Add Asset to {selectedFolder}</h3>
                        <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <input type="text" placeholder="Title" value={modalTitle} onChange={(e) => setModalTitle(e.target.value)} required style={{ width: '100%', padding: '12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                            <textarea placeholder="Summary description..." value={modalDescription} onChange={(e) => setModalDescription(e.target.value)} required rows="3" style={{ width: '100%', padding: '12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                            <div style={{ border: `1px dashed ${theme.accent}`, borderRadius: '8px', padding: '16px', textAlign: 'center', cursor: 'pointer' }}>
                                <input type="file" accept="image/*" required onChange={(e) => setModalImageFile(e.target.files[0])} style={{ display: 'none' }} id="modal-upload" />
                                <label htmlFor="modal-upload" style={{ cursor: 'pointer', fontSize: '13px', color: theme.accent, fontWeight: '700' }}>{modalImageFile ? `✓ ${mockImageFile.name}` : '📂 CHOOSE BINARY IMAGE'}</label>
                            </div>
                            <button type="submit" disabled={modalUploading} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>{modalUploading ? 'Transmitting Core...' : 'Commit Path Entry'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;