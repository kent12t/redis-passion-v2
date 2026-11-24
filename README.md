# Ideal Pursuit

A personality quiz that ends in a photo. Visitors answer a few questions, get one of six "ideal pursuit" personalities, and see a costume for that personality fitted onto their face by the camera. They can then scan a QR code to download the photo.

Ideal Pursuit was one of the games at the **Life Unstoppable Roadshow** for the Agency for Integrated Care, which ran in four Singapore venues in 2025 and 2026. It ran on a large vertical display in kiosk mode.

Case study: [kentlimanza.co/work/aic-life-unstoppable-2025](https://kentlimanza.co/work/aic-life-unstoppable-2025)

## How it works

- **Quiz.** Each answer can award points to several personalities, and the highest total wins. A tie goes to the first personality in the fixed order in `app/data/personality.json`. The questions, weights, and six results (The Wellness Warrior, The Adventurous Artist, The Tech Explorer, The Everyday Creator, The Urban Gardener, The Community Champion) were checked and rebalanced with simulations outside this repo.
- **Costume overlay.** Face detection (`@vladmandic/face-api`, SSD MobileNet V1, models in `public/models/`) places a 3D-rendered costume on the face. Position and scale are smoothed, and the costume stays on screen if tracking drops for a moment.
- **Photo and QR.** The captured photo is shown straight from the local blob, then uploaded through `app/api/upload-image` to Cloudflare R2 so the QR code can point at a public image URL.
- **Languages.** English, Chinese, Malay, and Tamil, with localised questions, text, and result artwork.
- **Kiosk use.** Portrait scaling, touch-gesture suppression, and button placement that works for standing visitors and wheelchair users. `EdgeKioskLauncher.bat` and `Redis-Passion-Autorun.bat` launch it unattended on Windows; edit the project path inside them first.
- **Optional activity log.** If Supabase is configured, each session is recorded as started and then marked complete with the personality result. The game plays on if Supabase is missing or fails.

## Running it

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and allow camera access. The quiz works without any environment variables; sharing needs R2 and the activity log needs Supabase.

Create `.env.local` with:

```env
# Photo sharing (Cloudflare R2, S3-compatible)
CLOUDFLARE_R2_ENDPOINT=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
CLOUDFLARE_R2_PUBLIC_URL=

# Optional activity log
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

More on the upload endpoint is in [app/api/README.md](app/api/README.md).

## Privacy

Photos are taken on the visitor's device and uploaded only when sharing. The live deployment's bucket deleted images after 30 days through a Cloudflare lifecycle rule, which is bucket configuration and not part of this repo. If you deploy it, set your own retention and tell visitors what happens to their photo.

## Stack

Next.js, React, TypeScript, Tailwind CSS, Radix UI, `@vladmandic/face-api`, Cloudflare R2 (AWS SDK), Supabase.

## Credits

A team-built roadshow. Clarita made the graphics and the UI of the game. Raja and Isaac handled client servicing and the event.

I (Kent, [@kent12t](https://github.com/kent12t)) came up with the camera-filter idea, designed the user journey and early wireframes, wrote the quiz content and scoring, 3D-modelled the six costumes, and built the game.

## License

GPL-3.0, see [LICENSE](LICENSE).
