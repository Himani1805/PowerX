import { useState } from 'react';
import { Link } from 'react-router-dom';
import LeadList from '../features/leads/LeadList';
import LeadForm from '../features/leads/LeadForm';

const LeadsPage = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leads Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          {showForm ? 'View Leads' : 'Add New Lead'}
        </button>
      </div>

      {showForm ? <LeadForm /> : <LeadList />}
    </div>
  );
};

export default LeadsPage;