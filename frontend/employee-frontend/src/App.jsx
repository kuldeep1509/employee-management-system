// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import EmployeeList from './pages/EmployeeList';
import EmployeeForm from './pages/EmployeeForm';
import EmployeeDetails from './pages/EmployeeDetails';
import TaskList from './pages/TaskList';
import TaskForm from './pages/TaskForm';
import { Box } from '@mui/material';

function App() {
  return (
    <Box>
      <Navbar />
      <Routes>
        <Route path="/" element={<EmployeeList />} />
        <Route path="/employees/new" element={<EmployeeForm />} />
        <Route path="/employees/edit/:id" element={<EmployeeForm />} />
        <Route path="/employees/:id" element={<EmployeeDetails />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/tasks/new" element={<TaskForm />} />
        <Route path="/tasks/edit/:id" element={<TaskForm />} />
        
       
        <Route path="*" element={<Box sx={{ p: 3, textAlign: 'center' }}><h1 style={{ color: 'red' }}>404 - Page Not Found</h1></Box>} />
      </Routes>
    </Box>
  );
}

export default App;