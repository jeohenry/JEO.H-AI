import React from 'react';
import classNames from 'classnames';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  onClick,
  className = '',
  disabled = false,
  loading = false,
  icon = null,
  variant = 'solid',
  type = 'button'
}) => {
  const base =
    'inline-flex items-center gap-2 justify-center px-4 py-2 font-medium rounded-xl text-sm transition-all';

  const styles = {
    solid:
      'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600',
    outline:
      'border border-indigo-500 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-900'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classNames(
        base,
        styles[variant],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading && <Loader2 className="animate-spin w-4 h-4" />}
      {icon && !loading && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
};