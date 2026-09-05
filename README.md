# JM Munna — Portfolio Website

A static portfolio site for JM Munna (Video Editor & Student), built with HTML, CSS, and vanilla JavaScript. Content is managed through **Decap CMS**, stored as JSON files in the `content/` folder, hosted on **GitHub**, and deployed on **Netlify**. No backend server, no database, no Firebase.

---

## 1. Project structure

```
/
├── index.html            → the whole site (single page, section per anchor)
├── css/style.css         → all styles and design tokens
├── js/
│   ├── content-loader.js → fetches content/*.json and renders every section
│   └── script.js         → theme toggle, mobile menu, scroll effects
├── content/               → editable content (JSON), edited via /admin/
│   ├── settings.json      → site title, logo, favicon, social links
│   ├── home.json          → hero section text/image
│   ├── about.json
│   ├── skills.json
│   ├── education.json
│   ├── experience.json
│   ├── projects.json      → array of projects
│   ├── photos.json        → array of gallery photos
│   ├── videos.json        → array of videos (Facebook/YouTube links)
│   ├── certificates.json  → array of certificates
│   └── contact.json
├── images/uploads/        → images uploaded through the CMS land here
├── admin/
│   ├── index.html         → Decap CMS admin app
│   └── config.yml         → defines every editable field
├── favicon/, assets/      → icons and misc assets
├── robots.txt, sitemap.xml
├── netlify.toml
└── README.md
```

**How it works:** the frontend never talks to a database. `content-loader.js` fetches the JSON files in `content/` and renders them into the page at load time. When you edit something in the `/admin/` panel and publish, Decap CMS commits an updated JSON file straight to your GitHub repo, Netlify rebuilds automatically, and the live site picks up the change.

---

## 2. Run it locally

No build step is required, but you can't just double-click `index.html` — browsers block `fetch()` on local files. Serve it instead:

```bash
# from the project folder
python3 -m http.server 8000
# then open http://localhost:8000
```

or with Node installed:

```bash
npx serve .
```

---

## 3. Put it on GitHub

1. Create a new empty repository on GitHub (no README/license — you already have files).
2. From inside the project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit — JM Munna portfolio"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

---

## 4. Deploy to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
2. Connect GitHub and pick your repository.
3. Build settings:
   - **Build command:** leave blank
   - **Publish directory:** `.` (the repo root)
4. Click **Deploy site**. Netlify gives you a URL like `https://your-site-name.netlify.app`.

Optional: in **Site settings → Change site name**, pick a nicer subdomain. Update that name in `robots.txt`, `sitemap.xml`, and `admin/config.yml` (`site_url` / `display_url`) afterward.

---

## 5. Turn on the admin panel (Decap CMS + Netlify Identity)

The admin panel needs Netlify Identity and Git Gateway turned on — this is what lets a non-programmer log in and publish changes without touching GitHub directly.

1. In your Netlify site dashboard: **Site configuration → Identity → Enable Identity**.
2. Under **Identity → Registration**, set it to **Invite only** (so strangers can't sign up).
3. Under **Identity → Services**, enable **Git Gateway**. This lets Netlify commit CMS edits to GitHub on your behalf, so nobody needs a personal GitHub login to use the admin panel.
4. Under **Identity → Invite users**, invite yourself (and JM Munna, if he'll edit content) by email.
5. Check your email for the invite, click it, and set a password. It will redirect to the site — that's expected.

---

## 6. Access the admin panel

Go to:

```
https://your-site-name.netlify.app/admin/
```

Log in with the email/password from your Identity invite. You'll see a dashboard with: **Site Settings, Home Page, About, Skills, Education, Experience, Projects, Photo Gallery, Videos, Certificates, Contact.**

Every field maps directly to what's shown on the live site. Click a section, edit, then **Publish** — Netlify rebuilds automatically (usually live within 30–60 seconds).

---

## 7. Common editing tasks

**Add/replace photos:**
`Photo Gallery` → add a new item (or edit one) → upload an image → add a title/caption → toggle **Featured** if it should appear on the homepage → Publish.

**Add a Facebook video:**
Upload the video to Facebook first, then copy its URL (from the browser address bar or the Share button). In `Videos`, add a new item → paste the URL into **Video URL** → upload a **Thumbnail Image** → Publish. The site will try to embed it directly; if Facebook blocks the embed (this depends on the video's privacy settings), visitors automatically see a "Watch on Facebook" button instead. YouTube links work the same way and embed directly.

**Update any text (bio, hero intro, skills, etc.):**
Go to the matching section in the CMS, edit the text field, Publish.

**Replace the logo or profile photo:**
`Site Settings` → **Logo Image** / **Profile Image**. The hero photo on the homepage is separate — that's under `Home Page` → **Hero Image**, and the About page photo is under `About` → **Profile Image**.

**Add/remove a certificate, project, or skill:**
Open that section in the CMS — each is a list. Use **Add** to create a new entry, the trash icon to remove one, and drag the handle to reorder.

**Upload a CV:**
`Contact` → **CV File** → upload a PDF. The "Download CV" button appears automatically on the site once a file is uploaded, and stays hidden until then.

---

## 8. Deploying future changes

- **Content changes** (text, images, projects, etc.): just use `/admin/` and click Publish — nothing else needed.
- **Code changes** (HTML/CSS/JS): edit locally, then:
  ```bash
  git add .
  git commit -m "Describe your change"
  git push
  ```
  Netlify redeploys automatically on every push to `main`.

---

## 9. Notes

- No video files are ever stored in this repository — videos live on Facebook/YouTube and only their links + thumbnails are stored.
- Sections with no content automatically hide themselves instead of showing empty or broken cards (Projects, Gallery, Videos, Certificates, the Download CV button, and each social icon all do this).
- All placeholder text in `content/*.json` is clearly generic ("Sample Project One", "Your Institution Name," etc.) — replace it through the admin panel rather than treating it as real information.
- Theme (dark/light) is chosen automatically from the visitor's system preference on first visit, then remembered after they use the toggle.
