import { iconRegistry, type IconName } from './registry';

export interface IconProps {
  /** The name of the icon from the registry */
  name: IconName;
  /** Size scale */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** If true, the icon is hidden from screen readers. If false, `title` should be provided. */
  decorative?: boolean;
  /** Accessible title for screen readers if the icon is not decorative */
  title?: string;
  /** Optional additional classes */
  className?: string;
}

const sizeMap = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
};

export const Icon = ({
  name,
  size = 'md',
  decorative = true,
  title,
  className,
}: IconProps) => {
  const LucideIcon = iconRegistry[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in registry.`);
    return null;
  }

  return (
    <LucideIcon
      size={sizeMap[size]}
      className={className}
      aria-hidden={decorative}
      aria-label={!decorative ? title : undefined}
    />
  );
};
