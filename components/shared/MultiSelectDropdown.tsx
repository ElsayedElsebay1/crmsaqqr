import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon } from '../icons/SearchIcon';
import { XIcon } from '../icons/XIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface Option {
  id: string;
  name: string;
}

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = (id: string) => {
    const newSelected = selected.includes(id)
      ? selected.filter(item => item !== id)
      : [...selected, id];
    onChange(newSelected);
  };

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedOptions = options.filter(opt => selected.includes(opt.id));

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      <div className={`w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md focus-within:ring-2 focus-within:ring-[#00B7C1] transition-colors ${disabled ? 'bg-[#2C3E5F]/50 cursor-not-allowed' : ''}`}>
        <div className="flex flex-wrap gap-2 p-2">
            {selectedOptions.map(option => (
            <div key={option.id} className="flex items-center gap-1 bg-[#00B7C1]/20 text-[#5BE1E8] text-xs font-semibold px-2 py-1 rounded-full">
                <span>{option.name}</span>
                {!disabled && (
                    <button type="button" onClick={() => handleToggle(option.id)} className="text-[#5BE1E8]/70 hover:text-white">
                        <XIcon className="w-3 h-3" />
                    </button>
                )}
            </div>
            ))}
             <div className="flex-grow">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className="w-full flex justify-end items-center text-slate-400 disabled:cursor-not-allowed"
                    disabled={disabled}
                >
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </div>
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-[#1A2B4D] border border-[#3E527B] rounded-md shadow-lg">
          <div className="p-2">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input
                type="text"
                placeholder="ابحث عن خدمة..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#2C3E5F] border-none rounded-md py-2 pl-9 pr-3 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00B7C1]"
                />
            </div>
          </div>
          <ul className="max-h-48 overflow-y-auto p-2">
            {filteredOptions.map(option => (
              <li key={option.id}>
                <label className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-[#2C3E5F]">
                  <input
                    type="checkbox"
                    checked={selected.includes(option.id)}
                    onChange={() => handleToggle(option.id)}
                    className="w-4 h-4 text-[#00B7C1] bg-slate-600 border-slate-500 rounded focus:ring-offset-[#1A2B4D] focus:ring-[#00B7C1]"
                  />
                  <span className="text-sm">{option.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
