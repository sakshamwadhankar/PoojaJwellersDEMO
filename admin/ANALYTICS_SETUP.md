# Analytics Setup

## 1. Public Site GA4

Create a Google Analytics 4 property and copy the Measurement ID.

Add it to the public site `.env.local`:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 2. Google Cloud

1. Open Google Cloud Console.
2. Create or select the same project connected to your GA4 property.
3. Enable `Google Analytics Data API`.
4. Go to `IAM & Admin -> Service Accounts`.
5. Create a service account.
6. Create a JSON key and download it.

From that JSON file, copy:

- `client_email`
- `private_key`

## 3. GA4 Access

In Google Analytics:

1. Open `Admin`.
2. Open `Property Access Management`.
3. Add the service account `client_email`.
4. Give it `Viewer` access.

## 4. Admin Env Vars

Add these to `admin/.env.local`:

```env
GA_PROPERTY_ID=123456789
GA_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

Keep the `\n` characters exactly like that in `.env.local`.

## 5. Run Admin

```bash
cd admin
npm run dev
```

Open `http://localhost:3000/dashboard`.

If the chart says env keys are missing, check `admin/.env.local`.

If the chart is empty, GA4 is connected but has no traffic yet.
