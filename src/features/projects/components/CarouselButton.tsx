import { BUTTON_STYLES } from '@/shared/styles/shared';

interface CarouselButtonProps {
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled?: boolean;
}

export function CarouselButton({
  direction,
  onClick,
  disabled
}: CarouselButtonProps): React.JSX.Element {
  const label = direction === 'prev' ? 'Previous project' : 'Next project';
  const icon = direction === 'prev' ? '<' : '>';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${BUTTON_STYLES.carousel} p-2 disabled:hover:bg-transparent disabled:active:bg-transparent`}
      aria-label={label}
      type="button"
    >
      <span className="pointer-events-none text-xl transition-transform duration-200 hover:scale-110 md:text-2xl">
        {icon}
      </span>
    </button>
  );
}
