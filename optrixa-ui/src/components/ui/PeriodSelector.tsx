import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import type { Period } from '../../hooks/useDateRange';

interface Props {
  value: Period;
  onChange: (period: Period) => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (val: string) => void;
  onCustomToChange: (val: string) => void;
  label: string;
}

const presets: { value: Period; label: string }[] = [
  { value: 'today',    label: 'Today'         },
  { value: 'week',     label: 'Last 7 Days'   },
  { value: 'month',    label: 'This Month'    },
  { value: '3months',  label: 'Last 3 Months' },
  { value: '6months',  label: 'Last 6 Months' },
  { value: 'year',     label: 'This Year'     },
  { value: 'custom',   label: 'Custom Range'  },
];

const PeriodSelector = ({
  value,
  onChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  label,
}: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
      >
        <Calendar size={15} className="text-indigo-500" />
        <span>{label}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">

          {/* Preset Options */}
          <div className="p-2">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide px-2 py-1.5">
              Quick Select
            </div>
            <div className="grid grid-cols-2 gap-1">
              {presets.filter(p => p.value !== 'custom').map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    onChange(preset.value);
                    setOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    value === preset.value
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mx-3" />

          {/* Custom Range */}
          <div className="p-3">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Custom Range
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  From
                </label>
                <input
                  type="date"
                  className="input text-sm"
                  value={customFrom}
                  max={customTo || undefined}
                  onChange={(e) => {
                    onCustomFromChange(e.target.value);
                    onChange('custom');
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  To
                </label>
                <input
                  type="date"
                  className="input text-sm"
                  value={customTo}
                  min={customFrom || undefined}
                  onChange={(e) => {
                    onCustomToChange(e.target.value);
                    onChange('custom');
                  }}
                />
              </div>
              {customFrom && customTo && (
                <button
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full text-sm py-2"
                >
                  Apply Range
                </button>
              )}
            </div>
          </div>

          {/* Clear custom */}
          {value === 'custom' && (
            <div className="px-3 pb-3">
              <button
                onClick={() => {
                  onCustomFromChange('');
                  onCustomToChange('');
                  onChange('month');
                  setOpen(false);
                }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear custom range
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PeriodSelector;