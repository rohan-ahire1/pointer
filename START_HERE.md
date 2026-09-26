# Start here (for Rohan)

## 1. Set up the folder
```bash
# unzip pointer-starter.zip wherever you keep projects, then:
cd pointer
git init && git add . && git commit -m "Design handoff"
```
Optional: create an empty GitHub repo called `pointer` and push, so Vercel can deploy it later.

## 2. Install and open Claude Code
```bash
npm install -g @anthropic-ai/claude-code   # skip if already installed (or use the installer on docs.claude.com)
claude
```
Claude Code reads `CLAUDE.md` in this folder automatically every session. That file is the whole brief.

## 3. Paste this as your first message
> Read CLAUDE.md, design/README.md and design/visualizer-spec.md, and skim the mocks in design/mocks. Then propose a short plan for milestone 1 (Sliding Window live) with the folder structure you'll use. Don't write code until I approve the plan.

After you approve, work through the build order one step at a time. A good rhythm: "Do step 1, run it, show me what changed." Check each step with `npm run dev` before moving on.

## 4. When it's ready to ship
- Import the repo in Vercel and deploy.
- In Vercel → Settings → Domains, add `pointer.rohanahire.com`.
- At your DNS provider, add a CNAME record: `pointer` → the target Vercel shows (usually `cname.vercel-dns.com`).

## Still needed from you
Explainer video file and captions, your photo, email, and the GitHub / Instagram / LinkedIn links. They're marked as `[PLACEHOLDERS]` in the design and data.
