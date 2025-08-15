import React from 'react';

const FilterBar = () => {
  // The filtering logic will be added in a later stage.
  // This component is currently for UI layout purposes.

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Date Range Selector */}
        <div className="col-span-1">
          <label htmlFor="date-range" className="block text-sm font-medium text-gray-700">
            Date Range
          </label>
          <input
            type="date"
            id="date-range"
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Location/Neighborhood Input */}
        <div className="col-span-1">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location / Neighborhood
          </label>
          <input
            type="text"
            id="location"
            placeholder="e.g., Mission District"
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Ticket Available Toggle */}
        <div className="col-span-1 flex items-end">
            <div className="flex items-center">
                <input
                    id="tickets-available"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="tickets-available" className="ml-2 block text-sm text-gray-900">
                    Ticket Available
                </label>
            </div>
        </div>

        {/* Apply Filter Button */}
        <div className="col-span-1 flex items-end">
          <button
            className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
