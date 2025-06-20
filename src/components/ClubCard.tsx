import React from 'react';
import { Link } from 'react-router-dom';

export interface ClubCardProps {
  id: number;
  name: string;
  description?: string | null;
  logo?: string | null;
}

const ClubCard: React.FC<ClubCardProps> = ({ id, name, description, logo }) => {
  const defaultLogo = 'https://via.placeholder.com/300x200/E0E0E0/B0B0B0?Text=Club+Logo'; // Placeholder with better dimensions

  return (
    <Link to={`/clubs/${id}`} className="block group transform transition-all duration-300 hover:scale-105">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden h-full flex flex-col">
        <img
          src={logo || defaultLogo}
          alt={`${name} logo`}
          className="w-full h-48 object-cover"
          onError={(e) => {
            // Type assertion to inform TypeScript this is an HTMLImageElement
            const target = e.target as HTMLImageElement;
            target.src = defaultLogo;
            target.onerror = null; // Prevent infinite loop if defaultLogo also fails
          }}
        />
        <div className="p-6 flex flex-col flex-grow">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
            {name}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm line-clamp-3 flex-grow">
            {description || 'No description available.'}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-indigo-600 dark:text-indigo-400 group-hover:underline">
              View Details &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ClubCard;
