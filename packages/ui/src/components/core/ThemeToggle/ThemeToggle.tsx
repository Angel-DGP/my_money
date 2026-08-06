
import { Button } from '../Button';
import { Icon } from '../Icon';

export type Theme = 'dark' | 'light' | 'system';

export interface ThemeToggleProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  className?: string;
}

export function ThemeToggle({ theme, onThemeChange, className }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Icon
        name={isDark ? 'sun' : 'moon'}
        size="sm"
        className="text-text-secondary hover:text-text-primary transition-colors"
      />
    </Button>
  );
}
