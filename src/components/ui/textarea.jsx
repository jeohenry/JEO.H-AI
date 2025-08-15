import React from 'react';
import classNames from 'classnames';

export const Textarea = ({
  name,
  value,
  onChange,
  placeholder = '',
  rows = 4,
  className = ''
}) => {
  return (
    <textarea
      name={name}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className={classNames(
        'w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 transition-all resize-none',
        className
      )}
    />
  );
};