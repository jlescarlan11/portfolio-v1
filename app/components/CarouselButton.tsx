interface CarouselButtonProps {
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled?: boolean;
}

export function CarouselButton({ direction, onClick, disabled }: CarouselButtonProps) {
  const label = direction === 'prev' ? 'Previous project' : 'Next project';
  const icon = direction === 'prev' ? '‹' : '›';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative z-10
        flex items-center justify-center
        bg-transparent
        text-white
        transition-all duration-300
        disabled:opacity-30 disabled:cursor-not-allowed
        cursor-pointer
        select-none
        p-2
        rounded-full
        hover:bg-white/10
        active:bg-white/20
        focus:outline-none focus:ring-2 focus:ring-white/50
        disabled:hover:bg-transparent
        disabled:active:bg-transparent
      `}
      aria-label={label}
      type="button"
    >
      <span className="text-xl md:text-2xl pointer-events-none transition-transform duration-200 hover:scale-110">
        {icon}
      </span>
    </button>
  );
}

