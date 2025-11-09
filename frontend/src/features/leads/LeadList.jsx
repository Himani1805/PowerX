import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLeads, selectAllLeads, selectLeadsStatus, selectLeadsError } from './leadsSlice';

const LeadList = () => {
  const dispatch = useDispatch();
  const leads = useSelector(selectAllLeads);
  const status = useSelector(selectLeadsStatus);
  const error = useSelector(selectLeadsError);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchLeads());
    }
  }, [status, dispatch]);

  if (status === 'loading') {
    return <div>Loading leads...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Leads</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Company</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{lead.name}</td>
                <td className="py-2 px-4 border">{lead.company}</td>
                <td className="py-2 px-4 border">{lead.email}</td>
                <td className="py-2 px-4 border">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    lead.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="py-2 px-4 border">
                  <button className="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                  <button className="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadList;