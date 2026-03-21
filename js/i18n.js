// ============================================
// i18n.js — Translations: English, French, Swahili
// ============================================

const TRANSLATIONS = {
  en: {
    heroTitle:     'Describe your emergency.<br/>Get help instantly.',
    heroSub:       'AI-powered first aid guidance in English, French & Swahili. For East Africa.',
    quickLabel:    'Quick Select — Common Emergencies',
    inputLabel:    'Describe the emergency situation:',
    inputPlaceholder: 'e.g. A person collapsed and is not breathing. What do I do?',
    btnText:       'Get Emergency Help →',
    contactsTitle: '🚨 Emergency Numbers',
    q1: 'Cardiac Arrest', q2: 'Choking', q3: 'Severe Bleeding',
    q4: 'Burns', q5: 'Fracture / Broken Bone', q6: 'Seizure',
    q7: 'Snake Bite', q8: 'Drowning',
    systemPrompt: `You are ResQ, an emergency first aid assistant for East Africa. 
When given an emergency situation, provide:
1. IMMEDIATE STEPS (numbered, clear, actionable)
2. What NOT to do
3. When to call for help / what to tell the dispatcher
4. Any local context relevant to East Africa

Be concise, calm, and clear. Use simple language. Format with bold headers.
Always remind the user to call emergency services (112 in Rwanda/Kenya).`,
    hospitalsTitle: '📍 Nearby Medical Facilities',
    findNearMe:    'Find Near Me',
  },
  fr: {
    heroTitle:     'Décrivez votre urgence.<br/>Obtenez de l\'aide instantanément.',
    heroSub:       'Conseils de premiers secours par IA en anglais, français et swahili. Pour l\'Afrique de l\'Est.',
    quickLabel:    'Sélection rapide — Urgences courantes',
    inputLabel:    'Décrivez la situation d\'urgence :',
    inputPlaceholder: 'ex. Une personne s\'est effondrée et ne respire pas. Que faire ?',
    btnText:       'Obtenir de l\'aide →',
    contactsTitle: '🚨 Numéros d\'urgence',
    q1: 'Arrêt Cardiaque', q2: 'Étouffement', q3: 'Saignement Grave',
    q4: 'Brûlures', q5: 'Fracture', q6: 'Convulsion',
    q7: 'Morsure de Serpent', q8: 'Noyade',
    systemPrompt: `Vous êtes ResQ, un assistant de premiers secours pour l'Afrique de l'Est.
Quand on vous décrit une urgence, fournissez en français:
1. ÉTAPES IMMÉDIATES (numérotées, claires, réalisables)
2. Ce qu'il ne faut PAS faire
3. Quand appeler les secours
4. Contexte local pour l'Afrique de l'Est

Soyez concis, calme et clair. Utilisez un langage simple. Rappeler toujours d'appeler le 112.`,
    hospitalsTitle: '📍 Établissements médicaux à proximité',
    findNearMe:    'Trouver près de moi',
  },
  sw: {
    heroTitle:     'Elezea dharura yako.<br/>Pata msaada mara moja.',
    heroSub:       'Mwongozo wa huduma ya kwanza kwa AI kwa Kiingereza, Kifaransa na Kiswahili. Kwa Afrika Mashariki.',
    quickLabel:    'Chaguo la Haraka — Dharura za Kawaida',
    inputLabel:    'Elezea hali ya dharura:',
    inputPlaceholder: 'mf. Mtu ameanguka na hapumui. Nifanye nini?',
    btnText:       'Pata Msaada wa Dharura →',
    contactsTitle: '🚨 Nambari za Dharura',
    q1: 'Kusimama kwa Moyo', q2: 'Kukosa Pumzi', q3: 'Kutoka damu',
    q4: 'Kuungua', q5: 'Mfupa Uliovunjika', q6: 'Degedege',
    q7: 'Kuumwa na Nyoka', q8: 'Kuzama',
    systemPrompt: `Wewe ni ResQ, msaidizi wa huduma ya kwanza wa dharura kwa Afrika Mashariki.
Ukipewa hali ya dharura, toa kwa Kiswahili:
1. HATUA ZA HARAKA (zilizohesabiwa, wazi, zinazoweza kufanywa)
2. Usifanye nini
3. Lini kupigia simu msaada
4. Muktadha wa Afrika Mashariki

Kuwa mfupi, utulivu na wazi. Tumia lugha rahisi. Kumbuka kila wakati kupiga simu 112.`,
    hospitalsTitle: '📍 Vituo vya Afya Vilivyo Karibu',
    findNearMe:    'Tafuta Karibu Nami',
  }
};

let currentLang = 'en';

function setLang(lang) {
  currentLang = lang;
  const t = TRANSLATIONS[lang];

  // Update buttons
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.lang-btn[onclick="setLang('${lang}')"]`).classList.add('active');

  // Update UI text
  document.getElementById('heroTitle').innerHTML   = t.heroTitle;
  document.getElementById('heroSub').textContent   = t.heroSub;
  document.getElementById('quickLabel').textContent = t.quickLabel;
  document.getElementById('inputLabel').textContent = t.inputLabel;
  document.getElementById('emergencyInput').placeholder = t.inputPlaceholder;
  document.getElementById('btnText').textContent   = t.btnText;
  document.getElementById('contactsTitle').textContent = t.contactsTitle;

  // Quick buttons
  for (let i = 1; i <= 8; i++) {
    document.getElementById(`q${i}`).textContent = t[`q${i}`];
  }
}

function getCurrentTranslation() {
  return TRANSLATIONS[currentLang];
}
