# NXTGEN Solutions - Enterprise Cybersecurity & Technology Portal

A high-performance, responsive, and secure website portal for **NXTGEN Solutions** built with modern web technologies, vanilla HTML/CSS/JS, and serverless email integrations.

---

## 🚀 Key Features

- **Cybersecurity & Facilities Catalog**: 8 dedicated marketing and implementation portals (Home, About Us, Services Hub, ID Cards, Access Control, Biometrics, CCTV, VAPT).
- **Dynamic Services Explorer**: Interactive layout that displays categories side-by-side, manages sub-tabs, and features a slide-out details inspector panel.
- **Interactive Particle Backgrounds**: WebGL and HTML5 2D canvas particle networks floating in the hero space that dynamically attract towards the user's cursor or finger touch events (mobile-friendly).
- **Secure Enquiry Pipeline**: Serverless `/api/contact` endpoint running on Vercel Node runtime.
  * **Input Sanitation**: Strips CRLF headers to prevent email header injection and escapes HTML inputs.
  * **Anti-Spam Security**: Built-in in-memory client IP rate limiter (maximum 3 requests per minute).
  * **SMTP Delivery**: Nodemailer configurations utilizing Hostinger Business SMTP to send enquiries directly to `info@nxt-gen.in`.
- **Theme Consistency**: Fully responsive layout matching Outlined fonts, vibrant gradient color systems, and modern glassmorphic overlays.

---

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML5, CSS3 Custom Properties (Variables), client-side ES6 JavaScript, [Lucide Icons](https://lucide.dev/), and [FontAwesome](https://fontawesome.com/).
- **Backend API**: Vercel Node.js Serverless Functions (`/api/contact.js`).
- **Email Delivery Service**: Nodemailer library routing requests via secure Hostinger SMTP.

---

## 📁 Project Structure

```
nxtgen-solutions-website/
├── api/
│   └── contact.js          # Vercel serverless contact form endpoint (Node.js)
├── public/
│   ├── css/
│   │   └── style.css       # Unified global style tokens & custom layout design
│   ├── js/
│   │   ├── bg-network.js   # Background constellation network canvas
│   │   ├── hero-3d.js      # Three.js WebGL hero animation nodes
│   │   └── main.js         # Core JS: animations, tabs, and form logic
│   ├── components/
│   │   ├── navigation.html # Shared responsive navbar header component
│   │   └── footer.html     # Shared branded footer component
│   ├── images/             # Optimised logos and graphics assets
│   ├── index.html          # Portal home page
│   ├── about.html          # About Us page
│   ├── services.html       # Services Hub page
│   ├── idcard.html         # ID Card solutions sub-page
│   ├── accesscard.html     # Access card configurations sub-page
│   ├── biometrics.html     # Biometrics consultation sub-page
│   ├── cctv.html           # CCTV implementations sub-page
│   ├── vapt.html           # VAPT Auditing sub-page
│   ├── contact.html        # Contact Us page
│   └── robots.txt          # SEO crawler management policy file
├── .gitignore              # Excludes development caches, OS folders, and env files
├── package.json            # Node dependency mapping (Nodemailer declarations)
├── vercel.json             # Vercel deployment directives (clean URLs)
└── README.md               # Operations manual & system documentation
```

---

## 💻 Local Development

1. **Serve Files**: Serve the `/public` folder using a simple HTTP server:
   ```bash
   # Python 3
   python -m http.server 8000 --directory public
   
   # Node.js Live Server
   npx live-server public
   ```
2. **View in Browser**: Open `http://localhost:8000` inside your browser.
3. **Form Submissions**: Form submissions will function locally with a simulated success display. To test actual email delivery, deploy the project to Vercel with active SMTP variables.

---

## 📦 Production Deployment (GitHub → Vercel)

This project is configured for continuous delivery via **Vercel**. Every push to the `main` branch on GitHub triggers an automatic production build.

### 1. Environment Variables Configuration
To send emails successfully, configure these environment variables in your Vercel Dashboard (**Project Settings -> Environment Variables**):

| Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `SMTP_HOST` | `smtp.hostinger.com` | Hostinger Business Email SMTP Server |
| `SMTP_PORT` | `465` | Secure SSL connection port |
| `SMTP_USER` | `info@nxt-gen.in` | SMTP login user email address |
| `SMTP_PASSWORD` | `[Your Password]` | Hostinger email password |
| `MAIL_TO` | `info@nxt-gen.in` | Recipient inbox email address |

### 2. Custom Domain Configuration (`nxt-gen.in`)
Add your custom domain in the **Vercel Dashboard** (**Project Settings -> Domains**):
- Add `nxt-gen.in`
- Select Vercel's recommendation to auto-redirect `www.nxt-gen.in` to `nxt-gen.in`.

### 3. Hostinger DNS Records Configuration
Login to **Hostinger hPanel** -> **Domains** -> Manage `nxt-gen.in` -> **DNS / Nameservers**, and configure these records:

| Type | Name | Value | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` | `3600` |
| **CNAME** | `www` | `cname.vercel-dns.com.` | `3600` |

*⚠️ Note: Delete any existing conflicting A records pointing `@` or CNAME records pointing `www` to old Hostinger IP addresses before adding the new entries.*
