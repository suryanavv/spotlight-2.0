import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import PublicPortfolio from './components/PublicPortfolio';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/portfolio/:username" element={<PublicPortfolio />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;