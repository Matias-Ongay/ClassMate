import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../../../ui/components/Header';
import Navbar from '../../../ui/components/Navbar';
import bookIcon from '../assets/Book.png';
import ImportantDates from '../components/ImportantDates';
import Notes from '../components/Notes';

const Subject = () => {
  const [subjects, setSubjects] = useState([]);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [examDates, setExamDates] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState([]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8080/get_subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchExamDates = async (subjectId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8080/get_exam_dates/${subjectId}`);
      setExamDates(response.data);
    } catch (error) {
      console.error('Error fetching exam dates:', error);
    }
  };

  const fetchNotes = async (subjectId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8080/get_notes/${subjectId}`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const addImportantDate = async (newDate) => {
    try {
      await axios.post(`http://127.0.0.1:8080/add_exam_date`, {
        subject_id: currentSubject.id,
        date: newDate,
      });
      fetchExamDates(currentSubject.id); // Refresh the list of dates
    } catch (error) {
      console.error('Error adding date:', error);
    }
  };

  const addNote = async (newNote) => {
    try {
      await axios.post(`http://127.0.0.1:8080/add_note`, {
        subject_id: currentSubject.id,
        content: newNote,
      });
      fetchNotes(currentSubject.id); // Refresh the list of notes
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAddSubject = async () => {
    try {
      await axios.post('http://127.0.0.1:8080/add_subject', { name: newSubjectTitle });
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
      if (currentSubject && currentSubject.id === subjectId) {
        setCurrentSubject(null);
        setExamDates([]);
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  const handleSelectSubject = (subject) => {
    setCurrentSubject(subject);
    fetchExamDates(subject.id);
  };

  const handleShowNotes = (subjectId) => {
    setShowNotes(true);
    fetchNotes(subjectId);
  };

  const renderSubjects = () => {
    return subjects.map(subject => (
      <div key={subject.id} className="bg-white p-4 rounded-lg shadow-md mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src={bookIcon} alt="Book Icon" className="w-6 h-6 mr-2" />
          <span className="text-[#9667E0]" onClick={() => handleSelectSubject(subject)}>{subject.name}</span>
        </div>
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
        <h2 className="text-center text-[#9667E0] text-[30px] font-bold mb-4">Asignatures</h2>
        {renderSubjects()}
        {currentSubject && !showNotes && (
          <ImportantDates 
            examDates={examDates} 
            onDelete={() => handleDelete(currentSubject.id)} 
            onBackToList={() => setCurrentSubject(null)} 
            onShowNotes={() => handleShowNotes(currentSubject.id)}
            onAddDate={addImportantDate}
          />
        )}
        {currentSubject && showNotes && (
          <Notes 
            notes={notes} 
            onBackToDates={() => setShowNotes(false)} 
            onDelete={() => handleDelete(currentSubject.id)}
            onAddNote={addNote}
          />
        )}
      </div>
      <div className="p-4 mt-7 mr-3 ml-3 rounded-[10px] ">
        <button
          onClick={() => setShowModal(true)}
          className="w-full px-4 py-3 font-semibold text-white bg-[#9667E0] rounded-[10px] text-[#FBFAFF] mt-4 shadow-md"
        >
          Add Asignature
        </button>
      </div>

      <Navbar />

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ">
          <div className=" p-8 rounded-lg shadow-lg bg-[#F2EBFB] ">
            <h2 className="text-2xl font-bold mb-4 text-center text-[#9667E0]  ">Add New Asignature</h2>
            <input
              type="text"
              value={newSubjectTitle}
              onChange={(e) => setNewSubjectTitle(e.target.value)}
              placeholder="Asignature Title"
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
                Add Asignature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subject;
