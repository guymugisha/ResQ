// ============================================
// app.js — ResQ Emergency Response Assistant
// APIs: ChatGPT 4 via RapidAPI + OpenStreetMap Overpass
// ============================================

// ---- CONFIG ----
const RAPID_API_KEY = window.RESQ_CONFIG?.RAPID_API_KEY;
const RAPID_API_HOST = window.RESQ_CONFIG?.RAPID_API_HOST;
const RAPID_API_URL = window.RESQ_CONFIG?.RAPID_API_URL;

// ---- QUICK PROMPTS ----
const QUICK_PROMPTS = {
  cardiac: 'A person has collapsed, is unconscious, and is not breathing. I think it is cardiac arrest. What should I do immediately?',
  choking: 'An adult is choking and cannot breathe or speak. What should I do right now?',
  bleeding: 'A person has a severe deep wound and is bleeding heavily. How do I stop the bleeding?',
  burn: 'A person has suffered a serious burn on their arm from fire/boiling water. What are the first aid steps?',
  fracture: 'A person has fallen and we think they have a broken bone in their leg. How do I help them?',
  seizure: 'Someone near me is having a seizure / convulsions. What should I do and not do?',
  snake: 'A person has just been bitten by a snake in East Africa. What should I do immediately?',
  drowning: 'We just pulled a person out of water and they are unconscious. How do I help?',
};

// ---- TRANSLATIONS ----
const TRANSLATIONS = {
  en: {
    systemPrompt: `You are ResQ, an emergency first aid assistant. Give clear, calm, numbered step-by-step first aid instructions. Always start with whether to call emergency services (112 in East Africa). Be concise and direct. Use ** ** for bold on critical steps. Never give medical diagnoses — only first aid guidance.`,
    placeholder: 'e.g. A person collapsed and is not breathing. What do I do?',
    btnText: 'Get Emergency Help →',
    heroTitle: 'Describe your emergency.<br/>Get help instantly.',
    heroSub: 'AI-powered first aid guidance in English, French & Swahili. For East Africa.',
    quickLabel: 'Quick Select — Common Emergencies',
  },
  fr: {
    systemPrompt: `Vous êtes ResQ, un assistant de premiers secours. Donnez des instructions numérotées claires et calmes. Commencez par indiquer s'il faut appeler le 112. Soyez concis. Utilisez ** ** pour le gras. Répondez en français.`,
    placeholder: 'Ex: Une personne a perdu connaissance. Que faire?',
    btnText: 'Obtenir de l\'aide →',
    heroTitle: 'Décrivez votre urgence.<br/>Obtenez de l\'aide instantanément.',
    heroSub: 'Assistance aux premiers secours en français, anglais et swahili.',
    quickLabel: 'Sélection rapide — Urgences courantes',
  },
  sw: {
    systemPrompt: `Wewe ni ResQ, msaidizi wa huduma ya kwanza. Toa maelekezo wazi ya nambari. Anza kwa kusema kama kupiga 112. Jibu kwa Kiswahili.`,
    placeholder: 'Mfano: Mtu amezimia na hapumui. Nifanye nini?',
    btnText: 'Pata Msaada wa Dharura →',
    heroTitle: 'Elezea dharura yako.<br/>Pata msaada mara moja.',
    heroSub: 'Msaada wa huduma ya kwanza kwa Kiswahili, Kiingereza na Kifaransa.',
    quickLabel: 'Chaguo la Haraka — Dharura za Kawaida',
  },
};

let currentLang = 'en';

// ---- LANGUAGE SWITCHER ----
function setLang(lang) {
  currentLang = lang;
  const t = TRANSLATIONS[lang];
  document.getElementById('heroTitle').innerHTML = t.heroTitle;
  document.getElementById('heroSub').textContent = t.heroSub;
  document.getElementById('quickLabel').textContent = t.quickLabel;
  document.getElementById('emergencyInput').placeholder = t.placeholder;
  document.getElementById('btnText').textContent = t.btnText;
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === lang.toUpperCase());
  });
}

function getCurrentTranslation() {
  return TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('emergencyInput');
  if (textarea) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      document.getElementById('charCount').textContent = `${len} / 500`;
      if (len > 500) textarea.value = textarea.value.substring(0, 500);
    });
  }
});

