// src/components/music/ThemeSwitcher.tsx

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2">
      <Button onClick={() => setTheme('light')}>Light</Button>
      <Button onClick={() => setTheme('dark')}>Dark</Button>
      <Button onClick={() => setTheme('music')}>🎧 Music Theme</Button>
    </div>
  );
};

export default ThemeSwitcher;