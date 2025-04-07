# Stop on any error
$ErrorActionPreference = "Stop"

Write-Host "Starting build process..."

# Setup Python virtual environment for building
Write-Host "Setting up Python build environment..."
python -m venv build_venv
.\build_venv\Scripts\Activate.ps1
pip install pyinstaller

# Create dist directory if it doesn't exist
if (-not (Test-Path "dist")) {
    New-Item -ItemType Directory -Path "dist"
}

# Build Python API
Write-Host "Building Python API..."
Set-Location -Path api
pip install -r requirements.txt
pyinstaller --clean --onefile --name api main.py
# Make sure the old file is removed if it exists
if (Test-Path "..\dist\api.exe") {
    Remove-Item -Path "..\dist\api.exe" -Force
}
Move-Item -Path "dist\api.exe" -Destination "..\dist\api.exe" -Force
Set-Location ..

# Verify the API executable exists
if (-not (Test-Path "dist\api.exe")) {
    Write-Host "Error: dist\api.exe not found!"
    exit 1
}

# Cleanup Python build environment
deactivate
Remove-Item -Path build_venv -Recurse -Force

# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Build Electron app
Write-Host "Building Electron app..."
npm run make

Write-Host "Build complete!"