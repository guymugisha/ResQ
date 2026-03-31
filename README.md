# ResQ — Emergency Response Assistant

> AI-powered first aid guidance for East Africa, available in **English**, **Français**, and **Kiswahili**.

**Live URL (Load Balancer):** http://54.175.173.79

---

## 📌 Overview

ResQ is a real-time emergency response web application that provides instant, AI-generated first aid instructions for life-threatening situations. It was built to address a genuine and critical need in East Africa — where access to immediate medical guidance can mean the difference between life and death, especially in areas with limited healthcare infrastructure.

Users describe their emergency in plain language (or select from 8 common scenarios), and the AI returns clear, numbered, step-by-step first aid instructions. The app also locates nearby hospitals using the device's GPS and displays emergency contact numbers for Rwanda, Kenya, Tanzania, and Uganda.

---

## ✨ Features

- **AI First Aid Guidance** — Powered by ChatGPT-4 via RapidAPI; returns calm, numbered instructions instantly
- **8 Quick-Select Emergencies** — Cardiac arrest, choking, severe bleeding, burns, fracture, seizure, snake bite, drowning
- **Multilingual Support** — Full UI and AI responses in English, Français, and Kiswahili
- **Nearby Hospital Finder** — Uses browser geolocation + OpenStreetMap Overpass API to find hospitals and clinics within 5km
- **Emergency Contacts** — Direct call links for Rwanda (112/912), Kenya (999/112), Tanzania (112/115), Uganda (999/112)
- **Offline Fallback** — If the AI API is unavailable, the app returns pre-built, medically accurate fallback responses for all 8 emergencies
- **Light/Dark Theme** — User preference saved via localStorage
- **Fully Responsive** — Optimized for mobile use in the field

---

## 🌍 Countries Covered

🇷🇼 Rwanda · 🇰🇪 Kenya · 🇹🇿 Tanzania · 🇺🇬 Uganda

---

## 🔌 APIs Used

### 1. ChatGPT-4 via RapidAPI
- **Purpose:** Generates real-time, context-aware first aid instructions based on the user's emergency description
- **Provider:** RapidAPI — chatgpt-42.p.rapidapi.com
- **Documentation:** https://rapidapi.com/rphrp1985/api/chatgpt-42
- **Credit:** AI responses powered by OpenAI GPT-4, accessed via RapidAPI

### 2. OpenStreetMap Overpass API
- **Purpose:** Finds hospitals, clinics, doctors, and pharmacies within 5km of the user's GPS location
- **Provider:** OpenStreetMap Foundation (free, no key required)
- **Documentation:** https://wiki.openstreetmap.org/wiki/Overpass_API
- **Credit:** Map and facility data © OpenStreetMap contributors

---

## 🚀 Running Locally

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge)
- Python 3 or Node.js (for local server), or VS Code with Live Server extension

### Step 1 — Clone the repository

```bash
git clone https://github.com/guymugisha/resq.git
cd resq
```

### Step 2 — Add your API key

Open `js/app.js` and replace line 4:

```js
const RAPID_API_KEY = 'YOUR_RAPIDAPI_KEY_HERE';
```

With your actual RapidAPI key. Get a free key at https://rapidapi.com.

> ⚠️ Never commit your real API key to a public repository. The key is provided separately in the submission comments.

### Step 3 — Start a local server

**Option A — Python:**
```bash
python -m http.server 8080
```

**Option B — Node.js:**
```bash
npx http-server . -p 8080
```

**Option C — VS Code:**
Right-click `index.html` → **Open with Live Server**

### Step 4 — Open in browser

```
http://localhost:8080
```

---

## 🐳 Docker Deployment

### Build the image

```bash
docker build -t resq .
```

### Run locally with Docker

```bash
docker run -d --name resq --restart=always -p 80:80 resq
```

### Visit

```
http://localhost
```

---

## 🖥️ Deployment to Web Servers

### Infrastructure

| Server | IP Address | Role |
|--------|-----------|------|
| web-01 | 3.86.16.111 | Web server 1 |
| web-02 | 13.222.214.21 | Web server 2 |
| lb-01  | 54.175.173.79 | HAProxy load balancer |

### Step 1 — SSH into each web server and deploy

Run the following on **both web-01 and web-02**:

