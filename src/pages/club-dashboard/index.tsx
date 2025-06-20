import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getClubById, Club,
  getUserRoles, // UserRole type is implicitly handled by the return type of getUserRoles
  User,
  getClubContentRequests, ContentRequest,
  RoleType
} from '../../lib/api';

// Mock user context
// const MOCK_CURRENT_USER_EMAIL_FOR_API = 'user@example.com'; // Not a manager
const MOCK_CURRENT_USER_EMAIL_FOR_API = 'manager_club1@example.com'; // Manages Club ID 1 (User ID 103 from deps.py)
// const MOCK_CURRENT_USER_EMAIL_FOR_API = 'admin@example.com'; // Admin (User ID 101 from deps.py)
// const MOCK_CURRENT_USER_EMAIL_FOR_API = 'superadmin@example.com'; // SuperAdmin (User ID 102 from deps.py)


// Mock user data to get ID (in a real app, this comes from auth context)
// This needs to align with IDs used in MOCK_USERS_DB in backend/app/api/deps.py for relationships to work.
const MOCK_USERS_DATA: { [email: string]: Pick<User, 'id' | 'email' | 'full_name'> } = {
  'user@example.com': { id: 104, email: 'user@example.com', full_name: 'Regular User' },
  'manager_club1@example.com': { id: 103, email: 'manager_club1@example.com', full_name: 'Club Manager One' },
  'admin@example.com': { id: 101, email: 'admin@example.com', full_name: 'Admin User' },
  'superadmin@example.com': {id: 102, email: "superadmin@example.com", full_name: "Super Admin"}
};
const currentUserMockData = MOCK_USERS_DATA[MOCK_CURRENT_USER_EMAIL_FOR_API];

const ClubDashboardPage = () => {
  const [managedClub, setManagedClub] = useState<Club | null>(null);
  const [clubRequests, setClubRequests] = useState<ContentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const { user, isLoading: authLoading } = useAuth(); // Real auth context

  useEffect(() => {
    if (!currentUserMockData) {
      setError("Mock user data not found for email: " + MOCK_CURRENT_USER_EMAIL_FOR_API + ". Please check MOCK_USERS_DATA.");
      setIsLoading(false);
      return;
    }
    const currentUserId = currentUserMockData.id;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch user's roles using their ID and email for mock auth
        const roles = await getUserRoles(currentUserId, undefined, MOCK_CURRENT_USER_EMAIL_FOR_API);

        const managerRole = roles.find(role => role.role_type === RoleType.CLUB_MANAGER && role.club_id != null);
        const isAdminOrSuperAdmin = roles.some(role => role.role_type === RoleType.ADMIN || role.role_type === RoleType.SUPER_ADMIN);

        if (managerRole && managerRole.club_id) {
          const clubDetails = await getClubById(managerRole.club_id, undefined, MOCK_CURRENT_USER_EMAIL_FOR_API);
          setManagedClub(clubDetails);
          // Fetch requests only if a club is managed
          const requests = await getClubContentRequests(managerRole.club_id, undefined, MOCK_CURRENT_USER_EMAIL_FOR_API);
          setClubRequests(requests);
        } else if (isAdminOrSuperAdmin) {
          setError("This dashboard is for Club Managers. Admins/SuperAdmins should use specific admin panels.");
          setManagedClub(null);
        } else {
          setManagedClub(null); // No club managed or user has no specific club manager role
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  // Important: Empty dependency array if currentUserMockData won't change during component lifecycle.
  // If it could change (e.g. user logs out and another logs in without full page reload), add dependencies.
  }, []);

  // if (authLoading) { return <div className="text-center p-8">Authenticating...</div>; }

  if (isLoading) {
    return <div className="text-center p-8 text-xl">Loading dashboard...</div>;
  }

  if (error) { // Error specific to dashboard loading
    return <div className="text-center p-8 text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-md">{error}</div>;
  }

  if (!managedClub) { // User is not a manager of any specific club
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Club Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          You are not currently assigned as a manager for any specific club.
          If you believe this is an error, please contact an administrator.
        </p>
        <Link to="/clubs" className="mt-6 inline-block text-indigo-600 dark:text-indigo-400 hover:underline text-lg">
          Browse Clubs
        </Link>
      </div>
    );
  }

  const defaultLogo = 'https://via.placeholder.com/150/E0E0E0/B0B0B0?Text=Club+Logo';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">Club Dashboard</h1>
        <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">Managing: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{managedClub.name}</span></p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Club Info Card (Column 1) */}
        <div className="md:col-span-1 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 flex flex-col items-center">
          <img
             src={managedClub.logo || defaultLogo}
             alt={`${managedClub.name} logo`}
             className="w-36 h-36 object-cover rounded-full mb-5 border-4 border-gray-200 dark:border-gray-700 shadow-md"
             onError={(e) => { (e.target as HTMLImageElement).src = defaultLogo; (e.target as HTMLImageElement).onerror = null;}}
           />
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">{managedClub.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-5 line-clamp-3">{managedClub.description || "No description available."}</p>
          <Link
            to={`/clubs/${managedClub.id}`}
            className="block w-full text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold py-2.5 px-4 rounded-lg transition-colors"
          >
            View Public Page
          </Link>
        </div>

        {/* Management Actions Card (Column 2) */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Management Tools</h2>
          <div className="space-y-4">
            <Link
              to={`/club-dashboard/edit/${managedClub.id}`} // TODO: Define this route
              className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              {/* Icon (optional, replace with actual icon component) */}
              <span>&#x270E;</span> {/* Pencil icon */}
              <span className="ml-2">Edit Club Details</span>
            </Link>
            <Link
              to={`/club-dashboard/members/${managedClub.id}`} // TODO: Define this route
              className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              <span>&#x1F465;</span> {/* Users icon */}
              <span className="ml-2">Manage Members</span>
            </Link>
            <Link
              to={`/club-dashboard/requests/new/${managedClub.id}`} // TODO: Define this route
              className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              <span>&#x2709;&#xFE0F;</span> {/* Envelope icon */}
              <span className="ml-2">Submit New Content Request</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Content Requests Table (Full Width Below) */}
      <div className="mt-12 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6">
         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Content Requests</h2>
         {clubRequests.length > 0 ? (
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
               <thead className="bg-gray-50 dark:bg-gray-700/50">
                 <tr>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Event/Title</th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submitted</th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reviewed</th>
                 </tr>
               </thead>
               <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                 {clubRequests.slice(0, 5).map(req => (
                   <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors">
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                       {(typeof req.event_data === 'object' && req.event_data?.title) ? req.event_data.title : 'Event Data (JSON)'}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                       <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                           req.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
                           req.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' :
                           'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
                         }`}>{req.status}</span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(req.submitted_at).toLocaleDateString()}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{req.reviewed_at ? new Date(req.reviewed_at).toLocaleDateString() : 'N/A'}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         ) : (
           <p className="text-gray-500 dark:text-gray-400 italic">No content requests found for this club.</p>
         )}
         {clubRequests.length > 5 && (
             <Link
                 to={`/clubs/${managedClub.id}/requests`} // TODO: Define this route for all club requests
                 className="mt-6 inline-block text-indigo-600 dark:text-indigo-400 hover:underline"
             >
                 View All Content Requests...
             </Link>
         )}
      </div>
    </div>
  );
};

export default ClubDashboardPage;
