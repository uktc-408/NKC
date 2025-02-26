import { FaSearch } from 'react-icons/fa';

export default function MobileSearchButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="nav-social-icon p-2 rounded-lg bg-gray-800/50 border border-cyan-500/20 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors flex items-center justify-center"
    >
      <FaSearch className="w-5 h-5" />
    </button>
  );
} 