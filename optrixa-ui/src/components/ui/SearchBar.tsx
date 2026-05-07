import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...'
}: Props) => {
  return (
    <div className="relative max-w-xs">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input pl-9 pr-8"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;