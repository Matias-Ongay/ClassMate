import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../ui/components/Header';
import Navbar from '../../ui/components/Navbar';

const Subject = () => {
  const [subjects, setSubjects] = useState([]);
  const [currentColumn, setCurrentColumn] = useState('Subject');
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8080/get_subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAddSubject = async () => {
    const statusMap = {
      'Pending Subjects': 'Pendiente',
      'Subjects In Progress': 'En ejecucion',
      'Completed Subjects': 'Asignatura finalizada'
    };

    try {
      await axios.post('http://127.0.0.1:8080/add_subject', {
        title: newSubjectTitle,
        status: statusMap[currentColumn]
      });

      setShowModal(false);
      setNewSubjectTitle('');
      fetchSubjects();
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleDelete = async (subjectId) => {
    try {
      await axios.delete(`http://127.0.0.1:8080/delete_subject/${subjectId}`);
      setSubjects(subjects.filter(subject => subject.id !== subjectId));
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  const renderSubjects = (status) => {
    return subjects
      .filter(subject => subject.status === status)
      .map(subject => (
        <div key={subject.id} className="bg-white p-4 rounded-lg shadow-md mb-4 flex justify-between items-center">
          <span className="text-[#9667E0]">{subject.title}</span>
          <button onClick={() => handleDelete(subject.id)} className="text-red-500">
            ❌
          </button>
        </div>
      ));
  };

  return (
    <div className="min-h-screen bg-[#FBFAFF]">
      <Header />
      <div className="p-4 mt-7 mr-3 ml-3 rounded-[10px] bg-[#F2EBFB]">
        <h2 className="text-center text-[#9667E0] text-[30px] font-bold mb-4">{currentColumn}</h2>
        {currentColumn === 'Pending Subjects' && renderSubjects('Pendiente')}
        {currentColumn === 'Subjects In Progress' && renderSubjects('En ejecucion')}
        {currentColumn === 'Completed Subjects' && renderSubjects('Asignatura finalizada')}
        <div className="flex justify-between mt-4">
          {currentColumn === 'Subjects In Progress' && (
            <button onClick={() => setCurrentColumn('Pending Subjects')} className="text-[#9667E0]">
              <span className="text-[#9667E0]">{`◀`}</span> Pending Subjects
            </button>
          )}
          {currentColumn === 'Completed Subjects' && (
            <button onClick={() => setCurrentColumn('Subjects In Progress')} className="text-[#9667E0]">
              <span className="text-[#9667E0]">{`◀`}</span> Subjects In Progress
            </button>
          )}
          {currentColumn === 'Pending Subjects' && (
            <button onClick={() => setCurrentColumn('Subjects In Progress')} className="text-[#9667E0]">
              Subjects In Progress <span className="text-[#9667E0]">{`▶`}</span>
            </button>
          )}
          {currentColumn === 'Subjects In Progress' && (
            <button onClick={() => setCurrentColumn('Completed Subjects')} className="text-[#9667E0]">
              Completed Subjects <span className="text-[#9667E0]">{`▶`}</span>
            </button>
          )}
        </div>
      </div>
      <div className="p-4 mt-7 mr-3 ml-3 rounded-[10px] ">
        <button
          onClick={() => setShowModal(true)}
          className="w-full px-4 py-3 font-semibold text-white bg-[#9667E0] rounded-[10px] text-[#FBFAFF] mt-4 shadow-md"
        >
          Add Subject
        </button>
      </div>

      <Navbar />

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ">
          <div className=" p-8 rounded-lg shadow-lg bg-[#F2EBFB] ">
            <h2 className="text-2xl font-bold mb-4 text-center text-[#9667E0]  ">Add New Subject</h2>
            <input
              type="text"
              value={newSubjectTitle}
              onChange={(e) => setNewSubjectTitle(e.target.value)}
              placeholder="Subject Title"
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
                onClick={handleAddSubject}
                className="px-4 py-2 bg-[#9667E0] text-white rounded-lg"
              >
                Add Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subject;
