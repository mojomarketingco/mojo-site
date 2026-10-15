# themojomarketing.com

Static site for Mojo Marketing. Plain HTML, CSS and JS — no build step, no
server, no database.

## Deploying

Hosted on **GitHub Pages** from this repo, `main` branch, root folder.
Pushing to `main` publishes the site. DNS is handled by Cloudflare, which is
**DNS only** (grey cloud) — the orange proxy must stay off or GitHub cannot
issue or renew the TLS certificate.

`CNAME` and `.nojekyll` are load-bearing. Do not delete either.

CSS and JS are requested with `?v=<content hash>`. When you change either
file, update the hash in every HTML page or browsers will serve the old one.

## Security

The site has no server, no database, no login, no admin area and no API of
its own, so most of a conventional web-app checklist does not apply. What
does apply:

- **No secrets in the repo.** The only key in the markup is the Web3Forms
  `access_key`, which is public by design — it identifies the destination
  inbox and cannot read anything. Treat it as spam-exposed, not as a secret:
  the protection is Web3Forms' own domain restriction and captcha settings,
  not hiding the key.
- **Content-Security-Policy** and **Referrer-Policy** are set per page via
  `<meta>` tags. The CSP restricts which origins can load scripts, styles,
  fonts, images and connections, and restricts where forms may post.
  Changing where the site loads anything from means updating the CSP in
  every page, or the new resource will be blocked.
- **No user input is ever rendered.** The only `innerHTML` use is the hero
  typing animation, fed from a hardcoded array in `js/site.js`.

Three headers **cannot** be set from a static host like GitHub Pages, because
they only exist as real HTTP response headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options` / CSP `frame-ancestors` (clickjacking protection)
- `Strict-Transport-Security`

Setting those needs something in front that can add headers — a proxied
Cloudflare setup, Netlify, or similar. A `_headers` file previously lived
here from the Cloudflare Pages era; GitHub Pages ignores it, so it was
removed rather than left looking like active configuration. It is in the git
history if the site ever moves back.