// ---- QUICK SELECT ----
function quickSelect(type) {
  const prompt = QUICK_PROMPTS[type];
  if (!prompt) return;
  document.getElementById('emergencyInput').value = prompt;
  document.getElementById('charCount').textContent = `${prompt.length} / 500`;
  document.getElementById('emergencyInput').focus();
  document.getElementById('hospitalsPanel').style.display = 'block';
}

// ---- MAIN AI CALL ----
async function getEmergencyHelp() {
  const input = document.getElementById('emergencyInput').value.trim();
  const btn = document.getElementById('getHelpBtn');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('btnSpinner');

  if (!input) {
    alert('Please describe the emergency situation first.');
    return;
  }

  btn.disabled = true;
  btnText.style.display = 'none';
  spinner.style.display = 'block';

  const t = getCurrentTranslation();

  try {
    const response = await fetch(RAPID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPID_API_HOST,
        'x-rapidapi-key': RAPID_API_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: `${t.systemPrompt}\n\nEmergency situation: ${input}`
          }
        ],
        system_prompt: t.systemPrompt,
        temperature: 0.9,
        top_k: 5,
        top_p: 0.9,
        max_tokens: 800,
        web_access: false,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('API error:', response.status, errText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response:', data);

    let aiText = '';
    if (typeof data.result === 'string' && data.result.length > 0) {
      aiText = data.result;
    } else if (data.choices?.[0]?.message?.content) {
      aiText = data.choices[0].message.content;
    } else if (typeof data.message === 'string' && data.message.length > 10) {
      aiText = data.message;
    } else if (data.response) {
      aiText = data.response;
    } else {
      console.warn('Unexpected API shape:', JSON.stringify(data));
      throw new Error('Unexpected response shape');
    }

    displayResponse(aiText);
    document.getElementById('hospitalsPanel').style.display = 'block';

  } catch (err) {
    console.error('Emergency API error:', err);
    displayResponse(getFallbackResponse(input));
    document.getElementById('hospitalsPanel').style.display = 'block';
  } finally {
    btn.disabled = false;
    btnText.style.display = 'block';
    spinner.style.display = 'none';
  }
}

// ---- DISPLAY RESPONSE ----
function displayResponse(text) {
  const panel = document.getElementById('responsePanel');
  const content = document.getElementById('responseContent');

  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^(\d+\.\s)/gm, '<strong>$1</strong>')
    .replace(/^#{1,3}\s+(.*)/gm, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');

  content.innerHTML = formatted;
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---- COPY ----
function copyResponse() {
  const text = document.getElementById('responseContent').innerText;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'Copied ✓';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });
}

// ---- RESET ----
function resetQuery() {
  document.getElementById('responsePanel').style.display = 'none';
  document.getElementById('hospitalsPanel').style.display = 'none';
  document.getElementById('emergencyInput').value = '';
  document.getElementById('charCount').textContent = '0 / 500';
  document.getElementById('emergencyInput').focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- NEARBY HOSPITALS ----
async function findNearbyHospitals() {
  const btn = document.getElementById('locateBtn');
  const content = document.getElementById('hospitalsContent');

  if (!navigator.geolocation) {
    content.innerHTML = '<p style="color:red;">Geolocation not supported by your browser.</p>';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Locating...';
  content.innerHTML = '<div style="padding:16px;color:#888;">Getting your location...</div>';

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;
      content.innerHTML = '<div style="padding:16px;color:#888;">Searching for nearby facilities...</div>';

      try {
        const query = `
          [out:json][timeout:15];
          (
            node["amenity"~"hospital|clinic|doctors|pharmacy"](around:5000,${lat},${lon});
            way["amenity"~"hospital|clinic|doctors|pharmacy"](around:5000,${lat},${lon});
          );
          out body 10;
        `;

        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: `data=${encodeURIComponent(query)}`,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const data = await res.json();
        const elements = data.elements || [];

        const withDist = elements
          .filter(e => e.tags?.name)
          .map(e => {
            const eLat = e.lat || e.center?.lat || lat;
            const eLon = e.lon || e.center?.lon || lon;
            const dist = getDistanceKm(lat, lon, eLat, eLon);
            return { ...e, dist, eLat, eLon };
          })
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 6);

        if (!withDist.length) {
          content.innerHTML = '<p style="padding:16px;color:#888;">No named facilities found within 5km. Call 112.</p>';
        } else {
          content.innerHTML = withDist.map(e => {
            const name = e.tags.name || 'Medical Facility';
            const type = e.tags.amenity || 'facility';
            const phone = e.tags.phone || e.tags['contact:phone'] || '';
            const mapsUrl = `https://www.openstreetmap.org/?mlat=${e.eLat}&mlon=${e.eLon}#map=17/${e.eLat}/${e.eLon}`;
            return `
              <div class="hospital-item">
                <div class="hospital-icon">🏥</div>
                <div>
                  <div class="hospital-name">${name}</div>
                  <div class="hospital-dist">${type} · ${e.dist.toFixed(1)} km away</div>
                  ${phone ? `<a href="tel:${phone}" class="hospital-link">📞 ${phone}</a>` : ''}
                  <a href="${mapsUrl}" target="_blank" class="hospital-link">🗺 View on map</a>
                </div>
              </div>
            `;
          }).join('');
        }

      } catch (err) {
        console.error('Overpass error:', err);
        content.innerHTML = '<p style="padding:16px;color:red;">Could not load hospitals. Call 112 directly.</p>';
      }

      btn.disabled = false;
      btn.textContent = 'Refresh Location';
    },
    (err) => {
      console.error('Geolocation error:', err);
      content.innerHTML = '<p style="padding:16px;color:red;">Could not get location. Please allow location access.</p>';
      btn.disabled = false;
      btn.textContent = 'Find Near Me';
    },
    { timeout: 10000, maximumAge: 60000 }
  );
}

