import React, { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  searchable?: boolean;
  name?: string;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Выберите...',
  className = '',
  triggerClassName = '',
  disabled = false,
  searchable,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openUpwards, setOpenUpwards] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; bottom: number }>({
    top: 0,
    left: 0,
    width: 0,
    bottom: 0,
  });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autoId = useId();
  const selectId = id || autoId;

  const isSearchable = searchable ?? options.length > 7;

  const filteredOptions = isSearchable && searchQuery
    ? options.filter((o) =>
        o.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.sublabel && o.sublabel.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : options;

  const selectedOption = options.find((o) => o.value === value);

  // Position calculation with collision detection
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = 320; // approximate max height
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const shouldOpenUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    setOpenUpwards(shouldOpenUpwards);

    setCoords({
      top: rect.top + window.scrollY,
      bottom: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
      setSearchQuery('');
      setFocusedIndex(options.findIndex((o) => o.value === value));
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen) updatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, isSearchable]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleToggle();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
        const option = filteredOptions[focusedIndex];
        onChange(option.value);
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-12 px-4 rounded-[14px] bg-white border border-[#DED9F5] text-sm font-bold text-[#17171C] flex items-center justify-between gap-2.5 transition-all outline-none hover:border-[#7047EB] focus:border-[#7047EB] focus:ring-4 focus:ring-[#7047EB]/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${triggerClassName}`}
      >
        <span className="truncate flex items-center gap-2 text-left">
          {selectedOption ? (
            <>
              {selectedOption.icon}
              <span className="truncate">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0ECFF] text-[#7047EB] font-black">
                  {selectedOption.badge}
                </span>
              )}
            </>
          ) : (
            <span className="text-[#8C93A4] font-medium">{placeholder}</span>
          )}
        </span>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 text-[#667085]"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Dropdown Menu in Portal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={dropdownRef}
                role="listbox"
                aria-labelledby={selectId}
                initial={{
                  opacity: 0,
                  y: openUpwards ? 6 : -6,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.98,
                  transition: { duration: 0.14 },
                }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute',
                  top: openUpwards
                    ? `${coords.top - 8}px`
                    : `${coords.bottom + 8}px`,
                  transform: openUpwards ? 'translateY(-100%)' : 'none',
                  left: `${coords.left}px`,
                  width: `${Math.max(coords.width, 240)}px`,
                  zIndex: 1000,
                }}
                className="bg-white rounded-2xl p-2 border border-[#E5E1F4] shadow-[0_12px_36px_rgba(23,23,28,0.12),0_4px_12px_rgba(112,71,235,0.08)] flex flex-col max-h-[320px] overflow-hidden"
              >
                {/* Search Header if searchable */}
                {isSearchable && (
                  <div className="p-1.5 pb-2 mb-1 border-b border-[#F0ECFF]">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C93A4]" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск варианта..."
                        className="w-full h-8 pl-8 pr-3 text-xs bg-[#F8F9FD] border border-[#E2E5EE] rounded-lg text-[#17171C] font-semibold focus:outline-none focus:border-[#7047EB]"
                      />
                    </div>
                  </div>
                )}

                {/* Options List with custom scrollbar */}
                <div className="overflow-y-auto custom-scrollbar flex-1 space-y-0.5 pr-1">
                  {filteredOptions.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#8C93A4] font-medium">
                      Ничего не найдено
                    </div>
                  ) : (
                    filteredOptions.map((opt, index) => {
                      const isSelected = opt.value === value;
                      const isFocused = index === focusedIndex;

                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelect(opt.value)}
                          onMouseEnter={() => setFocusedIndex(index)}
                          className={`w-full min-h-[42px] px-3 py-2 rounded-[10px] text-xs font-bold text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#F0ECFF] text-[#7047EB]'
                              : isFocused
                              ? 'bg-[#F8F9FD] text-[#17171C]'
                              : 'text-[#17171C] hover:bg-[#F8F9FD]'
                          }`}
                        >
                          <div className="min-w-0 flex-1 flex flex-col">
                            <div className="flex items-center gap-1.5 truncate">
                              {opt.icon}
                              <span className="truncate">{opt.label}</span>
                              {opt.badge && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-[#7047EB] font-bold border border-[#E2E5EE]">
                                  {opt.badge}
                                </span>
                              )}
                            </div>
                            {opt.sublabel && (
                              <span className="text-[10px] text-[#8C93A4] font-normal truncate mt-0.5">
                                {opt.sublabel}
                              </span>
                            )}
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-[#7047EB] shrink-0 stroke-[2.5]" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
