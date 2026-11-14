# Property Finder · Admin portal (React)

Web dashboard for the owner/admin: approve or reject listings (with photos), accept or
reject dealer applications, see users, visits and charts.

## 1. Database (once)
In the Supabase **SQL Editor** run, in this order:
1. `supabase/setup.sql`
2. `supabase/app_setup.sql`
3. `supabase/portal_setup.sql`

## 2. Create the admin account (once)
1. Supabase → **Authentication → Users → Add user** → email + password (tick *Auto confirm*).
2. In the SQL Editor run (use that email):
   ```sql
   update public.profiles set role = 'admin'
    where id = (select id from auth.users where email = 'you@example.com');
   ```

## 3. Run
```bash
cd admin-portal
npm install
npm run dev        # http://localhost:5173
npm run build      # production files in dist/
```
`.env` already holds the project URL and the public anon key. The anon key is safe in a
browser: every admin action goes through database functions that check `is_admin()`.

## Pages
| Page | What it does |
|---|---|
| Dashboard | Users, dealers, properties, reviews waiting, visits; activity, status, city and type charts |
| Listings | Review photos + details, **Approve** or **Reject** with a reason shown to the dealer |
| Dealers | Accept / reject / revoke dealer applications |
| Users | All accounts with number of properties and visits |
| Visits | Every booking and the dealer's answer |

## Deploy
Upload `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, Firebase Hosting).
Never put the Supabase **service_role** key in this project.
