export const siteTitle = 'Agile Health Monitor';
export const siteDescription = 'Team Health Check op basis van het Spotify Squad Health Check model. Meet de gezondheid van je agile team.';
export const siteURL = 'http://localhost:3000';
export const siteAuthor = 'Agile Health Monitor';

export const navItems = [
  { href: '/', label: 'Home' },
  { href: '/login', label: 'Inloggen', auth: false },
  { href: '/team-dashboard', label: 'Team Dashboard', auth: true },
  { href: '/my-settings', label: 'Mijn Instellingen', auth: true },
  { href: '/admin', label: 'Admin', auth: true, admin: true }
];

export const surveyQuestions = [
  {
    field: 'waarde_leveren',
    question: 'Waarde leveren',
    good: 'We leveren geweldig werk! We zijn er trots op en onze stakeholders zijn erg blij.',
    bad: 'We leveren slechte kwaliteit. We zijn er niet trots op en onze stakeholders zijn ontevreden.'
  },
  {
    field: 'kwaliteit_van_de_codebase',
    question: 'Kwaliteit van de codebase',
    good: 'We zijn trots op de kwaliteit van onze code! Het is schoon, leesbaar en heeft goede testdekking.',
    bad: 'Onze code is rommelig en moeilijk te onderhouden.'
  },
  {
    field: 'taakplanning_en_prioritering',
    question: 'Taakplanning en prioritering',
    good: 'Ik heb helder voor ogen wat de geplande taken zijn en wat de prioriteit in mijn backlog is.',
    bad: 'Ik weet niet wat mijn taken zijn, wat de afhankelijkheden zijn, en of ik mijn commitments kan nakomen.'
  },
  {
    field: 'informatie_delen',
    question: 'Informatie delen',
    good: 'We krijgen altijd de juiste informatie over wijzigingen/beslissingen die ons werk beïnvloeden.',
    bad: 'We krijgen nooit consistent updates en dat beïnvloedt ons dagelijks werk.'
  },
  {
    field: 'samenwerking',
    question: 'Samenwerking',
    good: 'We zijn een topteam dat goed samenwerkt. We respecteren elkaar en waarderen elkaars bijdragen.',
    bad: 'We zijn een stel individuen die niet weten of zich bekommeren om wat anderen doen.'
  },
  {
    field: 'events_ceremonies',
    question: 'Events (ceremonies)',
    good: 'Onze meetings — daily, planning, review en retro — zijn regelmatig en effectief.',
    bad: 'Onze meetings zijn ineffectief en volgen geen vaste cadans.'
  },
  {
    field: 'leren_en_plezier',
    question: 'Leren en plezier',
    good: 'We leren continu nieuwe dingen en van onze fouten. We houden van ons werk en hebben veel plezier samen.',
    bad: 'Het werk is saai en we hebben nooit tijd om iets te leren. Sterker nog, we leren nooit van onze fouten.'
  },
  {
    field: 'regie_over_eigen_werk',
    question: 'Regie over eigen werk',
    good: 'We zijn meester over ons eigen werk! We hebben autonomie, doelgerichtheid en bepalen zelf wat en hoe we bouwen.',
    bad: 'We zijn pionnen op een schaakbord — geen invloed op wát we bouwen of hóe we het bouwen.'
  },
  {
    field: 'product_ownership',
    question: 'Product Ownership',
    good: 'We zijn blij met de staat van onze backlog en de relevantie ervan voor de business.',
    bad: 'Onze backlog is rommelig en lijkt geen waarde te leveren aan stakeholders.'
  },
  {
    field: 'snelheid_en_incrementele_oplevering',
    question: 'Snelheid en incrementele oplevering',
    good: 'We krijgen dingen snel gedaan! Geen wachttijden of vertragingen.',
    bad: 'Het lijkt alsof we nooit iets afkrijgen. We blijven vastlopen of worden gestoord. Stories blijven hangen op afhankelijkheden.'
  },
  {
    field: 'makkelijk_te_releasen',
    question: 'Makkelijk te releasen',
    good: 'Releasen is simpel, veilig, pijnloos en grotendeels geautomatiseerd.',
    bad: 'Releasen is risicovol, pijnlijk, veel handwerk en duurt veel te lang.'
  },
  {
    field: 'passende_processen',
    question: 'Passende processen',
    good: 'Onze manier van werken past perfect bij ons.',
    bad: 'Onze manier van werken is waardeloos!'
  },
  {
    field: 'tooling',
    question: 'Tooling',
    good: 'We gebruiken agile-, productiviteits- en engineering-tools effectief om meer waarde te leveren.',
    bad: 'We kunnen geen moderne tools gebruiken en zitten vast aan oude legacy-tools.'
  },
  {
    field: 'ondersteuning',
    question: 'Ondersteuning',
    good: 'We krijgen altijd goede ondersteuning en hulp als we erom vragen!',
    bad: 'We blijven vastlopen omdat we de ondersteuning en hulp die we nodig hebben niet krijgen.'
  },
  {
    field: 'manager_geeft_het_goede_voorbeeld',
    question: 'Manager geeft het goede voorbeeld',
    good: 'Onze manager geeft altijd het goede voorbeeld en komt beloften na.',
    bad: 'Onze manager communiceert niet effectief en kan het team niet helpen waarde te leveren.'
  }
];

export async function loadQuestions(pb) {
  try {
    const records = await pb.collection('questions').getFullList({ sort: 'order' });
    if (records && records.length > 0) {
      return records.map(r => ({
        field: r.field,
        question: r.question,
        good: r.good,
        bad: r.bad
      }));
    }
  } catch {}
  return surveyQuestions;
}
