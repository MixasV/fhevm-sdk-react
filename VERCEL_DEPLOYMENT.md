# Vercel Deployment Guide

## Automatic Deployment Setup

This project is configured for automatic deployment to Vercel.

### Prerequisites

1. GitHub account with access to https://github.com/MixasV/fhevm-sdk-react
2. Vercel account (free tier works)

### Deployment Steps

#### 1. Connect to Vercel

1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Import repository: `MixasV/fhevm-sdk-react`
4. Configure project:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `pnpm build && node scripts/prepare-vercel.js`
   - **Output Directory:** `public`
   - **Install Command:** `pnpm install --frozen-lockfile`

#### 2. Environment Variables (Optional)

No environment variables required for static examples.

#### 3. Deploy

Click "Deploy" button. Vercel will:
1. Clone repository
2. Install dependencies with pnpm
3. Build all 6 examples
4. Copy built files to `public/`
5. Serve static files

#### 4. Access Examples

After deployment, examples will be available at:

```
https://your-project.vercel.app/
https://your-project.vercel.app/react-counter/
https://your-project.vercel.app/svelte-voting/
https://your-project.vercel.app/vue-token/
https://your-project.vercel.app/solid-poll/
https://your-project.vercel.app/angular-auction/
https://your-project.vercel.app/vanilla-message/
```

### Build Configuration

The project uses a custom build script (`scripts/prepare-vercel.js`) that:

1. Builds all 6 framework examples:
   - React Counter (Vite)
   - Svelte Voting (Vite)
   - Vue Token (Vite)
   - Solid Poll (Vite)
   - Angular Auction (Angular CLI)
   - Vanilla Message (Vite)

2. Copies built files to `public/` directory:
   - `public/react-counter/`
   - `public/svelte-voting/`
   - `public/vue-token/`
   - `public/solid-poll/`
   - `public/angular-auction/`
   - `public/vanilla-message/`

3. Generates landing page (`public/index.html`)

### Troubleshooting

#### Build Fails

If build fails, check:
- All packages build successfully: `pnpm build`
- Node.js version (Vercel uses Node 18+)
- pnpm version compatibility

#### Examples Don't Load

If examples load but don't work:
- Check browser console for errors
- Verify FHEVM SDK initialization (requires browser environment)
- Examples work in "demo mode" without actual blockchain connection

### Manual Deployment (Alternative)

If automatic deployment doesn't work:

```bash
# Build locally
pnpm build
node scripts/prepare-vercel.js

# Deploy public/ directory manually via Vercel CLI
npx vercel --prod
```

### Continuous Deployment

Once connected, Vercel automatically deploys on every push to `main` branch.

### Custom Domain (Optional)

After deployment, you can add custom domain in Vercel dashboard:
1. Go to project settings
2. Add domain (e.g., `fhevm-sdk-pro.vercel.app`)
3. Update DNS records as instructed

---

**Note:** This is a static deployment. All examples run in browser using FHEVM SDK client-side.