// ---- HAVERSINE DISTANCE ----
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---- FALLBACK RESPONSE ----
function getFallbackResponse(input) {
  const lower = input.toLowerCase();

  if (lower.includes('cardiac') || lower.includes('heart') || lower.includes('breathing') || lower.includes('unconscious')) {
    return `**⚠ CALL 112 IMMEDIATELY**\n\n**Steps for Cardiac Arrest:**\n1. Check scene is safe\n2. Tap shoulders, shout — check response\n3. Call 112 now\n4. CPR: 30 hard fast compressions then 2 rescue breaths\n5. Continue until help arrives\n\n**Do NOT:** Leave person, give food or water`;
  }
  if (lower.includes('bleed') || lower.includes('blood') || lower.includes('wound')) {
    return `**⚠ CALL 112 IF SEVERE**\n\n**Steps for Bleeding:**\n1. Gloves if available\n2. Firm direct pressure with clean cloth\n3. Do NOT remove cloth — add more on top\n4. Elevate above heart level\n5. Hold 10+ minutes`;
  }
  if (lower.includes('chok')) {
    return `**Steps for Choking:**\n1. Ask "Are you choking?" — if can't speak, act now\n2. 5 firm back blows between shoulder blades\n3. 5 abdominal thrusts (Heimlich)\n4. Alternate until clear\n5. Unconscious → call 112 + CPR`;
  }
  if (lower.includes('burn')) {
    return `**Steps for Burns:**\n1. Remove from heat\n2. Cool running water 10–20 mins\n3. Remove nearby clothing/jewellery\n4. Cover loosely with clean cloth\n5. Call 112 for large/deep burns\n\n**Do NOT:** Ice, butter, toothpaste`;
  }
  if (lower.includes('snake')) {
    return `**⚠ CALL 112 — Snake Bite**\n\n1. Move away from snake\n2. Keep person calm and still\n3. Remove tight items near bite\n4. Keep limb below heart\n5. Hospital immediately for antivenom\n\n**Do NOT:** Cut, suck, tourniquet`;
  }
  if (lower.includes('seizure') || lower.includes('convuls')) {
    return `**Steps for Seizure:**\n1. Stay calm — most end in 1–3 mins\n2. Clear hard objects nearby\n3. Cushion head\n4. Turn onto side\n5. Call 112 if over 5 minutes\n\n**Do NOT:** Hold down or put anything in mouth`;
  }

  return `**⚠ CALL 112 FOR ANY LIFE-THREATENING EMERGENCY**\n\nWhile waiting:\n1. Keep person calm and still\n2. No food or water\n3. Monitor breathing\n4. Keep warm\n5. Stay on line with emergency services\n\n**Numbers:**\n- Rwanda: 112 / 912\n- Kenya: 999 / 112\n- Tanzania: 112 / 115\n- Uganda: 999 / 112`;
}