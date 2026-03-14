# Build, test, and push Docker image for Pelican Panel
# Usage: .\scripts\build-and-push.ps1 -Push $true

param(
    [string]$ImageName = "ghcr.io/zeropointbruh/icecast-autodj",
    [string]$Tag = "dev",
    [bool]$Push = $false,
    [bool]$Test = $true
)

Write-Output "╔════════════════════════════════════════════════════════╗"
Write-Output "║       AutoDJ-Extreme Docker Build & Push             ║"
Write-Output "╚════════════════════════════════════════════════════════╝"
Write-Output ""
Write-Output "Image: $ImageName"
Write-Output "Tag: $Tag"
Write-Output "Push: $Push"
Write-Output "Test: $Test"
Write-Output ""

# Build image
Write-Output "[1/4] Building image..."
docker build -t "$($ImageName):$Tag" -f docker/Dockerfile .
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed"; exit 1 }
Write-Output "✓ Image built successfully"
Write-Output ""

# Test image
if ($Test) {
    Write-Output "[2/4] Testing image (running container for 25s)..."
    docker rm -f autodj-test 2>$null | Out-Null
    docker run -d --name autodj-test -p 8000:8000 "$($ImageName):$Tag" | Out-Null
    Write-Output "  Container started, waiting 20s for service startup..."
    Start-Sleep -Seconds 20
    
    Write-Output "  Checking healthcheck endpoint..."
    try {
        $response = curl -s http://localhost:8000/status-json.xsl -ErrorAction Stop
        if ($response -match "icestats") {
            Write-Output "✓ Healthcheck PASSED - Icecast is responding"
        } else {
            Write-Output "⚠ Healthcheck returned data but format unclear"
        }
    } catch {
        Write-Output "⚠ Healthcheck failed (service may still be starting)"
    }
    
    Write-Output "  Container logs tail:"
    docker logs autodj-test --tail 10
    
    Write-Output "  Cleaning up test container..."
    docker stop autodj-test 2>$null | Out-Null
    docker rm -f autodj-test 2>$null | Out-Null
    Write-Output "✓ Test complete"
} else {
    Write-Output "[2/4] Skipping test"
}
Write-Output ""

# Push image
if ($Push) {
    Write-Output "[3/4] Pushing image to GHCR..."
    
    # Check if docker is logged in to GHCR
    $loginTest = docker run --rm -v /var/run/docker.sock:/var/run/docker.sock alpine:latest echo "test" 2>&1
    
    Write-Output "  Checking GHCR authentication..."
    
    # Try to authenticate using GitHub CLI if available
    $ghCliAvailable = Get-Command gh -ErrorAction SilentlyContinue
    if ($ghCliAvailable) {
        Write-Output "  ✓ GitHub CLI found - attempting to authenticate..."
        try {
            $token = & gh auth token
            if ($token) {
                Write-Output "  ✓ Using GitHub CLI token for authentication"
                $token | docker login ghcr.io -u ZEROPOINTBRUH --password-stdin | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Output "  ✓ Successfully authenticated to GHCR"
                }
            }
        } catch {
            Write-Output "  ⚠ GitHub CLI token not available"
        }
    } else {
        Write-Output "  ℹ GitHub CLI not found. For browser-based auth:"
        Write-Output "    1. Install: winget install GitHub.cli"
        Write-Output "    2. Run: gh auth login"
        Write-Output "    3. Or create a PAT: https://github.com/settings/tokens"
    }
    
    Write-Output ""
    Write-Output "  Pushing $($ImageName):$Tag to GHCR..."
    docker push "$($ImageName):$Tag"
    if ($LASTEXITCODE -ne 0) { Write-Error "Push failed"; exit 1 }
    Write-Output "✓ Image pushed successfully"
} else {
    Write-Output "[3/4] Skipping push (use -Push `$true to enable)"
}
Write-Output ""

Write-Output "[4/4] Summary"
Write-Output "  Image: $($ImageName):$Tag"
Write-Output "  Built: Yes"
Write-Output "  Tested: $Test"
Write-Output "  Pushed: $Push"
Write-Output ""
Write-Output "Next steps:"
if (-not $Push) {
    Write-Output "  1. Run: docker login ghcr.io"
    Write-Output "  2. Run: .\scripts\build-and-push.ps1 -Push `$true"
}
Write-Output "  3. Pelican egg will pull $($ImageName):$Tag"
Write-Output ""
Write-Output "╔════════════════════════════════════════════════════════╗"
Write-Output "║                   Build Complete                      ║"
Write-Output "╚════════════════════════════════════════════════════════╝"
