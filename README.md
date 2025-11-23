# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/284ef2a9-c5f2-4733-b8ec-37864535fd9e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/284ef2a9-c5f2-4733-b8ec-37864535fd9e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Quick Deploy (Lovable)

Simply open [Lovable](https://lovable.dev/projects/284ef2a9-c5f2-4733-b8ec-37864535fd9e) and click on Share -> Publish.

### Full Deployment (Production)

This project consists of:
- **Frontend**: React + Vite (deploy to Vercel) - **[Quick Guide →](./DEPLOY_VERCEL.md)**
- **Backend**: Express.js server (deploy to Render/Railway/Fly.io)

**🚀 Quick Deploy to Vercel:**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import repository
3. Set `VITE_API_URL` environment variable (your backend URL)
4. Click Deploy!

See [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) for step-by-step Vercel deployment or [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.

### Quick Start (Local Development)

1. **Start Backend:**
   ```bash
   cd server
   npm install
   npm run start:dev
   ```

2. **Start Frontend:**
   ```bash
   npm install
   npm run dev
   ```

3. **Access:**
   - Frontend: http://localhost:8080
   - Backend: http://localhost:3001

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
