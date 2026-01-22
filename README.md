# ⚡ Monzed AutoShorts AI Playground (v1.0.0)

### **Industrial-Grade Video Generation Engine. Build Your Own Viral SaaS.**

**AutoShorts AI** transforms raw, long-form content into high-impact viral shorts. This repository provides the complete source code for our interactive playground, designed to help founders and developers master the Monzed API, fine-tune visual presets, and prototype viral content strategies in real-time.

---

[![Official Site](https://img.shields.io/badge/Monzed-Official_Site-5865F2?style=for-the-badge&logoColor=white)](https://monzed.com/apis/autoshorts)
[![Get API Key](https://img.shields.io/badge/API-Get_Token_Now-emerald?style=for-the-badge&logoColor=white)](https://monzed.com/client/api)
[![Technical Support](https://img.shields.io/badge/Support-Help_Center-orange?style=for-the-badge&logoColor=white)](https://monzed.com/support)

---

## 📽️ The Transformation: Raw vs Viral

Our AI doesn't just clip—it curates, reframes, and enhances. The playground demonstrates the engine's ability to identify viral hooks and apply production-grade effects automatically.

| 🔴 SOURCE 2 hours (UNEDITED) | 🟢 AI RESULT 60 seconds (Face Tracking, Captions, Background Music, Fade In & Fade Out) |
|:---:|:---:|
| [![Before Video](https://img.youtube.com/vi/Rni7Fz7208c/0.jpg)](https://youtu.be/Rni7Fz7208c) | [![After Video](https://img.youtube.com/vi/GoITUMxlwBI/0.jpg)](https://youtu.be/GoITUMxlwBI) |
| *Original horizontal lecture.* | *Vertical short with AI face tracking.* |

---

## 🏗️ Quick Installation

Deploy the playground locally to start prototyping your video SaaS:

### 1. Clone & Install
```bash
git clone https://github.com/MinightDev/Autoshorts.git
cd Autoshorts
npm install
```

### 2. Configure Authentication
Create a `.env` file in the root directory. Get your production key at [monzed.com/client/api](https://monzed.com/client/api).
```env
# Production API endpoint
VITE_API_BASE_URL=https://api.monzed.com/autoshorts/v1
```

### 3. Launch Development Server
```bash
npm run dev
```

---

## 📚 Comprehensive API Masterclass (v1.0.0)

The Monzed Engine is highly configurable. The playground exposes these core objects:

### ⚙️ 1. Core Config (`config`)
| Parameter | Type | Default | Description |
|:---:|:---:|:---:|---|
| `resolution` | `string` | `1080p` | `1080p` (HD) or `720p`. `4k` is exclusive to the **Agency Plan**. |
| `clips_count` | `number` | `3` | Total viral segments the AI will attempt to extract. |
| `min_duration` | `number` | `15` | Minimum length (seconds) for each clip. |
| `max_duration` | `number` | `60` | Maximum length (seconds) for each clip. |
| `quality_preset`| `string` | `balanced` | `balanced` (Fast/8Mbps) vs `best` (Pro/20Mbps). |
| `hardware` | `string` | `cpu` | `cpu` (Shared) vs `gpu` (NVIDIA T4 Clusters - 10x faster). |

### 📝 2. AI Content Focus (`content`)
| Parameter | Type | Default | Description |
|:---:|:---:|:---:|---|
| `prompt_style` | `string` | `viral_hook` | AI Persona: `viral_hook`, `storytelling`, `educational`, `funny`, `news`, etc. |
| `custom_prompt` | `string` | `null` | Direct surgical instructions (e.g., *"Focus on technical jokes"*). |
| `language` | `string` | `auto` | Source language. Use `auto` for Whispher-based detection. |

### 💬 3. Subtitle retention (`captions`)
*   **Animations:** `pop`, `bounce`, `fade`, `glow`, `highlight`, `word_box`, `karaoke`, `typewriter`.
*   **Design:** Full control over `font`, `fontsize`, `color`, `stroke_width`, and `words_per_caption`.
*   **Position:** Precise control with `position` (top/center/bottom) plus `position_x`/`position_y` offsets.

### 🎨 4. Visual Intensity (`visuals`)
*   **AI Face Tracking:**centers the speaker even in multi-person videos.
*   **Cinematic Effects:** Apply filters like `glitch`, `vignette`, `vintage`, `soft_glow`, `slow_zoom_in`, and more.

### 🎵 5. Professional Audio (`audio`)
*   **AI Music selection:** Set `source_url` to **`"auto"`** to let the engine choose music matching your content's vibe.
*   **Normalization:** Master speaker volume is normalized; background music utilizes auto-ducking to ensure clarity.

---

## 📊 Credits & The "Fair Usage" Formula

Monzed protects your SaaS margins with a predictable, transparent credit system:

**`Job Cost = (Clips × 5) + ceil(Source Minutes ÷ 10)`**

| Scenario | Duration | Clips Requested | Total Credits |
|:---|:---:|:---:|:---:|
| **TikTok Starter** | 10 min | 3 Clips | **16 Credits** |
| **Podcast Deep Dive** | 60 min | 1 Clip | **11 Credits** |
| **Industrial Scale** | 120 min | 5 Clips | **37 Credits** |

---

## 📟 Security & Best Practices

- **401 Unauthorized**: Ensure your `mk_live_...` key is valid and has not expired.
- **402 Payment Required**: Credits are deducted **atomically** based on the duration check. Insufficient balance will reject the job instantly.
- **Permanent Access**: S3 links expire. Always use the `/download/{job_id}/{clip_id}` proxy endpoint in your production apps for permanent video availability.

---

### [🔗 Official API Documentation & Reference](https://monzed.com/apis/autoshorts

**Copyright © Monzed.**
Built for the next generation of content creators and SaaS founders.
MIT License - See [LICENSE](LICENSE) for details.
