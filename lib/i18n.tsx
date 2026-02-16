'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Locale = 'cs' | 'en';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string | string[] | Record<string, unknown>[] | Record<string, unknown>;
}

const I18nContext = createContext<I18nContextType | null>(null);

/* eslint-disable @typescript-eslint/no-explicit-any */
const translations: Record<Locale, any> = {
  cs: {
    nav: {
      story: 'Náš příběh',
      ceremony: 'Obřad & Oslava',
      venue: 'Místo konání',
      rsvp: 'Potvrdit účast',
      gallery: 'Galerie',
      party: 'Svatební party',
      accommodation: 'Ubytování',
      gifts: 'Dary',
      faq: 'FAQ',
      guestbook: 'Nástěnka',
      photos: 'Vaše fotky',
      langSwitch: 'EN',
    },
    hero: {
      date: '29. srpna 2026',
      days: 'dní',
      hours: 'hodin',
      minutes: 'minut',
      seconds: 'sekund',
      cta: 'Zjistit více',
    },
    story: {
      title: 'Náš příběh',
      subtitle: 'Cesta, která nás spojila',
      chapters: [
        { date: 'Srpen 2020', title: 'Ostrov u Tisé — První setkání', text: 'Poprvé to bylo na letní verzi lezecké všehochuti v srpnu 2020.' },
        { date: '2020–2024', title: 'Roky setkávání ve skalách', text: 'Na letních a později i jarních a podzimních jsme se nepravidelně potkávali celé čtyři roky.' },
        { date: 'Duben 2024', title: 'Osudový Ostrov', text: 'Na malou chvíli se uvolnila židle vedle Klárky a Lindy. Michal ani na chvíli nezaváhal a sedl si mezi ně. Adam pronesl se svou neskrývanou racionalitou: „No tak Michale, Klárka je volná, ty už skoro taky, tak to dáte dohromady, ne?"' },
        { date: 'Květen 2024', title: 'Květnové svátky v Jablonci — První rande', text: 'Poprvé jsme s Klárkou vyrazili sami. Klárka mě vzala na burger do Qčka.' },
        { date: 'Květen 2024', title: 'Tajný výlet do Kutné Hory', text: 'Výlet, který byl zlomový pro Klárku. A to až tak, že mi po něm namalovala obrázek.' },
        { date: 'Červen 2024', title: 'Tajný výlet do Bordeaux', text: 'Výlet, který byl zlomový pro Michala. A to až tak, že se mu po něm začalo po klárce stýskat.' },
        { date: 'Červenec 2024', title: 'Poprvé v Hamburku', text: 'První návštěva tvého světa v Hamburku. Další krok na naší společné cestě, kde jsme se poznávali v novém prostředí.' },
        { date: 'Červenec 2024', title: 'Rozhodující výhled do Prokopského údolí', text: 'Michal měl krásný výhled na Klárku, Klárka výlíčila Michalovi svůj výhled na vztah, který si oba stvrdili souhlasem. A to celé nad nádherným výhledem do Prokopského údolí.' },
        { date: '2026', title: 'Zásnuby', text: 'A pak přišel ten moment… Moment, na který budu vzpomínat po zbytek života. Řekla jsi ANO!' },
      ],
    },
    ceremony: {
      title: 'Obřad & Oslava',
      subtitle: 'Harmonogram svatebního víkendu',
      dressCode: 'Dress Code: Formální elegance',
      dressCodeFriday: 'Dress Code: Pohodový casual',
      addToCalendar: 'Přidat do kalendáře',
      days: [
        {
          label: 'Pátek 28. srpna',
          subtitle: 'Seznámení & grilování',
          schedule: [
            { time: '14:00', event: 'Příjezd hostů', icon: '🚗', desc: 'Ubytování a přivítání v areálu Mlýna Davídkov' },
            { time: '14:00 – 16:00', event: 'Seznámení rodin & kamarádů', icon: '🤝', desc: 'Společný čas pro rodiny a přátele ze strany ženicha i nevěsty' },
            { time: '18:00', event: 'Společné grilování', icon: '🔥', desc: 'Neformální večeře v zahradě — grilované dobroty a dobrá nálada' },
            { time: '20:00', event: 'Večer s přáteli', icon: '🍻', desc: 'Ženich a nevěsta tráví čas se svými kamarády' },
          ],
        },
        {
          label: 'Sobota 29. srpna',
          subtitle: 'Svatební den',
          schedule: [
            { time: '13:00', event: 'Příjezd hostů', icon: '🚗', desc: 'Přivítání svatebních hostů v areálu' },
            { time: '14:00', event: 'Svatební obřad', icon: '💒', desc: 'Slavnostní slib lásky' },
            { time: '14:30', event: 'Gratulace & focení', icon: '📸', desc: 'Společné fotografie s novomanželi' },
            { time: '15:00', event: 'Koktejlová hodinka', icon: '🥂', desc: 'Aperitiv a občerstvení v zahradě' },
            { time: '16:00', event: 'Svatební hostina', icon: '🍽️', desc: 'Gastronomický zážitek' },
            { time: '18:00', event: 'Krájení dortu', icon: '🎂', desc: 'Sladký moment dne' },
            { time: '19:00', event: 'První tanec', icon: '💃', desc: 'Novomanželský tanec' },
            { time: '19:30', event: 'Volná zábava', icon: '🎶', desc: 'Hudba, tanec a smích' },
            { time: '00:00', event: 'Afterparty', icon: '🌙', desc: 'Noc je ještě mladá!' },
          ],
        },
      ],
    },
    venue: {
      title: 'Mlýn Davídkov',
      subtitle: 'Kouzelný resort mezi Prahou a Kutnou Horou',
      description: 'Malebný resort obklopený přírodou, kde se náš příběh stane nezapomenutelným. Absolutní soukromí, vynikající gastronomie a dechberoucí prostředí — přesně tam, kde chceme říci své ANO.',
      funFact: 'Je to stejně daleko z Plzně, Rakovníka, Jablonce nad Nisou i Českých Budějovic — osud si to tak naplánoval!',
      features: [
        { icon: '👥', title: 'Kapacita', desc: 'Až 250 hostů' },
        { icon: '🛏️', title: 'Ubytování', desc: '102 lůžek ve 3 budovách' },
        { icon: '🌿', title: 'Příroda', desc: 'Obklopeno malebným údolím' },
        { icon: '🚗', title: 'Dostupnost', desc: '40 min od Prahy' },
      ],
      address: 'Hryzely 36, 281 63 Barchovice-Zásmuky',
      navigate: 'Navigovat',
    },
    rsvp: {
      title: 'Potvrďte účast',
      subtitle: 'Dejte nám vědět, zda dorazíte',
      name: 'Vaše jméno',
      email: 'E-mail',
      attending: 'Zúčastním se',
      notAttending: 'Bohužel se nezúčastním',
      guestCount: 'Počet osob',
      children: 'Přijedou s vámi děti?',
      childrenCount: 'Počet dětí',
      menu: 'Preference menu',
      menuOptions: ['Bez preference', 'Maso', 'Ryba', 'Vegetariánské', 'Veganské'],
      allergies: 'Alergie / dietní omezení',
      songRequest: 'Jakou písničku musíme hrát?',
      songNever: 'Jakou písničku nesmíme hrát?',
      submit: 'Odeslat odpověď',
      successYes: 'Děkujeme! Těšíme se na vás!',
      successAlpacaSay: 'Alpaka říká: Těšíme se na vás!',
      successNo: 'Mrzí nás to! Budete nám chybět.',
      yes: 'Ano',
      no: 'Ne',
      step: 'Krok',
      of: 'z',
      next: 'Pokračovat',
      back: 'Zpět',
      attendance: 'Účast',
    },
    gallery: {
      title: 'Galerie',
      subtitle: 'Momenty, které nás definují',
    },
    weddingParty: {
      title: 'Svatební party',
      subtitle: 'Lidé, bez kterých by to nešlo',
      members: [
        { name: 'Jméno svědka', role: 'Svědek ženicha', bio: 'Nejlepší kamarád od dětství. Vždy připraven pomoci — i když ne vždy střízlivý.' },
        { name: 'Jméno svědkyně', role: 'Svědkyně nevěsty', bio: 'Sestra duší, se kterou sdílíme všechno — od tajemství po oblečení.' },
        { name: 'Jméno družičky', role: 'Družička', bio: 'Ta, co přinese úsměv do každé místnosti.' },
        { name: 'Jméno druhy', role: 'Druh', bio: 'Spolehlivý parťák na všechny životní dobrodružství.' },
      ],
    },
    accommodation: {
      title: 'Ubytování & Doprava',
      subtitle: 'Vše, co potřebujete vědět',
      buildings: [
        { name: 'Mlýn', desc: 'Hlavní budova — srdce resortu. 13 pokojů.', icon: '🏛️' },
        { name: 'Šalanda', desc: 'Naproti hlavní budově. 10 pokojů.', icon: '🏡' },
        { name: 'Vila Toyen', desc: 'Secesní vila naproti areálu. 5 pokojů.', icon: '🏰' },
      ],
      transport: {
        title: 'Jak se k nám dostat',
        car: 'Autem: GPS — Hryzely 36, 281 63 Barchovice-Zásmuky. Parkování zdarma v areálu.',
        public: 'MHD: Nejbližší vlak. stanice Zásmuky, poté taxi/shuttle.',
        note: 'Doporučujeme přijet den předem a užít si celý víkend!',
      },
    },
    gifts: {
      title: 'Dary',
      subtitle: 'Vaše přítomnost je pro nás ten největší dar',
      text: 'Pokud nás ale přesto chcete obdarovat, budeme rádi za příspěvek na naše společné dobrodružství — seznam přání či cestovní fond najdete níže.',
      cta: 'Přispět na cestovní fond',
    },
    faq: {
      title: 'Často kladené otázky',
      subtitle: 'Vše, co vás zajímá',
      questions: [
        { q: 'Jaký je dress code?', a: 'Formální elegance — pánové oblek, dámy koktejlové nebo dlouhé šaty. Pohodlná obuv doporučena — areál je v přírodě!' },
        { q: 'Mohu přivést děti?', a: 'Samozřejmě! Děti jsou vítány. Prosíme, uveďte je ve formuláři potvrzení účasti.' },
        { q: 'Kde zaparkuji?', a: 'Parkování je zdarma přímo v areálu Mlýna Davídkov.' },
        { q: 'Mohu přespat v areálu?', a: 'Ano! Mlýn Davídkov nabízí ubytování ve třech budovách s celkovou kapacitou 102 lůžek.' },
        { q: 'Kdy bych měl/a přijet?', a: 'Doporučujeme přijet v pátek 28. srpna, abyste si užili celý svatební víkend.' },
        { q: 'Bude dort?', a: 'A jaký! Nechte se překvapit.' },
        { q: 'Mohu nahrát fotky ze svatby?', a: 'Rozhodně! V sekci "Vaše fotky" můžete po svatbě nahrát všechny vaše záběry.' },
      ],
    },
    guestbook: {
      title: 'Nástěnka',
      subtitle: 'Pošlete nám vzkaz, fotku nebo vzpomínku',
      name: 'Vaše jméno',
      message: 'Váš vzkaz',
      photos: 'Připojte fotku (volitelné)',
      submit: 'Odeslat vzkaz',
      success: 'Děkujeme za váš vzkaz!',
      visibility: 'Viditelnost vzkazu',
      public: 'Veřejný',
      publicDesc: 'Zobrazí se na nástěnce pro všechny',
      private: 'Soukromý',
      privateDesc: 'Uvidí ho jen Michal & Klára',
    },
    weddingPhotos: {
      title: 'Vaše fotky ze svatby',
      subtitle: 'Sdílejte s námi vaše záběry z našeho velkého dne',
      name: 'Vaše jméno',
      upload: 'Vybrat fotky',
      dragDrop: 'Přetáhněte fotky sem nebo klikněte',
      submit: 'Nahrát fotky',
      success: 'Fotky nahrány! Děkujeme!',
    },
    alpacas: {
      title: 'Proč alpaky?',
      subtitle: 'Malé vyznání',
      text: 'Alpaky máme oba moc rádi. Jsou pro nás symbolem klidu, něhy a společných chvil v přírodě. Chtěli jsme je mít i na našem svatebním webu — jako malý kousek nás.',
    },
    footer: {
      hashtag: '#MichalAKlara2026',
      quote: '"V tobě jsem konečně našel domov, který jsem hledal celý život."',
      madeWith: 'Vytvořeno s',
      copyright: '© 2026 Michal & Klára',
    },
  },
  en: {
    nav: {
      story: 'Our Story',
      ceremony: 'Ceremony',
      venue: 'Venue',
      rsvp: 'RSVP',
      gallery: 'Gallery',
      party: 'Wedding Party',
      accommodation: 'Stay',
      gifts: 'Gifts',
      faq: 'FAQ',
      guestbook: 'Message Board',
      photos: 'Your Photos',
      langSwitch: 'CZ',
    },
    hero: {
      date: 'August 29, 2026',
      days: 'days',
      hours: 'hours',
      minutes: 'minutes',
      seconds: 'seconds',
      cta: 'Learn more',
    },
    story: {
      title: 'Our Story',
      subtitle: 'The journey that brought us together',
      chapters: [
        { date: 'August 2020', title: 'Ostrov u Tisé — First Meeting', text: 'It was the summer edition of a climbing meetup in August 2020.' },
        { date: '2020–2024', title: 'Years of Meeting in the Rocks', text: 'We met irregularly for four years — in summer and later in spring and autumn too.' },
        { date: 'April 2024', title: 'The Fateful Ostrov', text: 'A chair next to Klárka and Linda freed up for a moment. Michal didn\'t hesitate and sat down between them. Adam said with his trademark bluntness: "Well Michal, Klára is single, you almost are too, so you two should get together, right?"' },
        { date: 'May 2024', title: 'May Holidays in Jablonec — First Date', text: 'The first time we went out just the two of us. Klárka took me for a burger at Qčko.' },
        { date: 'May 2024', title: 'Secret Trip to Kutná Hora', text: 'A trip that was a turning point for Klárka. So much so that she painted me a picture after it.' },
        { date: 'June 2024', title: 'Secret Trip to Bordeaux', text: 'A trip that was a turning point for Michal. So much so that afterwards he started missing Klárka.' },
        { date: 'July 2024', title: 'First Time in Hamburg', text: 'The first visit to your world in Hamburg. Another step on our shared journey, where we got to know each other in a new environment.' },
        { date: 'July 2024', title: 'The Decisive View of Prokopské Valley', text: 'Michal had a beautiful view of Klárka; Klárka laid out her view of the relationship to Michal, and they both confirmed it with a yes. All of that above the stunning view of Prokopské Valley.' },
        { date: '2026', title: 'The Proposal', text: 'And then came that moment… The moment I will remember for the rest of my life. She said YES!' },
      ],
    },
    ceremony: {
      title: 'Ceremony & Celebration',
      subtitle: 'Wedding weekend schedule',
      dressCode: 'Dress Code: Formal Elegance',
      dressCodeFriday: 'Dress Code: Casual',
      addToCalendar: 'Add to Calendar',
      days: [
        {
          label: 'Friday, August 28',
          subtitle: 'Meet & Greet BBQ',
          schedule: [
            { time: '14:00', event: 'Guest Arrival', icon: '🚗', desc: 'Check-in and welcome at Mlýn Davídkov resort' },
            { time: '14:00 – 16:00', event: 'Meet the Families & Friends', icon: '🤝', desc: 'Quality time for families and friends from both the bride\'s and groom\'s side' },
            { time: '18:00', event: 'Group BBQ', icon: '🔥', desc: 'Informal dinner in the garden — grilled treats and good vibes' },
            { time: '20:00', event: 'Evening with Friends', icon: '🍻', desc: 'The bride and groom spend time with their friends' },
          ],
        },
        {
          label: 'Saturday, August 29',
          subtitle: 'The Wedding Day',
          schedule: [
            { time: '13:00', event: 'Guest Arrival', icon: '🚗', desc: 'Welcome of wedding guests at the resort' },
            { time: '14:00', event: 'Wedding Ceremony', icon: '💒', desc: 'The vows of love' },
            { time: '14:30', event: 'Congratulations & Photos', icon: '📸', desc: 'Group photos with the newlyweds' },
            { time: '15:00', event: 'Cocktail Hour', icon: '🥂', desc: 'Aperitif and refreshments in the garden' },
            { time: '16:00', event: 'Wedding Feast', icon: '🍽️', desc: 'A gastronomic experience' },
            { time: '18:00', event: 'Cake Cutting', icon: '🎂', desc: 'The sweetest moment' },
            { time: '19:00', event: 'First Dance', icon: '💃', desc: 'The newlywed dance' },
            { time: '19:30', event: 'Party Time', icon: '🎶', desc: 'Music, dance, and laughter' },
            { time: '00:00', event: 'Afterparty', icon: '🌙', desc: 'The night is still young!' },
          ],
        },
      ],
    },
    venue: {
      title: 'Mlýn Davídkov',
      subtitle: 'An enchanting resort between Prague and Kutná Hora',
      description: 'A picturesque resort surrounded by nature, where our story will become unforgettable. Complete privacy, exquisite gastronomy, and breathtaking surroundings — exactly where we want to say our YES.',
      funFact: 'Fun fact: It\'s equidistant from Plzeň, Rakovník, Jablonec nad Nisou, and České Budějovice — destiny planned it that way!',
      features: [
        { icon: '👥', title: 'Capacity', desc: 'Up to 250 guests' },
        { icon: '🛏️', title: 'Accommodation', desc: '102 beds in 3 buildings' },
        { icon: '🌿', title: 'Nature', desc: 'Surrounded by a picturesque valley' },
        { icon: '🚗', title: 'Accessibility', desc: '40 min from Prague' },
      ],
      address: 'Hryzely 36, 281 63 Barchovice-Zásmuky',
      navigate: 'Navigate',
    },
    rsvp: {
      title: 'RSVP',
      subtitle: 'Let us know if you can make it',
      name: 'Your name',
      email: 'E-mail',
      attending: 'I will attend',
      notAttending: 'Unfortunately, I cannot attend',
      guestCount: 'Number of guests',
      children: 'Bringing children?',
      childrenCount: 'Number of children',
      menu: 'Menu preference',
      menuOptions: ['No preference', 'Meat', 'Fish', 'Vegetarian', 'Vegan'],
      allergies: 'Allergies / dietary restrictions',
      songRequest: 'What song must we play?',
      songNever: 'What song must we NOT play?',
      submit: 'Confirm',
      successYes: 'Thank you! We look forward to seeing you!',
      successAlpacaSay: 'The alpaca says: We can\'t wait to see you!',
      successNo: 'We\'re sorry! You will be missed.',
      yes: 'Yes',
      no: 'No',
      step: 'Step',
      of: 'of',
      next: 'Continue',
      back: 'Back',
      attendance: 'Attendance',
    },
    gallery: {
      title: 'Gallery',
      subtitle: 'Moments that define us',
    },
    weddingParty: {
      title: 'Wedding Party',
      subtitle: 'The people we couldn\'t do it without',
      members: [
        { name: 'Best Man Name', role: 'Best Man', bio: 'Best friend since childhood. Always ready to help — though not always sober.' },
        { name: 'Maid of Honor Name', role: 'Maid of Honor', bio: 'Soul sister who shares everything — from secrets to clothes.' },
        { name: 'Bridesmaid Name', role: 'Bridesmaid', bio: 'The one who brings a smile to every room.' },
        { name: 'Groomsman Name', role: 'Groomsman', bio: 'A reliable partner for all of life\'s adventures.' },
      ],
    },
    accommodation: {
      title: 'Accommodation & Transport',
      subtitle: 'Everything you need to know',
      buildings: [
        { name: 'Mlýn', desc: 'The main building — heart of the resort. 13 rooms.', icon: '🏛️' },
        { name: 'Šalanda', desc: 'Opposite the main building. 10 rooms.', icon: '🏡' },
        { name: 'Vila Toyen', desc: 'Art Nouveau villa opposite the resort. 5 rooms.', icon: '🏰' },
      ],
      transport: {
        title: 'How to get here',
        car: 'By car: GPS — Hryzely 36, 281 63 Barchovice-Zásmuky. Free parking on-site.',
        public: 'Public transport: Nearest train station Zásmuky, then taxi/shuttle.',
        note: 'We recommend arriving the day before to enjoy the whole weekend!',
      },
    },
    gifts: {
      title: 'Gifts',
      subtitle: 'Your presence is the greatest gift of all',
      text: 'However, if you wish to give us something, we\'d be grateful for a contribution to our shared adventure — you can find our wish list or travel fund below.',
      cta: 'Contribute to travel fund',
    },
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you want to know',
      questions: [
        { q: 'What is the dress code?', a: 'Formal elegance — gentlemen in suits, ladies in cocktail or long dresses. Comfortable shoes recommended — the venue is in nature!' },
        { q: 'Can I bring children?', a: 'Of course! Children are welcome. Please include them when confirming your attendance.' },
        { q: 'Where can I park?', a: 'Free parking is available on-site at Mlýn Davídkov.' },
        { q: 'Can I stay at the venue?', a: 'Yes! Mlýn Davídkov offers accommodation in three buildings with a total capacity of 102 beds.' },
        { q: 'When should I arrive?', a: 'We recommend arriving on Friday, August 28th, to enjoy the entire wedding weekend.' },
        { q: 'Will there be cake?', a: 'You bet! Prepare to be amazed.' },
        { q: 'Can I upload my wedding photos?', a: 'Absolutely! In the "Your Photos" section, you can upload all your shots after the wedding.' },
      ],
    },
    guestbook: {
      title: 'Message Board',
      subtitle: 'Send us a message, photo or a memory',
      name: 'Your name',
      message: 'Your message',
      photos: 'Attach a photo (optional)',
      submit: 'Send message',
      success: 'Thank you for your message!',
      visibility: 'Message visibility',
      public: 'Public',
      publicDesc: 'Displayed on the board for everyone',
      private: 'Private',
      privateDesc: 'Only Michal & Klára will see it',
    },
    weddingPhotos: {
      title: 'Your Wedding Photos',
      subtitle: 'Share your shots from our big day',
      name: 'Your name',
      upload: 'Choose photos',
      dragDrop: 'Drag photos here or click',
      submit: 'Upload photos',
      success: 'Photos uploaded! Thank you!',
    },
    alpacas: {
      title: 'Why alpacas?',
      subtitle: 'A little confession',
      text: 'We both love alpacas. They\'re our symbol of calm, tenderness, and time spent in nature together. We wanted them on our wedding site too — a little piece of us.',
    },
    footer: {
      hashtag: '#MichalAKlara2026',
      quote: '"In you, I finally found the home I\'d been searching for my whole life."',
      madeWith: 'Made with',
      copyright: '© 2026 Michal & Klára',
    },
  },
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('cs');

  const t = useCallback(
    (key: string) => {
      const keys = key.split('.');
      let value: any = translations[locale];
      for (const k of keys) {
        value = value?.[k];
      }
      return value ?? key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
