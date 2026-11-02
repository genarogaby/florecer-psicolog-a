<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->


## Project rules
- No user accounts: signup is disabled and there is no login screen. All data belongs to a single fixed profile id `00000000-0000-0000-0000-000000000001` (exported as `OWNER_ID` from `src/routes/_authenticated/route.tsx`); why: the psychologist wants the app to open straight into its functions.
- RLS policies on all public tables are open (`using (true)`) to anon + authenticated; why: no auth means the browser client is always anonymous. Anyone with the URL can read/write — do not add sensitive features without reintroducing auth.
- Patient portal lives at `/reservar/$id` where `$id` is the fixed OWNER_ID; visitors INSERT booking_requests there.
