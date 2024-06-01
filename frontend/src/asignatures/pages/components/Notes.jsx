import React, { useState } from 'react';

const Notes = ({ notes, onBackToDates, onDelete, onAddNote }) => {
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
          <li key={note.id}>
            <a href={note.url} className="text-[#9667E0]">{note.content}</a>
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
      <button className="text-blue-500 mt-4 flex items-center" onClick={onBackToDates}>
        Dates <span className="ml-2 text-[#9667E0]">{`➔`}</span>
      </button>
      <button onClick={onBackToDates} className="text-[#9667E0] mt-2">
        <span className="text-[#9667E0]">{`◀`}</span> Back to Dates
      </button>
    </div>
  );
};

export default Notes;
