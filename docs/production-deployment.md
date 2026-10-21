# Production deployment

The Vercel project `lester-s-projects4/portfolio-v1` is connected to
`jlescarlan11/portfolio-v1`. Its production branch is `main`, and its public
domain is https://johnlesterescarlan.pro.

Pushes to `main` deploy through the Vercel GitHub integration. Git-triggered
builds may start after a delay: commit `773fd97` took about nine minutes to
appear in Vercel, then built successfully. A missing deployment immediately
after a push does not establish that automatic deployment is broken.

Before reporting a release as live:

1. Check the pushed commit's Vercel status on GitHub:
   `gh api repos/jlescarlan11/portfolio-v1/commits/HEAD/status` (replace `HEAD`
   with the actual commit SHA when using the API).
2. Wait for the matching Git-triggered deployment to reach `Ready`; inspect
   its commit SHA and build logs rather than relying on the latest local push.
3. Run `vercel inspect https://johnlesterescarlan.pro` to confirm the public
   domain points to that deployment.
4. Verify the changed behavior on the public domain. For assistant changes,
   run `CHAT_BASE_URL=https://johnlesterescarlan.pro pnpm verify:chat`.

The project enables skipping unaffected builds. An empty commit is therefore
not a conclusive test of automatic deployment. Use a real file change when
testing the Git integration.

If no deployment appears after allowing for a trigger delay, check the GitHub
App's repository access, production branch, ignored-build settings, commit
identity, and service status before reconnecting the integration or using a
manual production deployment. A manual deployment does not test the Git push
trigger.
