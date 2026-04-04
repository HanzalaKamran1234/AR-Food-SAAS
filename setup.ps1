Set-Location -Path 'd:\AR Project SAAS'
if (-not (Test-Path -Path server)) { New-Item -ItemType Directory -Force -Path server }
Set-Location -Path server
npm init -y
npm install express mongoose firebase-admin cors dotenv
npm install --save-dev nodemon
if (-not (Test-Path -Path controllers)) { New-Item -ItemType Directory -Force -Path controllers, models, routes, middleware }

Set-Location -Path 'd:\AR Project SAAS'
npx -y create-vite@latest client --template vanilla
Set-Location -Path client
npm install
npm install -D tailwindcss postcss autoprefixer
npx -y tailwindcss init -p
npm install firebase three
if (-not (Test-Path -Path "src\components")) { New-Item -ItemType Directory -Force -Path src\components, src\pages, src\utils, src\ar }
