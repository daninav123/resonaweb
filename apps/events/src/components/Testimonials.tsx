import { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Reveal } from './motion/Reveal';
import { TESTIMONIALS, Testimonial } from '../data/testimonials';

interface TestimonialsProps {
  filter?: Testimonial['type'];
  eyebrow?: string;
  title?: ReactNode;
  dark?: boolean;
}

const Testimonials = ({
  filter,
  eyebrow = 'Lo que cuentan',
  title,
  dark = true,
}: TestimonialsProps) => {
  const items = filter ? TESTIMONIALS.filter((t) => t.type === filter) : TESTIMONIALS;
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const x = useTransform(scrollYProgress, [0, 1], ['5%', '-40%']);

  const bg = dark ? 'bg-ink text-cream' : 'bg-cream text-ink';
  const accent = dark ? 'text-accent-300' : 'text-accent-500';
  const cardBorder = dark ? 'border-cream/15' : 'border-ink/15';
  const eyebrowColor = dark ? 'text-cream/60' : '';
  const mutedText = dark ? 'text-cream/70' : 'text-ink/70';

  return (
    <section ref={sectionRef} className={`py-28 md:py-40 ${bg} overflow-hidden`}>
      <div className="max-w-[1600px] mx-auto px-5 md:px-10">
        <div className="mb-14 md:mb-20">
          <Reveal>
            <span className={`eyebrow ${eyebrowColor}`}>{eyebrow}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 font-display text-display-md md:text-display-lg tracking-tighter text-balance max-w-[18ch]">
              {title ?? (
                <>
                  Las palabras que no<br />
                  caben en una <span className={`display-italic ${accent}`}>foto</span>.
                </>
              )}
            </h2>
          </Reveal>
        </div>
      </div>

      <motion.div
        ref={trackRef}
        style={{ x }}
        className="flex gap-5 md:gap-8 px-5 md:px-10 will-change-transform"
      >
        {items.map((t, i) => (
          <article
            key={i}
            className={`flex-shrink-0 w-[85vw] sm:w-[60vw] md:w-[42vw] lg:w-[32vw] border ${cardBorder} p-8 md:p-10 flex flex-col justify-between`}
          >
            <div className={`font-display text-4xl md:text-5xl leading-none ${accent}`}>“</div>
            <blockquote className="mt-6 font-display text-xl md:text-2xl leading-[1.25] tracking-tight">
              {t.quote}
            </blockquote>
            <div className="mt-8 pt-6 border-t border-current/10">
              <div className="font-medium">{t.author}</div>
              <div className={`mt-1 text-sm ${mutedText}`}>{t.context}</div>
            </div>
          </article>
        ))}
      </motion.div>
    </section>
  );
};

export default Testimonials;
