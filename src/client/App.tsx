import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
const App: React.FC = () => {
    return (
        <Router>
            <div>
                <h1>Welcome to your banking system</h1>
                <Routes>
                    <Route path="/">Home</Route>
                    <Route path="/about">About</Route>
                </Routes>
            </div>
        </Router>
    );
};
export default App;
