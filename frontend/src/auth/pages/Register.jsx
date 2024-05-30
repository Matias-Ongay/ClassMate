import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/LogoLogin.png';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8080/register', {
        username,
        password,
      });
      if (response.status === 200) {
        navigate('/login');
      } else {
        setError('Error creating account');
      }
    } catch (error) {
      setError('Error creating account');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FBFAFF]">
      <div className="w-full max-w-md p-8 space-y-6 bg-[#FBFAFF]">
        <div className="flex flex-col items-center mt-8">
          <img src={logo} alt="ClassMate Logo" className="w-20 h-20 mb-4" />
          <h1 className="text-[48px] font-bold text-[#9667E0] mb-8">ClassMate</h1>
        </div>
        <div className="flex flex-col items-start mb-8">
          <p className="text-[16px] font-semibold text-[#9667E0]">Create your Account</p>
        </div>
        <form className="flex flex-col space-y-6" onSubmit={handleRegister}>
          <div className='flex flex-col'>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="w-full max-w-xs mx-auto px-4 py-3 text-[#9667E0] placeholder-[#9667E0] bg-[#EBD9FC] border border-[#9667E0] rounded-[20px] focus:outline-none focus:ring-2 focus:ring-[#9667E0] shadow-md shadow-[#9667E0]/20"
              style={{ width: '315px', height: '60px' }}
            />
          </div>
          <div className="mt-6 flex flex-col">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full max-w-xs mx-auto px-4 py-3 text-[#9667E0] placeholder-[#9667E0] bg-[#EBD9FC] border border-[#9667E0] rounded-[20px] focus:outline-none focus:ring-2 focus:ring-[#9667E0] shadow-md shadow-[#9667E0]/20"
              style={{ width: '315px', height: '60px' }}
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full max-w-xs mx-auto px-4 py-3 font-semibold text-white bg-[#9667E0] rounded-[20px] hover:bg-[#7D56B8]"
            style={{ width: '315px', height: '60px', marginTop: '70px' }}
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center">
          <a href="/login" className="text-[#9667E0]">Already have an account? Sign In</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
