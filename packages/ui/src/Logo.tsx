interface LogoProps {
  /** Ancho en píxeles o cualquier medida CSS. La altura se calcula sola. */
  width?: number | string;
  /** Color del lettering. Por defecto hereda el del contenedor. */
  color?: string;
  /** Color de la pata del símbolo. El azul de marca salvo en monocromo. */
  accent?: string;
  className?: string;
  title?: string;
}

/**
 * Logotipo ReSona. El símbolo hace de inicial, así que nunca se acompaña
 * del símbolo suelto: sería la R dos veces.
 */
export function Logo({
  width = 240,
  color = 'currentColor',
  accent = '#3D5AFE',
  className,
  title = 'ReSona',
}: LogoProps) {
  return (
    <svg
      viewBox="0 0 811.6 161"
      width={width}
      className={className}
      role="img"
      aria-label={title}
      style={{ display: 'block', height: 'auto' }}
    >
      <title>{title}</title>
      <path d="M 3.77 0 L 106.91 0 A 36.48 45.91 0 0 1 105.66 91.82 L 76.73 59.12 L 101.88 57.86 A 7.55 11.95 0 0 0 100.62 33.96 L 33.96 33.96 Z" fill={color} fillRule="evenodd" />
      <path d="M 151.1 88 C 151.1 58.7 168.4 43.4 196.2 43.4 H 233.2 C 260.8 43.4 274.4 59.2 274.4 84.8 V 108.3 H 181.3 C 182.7 120.9 189.5 126.7 203.4 126.7 H 270.3 L 266.1 149.7 H 201.9 C 168.2 149.7 151.1 131.3 151.1 102.6 Z M 181.4 85.1 H 245.2 V 83.5 C 245.2 71.8 238.2 65.9 225.5 65.9 H 201.4 C 188.6 65.9 182.1 72.2 181.4 85.1 Z M 287.1 127 H 370.1 C 381.1 127 389.1 131.5 393.3 140 C 385.4 153.9 371.8 160.7 351.7 160.7 H 287.1 Z M 310.4 34 C 299.8 34 292.3 37.3 287.2 43.9 C 291.5 15.9 313.4 0.5 349 0.5 H 410.6 V 34 Z M 310.7 39.5 C 315.5 44.8 322.4 49.2 333 54.8 L 387.5 83.9 C 402.3 91.7 410.1 102.8 410.1 115 C 410.1 125.1 406.6 133.4 400.4 141.4 C 397.9 133.8 392.4 127.8 382.9 123 L 309.7 86.1 C 293.8 78.1 286.9 68.5 286.9 56 C 286.9 47.5 294.8 41 310.7 39.5 Z M 425.1 87.5 C 425.1 58 440.7 43.4 468.4 43.4 H 503.6 C 531.2 43.4 546.6 58.1 546.6 87.5 V 106.5 C 546.6 136.1 531.2 150.2 503.6 150.2 H 468.4 C 440.7 150.2 425.1 136.1 425.1 106.5 Z M 455.1 88.2 V 105.8 C 455.1 120.2 462 126.9 476.5 126.9 H 495.3 C 509.9 126.9 517.1 120.2 517.1 105.8 V 88.2 C 517.1 73.7 509.9 66.3 495.3 66.3 H 476.5 C 462 66.3 455.1 73.7 455.1 88.2 Z M 558.1 43.5 H 589.8 V 52.2 C 598.8 46.2 609.2 43.1 623.5 43.1 H 637 C 662 43.1 675.6 57 675.6 82.7 V 149.8 H 645.8 V 89.7 C 645.8 75.4 639.8 69 626 69 H 612.1 C 596.8 69 589.8 76 589.8 91.4 V 149.7 H 558.1 Z M 700.1 43.3 H 766.9 C 796.3 43.3 811.6 57.4 811.6 84.4 V 149.5 H 723 C 699.2 149.5 686.6 136.7 686.6 117.4 V 115.9 C 686.6 96.2 699.2 85 723 85 H 781.1 V 82.2 C 781.1 71.7 775.1 66.7 762.8 66.7 H 694.9 Z M 727.1 105.4 C 718.3 105.4 714.5 109.1 714.5 116 V 117.1 C 714.5 123.8 718.3 126.8 727.1 126.8 H 781.1 V 105.4 Z" fill={color} fillRule="evenodd" />
      <path d="M 0 51.57 L 46.54 51.57 L 143.39 161 L 60 161 L 0 93.08 Z" fill={accent} fillRule="evenodd" />
    </svg>
  );
}

export default Logo;
