import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AgentDashboard from './pages/AgentDashboard';
import NewsFeed from './pages/NewsFeed';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<AgentDashboard />} />
        <Route path="/feed" element={<NewsFeed />} />
      </Routes>
    </Router>
  );
}

export default App;
