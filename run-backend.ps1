$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $repoRoot "backend"
$pythonExe = Join-Path $repoRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $pythonExe)) {
    throw "Missing virtual environment interpreter at $pythonExe. Create .venv first."
}

Push-Location $backendDir
try {
    try {
        & $pythonExe -c "import dotenv, fastapi, sqlalchemy, jwt, stripe, psycopg" | Out-Null
    }
    catch {
        throw "Backend dependencies are missing in .venv. Run: & $pythonExe -m pip install -r `"$backendDir\requirements.txt`""
    }

    & $pythonExe ".\run.py"
}
finally {
    Pop-Location
}
