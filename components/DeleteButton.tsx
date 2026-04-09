'use client';

interface Props {
  message?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function DeleteButton({ message = 'Are you sure? This cannot be undone.', className, style, children }: Props) {
  return (
    <button
      type="submit"
      className={className}
      style={style}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
