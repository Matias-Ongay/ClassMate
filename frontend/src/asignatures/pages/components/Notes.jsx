import React, { useState } from 'react';

const Notes = ({ notes, onBackToDates, onDelete, onAddNote, onDeleteNote }) => {
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote);
      setNewNote('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[#9667E0] text-[20px] font-bold">Notes and URLs</h3>
        <button onClick={onDelete} className="text-red-500">
          ❌
        </button>
      </div>
      <ul className="mb-4">
        {notes.map(note => (
          <li key={note.id} className="flex justify-between items-center">
            <a href={note.url} className="text-[#9667E0]">{note.content}</a>
            <button onClick={() => onDeleteNote(note.id)} className="text-red-500">
              ❌
            </button>
          </li>
        ))}
      </ul>
      <textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Add a new note or URL"
        className="w-full px-4 py-2 border-1-[#9667E0] rounded-lg mb-4"
      />
      <button onClick={handleAddNote} className="px-4 py-2 bg-[#9667E0] text-white rounded-lg mb-4">
        Add Note
      </button>
      <div className="flex justify-between">
        <button onClick={onBackToDates} className="text-[#9667E0]">
          <span className="text-[#9667E0]">{`◀`}</span> Back to Dates
        </button>
      </div>
    </div>
  );
};

export default Notes;
