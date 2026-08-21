# Arty Affairs

Vite + React shop for original art, workshops, and interiors. Data lives in Supabase. Checkout uses Razorpay. Enquiry emails use Resend. Deploy on Vercel.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`. The app expects a `.env` file (see `.env.example`).

## Deploy on Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com) → **Add New Project** → import the repo.
3. Framework should be **Vite**. Build command `npm run build`, output `dist`.
4. Add environment variables (Project → Settings → Environment Variables) for **Production**, **Preview**, and **Development**.
5. Deploy. After the first deploy, copy the URL into `VITE_SITE_URL` and redeploy so Google auth redirects to the live domain.

Client `VITE_*` values are baked in at **build** time. If you change them, trigger a new deployment.

### Environment variables

| Name | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Vercel + local `.env` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Vercel + local `.env` | Supabase anon/public key |
| `VITE_SITE_URL` | Vercel | Live site URL, no trailing slash (Google OAuth redirect) |
| `VITE_RAZORPAY_KEY_ID` | Vercel + local `.env` | Razorpay **key id** (public) |
| `VITE_ADMIN_EMAILS` | Vercel + local `.env` | Comma-separated admin logins |
| `VITE_ENQUIRY_EMAIL` | optional | Shown as enquiry destination in the client |
| `VITE_INSTAGRAM_URL` | optional | Footer Instagram link |
| `RAZORPAY_KEY_ID` | Vercel only | Same key id as above, for `/api/create-order` |
| `RAZORPAY_KEY_SECRET` | Vercel only | Razorpay secret — never prefix with `VITE_` |
| `RESEND_API_KEY` | Vercel only | Sends workshop/order emails |
| `RESEND_FROM_EMAIL` | Vercel only | Must be a verified Resend sender |
| `ENQUIRY_EMAIL` | Vercel only | Inbox for enquiries and new-order alerts |

Checkout and emails will fail until Razorpay and Resend secrets are set on Vercel. The rest of the site still works.

## After deploy: Supabase

In **Authentication → URL configuration**:

- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**` and `http://localhost:3000/**`

Enable **Email** (and **Google** if you use it). For Google, set the same callback in Google Cloud: `https://<project>.supabase.co/auth/v1/callback`.

Run `supabase-admin-policies.sql` in the SQL editor if admins cannot create/update artworks, workshops, or orders.

Storage: public bucket for artwork images if you upload files (the current admin upload uses image URLs).

## After deploy: Razorpay

1. Create a Razorpay account and get Key ID + Key Secret (test first).
2. Set `VITE_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` on Vercel.
3. Checkout calls `/api/create-order` and `/api/verify-payment` (Vercel serverless functions in `api/`).

Local `vite` preview does **not** run those API routes. Use `vercel dev` if you need payments locally.

## After deploy: Resend

1. Create an API key and verify a sending domain (or use `onboarding@resend.dev` for tests).
2. Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `ENQUIRY_EMAIL`.

## Admin

Sign in with an email listed in `VITE_ADMIN_EMAILS`. Admin routes: `/admin-dashboard` (artworks, workshops, orders) and `/admin/upload`.
