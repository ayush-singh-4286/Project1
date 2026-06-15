import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost.jsx';
import Feed from './pages/Feed.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx'; // 👈 Imported perfectly
import TravelDashboard from './components/TravelDashboard';
import LandingPage from './components/LandingPage.jsx'; 

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Login & Register dono isi root path pe handle honge */}
        <Route path='/' element={<Login />} />
        
        {/* Forgot Password Route */}
        <Route path='/forgot-password' element={<ForgotPassword />} /> 
        
        {/* Protected Pages */}
        <Route path='/landing' element={<LandingPage />} /> 
        <Route path='/create-post' element={<CreatePost />} />
        <Route path='/feed' element={<Feed />} />
        <Route path="/dashboard" element={<TravelDashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;