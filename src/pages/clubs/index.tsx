import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClubs, Club } from '../../lib/api'; // Club type is exported from api.ts
import ClubCard from '../../components/ClubCard';
// import { useAuth } from '../../contexts/AuthContext'; // Assuming an AuthContext exists

// Mock user context for now. In a real app, this would come from AuthContext or similar.
// This email will be passed as 'X-User-Email' by fetchApi if mockUserEmail param is provided.
// The backend deps.py uses this header to simulate an authenticated user.
const MOCK_CURRENT_USER_EMAIL_FOR_API = 'admin@example.com'; // For fetching data as admin
// const MOCK_CURRENT_USER_EMAIL_FOR_API = 'user@example.com'; // For fetching data as regular user

// This email is for UI elements (e.g. show/hide "Create Club" button)
// It might be the same as above, or derived differently (e.g. from a decoded JWT in a real app)
const MOCK_UI_USER_ROLE_EMAIL = 'admin@example.com'; // UI behavior as admin
// const MOCK_UI_USER_ROLE_EMAIL = 'user@example.com'; // UI behavior as non-admin


const ClubsListPage = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const { user, isLoading: authLoading } = useAuth(); // Later, use actual user from context

  // Determine isAdmin based on the MOCK_UI_USER_ROLE_EMAIL for UI elements.
  // This logic would ideally use the user object from AuthContext.
  const isAdmin = MOCK_UI_USER_ROLE_EMAIL === 'admin@example.com' || MOCK_UI_USER_ROLE_EMAIL === 'superadmin@example.com';

  useEffect(() => {
    const fetchClubsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Pass the MOCK_CURRENT_USER_EMAIL_FOR_API to getClubs.
        // This email is used by `fetchApi` to set the `X-User-Email` header for mock backend auth.
        // If the /clubs endpoint is public and doesn't strictly need auth for GET,
        // MOCK_CURRENT_USER_EMAIL_FOR_API can be undefined.
        // However, our backend's mock deps currently rely on X-User-Email to identify ANY user.
        const fetchedClubs = await getClubs(MOCK_CURRENT_USER_EMAIL_FOR_API);
        setClubs(fetchedClubs.filter(club => club.is_active)); // Filter for active clubs on frontend
      } catch (err) {
        console.error('Failed to fetch clubs:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching clubs.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubsData();
  }, []); // Empty dependency array means this effect runs once on mount

  // if (authLoading) { // If using a real AuthContext
  //   return <div className="text-center p-8">Authenticating...</div>;
  // }

  if (isLoading) {
    return <div className="text-center p-8">Loading clubs...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-md">Error fetching clubs: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">Discover Clubs</h1>
        {isAdmin && ( // Show button only if user is admin (based on mock UI role)
          <Link
            to="/admin/clubs/create" // TODO: Ensure this route exists or adjust as needed
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
          >
            Create New Club
          </Link>
        )}
      </div>

      {clubs.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400 text-xl">
          No active clubs found at the moment.
          {isAdmin && " Why not create one?"}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {clubs.map(club => (
            <ClubCard
              key={club.id}
              id={club.id}
              name={club.name}
              description={club.description}
              logo={club.logo}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubsListPage;
