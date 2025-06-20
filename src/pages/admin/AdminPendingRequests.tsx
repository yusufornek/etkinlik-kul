import React, { useEffect, useState, useCallback } from 'react';
import {
  getPendingContentRequests, ContentRequest,
  approveContentRequest, rejectContentRequest
} from '../../lib/api';
// import { useAuth } from '../../contexts/AuthContext'; // For real auth

// Mock Admin User for API calls
const MOCK_ADMIN_EMAIL = 'admin@example.com'; // Or 'superadmin@example.com' if that's the test case

const AdminPendingRequestsPage = () => {
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null); // To show loading on specific item

  // const { user } = useAuth(); // Real auth context
  // const adminEmailForApi = user?.email || MOCK_ADMIN_EMAIL; // Use real user email when available

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Pass admin email for X-User-Email header via mockUserEmail param
      const pendingRequests = await getPendingContentRequests(undefined, MOCK_ADMIN_EMAIL);
      setRequests(pendingRequests);
    } catch (err) {
      console.error('Failed to fetch pending requests:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching requests.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (requestId: number, action: 'approve' | 'reject') => {
    setActionError(null);
    setProcessingId(requestId); // Indicate processing for this specific request
    try {
      if (action === 'approve') {
        await approveContentRequest(requestId, undefined, MOCK_ADMIN_EMAIL);
      } else {
        await rejectContentRequest(requestId, undefined, MOCK_ADMIN_EMAIL);
      }
      // Refresh list after action by removing the processed item
      setRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
    } catch (err) {
      console.error(`Failed to ${action} request ${requestId}:`, err);
      const errorMsg = err instanceof Error ? err.message : `An unknown error occurred while trying to ${action} the request.`;
      setActionError(errorMsg);
    } finally {
      setProcessingId(null); // Clear processing indicator
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xl">Loading pending requests...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-md">Error loading requests: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">Pending Content Requests</h1>

      {actionError && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 border border-red-300 dark:border-red-700 rounded-md">
          <p><span className="font-semibold">Action Error:</span> {actionError}</p>
        </div>
      )}

      {requests.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-lg text-center py-10">No pending content requests at this time.</p>
      ) : (
        <div className="space-y-6">
          {requests.map(req => (
            <div
              key={req.id}
              className={`bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 transition-opacity duration-300 ${processingId === req.id ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-col md:flex-row justify-between md:items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Request ID: <span className="font-mono">{req.id}</span>
                  </h2>
                  <p className="text-md text-gray-700 dark:text-gray-300">
                    Club: <span className="font-semibold">{req.club?.name || `ID ${req.club_id}`}</span>
                  </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 md:mt-0">
                  Submitted: {new Date(req.submitted_at).toLocaleString()}
                </p>
              </div>

              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mb-1">Event Data Preview:</h3>
                <pre className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300 max-h-48 overflow-y-auto p-2 bg-white dark:bg-gray-700 rounded scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {JSON.stringify(req.event_data, null, 2)}
                </pre>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleAction(req.id, 'approve')}
                  disabled={processingId === req.id}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:shadow-lg transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId === req.id ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleAction(req.id, 'reject')}
                  disabled={processingId === req.id}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:shadow-lg transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId === req.id ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPendingRequestsPage;
