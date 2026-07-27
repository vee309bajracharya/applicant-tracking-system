import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => (
  <div className="relative">
    <Search size={16} className="absolute left-3 top-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full border border-box-outline rounded-lg px-8 py-2 focus:outline-none"
    />
  </div>
);

export default SearchBar;
