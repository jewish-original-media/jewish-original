# V1 launch readiness

Status: Integration Preview launch infrastructure is in place. Production,
DNS, and `main` cutover are not done.

## Live public inventory

- History: 5 published articles
- Originals: 2 published house essays
- Podcasts: 1 show, 4 episodes
- News: 4 outbound items, 2 publishers; homepage module on; nav off
- Events: 0 published; route intact; homepage, nav, and sitemap off
- Jewish Today: live daily utility

## Public chrome

Primary nav: Today, History, Originals, Podcasts, About, Support.

Footer adds Originals and News. Events stay out until inventory is
meaningfully broader. News stays out of primary nav until five strong items
and three publishers exist.

## Trust

`/about` states source method, AI-assisted News context, corrections contact,
and editorial independence. News cards are not labeled “AI”.

`/support` remains mailto until real Stripe payment links exist. No tax
deductibility claims.

`/privacy` describes cookieless Vercel Web Analytics and Speed Insights. It
is still not a binding legal policy.

## Discovery

Canonical host: `https://jewishoriginal.com`.

Preview deployments send `robots.txt` disallow-all. Production robots will
allow `/` and disallow `/admin/` and `/api/`.

Sitemap includes Home, Today, History (published slugs only), Podcasts
(published show/episodes only), Originals (published slugs only), News,
About, Support, Privacy. No Events, no drafts, no `/admin`, no query URLs,
no podcast dev fixture.

Default social image is typography-led (`opengraph-image`). Favicon and app
icon are typography-led “JO” marks. The supplied JOM raster logo is not used
for social or icons because it has a baked black field.

## Production checklist (do not perform yet)

1. Create remote `main` from the approved Integration tip
2. Move GitHub default branch to `main`
3. Point Vercel Production to `main`
4. Protect `main`
5. Verify Production env vars (read token, draft secret, site URL, analytics)
6. Do not enable ingest writes or cron on Production until founder approval
7. Production smoke of `/`, `/today`, `/history`, `/originals`, `/podcasts`, `/news`, `/about`, `/support`, `/privacy`
8. Attach `jewishoriginal.com` and `www` with apex/www redirect
9. Confirm SSL
10. Add Search Console and submit `/sitemap.xml`

## Next

Founder visual pass on the content-rich Preview, then Production cutover.
Not History expansion from Integration. Not DNS from this branch.
