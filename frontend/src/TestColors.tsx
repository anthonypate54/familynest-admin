import React from 'react';

const TestColors: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-green-600 mb-4">Color Test</h1>
      <div className="space-y-4">
        <div className="bg-green-600 text-white p-4 rounded">Green Background</div>
        <div className="bg-blue-500 text-white p-4 rounded">Blue Background</div>
        <div className="bg-red-500 text-white p-4 rounded">Red Background</div>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded">
          Green Button
        </button>
      </div>
    </div>
  );
};

export default TestColors;