```bash
# SSH in
ssh ubuntu@3.86.16.111   # repeat with web-02 IP

# Install Docker if not present
sudo apt update && sudo apt install -y docker.io
sudo systemctl enable docker && sudo systemctl start docker

# Stop any existing container on port 80
sudo systemctl stop nginx

# Clone the repository
git clone https://github.com/guymugisha/resq.git
cd resq

# Build and run
sudo docker build -t resq .
sudo docker run -d --name resq --restart=always -p 80:80 resq

# Verify
curl http://localhost
```

### Step 2 — Configure HAProxy on lb-01

```bash
ssh ubuntu@54.175.173.79
sudo tee -a /etc/haproxy/haproxy.cfg << 'EOF'

frontend resq_front
    bind *:80
    default_backend resq_back

backend resq_back
    balance roundrobin
    server web01 3.86.16.111:80 check
    server web02 13.222.214.21:80 check
EOF

sudo systemctl restart haproxy
sudo systemctl status haproxy
```

### Step 3 — Verify load balancing

```bash
for i in 1 2 3 4 5 6; do curl -s -I http://54.175.173.79 | grep -i x-served-by; done
```

Expected output — two alternating hostnames confirming round-robin:

```
x-served-by: 9cc81b80458f
x-served-by: 4613834bc87c
x-served-by: 9cc81b80458f
x-served-by: 4613834bc87c
```

---

## 📁 Project Structure

```
resq/
├── index.html              # Main single-page application
├── css/
│   ├── style.css           # Core styles + dark theme
│   └── theme-patch.css     # Light mode variables + theme toggle
├── js/
│   ├── app.js              # API calls, emergency logic, fallback responses
│   └── ui.js               # Animations, particles, language switcher, ripple effects
├── Dockerfile              # Docker build config (nginx:alpine)
├── nginx.conf              # Nginx server config with security headers
├── .gitignore              # Excludes API keys and unnecessary files
└── README.md
```

---

## 🔐 Security

- API key is **not committed** to the repository — it is provided in the submission comments
- Nginx security headers configured: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`
- No user data is stored or transmitted beyond the AI API call
- Input is limited to 500 characters to prevent abuse

---

## ⚠️ Error Handling

| Scenario | Handling |
|----------|----------|
| AI API down or slow | Falls back to pre-built medically accurate offline responses |
| Geolocation denied | Shows clear error message, prompts user to enable location |
| No hospitals found in 5km | Displays message advising to call 112 directly |
| Network offline | Fallback responses work without internet |
| Invalid/empty input | Alert prompts user to describe the emergency |

---

## 🧗 Challenges & Solutions

**Challenge 1: ChatGPT-4 API response shape**
The RapidAPI ChatGPT-4 endpoint returns responses in a non-standard shape (`data.result` instead of `data.choices[0].message.content`). Solved by checking multiple possible response fields in order before throwing an error.

**Challenge 2: Port 80 conflict on web servers**
Nginx was already running on port 80 on both web servers. Solved by stopping Nginx with `sudo systemctl stop nginx` before running the Docker container on port 80.

**Challenge 3: CORS with Overpass API**
The Overpass API requires requests from a running web server, not `file://`. Solved by always running the app through a local server or Docker container.

**Challenge 4: French string encoding in JavaScript**
French apostrophes (`'`) in inline JS strings caused syntax errors. Solved by using Unicode escape sequences (`\u2019`) in the script.

---

## 📹 Demo Video

**Link:** [YouTube/Vimeo link here]

The demo video covers:
1. Running the app locally
2. Selecting a quick emergency (cardiac arrest)
3. Typing a custom emergency description
4. Viewing AI-generated first aid instructions
5. Using the hospital finder with live geolocation
6. Switching languages (EN → FR → SW)
7. Toggling light/dark mode
8. Accessing the app via the load balancer URL

---

## 📚 Resources & Credits

- [ChatGPT-4 API — RapidAPI](https://rapidapi.com/rphrp1985/api/chatgpt-42)
- [OpenStreetMap Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API)
- [Playfair Display — Google Fonts](https://fonts.google.com/specimen/Playfair+Display)
- [DM Sans — Google Fonts](https://fonts.google.com/specimen/DM+Sans)
- [Nginx Alpine Docker Image](https://hub.docker.com/_/nginx)
- [HAProxy Documentation](https://www.haproxy.org/#docs)

---

## 👤 Author

**Guy Mugisha** — ALU (African Leadership University), 2026
GitHub: [@guymugisha](https://github.com/guymugisha)

---

> ⚠️ ResQ does **not** replace professional medical advice. Always call emergency services first — **112** in East Africa.