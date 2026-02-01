import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import QuickOutfit from './pages/QuickOutfit';
import Wardrobe from './pages/Wardrobe';
import History from './pages/History';
import { BackendStatus } from './components/BackendStatus';

function App() {
  return (
    <Router>
      <div className="app">
        <BackendStatus />
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-title">思搭style</h1>
            <ul className="nav-links">
              <li><Link to="/">快速搭配</Link></li>
              <li><Link to="/wardrobe">衣橱</Link></li>
              <li><Link to="/history">历史记录</Link></li>
            </ul>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<QuickOutfit />} />
            <Route path="/wardrobe" element={<Wardrobe />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
