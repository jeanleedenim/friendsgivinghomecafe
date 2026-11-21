# Aura order site

Static site (`index.html`) + one serverless function (`api/order.js`) that emails you each order with the selfie.

## Deploy
1. Create a GitHub repo, upload these files, commit.
2. vercel.com > Add New > Project > import the repo > Deploy.
3. Get a free API key at resend.com. In Vercel: Settings > Environment Variables, add:
   - `RESEND_API_KEY` = your Resend key
   - `OWNER_EMAIL` = the email you signed up to Resend with (the free test sender only delivers to that address)
4. Redeploy (Deployments > ... > Redeploy). Done.

## Gift cards
Each order email reminds you to verify the aura invites. $25 per verified person, $500 cap = 20 gift cards; keep your own tally.
