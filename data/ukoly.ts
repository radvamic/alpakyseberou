export type Level = 'mild' | 'wild';
export type Lang = 'cs' | 'en';

export interface Dare {
  cs: string;
  en: string;
  level: Level;
}

export const DARES: Dare[] = [
  // ─── MÍRNÉ / MILD ────────────────────────────────────────────────
  {
    cs: 'Ochutnej z talíře souseda vedle tebe',
    en: 'Take a bite from your neighbour\'s plate',
    level: 'mild',
  },
  {
    cs: 'Zazpívej první verš libovolné písničky nahlas',
    en: 'Sing the first line of any song out loud',
    level: 'mild',
  },
  {
    cs: 'Přiťukni si s někým od úplně jiného stolu',
    en: 'Clink glasses with someone from a completely different table',
    level: 'mild',
  },
  {
    cs: 'Řekni novomanželům kompliment v jedné větě',
    en: 'Pay the newlyweds a compliment in one sentence',
    level: 'mild',
  },
  {
    cs: 'Nafotit selfie s někým, koho ještě neznáš',
    en: 'Take a selfie with someone you don\'t know yet',
    level: 'mild',
  },
  {
    cs: 'Popiš partnera/partnerku jedním zvířetem a vysvětli proč',
    en: 'Describe your partner as one animal and explain why',
    level: 'mild',
  },
  {
    cs: 'Řekni sousedovi vlevo jeden upřímný kompliment',
    en: 'Tell the person to your left one genuine compliment',
    level: 'mild',
  },
  {
    cs: 'Proveď tanečního pohyb ze svého oblíbeného tance',
    en: 'Show off your favourite dance move right now',
    level: 'mild',
  },
  {
    cs: 'Najdi na sále někoho, kdo má narozeniny v tomto měsíci',
    en: 'Find someone in the hall who has a birthday this month',
    level: 'mild',
  },
  {
    cs: 'Vymysli přezdívku pro novomanžele a řekni ji hlasitě',
    en: 'Come up with a couple\'s nickname for the newlyweds and say it out loud',
    level: 'mild',
  },
  {
    cs: 'Zavolej někomu blízkému a za 10 sekund mu popište probíhající oslavu',
    en: 'Call someone close and describe this celebration in 10 seconds',
    level: 'mild',
  },
  {
    cs: 'Udělej svůj nejlepší obličej pro skupinovou fotku s celým stolem',
    en: 'Pull your best face for a group photo with the whole table',
    level: 'mild',
  },
  {
    cs: 'Řekni sousedovi vpravo jednu věc, co jste zažili spolu',
    en: 'Tell the person to your right one memory you share together',
    level: 'mild',
  },
  {
    cs: 'Odfoť detail z výzdoby sálu, který se ti nejvíc líbí',
    en: 'Take a close-up photo of the decoration detail you like most',
    level: 'mild',
  },
  {
    cs: 'Popiš celý dnešní den jedním slovem a vysvětli ho',
    en: 'Describe today\'s day in one word and explain it',
    level: 'mild',
  },
  {
    cs: 'Najdi ve svém telefonu nejstarší fotku s novomanželi a ukaž ji stolu',
    en: 'Find the oldest photo of the newlyweds on your phone and show the table',
    level: 'mild',
  },
  {
    cs: 'Připij na osobu naproti tobě a řekni, proč jsi rád/a, že je tady',
    en: 'Toast the person across from you and say why you\'re glad they\'re here',
    level: 'mild',
  },
  {
    cs: 'Vymysli, co bude novomanžely za 5 let nejvíce bavit dělat spolu',
    en: 'Predict what the newlyweds will most love doing together in 5 years',
    level: 'mild',
  },
  {
    cs: 'Bez použití slov ukaž, jak se cítíš na téhle svatbě',
    en: 'Without words, show how you feel at this wedding',
    level: 'mild',
  },
  {
    cs: 'Zatleskej rytmus své oblíbené písničky a nech ostatní hádat, jaká je',
    en: 'Clap the rhythm of your favourite song and let others guess',
    level: 'mild',
  },
  {
    cs: 'Řekni jeden vtip. Může být i špatný.',
    en: 'Tell one joke. Even a bad one counts.',
    level: 'mild',
  },
  {
    cs: 'Vymysli a nahlas řekni svatební přípitek na 30 sekund',
    en: 'Come up with and say a 30-second wedding toast out loud',
    level: 'mild',
  },
  {
    cs: 'Sdílej nejzábavnější vzpomínku na ženicha nebo nevěstu',
    en: 'Share your funniest memory of the bride or groom',
    level: 'mild',
  },
  {
    cs: 'Nakresli portrét souseda vedle tebe (máš 60 sekund) a ukaž mu ho',
    en: 'Draw a portrait of the person next to you (60 seconds) and show them',
    level: 'mild',
  },
  {
    cs: 'Najdi na sále nejpohlednějšího staříčka a přijď mu prodat počestný kompliment',
    en: 'Find the most dapper senior in the room and give them a sincere compliment',
    level: 'mild',
  },
  {
    cs: 'Napodobuj způsob chůze ženicha, dokud ho někdo nepozná',
    en: 'Imitate the groom\'s walking style until someone guesses who it is',
    level: 'mild',
  },
  {
    cs: 'Ukáž svůj oblíbený tanec z dob školní akademie',
    en: 'Show off your go-to dance move from school years',
    level: 'mild',
  },
  {
    cs: 'Udělej si selfie s největším úsměvem, jaký zvládneš, a pošli ho novomanželům',
    en: 'Take a selfie with your biggest smile and send it to the newlyweds',
    level: 'mild',
  },
  {
    cs: 'Popiš svůj outfit dnešního dne jedním slovem',
    en: 'Describe your outfit today in one word',
    level: 'mild',
  },
  {
    cs: 'Přijdi k jinému stolu a zaveď hovor s někým, s kým jsi dnes ještě nemluvil/a',
    en: 'Walk to another table and start a conversation with someone you haven\'t spoken to yet today',
    level: 'mild',
  },

  // ─── ODVÁŽNÉ / WILD ──────────────────────────────────────────────
  {
    cs: 'Předveď, jak tančí ženich — co nejvěrněji',
    en: 'Imitate the groom\'s dancing style — be as accurate as possible',
    level: 'wild',
  },
  {
    cs: 'Proslovu sousedovi celých 30 sekund a chval ho bez přestávky',
    en: 'Give your neighbour a 30-second non-stop compliment speech',
    level: 'wild',
  },
  {
    cs: 'Zazpívej část písničky, která se hrála na tvé maturitě nebo ve škole',
    en: 'Sing part of the song that was popular at your school graduation',
    level: 'wild',
  },
  {
    cs: 'Vymysli a přednáším krátkou báseň o dnešní svatbě (aspoň 4 verše)',
    en: 'Compose and recite a short poem about today\'s wedding (at least 4 lines)',
    level: 'wild',
  },
  {
    cs: 'Udělej svůj nejlepší impersonace celebrity a nech ostatní hádat koho',
    en: 'Do your best celebrity impression and let the table guess who',
    level: 'wild',
  },
  {
    cs: 'Prozraď nepříliš lichotivou pravdu o sobě z dob dospívání',
    en: 'Reveal an embarrassing truth about yourself from your teenage years',
    level: 'wild',
  },
  {
    cs: 'Vyzvi souseda na zápolení v papír-nůžky-kámen. Poražený platí rundu nealka.',
    en: 'Challenge your neighbour to rock-paper-scissors. Loser buys a round of soft drinks.',
    level: 'wild',
  },
  {
    cs: 'Zaimprovizuj 15sekundový taneční kousek na cokoliv, co zrovna hraje',
    en: 'Improvise a 15-second dance routine to whatever is playing right now',
    level: 'wild',
  },
  {
    cs: 'Vyfotit se s co nejvíce lidmi do 60 sekund (počítá se celý sál)',
    en: 'Take a photo with as many people as possible in 60 seconds (whole venue counts)',
    level: 'wild',
  },
  {
    cs: 'Zavolej DJ-ovi nebo moderátorovi akce a navrhni mu písničku ŽIVĚ přes stůl',
    en: 'Shout a song request to the DJ or MC from your table right now',
    level: 'wild',
  },
  {
    cs: 'Předveď nevěstu — její rej, chůzi i výraz — co nejpřesněji',
    en: 'Imitate the bride — her walk, expression and mannerisms — as closely as possible',
    level: 'wild',
  },
  {
    cs: 'Vymysli fiktivní titul knihy nebo filmu o životě novomanželů',
    en: 'Invent a fictional book or film title about the newlyweds\' life together',
    level: 'wild',
  },
  {
    cs: 'Udělej zábavné video-přání novomanželům (max. 20 sekund) a pošli jim ho',
    en: 'Record a funny video greeting for the newlyweds (max 20 seconds) and send it',
    level: 'wild',
  },
  {
    cs: 'Přiznej svůj nejzvláštnější zlozvyk. Celý stůl musí souhlasit, že to přebíjí všechno ostatní.',
    en: 'Confess your weirdest habit. The whole table must agree it tops everything else.',
    level: 'wild',
  },
  {
    cs: 'Zaimprovizuj svatební řeč jako kdyby jsi byl hollywoodský herec',
    en: 'Improvise a wedding speech as if you were a Hollywood actor',
    level: 'wild',
  },
  {
    cs: 'Přijdi k vedlejšímu stolu a požádej kohokoli o jeden taneční pohyb — musíš ho ihned zopakovat',
    en: 'Go to the next table and ask anyone for one dance move — you must repeat it immediately',
    level: 'wild',
  },
  {
    cs: 'Předveď, jak by vypadala svatba ve stylu tvojí oblíbené filmové série',
    en: 'Show what this wedding would look like in the style of your favourite film franchise',
    level: 'wild',
  },
  {
    cs: 'Zatancuj sám/sama uprostřed sálu přesně 10 sekund',
    en: 'Dance alone in the middle of the floor for exactly 10 seconds',
    level: 'wild',
  },
  {
    cs: 'Vyber si kohokoliv ze stolu a přijdi mu říct, co ti na něm nejvíce imponuje',
    en: 'Pick anyone at the table and go tell them what impresses you most about them',
    level: 'wild',
  },
  {
    cs: 'Zazpívej „Happy Birthday" / „Mnohaya leta" ale s textem o novomanželích',
    en: 'Sing "Happy Birthday" but replace the lyrics with something about the newlyweds',
    level: 'wild',
  },
  {
    cs: 'Vyzvi souseda na minisoutěž: kdo udělá víc dřepů za 30 sekund',
    en: 'Challenge your neighbour: who can do more squats in 30 seconds',
    level: 'wild',
  },
  {
    cs: 'Předstírej, že jsi slavný návrhář a popiš, co by na dnešní slavnosti bylo jinak',
    en: 'Pretend you\'re a famous event designer and describe what you would change today',
    level: 'wild',
  },
  {
    cs: 'Sdílej nejbláznivější plán na líbánky, který tě napadne',
    en: 'Share the craziest honeymoon idea you can think of for the newlyweds',
    level: 'wild',
  },
  {
    cs: 'Ztvárnění „první tanec" — sám/sama, bez partnera, uprostřed místnosti',
    en: 'Perform the "first dance" — alone, no partner, in the middle of the room',
    level: 'wild',
  },
  {
    cs: 'Přijdi za svatebčanem, kterého nejméně znáš, a dej si s ním selfie s vtipným obličejem',
    en: 'Find the guest you know least and take a goofy selfie together',
    level: 'wild',
  },
  {
    cs: 'Napiš novomanželům zprávu smajlíky (bez textu) a pošli jim ji — ať to přečtou nahlas',
    en: 'Write a message to the newlyweds using only emojis and send it — make them read it aloud',
    level: 'wild',
  },
  {
    cs: 'Improvizovaný rozhovor: jsi reportér ČT a interview si s náhodným sousedem o „nejlepší chvíli dnešního dne"',
    en: 'Improvised interview: you\'re a TV reporter and you interview a random neighbour about "the best moment today"',
    level: 'wild',
  },
  {
    cs: 'Vyzvi ženicha nebo nevěstu na jednu otázku „co by na svém svatebním dni změnil/a"',
    en: 'Challenge the groom or bride to answer: "what would you change about your wedding day?"',
    level: 'wild',
  },
  {
    cs: 'Dej si s někým duel v pohledu — kdo se první zasměje, dá ostatním rundu désalka',
    en: 'Have a stare-down duel with someone — whoever laughs first buys a round of soft drinks',
    level: 'wild',
  },
  {
    cs: 'Zazpívej první verš libovolné písničky operním hlasem',
    en: 'Sing the first line of any song in a full operatic voice',
    level: 'wild',
  },
  {
    cs: 'Natočte s celým stolem 10sekundové video pozdravení a pošlete ho novomanželům',
    en: 'Record a 10-second group greeting video with the whole table and send it to the newlyweds',
    level: 'wild',
  },
];
