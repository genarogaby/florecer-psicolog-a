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
- Data access uses the browser Cloud client with RLS scoped to `owner_id = auth.uid()`; why: single-psychologist app, no server logic needed.
- Public patient portal lives at `/reservar/$id` (owner id) and may only INSERT pending booking_requests; why: anonymous visitors must never read clinical data.
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
- Data access uses the browser Cloud client with RLS scoped to `owner_id = auth.uid()`; why: single-psychologist app, no server logic needed.
- Public patient portal lives at `/reservar/$id` (owner id) and may only INSERT pending booking_requests; why: anonymous visitors must never read clinical data.
