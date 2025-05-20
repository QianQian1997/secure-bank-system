import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
const App: React.FC = () => {
    return (
        <Router>
            <div>
                <h1 className="flex justify-center items-center">Welcome to your banking system</h1>
                <Routes>
                    <Route path="/" element={<HomePage />}></Route>
                    <Route path="/profile"></Route>
                    <Route path="/login"></Route>
                    <Route path="/signup"></Route>
                </Routes>
            </div>
        </Router>
    );
};
export default App;
