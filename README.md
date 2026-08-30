# Flip a Coin (Email Edition)

*(See my [email-based magic 8-ball](https://github.com/tinkerer9/magic-8-ball-email) for more information)*

When someone sends an email, Cloudflare's edge servers run the worker in [`src/index.ts`](src/index.ts).
The script hashes the email&mdash;sender, subject, and body&mdash;as a SHA-256 string, extracts the first byte, and uses the first bit from that for the heads/tails.
Unlike randomly picking a response, this method gives the exact same result if the question is the same.

<!-- markdownlint-disable-next-line MD026 -->
## Try it out!

Send an email to [**coin@maxparisi.me**](mailto:coin@maxparisi.me).
The worker may take up to 30 seconds, so be patient!
