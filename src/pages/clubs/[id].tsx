import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getClubById, Club,
  getClubMembers, ClubMember,
  getClubContentRequests, ContentRequest,
  User, // Make sure User type is robustly defined in api.ts
  RoleType // Import RoleType if needed for explicit role checks in UI, though deps.py handles API auth
} from '../../lib/api';
// import { useAuth } from '../../contexts/AuthContext'; // For real auth

// Mock user context for determining role-based UI elements and API calls
// Change this to test different views:
// const CURRENT_USER_MOCK_EMAIL = 'user@example.com'; // Regular user
// const CURRENT_USER_MOCK_EMAIL = 'admin@example.com'; // Admin user
const CURRENT_USER_MOCK_EMAIL = 'manager_club1@example.com'; // Manager of Club 1
// const CURRENT_USER_MOCK_EMAIL = 'manager_club2@example.com'; // Manager of Club 2 (to test non-manager view for club 1)


const ClubDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const clubId = parseInt(id || '0', 10);

  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [requests, setRequests] = useState<ContentRequest[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // const { user, isLoading: authLoading } = useAuth(); // Real auth context

  // Mock user object based on CURRENT_USER_MOCK_EMAIL
  // This helps simulate the structure of a user object that might come from useAuth()
  // The actual authorization is handled by the backend via X-User-Email header set by fetchApi.
  // This mockUser is primarily for UI conditional rendering.
  const mockUser = {
    email: CURRENT_USER_MOCK_EMAIL,
    // Simulate roles based on email for UI logic.
    // This should align with how MOCK_USERS_DB in deps.py is structured for roles.
    roles: (() => {
      if (CURRENT_USER_MOCK_EMAIL === 'admin@example.com') return [{ role_type: RoleType.ADMIN }];
      if (CURRENT_USER_MOCK_EMAIL === 'superadmin@example.com') return [{ role_type: RoleType.SUPER_ADMIN }];
      if (CURRENT_USER_MOCK_EMAIL === 'manager_club1@example.com' && clubId === 1) return [{ role_type: RoleType.CLUB_MANAGER, club_id: 1 }];
      if (CURRENT_USER_MOCK_EMAIL === 'manager_club2@example.com' && clubId === 2) return [{ role_type: RoleType.CLUB_MANAGER, club_id: 2 }];
      return [{ role_type: RoleType.USER }];
    })()
  };

  const isClubManager = mockUser.roles.some(
    (role: any) => role.role_type === RoleType.CLUB_MANAGER && role.club_id === clubId
  );
  const isAdmin = mockUser.roles.some((role: any) => role.role_type === RoleType.ADMIN || role.role_type === RoleType.SUPER_ADMIN);

  useEffect(() => {
    if (!clubId || isNaN(clubId)) {
      setError('Invalid club ID provided.');
      setIsLoading(false);
      return;
    }

    const fetchClubData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Pass undefined for token, and CURRENT_USER_MOCK_EMAIL for mockUserEmail
        const clubDetails = await getClubById(clubId, undefined, CURRENT_USER_MOCK_EMAIL);
        setClub(clubDetails);

        const clubMembers = await getClubMembers(clubId, undefined, CURRENT_USER_MOCK_EMAIL);
        setMembers(clubMembers);

        if (isAdmin || isClubManager) {
          const clubRequests = await getClubContentRequests(clubId, undefined, CURRENT_USER_MOCK_EMAIL);
          setRequests(clubRequests);
        } else {
          setRequests([]); // Clear requests if user is not authorized for them
        }

      } catch (err) {
        console.error('Failed to fetch club details:', err);
        const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to load club data. ${errorMsg}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubData();
  }, [clubId, isAdmin, isClubManager]); // Dependencies for re-fetching

  // if (authLoading) return <div className="text-center p-8">Authenticating...</div>;

  if (isLoading) {
    return <div className="text-center p-8 text-xl">Loading club details...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-md">{error}</div>;
  }

  if (!club) {
    return <div className="text-center p-8 text-xl">Club not found.</div>;
  }

  const defaultLogo = 'https://via.placeholder.com/400x200/E0E0E0/B0B0B0?Text=Club+Logo';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden">
        <img
          src={club.logo || defaultLogo}
          alt={`${club.name} logo`}
          className="w-full h-56 sm:h-72 md:h-96 object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = defaultLogo; (e.target as HTMLImageElement).onerror = null; }}
        />
        <div className="p-6 md:p-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3">{club.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">Last updated: {new Date(club.updated_at || club.created_at).toLocaleDateString()}</p>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p>{club.description || 'No description provided.'}</p>
          </div>

          {club.contact_info && (
            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Contact Information</h2>
              <p className="text-gray-700 dark:text-gray-300">{club.contact_info}</p>
            </div>
          )}

          {(isAdmin || isClubManager) && (
            <div className="mb-8 flex flex-wrap gap-3">
              <Link
                to={`/admin/clubs/edit/${club.id}`} // TODO: Define this route for admin club editing
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:shadow-lg transition-all"
              >
                Edit Club Info
              </Link>
              <Link
                to={`/club-dashboard/${club.id}/members`} // TODO: Define this route for club dashboard member management
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:shadow-lg transition-all"
              >
                Manage Members
              </Link>
              <Link
                to={`/club-dashboard/${club.id}/requests/new`} // TODO: Define this route for submitting new content request
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:shadow-lg transition-all"
              >
                New Content Request
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">
                Members <span className="text-lg font-normal text-gray-500 dark:text-gray-400">({members.length})</span>
              </h2>
              {members.length > 0 ? (
                <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {members.map(member => (
                    <li key={member.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors">
                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        {member.user?.full_name || member.user?.email || `User ID: ${member.user_id}`}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2 capitalize">({member.role})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No members currently listed for this club.</p>
              )}
            </div>

            {(isAdmin || isClubManager) && ( // Content requests section only for authorized users
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">
                  Content Requests <span className="text-lg font-normal text-gray-500 dark:text-gray-400">({requests.length})</span>
                </h2>
                {requests.length > 0 ? (
                  <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {requests.map(req => (
                      <li key={req.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center">
                           <p className="font-medium text-gray-800 dark:text-gray-100">Request ID: {req.id}</p>
                           <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                             req.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' :
                             req.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100' :
                             'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100'
                           }`}>{req.status}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Event Data: {JSON.stringify(req.event_data).substring(0,50)}...</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Submitted: {new Date(req.submitted_at).toLocaleDateString()}</p>
                        {req.reviewed_at && <p className="text-xs text-gray-500 dark:text-gray-400">Reviewed: {new Date(req.reviewed_at).toLocaleDateString()}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No content requests found for this club.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetailPage;
