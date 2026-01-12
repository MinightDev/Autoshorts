# ⚡ Monzed AutoShorts AI Playground

### Industrial-Grade Video Generation Engine. Build Your Own Viral SaaS.
**Autoshorts AI** transforms long videos into engaging viral shorts using the power of artificial intelligence. It analyzes video content, identifying key topics or moments likely to interest viewers, and automatically generates shorts with professional effects, animations, captions, face tracking, and music.

---

[![Official Site](https://img.shields.io/badge/Monzed-Official_Site-5865F2?style=for-the-badge&logoColor=white)](https://monzed.com/apis/autoshorts)
[![Get API Key](https://img.shields.io/badge/API-Get_Token_Now-emerald?style=for-the-badge&logoColor=white)](https://monzed.com/client/api)
[![Technical Support](https://img.shields.io/badge/Support-Help_Center-orange?style=for-the-badge&logoColor=white)](https://monzed.com/support)

---

## 📽️ The Transformation: Raw vs Viral

Experience the transformation quality. Our AI doesn't just cut—it curates, reframes, and enhances.

| 🔴 SOURCE (UNEDITED) | 🟢 RESULT (OPTIMIZED) |
|:---:|:---:|
| [![Before Video](https://img.youtube.com/vi/gV6hP9wpMW8/0.jpg)](https://youtu.be/gV6hP9wpMW8) | [![After Video](https://img.youtube.com/vi/4Be3y6aTkdQ/0.jpg)](https://youtu.be/4Be3y6aTkdQ) |
| *Minutes of raw footage.* | *60s High-retention viral clip.* |

---

## 🏗️ Build Your SaaS on Monzed

This repository is more than a demo—it's a foundation. We provide the source code for this playground so you can:
1. **Discover** how to interface with high-performance AI video infrastructure.
2. **Build** your own unique frontend or Saas brand on top of our API.
3. **Scale** instantly using our GPU clusters.

---

## 🛠️ Quick Installation

Deploy the playground locally in minutes:

### 1. Clone & Install
```bash
git clone https://github.com/MinightDev/Autoshorts.git
cd Autoshorts
npm install
```

### 2. Configure Authentication
Create a `.env` file in the root directory. You can get your key at [monzed.com/client/api](https://monzed.com/client/api).
```env
VITE_API_BASE_URL=https://api.monzed.com/autoshorts/v1
```

### 3. Launch Development Server
```bash
npm run dev
```

---

## 📚 Comprehensive API Parameter Masterclass

The Monzed Engine is highly configurable. Below is an exhaustive list of every parameter you can send to the `/generate` endpoint.

### 1. Core Logic (`VideoConfig`)
These settings define the structural output of your video.

| Parameter | Type | Description |
|:---:|:---:|---|
| `resolution` | `string` | `1080p` (1080x1920) or `720p` (720x1280). Highly recommended to use 1080p for TikTok/Reels. |
| `clips_count` | `number` | The number of segments the AI should attempt to extract (1-10 suggested). |
| `min_duration` | `number` | Minimum length of each clip in seconds. |
| `max_duration` | `number` | Maximum length of each clip in seconds. |
| `quality_preset`| `string` | `balanced` (Fast) or `best` (Higher bitrate, multi-pass encoding). |
| `hardware` | `string` | `cpu` (Standard) or `gpu` (**NVIDIA T4**). GPU mode enables 10x faster encoding. |

### 2. Content Strategy (`ContentConfig`)
Control what the AI looks for and how it frames the narrative.

| Parameter | Type | Description |
|:---:|:---:|---|
| `prompt_style` | `string` | AI Persona: `viral_hook`, `storytelling`, `educational`, `funny`, `inspirational`, etc. |
| `custom_prompt` | `string` | (Optional) Direct instructions to the AI on what specific topics to clip. |
| `language` | `string` | Source language code (e.g., `en`, `es`, `fr`). Use `auto` for AI detection. |

### 3. Caption Design (`CaptionConfig`)
Captions are the most critical element for social media retention.

*   **`animation`**:
    *   `word_box`: Dynamic box surrounding the active word.
    *   `highlight`: Active word changes color.
    *   `karaoke`: Progressive reveal of words.
    *   `glow`: Soft glow transition on text.
*   **`font`**: Choose from premium fonts like *Inter, Montserrat, Roboto, or Impact*.
*   **`cadence`**: (`words_per_caption`) 1-5 words. Lower values = faster, high-energy reading.
*   **`styling`**: Control `color`, `stroke_color`, `stroke_width`, `bold`, and `italic`.
*   **`positioning`**:
    *   `top`, `center`, `bottom`.
    *   `position_x` / `position_y`: Custom pixel offsets for precise branding.

### 4. Visual Intelligence (`VisualConfig`)
*   **`face_tracking`**: (Boolean) Our proprietary AI specifically centers the speaker's face even if they move within the original wide-angle frame.
*   **`crop_strategy`**: `smart_center` (AI-driven) vs `center` (Fixed).
*   **`effects`**: Array of cinematic filters:
    *   `glitch`, `shake`, `vignette`, `vintage`, `soft_glow`, `slow_zoom_in`.

### 5. Professional Audio (`AudioConfig`)
*   **`voiceover_volume`**: Boost or normalize original speaker audio.
*   **`background_music`**:
    *   **`source_url`**: Audio link (.mp3) or set to **`"auto"`** to let AI choose music based on content vibe.
    *   `volume`: 0.0 to 1.0 (Auto-ducking is enabled by default).
    *   `loop`: Seamless looping of tracks.
*   > [!IMPORTANT]
    > **Audio Limit**: For system stability, all background audio downloads (YouTube or Direct) are restricted to a maximum duration of **10 minutes**. Tracks exceeding this will be rejected.

### 6. Integration Features
*   **`webhook_url`**: Receive a JSON POST payload when the job is done. Perfect for building automated SaaS pipelines.

---

## 🚀 Scaling to Production

When you are ready to take your app live:
1.  **Production Credits**: Purchase credits at [monzed.com/client/api](https://monzed.com/client/api).
2.  **Custom Features**: Contact us if you need custom features or specific configurations added for your use case.

---

## ⚖️ Legal & Copyright

**Copyright © Monzed.**

This source code is provided under an **Open Discovery License**. You are free to explore, debug, and build applications on top of the Monzed AutoShorts API. This repo is designed to be a transparent guide for developers.

*   **Support & Discord**: [monzed.com/support](https://monzed.com/support)
*   **Business Inquiries**: [team@monzed.com](mailto:team@monzed.com)
*   **Contact Sales**: [monzed.com/products](https://monzed.com/products)

---

### [🔗 Official API Documentation & Reference](https://monzed.com/apis/autoshorts)
