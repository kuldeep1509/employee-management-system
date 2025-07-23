// src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../Navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg glass-navbar sticky-top px-4 py-2">
      <div className="container-fluid">
        <NavLink id='one' className="navbar-brand brand-glow fs-3" to="/">
           EmployeeMgmt
        </NavLink>
        <button
          className="navbar-toggler bg-light"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="navbar-nav ms-auto gap-3">
            <NavLink exact="true" to="/" className="nav-link cool-link">
              Employees
            </NavLink>
            <NavLink to="/tasks" className="nav-link cool-link">
              Tasks
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
