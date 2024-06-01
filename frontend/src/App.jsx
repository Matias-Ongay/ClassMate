import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './auth/pages/Login';
import Register from './auth/pages/Register';
import Dashboard from './todo/pages/Dashboard';
import ToDo from './todo/pages/ToDo';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/todo" element={<ToDo />} />
        
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
