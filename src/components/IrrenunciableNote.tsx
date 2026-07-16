interface Props {
  irrenunciable: boolean;
  className?: string;
}

/**
 * Explica qué significa "Irrenunciable" donde sea que aparezca ese badge,
 * en vez de dejarlo como una palabra sin contexto para quien no conoce el
 * término legal.
 */
export function IrrenunciableNote({ irrenunciable, className = "" }: Props) {
  if (!irrenunciable) return null;
  return (
    <p className={`text-2xs text-ink-faint ${className}`}>
      Irrenunciable: el comercio debe permanecer cerrado ese día.
    </p>
  );
}
