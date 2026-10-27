import Image from 'next/image';

interface SectionPhotoBackdropProps {
  src: string;
  /** CSS object-position — kam fotku při ořezu vycentrovat */
  position?: string;
  /** Barva sekce, do které fotka nahoře i dole plynule přechází */
  fadeTo: string;
}

/**
 * Fotka na pozadí horní části sekce (nadpis + tlačítko). Ztmavená, pod textem
 * ještě víc, a dole přechází do barvy sekce, aby rozbalený obsah zůstal na čistém pozadí.
 */
export default function SectionPhotoBackdrop({ src, position = 'center', fadeTo }: SectionPhotoBackdropProps) {
  return (
    <div
      className="absolute inset-x-0 top-0 h-full max-h-[620px] md:max-h-[720px] pointer-events-none overflow-hidden"
      aria-hidden
    >
      <Image src={src} alt="" fill sizes="100vw" className="object-cover" style={{ objectPosition: position }} />
      <div className="absolute inset-0 bg-black/55" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(0,0,0,0.55), transparent 75%)' }}
      />
      <div className="absolute inset-x-0 top-0 h-24" style={{ background: `linear-gradient(to bottom, ${fadeTo}, transparent)` }} />
      <div className="absolute inset-x-0 bottom-0 h-32" style={{ background: `linear-gradient(to top, ${fadeTo}, transparent)` }} />
    </div>
  );
}
