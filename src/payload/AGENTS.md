# Payload scaffold ownership

- This folder is a guarded Payload-ready scaffold, not an active CMS by default. Admin and API routes remain unavailable until an instance explicitly completes activation.
- Keep Payload SDK types, collection details, relationships, media records, drafts, SEO, localization, redirects, and taxonomies behind server-side adapters.
- Normalize Payload data into the source-neutral marketing contracts before rendering. Frontend sections must not import Payload document shapes.
- Static project assembly excludes this folder, Payload configuration, routes, packages, and deployment documentation entirely.
- Payload-powered Vercel activation follows `docs/guides/payload-vercel-neon-blob.md`, provisions Neon and Vercel Blob, and supplies project secrets through environment storage.
- Preserve committed fallback content until schema migration, seed/readback, and rendered parity are proven.
