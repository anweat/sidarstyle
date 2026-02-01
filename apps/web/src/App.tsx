import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import QuickOutfit from './pages/QuickOutfit';
import Wardrobe from './pages/Wardrobe';
import History from './pages/History';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-title">Sidarstyle</h1>
            <ul className="nav-links">
              <li><Link to="/">Quick Outfit</Link></li>
              <li><Link to="/wardrobe">Wardrobe</Link></li>
              <li><Link to="/history">History</Link></li>
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
