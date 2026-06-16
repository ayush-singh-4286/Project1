import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    
    const [existingFolders, setExistingFolders] = useState([]);
    const [folderType, setFolderType] = useState('new'); 
    const [selectedFolder, setSelectedFolder] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [isThumbnail, setIsThumbnail] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [terminalLog, setTerminalLog] = useState('SYSTEM INIT: Upload workspace ready for pipeline injection.');

    // THEME STATE CONTROL
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('themePreference');
        return savedTheme ? savedTheme === 'dark' : true;
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Access Denied! Please login first.");
            navigate('/');
            return;
        }
        fetchUserFolders(token);

        // REAL-TIME STORAGE EVENT LISTENER FOR INSTANT LIGHT/DARK TOGGLE
        const handleStorageChange = () => {
            const savedTheme = localStorage.getItem('themePreference');
            setIsDarkMode(savedTheme ? savedTheme === 'dark' : true);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const fetchUserFolders = async (token) => {
        try {
            const response = await fetch('https://project1-backend-c6re.onrender.com/api/posts', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                const folders = [];
                data.posts.forEach(post => {
                    let folder = post.folderName;
                    if (!folders.includes(folder) && folder) {
                        folders.push(folder);
                    }
                });
                setExistingFolders(folders);
                if (folders.length > 0) {
                    setFolderType('existing');
                    setSelectedFolder(folders[0]);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const savedUserId = localStorage.getItem('userId');
        
        const finalFolder = folderType === 'new' ? newFolderName.trim() : selectedFolder;
        if (!finalFolder) return;

        setLoading(true);
        const finalCaption = `${title} | 📍 ${finalFolder} | ${description}`;

        const formData = new FormData();
        formData.append('caption', finalCaption);
        formData.append('image', imageFile); 
        formData.append('userId', savedUserId);
        formData.append('folderName', finalFolder);
        formData.append('isThumbnail', folderType === 'new' ? isThumbnail : false); 

        try {
            const response = await fetch('https://project1-backend-c6re.onrender.com/api/posts/create', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData 
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setMessage('Memory successfully logged!');
                setTimeout(() => navigate('/landing'), 1000); 
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const theme = {
        bg: isDarkMode ? '#090d16' : '#ffb703',
        cardBg: isDarkMode ? 'rgba(15, 23, 42, 0.4)' : '#ffffff',
        border: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.12)',
        inputBg: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : '#f1f5f9',
        textMain: isDarkMode ? '#f8fafc' : '#0f172a',
        textMuted: isDarkMode ? '#64748b' : '#475569',
        accent: '#6366f1',
        glassBtn: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.04)',
        gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.04)'
    };

    const navBtnStyle = {
        background: theme.glassBtn,
        border: `1px solid ${theme.border}`,
        color: theme.textMain,
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '13px',
        padding: '8px 16px',
        borderRadius: '20px',
        transition: 'all 0.3s ease'
    };

    return (
        <div style={{ 
            backgroundColor: theme.bg, 
            minHeight: '100vh', 
            color: theme.textMain, 
            fontFamily: "'Urbanist', sans-serif", 
            transition: 'background-color 0.3s ease, color 0.3s ease',
            backgroundImage: `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}>
            
            {/* UNIVERSAL NAVIGATION HEADER BAR */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: `1px solid ${theme.border}`, backdropFilter: 'blur(10px)' }}>
                <div 
                    onClick={() => navigate('/landing')}
                    style={{ padding: '8px 20px', border: `1px solid ${theme.border}`, borderRadius: '30px', fontWeight: '900', fontSize: '14px', letterSpacing: '1px', background: isDarkMode ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', color: theme.textMain, cursor: 'pointer' }}
                >
                  Traveller_LOG
                </div>
                
                <div style={{ fontSize: '16px', fontWeight: '700', color: theme.textMain }}>Media Control Center</div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button style={navBtnStyle} onClick={() => navigate('/landing')}>Home</button>
                    <button style={navBtnStyle} onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button style={{ ...navBtnStyle, color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }} onClick={() => navigate('/create-post')}>Upload New</button>
                    <button style={navBtnStyle} onClick={() => navigate('/profile')}>👤 Profile</button>
                </div>
            </header>

            <div style={{ maxWidth: '600px', margin: '40px auto 0 auto', padding: '0 20px' }}>
                <div style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '30px', backdropFilter: 'blur(16px)', boxShadow: isDarkMode ? 'none' : '0 10px 30px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 24px 0', color: theme.textMain }}>Uploading Photos...!!!</h3>

                    <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        <div style={{ backgroundColor: theme.glassBtn, padding: '16px', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', color: theme.textMain }}>
                                    <input type="radio" name="folderType" checked={folderType === 'new'} onChange={() => setFolderType('new')} style={{ accentColor: theme.accent }} />
                                    Create New Folder
                                </label>
                                {existingFolders.length > 0 && (
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', color: theme.textMain }}>
                                        <input type="radio" name="folderType" checked={folderType === 'existing'} onChange={() => setFolderType('existing')} style={{ accentColor: theme.accent }} />
                                        Add to Existing Folder
                                    </label>
                                )}
                            </div>

                            {folderType === 'new' ? (
                                <div>
                                    <input 
                                        type="text" 
                                        placeholder="Enter New Folder Name (e.g. Bali Trip)" 
                                        value={newFolderName} 
                                        onChange={(e) => setNewFolderName(e.target.value)} 
                                        required={folderType === 'new'}
                                        style={{ width: '100%', padding: '12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.textMain, fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }}
                                    />
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#34d399', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={isThumbnail} onChange={(e) => setIsThumbnail(e.target.checked)} style={{ accentColor: '#34d399' }} />
                                        🖼️ Set as Folder Cover Thumbnail
                                    </label>
                                </div>
                            ) : (
                                <select 
                                    value={selectedFolder} 
                                    onChange={(e) => setSelectedFolder(e.target.value)}
                                    style={{ width: '100%', padding: '12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.textMain, fontSize: '14px', outline: 'none', cursor: 'pointer' }}
                                >
                                    {existingFolders.map(folder => <option key={folder} value={folder} style={{ background: theme.bg, color: theme.textMain }}>{folder}</option>)}
                                </select>
                            )}
                        </div>

                        <input type="text" placeholder="Memory Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '14px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '10px', color: theme.textMain, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                        <textarea placeholder="Narrative summary..." value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" style={{ width: '100%', padding: '14px', backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: '10px', color: theme.textMain, fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                        
                        <div style={{ border: `1px dashed ${theme.accent}`, borderRadius: '10px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                            <input type="file" accept="image/*" required onChange={(e) => setImageFile(e.target.files[0])} style={{ display: 'none' }} id="upload-binary" />
                            <label htmlFor="upload-binary" style={{ cursor: 'pointer', fontSize: '14px', color: theme.accent, fontWeight: '700' }}>
                                {imageFile ? `✓ ${imageFile.name}` : '📂 CHOOSE  IMAGE'}
                            </label>
                        </div>

                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                            {loading ? 'Transmitting Assets...' : 'Save changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;