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
    cs: 'Udělej s celým stolem „nejserióznější svatební portrét“. Nesmí se nikdo smát.',
    en: 'Take the most serious wedding portrait with your whole table. Nobody is allowed to laugh.',
    level: 'mild',
  },
  {
    cs: 'Najdi u stolu člověka s nejlepším smíchem a nech ho ho předvést.',
    en: 'Find the person at your table with the best laugh and make them demonstrate it.',
    level: 'mild',
  },
  {
    cs: 'Vymysli novomanželům společné superhrdinské jméno.',
    en: 'Come up with a shared superhero name for the newlyweds.',
    level: 'mild',
  },
  {
    cs: 'Řekni přípitek dlouhý přesně jednu větu. Musí znít slavnostně, i kdyby nedával smysl.',
    en: 'Give a toast that is exactly one sentence long. It must sound solemn, even if it makes no sense.',
    level: 'mild',
  },
  {
    cs: 'Vyber u stolu člověka, který by nejlépe přežil týden s alpakami, a vysvětli proč.',
    en: 'Pick who at your table would survive a week with alpacas best — and explain why.',
    level: 'mild',
  },
  {
    cs: 'Udělej selfie s někým, koho dnes znáš nejmíň.',
    en: 'Take a selfie with the person you know least at the wedding today.',
    level: 'mild',
  },
  {
    cs: 'Popiš ženicha třemi slovy, ale jedno z nich musí být „majestátní“.',
    en: 'Describe the groom in three words, but one of them must be "majestic".',
    level: 'mild',
  },
  {
    cs: 'Popiš nevěstu třemi slovy, ale jedno z nich musí být „nebezpečně“.',
    en: 'Describe the bride in three words, but one of them must be "dangerously".',
    level: 'mild',
  },
  {
    cs: 'Zjisti, kdo u stolu zná novomanžele nejdéle, a nech ho říct jednu krátkou historku.',
    en: 'Find who at your table has known the couple longest and get them to tell one short story.',
    level: 'mild',
  },
  {
    cs: 'Vymysli název romantické komedie o Kláře a Michalovi.',
    en: 'Come up with a romantic comedy title about Klára and Michal.',
    level: 'mild',
  },
  {
    cs: 'Vyber člověka u stolu, který má dnes největší „svatební energii“.',
    en: 'Pick the person at your table with the most "wedding energy" today.',
    level: 'mild',
  },
  {
    cs: 'Pošli novomanželům zprávu složenou jen ze tří slov.',
    en: 'Send the newlyweds a message made of exactly three words.',
    level: 'mild',
  },
  {
    cs: 'Udělej „reklamu“ na jídlo, které máš právě na talíři.',
    en: 'Do a TV-style ad for whatever is on your plate right now.',
    level: 'mild',
  },
  {
    cs: 'Zeptej se u stolu: „Kdo by z nás jako první brečel u romantického filmu?“ a nechte hlasovat.',
    en: 'Ask your table: "Who would cry first at a rom-com?" and take a vote.',
    level: 'mild',
  },
  {
    cs: 'Najdi u stolu nejhezčí boty a slavnostně je pochval.',
    en: 'Find the nicest shoes at your table and praise them ceremoniously.',
    level: 'mild',
  },
  {
    cs: 'Vymysli novomanželům budoucí domácí pravidlo.',
    en: 'Invent one house rule for the newlyweds\' future home.',
    level: 'mild',
  },
  {
    cs: 'Řekni, kdo u stolu by byl nejlepší svatební koordinátor a proč.',
    en: 'Say who at your table would be the best wedding planner and why.',
    level: 'mild',
  },
  {
    cs: 'Vyfoť nejhezčí detail na stole.',
    en: 'Photograph the prettiest detail on your table.',
    level: 'mild',
  },
  {
    cs: 'Udělej skupinovou fotku, kde se všichni tváří jako tajní agenti.',
    en: 'Take a group photo where everyone looks like secret agents.',
    level: 'mild',
  },
  {
    cs: 'Řekni sousedovi po pravici kompliment tak slavnostně, jako bys předával Oscar.',
    en: 'Give the person on your right a compliment as solemnly as if you were handing them an Oscar.',
    level: 'mild',
  },
  {
    cs: 'Zeptej se stolu: „Kdo by nejspíš ztratil klíče od svatebního apartmá?“',
    en: 'Ask your table: "Who is most likely to lose the keys to the honeymoon suite?"',
    level: 'mild',
  },
  {
    cs: 'Vymysli novomanželům motto do manželství.',
    en: 'Come up with a marriage motto for the newlyweds.',
    level: 'mild',
  },
  {
    cs: 'Najdi u stolu někoho, kdo má stejnou barvu oblečení jako ty.',
    en: 'Find someone at your table wearing the same colour as you.',
    level: 'mild',
  },
  {
    cs: 'Udělej mini rozhovor s někým u stolu: „Jaký je váš odborný názor na lásku?“',
    en: 'Do a mini interview with someone at your table: "What is your expert opinion on love?"',
    level: 'mild',
  },
  {
    cs: 'Vymysli jednu větu, kterou by podle tebe řekla alpaka, kdyby byla na téhle svatbě.',
    en: 'Invent one sentence an alpaca would say if it were at this wedding.',
    level: 'mild',
  },
  {
    cs: 'Vyber člověka u stolu, který by měl dostat titul „král/královna dnešního stolu“.',
    en: 'Crown someone at your table king or queen of the table for the evening.',
    level: 'mild',
  },
  {
    cs: 'Zjisti, kdo u stolu má nejvtipnější fotku v telefonu, a nech ho ji dobrovolně ukázat.',
    en: 'Find who has the funniest photo on their phone and get them to show it — only if they want to.',
    level: 'mild',
  },
  {
    cs: 'Udělej fotku s výrazem „právě jsem pochopil/a smysl manželství“.',
    en: 'Take a photo with the face of someone who just understood the meaning of marriage.',
    level: 'mild',
  },
  {
    cs: 'Vymysli název dnešní hostiny jako epizody seriálu.',
    en: 'Name today\'s feast as if it were an episode of a TV series.',
    level: 'mild',
  },
  {
    cs: 'Řekni nahlas jednu věc, která se dnes fakt povedla.',
    en: 'Say out loud one thing that genuinely went well today.',
    level: 'mild',
  },

  // ─── ODVÁŽNÉ / WILD ──────────────────────────────────────────────
  {
    cs: 'Předveď, jak podle tebe tančí člověk, který tvrdí, že „netančí“.',
    en: 'Show how you think someone dances when they insist they "don\'t dance".',
    level: 'wild',
  },
  {
    cs: 'Udělej 10sekundový slavnostní nástup ke svému stolu jako celebrita.',
    en: 'Make a 10-second celebrity entrance back to your table.',
    level: 'wild',
  },
  {
    cs: 'Zazpívej jednu řádku libovolné písničky, ale jako operní pěvec.',
    en: 'Sing one line of any song — in full operatic voice.',
    level: 'wild',
  },
  {
    cs: 'Zahraj beze slov „ženich zjistil, kolik stála svatba“.',
    en: 'Act out silently: "the groom just found out how much the wedding cost".',
    level: 'wild',
  },
  {
    cs: 'Zahraj beze slov „nevěsta poprvé vidí svatební dort“.',
    en: 'Act out silently: "the bride sees the wedding cake for the first time".',
    level: 'wild',
  },
  {
    cs: 'Přednes dramaticky větu: „Prosím ještě jeden knedlík.“',
    en: 'Deliver this line with full drama: "May I have one more dumpling, please."',
    level: 'wild',
  },
  {
    cs: 'Vymysli falešnou, ale velmi přesvědčivou historku o tom, jak se novomanželé potkali.',
    en: 'Invent a fake but very convincing story of how the couple met.',
    level: 'wild',
  },
  {
    cs: 'Udělej krátkou módní přehlídku kolem svého stolu.',
    en: 'Do a short fashion walk around your table.',
    level: 'wild',
  },
  {
    cs: 'Vyhlaš u stolu cenu za „nejlepší účes večera“.',
    en: 'Announce the award for "best hair of the evening" at your table.',
    level: 'wild',
  },
  {
    cs: 'Předveď výraz člověka, který právě zjistil, že má jít na parket.',
    en: 'Show the face of someone who just realised they have to hit the dance floor.',
    level: 'wild',
  },
  {
    cs: 'Vymysli novomanželům reklamní slogan.',
    en: 'Come up with an advertising slogan for the newlyweds.',
    level: 'wild',
  },
  {
    cs: 'Zahraj krátkou scénku: „Alpaka žádá o slovo na svatbě.“',
    en: 'Perform a short scene: "The alpaca asks to speak at the wedding."',
    level: 'wild',
  },
  {
    cs: 'Řekni přípitek, ve kterém musí zaznít slova: alpaka, dort, osud.',
    en: 'Give a toast that must include the words: alpaca, cake, destiny.',
    level: 'wild',
  },
  {
    cs: 'Udělej s někým u stolu synchronizovaný taneční pohyb.',
    en: 'Do a synchronised dance move with someone at your table.',
    level: 'wild',
  },
  {
    cs: 'Předstírej, že jsi sportovní komentátor, a okomentuj dění u stolu.',
    en: 'Pretend you\'re a sports commentator and narrate what\'s happening at your table.',
    level: 'wild',
  },
  {
    cs: 'Předveď „nejhorší možný první tanec“ po dobu 5 sekund.',
    en: 'Perform the "worst possible first dance" for 5 seconds.',
    level: 'wild',
  },
  {
    cs: 'Vyber si někoho u stolu a vymysli mu svatební přezdívku.',
    en: 'Pick someone at your table and invent a wedding nickname for them.',
    level: 'wild',
  },
  {
    cs: 'Udělej fotku, kde celý stůl předstírá, že právě vyhrál loterii.',
    en: 'Take a photo of your whole table pretending you just won the lottery.',
    level: 'wild',
  },
  {
    cs: 'Řekni jednu větu jako král/královna středověké hostiny.',
    en: 'Say one sentence as the king or queen of a medieval feast.',
    level: 'wild',
  },
  {
    cs: 'Vymysli novomanželům luxusní název pro jejich budoucí domácnost.',
    en: 'Invent a fancy name for the newlyweds\' future home.',
    level: 'wild',
  },
  {
    cs: 'Udělej minutu slávy: 15 sekund mluv o čemkoliv, ale velmi sebevědomě.',
    en: 'Your moment of glory: talk about anything for 15 seconds, very confidently.',
    level: 'wild',
  },
  {
    cs: 'Napodob zvuk, který podle tebe vydá člověk po třetím chodu hostiny.',
    en: 'Imitate the sound someone makes after the third course of the feast.',
    level: 'wild',
  },
  {
    cs: 'Přesvědč stůl, že dezert je ve skutečnosti hlavní chod.',
    en: 'Convince your table that dessert is actually the main course.',
    level: 'wild',
  },
  {
    cs: 'Zahraj pantomimu „svatebčan hledá své místo u stolu“.',
    en: 'Mime: "a wedding guest looking for their seat at the table".',
    level: 'wild',
  },
  {
    cs: 'Vymysli krátkou hymnu vašeho stolu. Stačí jeden verš.',
    en: 'Write a one-verse anthem for your table.',
    level: 'wild',
  },
  {
    cs: 'Vyhlaš soutěž o nejupřímnější „mmm“ po ochutnání jídla.',
    en: 'Hold a contest for the most sincere "mmm" after tasting the food.',
    level: 'wild',
  },
  {
    cs: 'Předveď, jak by vypadala svatba, kdyby ji organizovaly alpaky.',
    en: 'Show what this wedding would look like if alpacas were in charge.',
    level: 'wild',
  },
  {
    cs: 'Udělej s někým „souboj vážných pohledů“. Kdo se první zasměje, prohrál.',
    en: 'Have a staring contest with someone. Whoever laughs first loses.',
    level: 'wild',
  },
  {
    cs: 'Natoč 10sekundové video pozdravení novomanželům s celým stolem.',
    en: 'Record a 10-second group video greeting for the newlyweds.',
    level: 'wild',
  },
  {
    cs: 'Přijď k vedlejšímu stolu a zeptej se: „Jak se vám daří v této části království?“',
    en: 'Walk to the next table and ask: "How are things in this part of the kingdom?"',
    level: 'wild',
  },
];
