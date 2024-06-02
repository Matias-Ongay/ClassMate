import React, { useState } from 'react';

const ImportantDates = ({ examDates, onDelete, onBackToList, onShowNotes, onAddDate }) => {
  const [newDate, setNewDate] = useState('');

  const handleAddDate = () => {
    if (newDate.trim()) {
      onAddDate(newDate);
      setNewDate('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[#9667E0] text-[20px] font-bold">Important Dates</h3>
        <button onClick={onDelete} className="text-red-500">
          ❌
        </button>
      </div>
      <ul className="mb-4">
        {examDates.map(date => (
          <li key={date.id} className="text-[#9667E0]">
            • {date.date}
          </li>
        ))}
      </ul>
      <textarea
        value={newDate}
        onChange={(e) => setNewDate(e.target.value)}
        placeholder="Add new important date"
        className="w-full px-4 py-2 border-1-[#9667E0] rounded-lg mb-4"
      />
      <button onClick={handleAddDate} className="px-4 py-2 bg-[#9667E0] text-white rounded-lg mb-4">
        Add Date
      </button>
      <div className="flex justify-between">
        <button onClick={onBackToList} className="text-[#9667E0] mt-2">
          <span className="text-[#9667E0]">{`◀`}</span> Back to list
        </button>
        <button className="text-[#9667E0] mt-4 flex items-center" onClick={onShowNotes}>
          Notes
          <span className="ml-2 text-[#9667E0]">{`➔`}</span> 
        </button>
      </div>
    </div>
  );
};

export default ImportantDates;
