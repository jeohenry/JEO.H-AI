import React from 'react';
import classNames from 'classnames';

export const Input = ({
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  className = ''
}) => {
  return (
    <input
      name={name}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className={classNames(
        'w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 transition-all',
        className
      )}
    />
  );
};