import React from 'react';
import { useNavigate } from 'react-router-dom';
import home from '../assets/home.png';
import asignaturesHome from '../assets/asignatureshome.png';
import todoHome from '../assets/todohome.png';
const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="bg- fixed bottom-0 left-0 right-0 bg-[#F2EBFB] p-4 flex justify-around shadow-md border-[1px] border-[#9667E0] rounded-t-[20px]">
        <button className="text-[#9667E0]" onClick={() => navigate('/todo')}>
        <img src={todoHome} alt="" />
      </button>
      <button className="text-[#9667E0]" onClick={() => navigate('/dashboard')}>
        <img src={home} alt="icono de home" />
        
      </button>
      <button className="text-[#9667E0]" onClick={() => navigate('/dashboard')}>
        <img src={asignaturesHome} alt="icono de asignaturas" />
      </button>
      
    </div>
  );
};

export default Navbar;
