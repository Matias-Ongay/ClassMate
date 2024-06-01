import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../ui/components/Header';
import Navbar from '../../ui/components/Navbar';

const ToDo = () => {
  const [tasks, setTasks] = useState([]);
  const [currentColumn, setCurrentColumn] = useState('Pending Tasks');
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetch tasks from the backend
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8080/get_tasks');
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    const statusMap = {
      'Pending Tasks': 'Pendiente',
      'Tasks In Progress': 'En ejecucion',
      'Completed Tasks': 'Tarea finalizada'
    };

    try {
      const response = await axios.post('http://127.0.0.1:8080/add_task', {
        title: newTaskTitle,
        status: statusMap[currentColumn]
      });

      setTasks([...tasks, response.data]);
      setShowModal(false);
      setNewTaskTitle('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`http://127.0.0.1:8080/delete_task/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
      setSelectedTask(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await axios.post(`http://127.0.0.1:8080/update_task_status`, {
        task_id: taskId,
        new_status: newStatus
      });
      setTasks(tasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const renderTasks = (status) => {
    return tasks
      .filter(task => task.status === status)
      .map(task => (
        <div 
          key={task.id} 
          className={`bg-white p-4 rounded-lg shadow-md mb-4 ${selectedTask && selectedTask.id === task.id ? 'expanded' : ''}`}
          onClick={() => setSelectedTask(selectedTask && selectedTask.id === task.id ? null : task)}
        >
          <div className="flex justify-between items-center">
            <span className="text-[#9667E0]">{task.title}</span>
            {selectedTask && selectedTask.id === task.id && (
              <>
                <button onClick={() => handleDelete(task.id)} className="text-red-500">❌</button>
                <button onClick={() => handleUpdateStatus(task.id, 'Pendiente')} className="text-[#FFA500]">🔄</button>
                <button onClick={() => handleUpdateStatus(task.id, 'En ejecucion')} className="text-[#32CD32]">✔️</button>
              </>
            )}
          </div>
          {selectedTask && selectedTask.id === task.id && (
            <div className="mt-4">
              <p className="text-gray-600">More info about the task...</p>
              <div className="flex justify-between mt-4">
                {currentColumn === 'Tasks In Progress' && (
                  <>
                    <button onClick={() => handleUpdateStatus(task.id, 'Pendiente')} className="text-[#FFA500]">↩️</button>
                    <button onClick={() => handleUpdateStatus(task.id, 'Tarea finalizada')} className="text-[#32CD32]">➡️</button>
                  </>
                )}
                {currentColumn === 'Pending Tasks' && (
                  <button onClick={() => handleUpdateStatus(task.id, 'En ejecucion')} className="text-[#32CD32]">➡️</button>
                )}
                {currentColumn === 'Completed Tasks' && (
                  <button onClick={() => handleUpdateStatus(task.id, 'En ejecucion')} className="text-[#FFA500]">↩️</button>
                )}
                <button onClick={() => handleDelete(task.id)} className="text-red-500">Remove Task</button>
              </div>
            </div>
          )}
        </div>
      ));
  };

  return (
    <div className="min-h-screen bg-[#FBFAFF]">
      <Header />
      <div className="p-4 mt-7 mr-3 ml-3 rounded-[10px] bg-[#F2EBFB]">
        <h2 className="text-center text-[#9667E0] text-[30px] font-bold mb-4">{currentColumn}</h2>
        {currentColumn === 'Pending Tasks' && renderTasks('Pendiente')}
        {currentColumn === 'Tasks In Progress' && renderTasks('En ejecucion')}
        {currentColumn === 'Completed Tasks' && renderTasks('Tarea finalizada')}
        <div className="flex justify-between mt-4">
          {currentColumn === 'Pending Tasks' && (
            <>
              <button onClick={() => setCurrentColumn('Tasks In Progress')} className="text-[#9667E0] text-bold ">Tasks In Progress ⮕</button>
            </>
          )}
          {currentColumn === 'Tasks In Progress' && (
            <>
              <button onClick={() => setCurrentColumn('Pending Tasks')} className="text-[#9667E0]">⬅ Pending Tasks </button>
              <button onClick={() => setCurrentColumn('Completed Tasks')} className="text-[#9667E0]">Completed Tasks ⮕</button>
            </>
          )}
          {currentColumn === 'Completed Tasks' && (
            <>
              <button onClick={() => setCurrentColumn('Tasks In Progress')} className="text-[#9667E0]">⬅ Tasks In Progress </button>
            </>
          )}
        </div>
      </div>
      <div className="p-4 mt-7 mr-3 ml-3 rounded-[10px] ">
        <button
          onClick={() => setShowModal(true)}
          className="w-full px-4 py-3 font-semibold text-white bg-[#9667E0] rounded-[10px] text-[#FBFAFF] mt-4 shadow-md"
        >
          Add Task
        </button>
      </div>
      
      <Navbar />

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ">
          <div className=" p-8 rounded-lg shadow-lg bg-[#F2EBFB] ">
            <h2 className="text-2xl font-bold mb-4 text-center text-[#9667E0]  ">Add New Task</h2>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task Title"
              className="w-full px-4 py-2 border-1-[#9667E0]  rounded-lg mb-4"
            />
            <div className="flex justify-center">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 mr-2 bg-white text-[#9667E0] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-[#9667E0] text-white rounded-lg"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToDo;
