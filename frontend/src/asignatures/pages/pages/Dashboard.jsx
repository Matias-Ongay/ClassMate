import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../ui/components/Header';
import Navbar from '../../../ui/components/Navbar';
import todo from '../assets/Todo.png';
import asignatures from '../assets/asignatures.png';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí puedes agregar la lógica para cerrar sesión
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FBFAFF]">
      <Header />
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[#9667E0] font-bold bg-[#EBD9FC] border border-[#9667E0] rounded-[10px] px-4 py-2">Ongaymatias@gmail.com</span>
          <button 
            onClick={handleLogout} 
            className="text-[#9667E0] font-bold bg-[#EBD9FC] border border-[#9667E0] rounded-[10px] px-4 py-2"
          >
            Log Out
          </button>
        </div>
        <div className="space-y-4">
          <div 
            className="bg-[#EBD9FC] h-[137px] p-4 items-center rounded-lg shadow-md cursor-pointer"
            onClick={() => navigate('/todo')}
          >
            <div className="flex items-center space-x-4">
              <div className="text-white p-2 rounded-full">
                <img src={todo} alt="Logo de lista" />
              </div>
              <span className="text-[#9667E0] text-[30px] font-bold">To Do</span>
            </div>
          </div>
          <div 
            className="bg-[#EBD9FC] h-[137px] p-4 rounded-lg shadow-md cursor-pointer"
            onClick={() => navigate('/asignatures')}
          >
            <div className="flex items-center space-x-4">
              <div className="text-white p-2 rounded-full">
                <img src={asignatures} alt="Logo de lista" />
              </div>
              <span className="text-[#9667E0] text-[30px] font-bold">Asignatures</span>
            </div>
          </div>
        </div>
      </div>
      <Navbar />
    </div>
  );
};

export default Dashboard;
