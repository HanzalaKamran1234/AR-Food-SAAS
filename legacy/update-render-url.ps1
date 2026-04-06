# AR Food Viewer — Post-Deploy Config Script
# Run this AFTER you get your Render backend URL and Vercel URL

param(
    [Parameter(Mandatory=$true)]
    [string]$RenderUrl
)

# Strip trailing slash if present
$RenderUrl = $RenderUrl.TrimEnd('/')

Write-Host "🔧 Updating frontend config with Render URL: $RenderUrl" -ForegroundColor Cyan

# Update config.js
$configPath = "d:\AR Project SAAS\client\src\utils\config.js"
$configContent = @"
// Determines the backend base URL dynamically based on Vite's build environment.
// During local testing, it routes to Node.js localhost.
// During Production (Vercel), it routes to your live Render Backend URL.

const isProduction = import.meta.env.MODE === 'production';

const PROD_BACKEND_URL = '$RenderUrl';

export const API_BASE_URL = isProduction ? PROD_BACKEND_URL : 'http://localhost:5000';
"@

Set-Content -Path $configPath -Value $configContent -Encoding UTF8
Write-Host "✅ config.js updated!" -ForegroundColor Green

# Commit and push
Set-Location "d:\AR Project SAAS"
git add "client/src/utils/config.js"
git commit -m "feat: set live Render backend URL ($RenderUrl)"
git push origin main

Write-Host ""
Write-Host "✅ Done! Your frontend is now wired to: $RenderUrl" -ForegroundColor Green
Write-Host "🚀 Now deploy to Vercel at https://vercel.com" -ForegroundColor Yellow
Write-Host "   Root Directory: client | Framework: Vite | Output: dist" -ForegroundColor Yellow
