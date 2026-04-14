'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

const navItems: { href: string; key: string; external?: boolean }[] = [
  { href: '#story', key: 'nav.story' },
  { href: '#venue', key: 'nav.venue' },
  { href: '#accommodation', key: 'nav.accommodation' },
  { href: '#ceremony', key: 'nav.ceremony' },
  { href: '#rsvp', key: 'nav.rsvp' },
  { href: '#gallery', key: 'nav.gallery' },
  { href: '#wedding-party', key: 'nav.party' },
  { href: '#faq', key: 'nav.faq' },
  { href: '#guestbook', key: 'nav.guestbook' },
  { href: '/fotokoutek', key: 'nav.photobooth', external: true },
];

export default function Navbar() {
  const { t, locale, setLocale } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection('#' + entry.target.id);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const pathname = usePathname();
  const isSubpage = pathname !== '/';

  const resolveHref = (href: string) =>
    href.startsWith('#') && isSubpage ? `/${href}` : href;

  const toggleLang = () => {
    setLocale(locale === 'cs' ? 'en' : 'cs');
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#C9A96E]/10'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 2.8 }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <a
            href={resolveHref('#hero')}
            className="font-[family-name:var(--font-great-vibes)] text-2xl text-[#C9A96E] hover:text-[#D4AF37] transition-colors"
          >
            K & M
          </a>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={resolveHref(item.href)}
                  className={`text-xs tracking-[0.15em] uppercase transition-colors duration-300 ${
                    item.external
                      ? 'border border-[#C9A96E]/20 rounded-full px-3 py-1 hover:bg-[#C9A96E]/10 text-[#C9A96E]'
                      : activeSection === item.href
                        ? 'text-[#C9A96E]'
                        : 'text-[#B8A99A] hover:text-[#F5F0E8]'
                  }`}
                >
                  {t(item.key) as string}
                </a>
              </li>
            ))}
            <li>
              <button
                onClick={toggleLang}
                className="ml-2 text-xs tracking-[0.15em] uppercase text-[#C9A96E] border border-[#C9A96E]/30 px-3 py-1 rounded-full hover:bg-[#C9A96E]/10 transition-all"
              >
                {t('nav.langSwitch') as string}
              </button>
            </li>
          </ul>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex flex-col gap-1.5 p-2"
            aria-label="Menu"
          >
            <motion.span
              className="block h-[1px] w-6 bg-[#C9A96E]"
              animate={mobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
            />
            <motion.span
              className="block h-[1px] w-6 bg-[#C9A96E]"
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
            />
            <motion.span
              className="block h-[1px] w-6 bg-[#C9A96E]"
              animate={mobileOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-[#0A0A0A]/98 backdrop-blur-lg flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col items-center gap-6">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={resolveHref(item.href)}
                  onClick={() => setMobileOpen(false)}
                  className={`font-[family-name:var(--font-cormorant)] text-2xl tracking-wider transition-colors ${
                    activeSection === item.href ? 'text-[#C9A96E]' : 'text-[#F5F0E8]'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {t(item.key) as string}
                </motion.a>
              ))}
              <motion.button
                onClick={() => {
                  toggleLang();
                  setMobileOpen(false);
                }}
                className="mt-4 text-sm tracking-[0.2em] uppercase text-[#C9A96E] border border-[#C9A96E]/30 px-6 py-2 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('nav.langSwitch') as string}
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
