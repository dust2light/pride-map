# MapDate Backend

The frontend prototype is ready for a real backend.

## Required services

- Authentication for adults (18+)
- PostgreSQL database
- Secure API / row-level authorization
- Approximate location search
- Likes -> mutual match
- Private chat
- Report / block / moderation

## Location privacy

Do not publish a user's exact latitude/longitude to other users. Store it privately and calculate an approximate distance or coarse geographic cell on the server.

## Next integration

Connect a managed PostgreSQL/Auth provider such as Supabase. Keep the project URL and public client key in deployment environment variables; never commit service-role secrets to GitHub.

See `backend-schema.sql` for the initial database model.
