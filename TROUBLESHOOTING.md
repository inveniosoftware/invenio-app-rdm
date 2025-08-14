# Complete InvenioRDM Development Setup Guide
## From WSL Issues to Production

*A comprehensive troubleshooting and setup guide based on real-world experience with Ubuntu 24.04.3 LTS on WSL 2, addressing critical issues not covered in official documentation.*

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Pre-Installation Setup](#pre-installation-setup)
3. [Python Packaging Issues](#python-packaging-issues)
4. [WSL 2 Docker Integration](#wsl-2-docker-integration)
5. [Dependency Resolution Problems](#dependency-resolution-problems)
6. [NPM and Node.js Setup](#npm-and-nodejs-setup)
7. [ImageMagick Installation](#imagemagick-installation)
8. [InvenioRDM Installation Methods](#inveniordm-installation-methods)
9. [Complete Setup Walkthrough](#complete-setup-walkthrough)
10. [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

##  System Requirements

###  Tested Configuration

| Component | Specification |
|-----------|---------------|
| **Host OS** | Windows 11 |
| **WSL Distribution** | Ubuntu 24.04.3 LTS (noble) |
| **RAM** | 8GB minimum (7,981 MB tested) |
| **Storage** | 256GB SSD (20GB+ free space required) |
| **Python** | 3.11-3.12 (3.11 recommended for stability) |
| **Node.js** | 18.19.1+ |
| **Docker Desktop** | 28.3.2+ |

---

## ⚙️ Pre-Installation Setup

### 1. Install InvenioRDM CLI

```bash
# Install using pipx (recommended)
pipx install invenio-cli

# Verify installation
invenio-cli --version
```

### 2. Create Your Project

```bash
# Initialize new InvenioRDM project
invenio-cli init rdm

# When prompted, provide:
# - Project name: your-project-name
# - Project short name: your_project
# - Author name: Your Name
# - Author email: your.email@example.com
# - Description: Your project description

cd your-project-name
```

### 3. Verify Requirements

```bash
invenio-cli check-requirements --development
```

---

##  Python Packaging Issues

###  Critical Issue: Python Module Naming

**Problem:** Entry point parsing errors during package installation.

**Error Message:**
```text
error: Problems to parse EntryPoint(name='header-issue_views', 
value='header-issue.views:create_blueprint', group='invenio_base.blueprints').
```

###  Root Cause
Python module and package names cannot contain hyphens (`-`). InvenioRDM extensions must follow Python naming conventions.

###  Solution: Fix setup.cfg and Directory Structure

####  Incorrect setup.cfg:
```ini
[metadata]
name = your-extension

[options.entry_points]
invenio_base.blueprints =
    header-issue_views = header-issue.views:create_blueprint
invenio_assets.webpack =
    header-issue_theme = header-issue.webpack:theme
```

####  Correct setup.cfg:
```ini
[metadata]
name = your-extension

[options.extras_require]
tests =
    pytest-invenio>=2.1.0,<3.0.0

[options.entry_points]
invenio_base.blueprints =
    header_issue_views = header_issue.views:create_blueprint
invenio_assets.webpack =
    header_issue_theme = header_issue.webpack:theme
```

###  Enhanced setup.py Template

```python
from setuptools import setup, find_packages

setup(
    name="your-extension-name",    # Package name can have hyphens
    version="0.1.0",
    packages=find_packages(),      # Automatically discovers packages
    include_package_data=True,     # Includes static files, templates
)
```

### Directory Structure Requirements

```
your-project/
├── site/
│   ├── setup.py              # Enhanced setup with find_packages()
│   ├── setup.cfg             # Fixed entry points with underscores
│   ├── pyproject.toml        # Build system configuration
│   ├── your_extension/       # Module name with underscores
│   │   ├── __init__.py
│   │   ├── views.py          # Blueprint definitions
│   │   └── webpack.py        # Asset configurations
│   └── tests/                # Test directory
└── Pipfile                   # Fixed dependency configuration
```

###  Validation Commands

```bash
# Test package builds without errors
cd site/
pip wheel .

# Verify imports work correctly
python -c "import your_extension; print('Extension imported successfully!')"
```

---

##  WSL 2 Docker Integration

###  Docker Credential Helper Issues

**Error Message:**
```text
error getting credentials - err: fork/exec /usr/bin/docker-credential-desktop.exe: 
exec format error, out: ``
```

**Solution:** Disable Docker credential store for WSL compatibility.

```bash
# Create Docker config directory
mkdir -p ~/.docker

# Create or edit config file
nano ~/.docker/config.json
```

Add configuration:
```json
{
  "credsStore": ""
}
```

###  Docker Permission Issues

**Error Message:**
```text
PermissionError: [Errno 13] Permission denied
docker.errors.DockerException: Error while fetching server API version
```

**Solution:** Add user to docker group and configure WSL integration.

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply group membership immediately
newgrp docker

# Verify Docker access
docker ps
docker --version
```

### 🔧 Docker Desktop WSL Integration Setup

1. Open **Docker Desktop** → **Settings** → **Resources** → **WSL Integration**
2. **Enable:** "Enable integration with my default WSL distro" 
3. **Enable:** Ubuntu 24.04 distribution toggle 
4. **Apply & Restart** Docker Desktop
5. **Restart WSL terminal:** exit and reopen

###  Verification Commands

```bash
# Verify Docker versions
docker --version          # Should show 28.3.2+
docker-compose --version  # Should show 2.38.2+

# Test Docker functionality
docker ps
docker run hello-world
```

---

##  Dependency Resolution Problems

###  Pipenv Lock Failures

**Error Message:**
```text
Your dependencies could not be resolved. You likely have a mismatch in your sub-dependencies.
ERROR: Failed to lock Pipfile.lock!
```

###  Root Cause Analysis

- InvenioRDM requires pre-release packages for complex dependency resolution
- Default Pipfile configuration blocks pre-release dependencies
- Python 3.12 has compatibility issues with some InvenioRDM packages
- setuptools version conflicts cause build failures

###  Solution: Comprehensive Pipfile Configuration

####  Default Pipfile (causes dependency failures):
```toml
[pipenv]
allow_prereleases = false  # This breaks InvenioRDM dependency resolution
```

#### Production-Ready Pipfile:
```toml
[[source]]
name = "pypi"
url = "https://pypi.org/simple"
verify_ssl = true

[dev-packages]
check-manifest = ">=0.25"
setuptools = ">=59.1.1,<59.7.0"  # Prevents setuptools deprecation issues

[packages]
invenio-app-rdm = {extras = ["opensearch2"], version = "~=13.0.0"}
your-site = {editable = true, path="./site"}
flask-admin = "<=1.6.1"          # Fixes Flask-Admin compatibility
uwsgi = ">=2.0"                  # Production server
uwsgitop = ">=0.11"              # Monitoring tools
uwsgi-tools = ">=1.1.1"          # Additional utilities

[requires]
python_version = "3.11"          # Most stable for InvenioRDM

[pipenv]
allow_prereleases = true         # CRITICAL: Enables dependency resolution
```

###  Dependency Resolution Commands

**Primary solution:**
```bash
# Force pre-release dependencies with cache clearing
pipenv lock --pre --clear
```

**Alternative approaches:**
```bash
# Skip lock file for development
pipenv install --skip-lock

# Manual lock file regeneration
rm Pipfile.lock
pipenv lock --pre

# Direct installation bypass
pipenv run pip install -e ./site
```

###  Python Version Recommendations

#### InvenioRDM Compatibility Matrix:

| Python Version | Status | Notes |
|----------------|---------|-------|
| **3.11** |  **Recommended** | Most stable, recommended for production |
| **3.12** |  **Caution** | Works but may have dependency conflicts |
| **3.10** |  **Stable** | Stable alternative |
| **3.9** | **Supported** | Supported but older |

#### Switch to Python 3.11:
```bash
# Install Python 3.11 in Ubuntu
sudo apt update
sudo apt install python3.11 python3.11-dev python3.11-venv

# Verify installation
python3.11 --version

# Update Pipfile python_version to "3.11"
# Recreate virtual environment with new Python version
```

---

##  NPM and Node.js Setup

###  NPM Version Compatibility Issues

#### InvenioRDM Requirements:
- **Node.js:** 18.0+ (tested with 18.19.1)
- **NPM:** 10.0+ (NPM 11+ requires Node.js 20+)

###  NPM Version Errors

#### Error 1 - Version too old:
```text
Pre requisites not met.
Errors: NPM wrong version. Got [9, 2, 0] expected 10
```

#### Error 2 - Engine compatibility:
```text
npm ERR! engine Not compatible with your version of node/npm: npm@11.5.2
npm ERR! notsup Required: {"node":"^20.17.0 || >=22.9.0"}
```

###  Solution: Permission-Safe NPM Upgrade

####  Don't use sudo (causes permission issues):
```bash
sudo npm install -g npm@10  # Dangerous approach
```

####  Recommended approach:
```bash
# Create directory for global npm packages
mkdir ~/.npm-global

# Configure npm to use your directory
npm config set prefix '~/.npm-global'

# Add npm global directory to PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Install npm 10 (compatible with Node.js 18)
npm install -g npm@10

# Verify installation
npm --version  # Should show 10.x.x
```

###  Node.js + NPM Compatibility Matrix

| Node.js Version | Compatible NPM Versions | InvenioRDM Support |
|-----------------|------------------------|-------------------|
| **18.19.1** | 9.x, 10.x | ✅ **Recommended** |
| **20.17.0+** | 10.x, 11.x | ✅ **Future-proof** |
| **22.9.0+** | 11.x+ | ✅ **Latest features** |

---

##  ImageMagick Installation

###  ImageMagick Requirement

**Error Message:**
```text
Pre requisites not met.
Errors: ImageMagick not found. Got [Errno 2] No such file or directory: 'convert'.
```

###  Why InvenioRDM Needs ImageMagick

- **Thumbnail generation** for uploaded documents
- **Image format conversions** (PNG, JPEG, PDF previews)
- **Image optimization** for web display
- **File preview generation** for various formats

###  Installation Commands

```bash
# Update package repository
sudo apt update

# Install ImageMagick
sudo apt install imagemagick

# Verify installation
convert -version
magick -version  # Alternative command on newer versions
```

**Expected output:**
```text
Version: ImageMagick 6.9.x.x Q16 x86_64
Copyright: (C) 1999-2021 ImageMagick Studio LLC
```

---

##  InvenioRDM Installation Methods

InvenioRDM supports two primary installation approaches, each with specific use cases:

### 🔧 Method 1: Local Development (Recommended for Contributors)

#### **Best for:**
- Active development and customization
- Testing code changes quickly
- Debugging and troubleshooting
- Contributing to InvenioRDM

#### **Installation process:**
```bash
cd your-project/

# Lock dependencies (creates Pipfile.lock)
invenio-cli packages lock

# Install Python and JavaScript dependencies
invenio-cli install

# Set up services (database, search, cache)
invenio-cli services setup

# Start development server
invenio-cli run
```

###  Method 2: Containerized Preview (Quick Testing)

#### **Best for:**
- Quick previews and demos
- Production-like environment testing
- Avoiding local dependency conflicts
- Clean, isolated environments

#### **Installation process:**
```bash
cd your-project/

# Single command for complete containerized setup
invenio-cli containers start --lock --build --setup

# Or step-by-step approach:
invenio-cli containers build
invenio-cli containers setup  
invenio-cli containers start
```

---

##  Complete Setup Walkthrough

###  Prerequisites Verification

Run complete requirements check:
```bash
invenio-cli check-requirements --development
```

**Expected output:**
```text
✅ Python version OK. Got 3.11.x.
✅ Pipenv OK. Got version 2025.0.4.
✅ Docker version OK. Got 28.3.2.
✅ Docker Compose version OK. Got 2.38.2.
✅ Node version OK. Got 18.19.1.
✅ NPM version OK. Got 10.x.x.
✅ ImageMagick version OK. Got 6.9.x.
All pre-requirements met!
```

###  Local Development Setup (Detailed)

#### **Step 1: Dependency Locking**
```bash
cd your-project/
invenio-cli packages lock
```
*This creates Pipfile.lock with exact dependency versions for reproducible builds.*

#### **Step 2: Install Dependencies**
```bash
invenio-cli install
```

**What this does:**
- Creates Python virtual environment with pipenv
- Installs Python packages from Pipfile.lock
- Downloads and installs JavaScript dependencies
- Builds webpack assets (CSS, JavaScript bundles)
- Compiles static assets for web interface

#### **Step 3: Services Setup**
```bash
invenio-cli services setup
```

**Services initialized:**
- **PostgreSQL database** (amf-db-1): User data and metadata storage
- **OpenSearch** (amf-search-1): Document indexing and search
- **Redis cache** (amf-cache-1): Session and performance caching
- **RabbitMQ** (amf-mq-1): Message queue for background tasks
- **PgAdmin** (amf-pgadmin-1): Database management interface
- **OpenSearch Dashboards** (amf-opensearch-dashboards-1): Search analytics

#### **Step 4: Database Initialization**
```bash
# Manual database setup (if needed)
pipenv shell
flask db create
flask index init
flask index create
flask fixtures

# Create admin user
flask users create admin@example.com --password admin123 --active
flask roles add admin@example.com admin
```

#### **Step 5: Start Development Server**
```bash
invenio-cli run
```

**Access your application:**
- **Main application:** https://127.0.0.1:5000
- **API endpoint:** https://127.0.0.1:5000/api
- **OpenSearch Dashboards:** http://localhost:5601
- **PgAdmin:** http://localhost:5050

###  Containerized Setup (Alternative)

#### **Single command setup:**
```bash
cd your-project/
invenio-cli containers start --lock --build --setup
```

#### **Step-by-step containerized approach:**
```bash
# Build Docker images
invenio-cli containers build

# Initialize services and database
invenio-cli containers setup

# Start all containers
invenio-cli containers start
```

###  Development Workflow

#### **Daily development routine:**
```bash
# Start services (if not running)
docker-compose up -d

# Enter development environment
pipenv shell

# Make code changes in your editor
# Test changes
flask run --host=0.0.0.0 --port=5000 --cert=adhoc

# Run tests
pytest

# Commit changes
git add .
git commit -m "Your changes"
```

---

##  Troubleshooting Common Issues

###  Issue 1: Setuptools Version Conflicts

**Error Message:**
```text
pkg_resources.ContextualVersionConflict: (setuptools 60.5.0 (...), 
Requirement.parse('setuptools<59.7.0,>=59.1.1'), {'celery'})
```

**Solution:** Add setuptools constraint to Pipfile
```toml
[dev-packages]
setuptools = ">=59.1.1,<59.7.0"
```

###  Issue 2: Node.js/NPM Compatibility

**Error Message:**
```text
TypeError: Object.fromEntries is not a function
```

**Solution:** Update base Docker image and ensure Node.js 14+
```bash
invenio-cli containers build --pull --no-cache
```

###  Issue 3: Database Connection Issues

**Error Message:**
```text
psycopg2.OperationalError: could not connect to server
```

**Solution:** Verify Docker services are running
```bash
docker ps
docker-compose logs db
invenio-cli services setup --force
```

### 🚨 Issue 4: Search Index Problems

**Error Message:**
```text
elasticsearch.exceptions.ConnectionError
```

**Solution:** Reinitialize search indices
```bash
pipenv shell
flask index destroy --force
flask index init
flask index create
```

###  Issue 5: Webpack Build Failures

**Error Message:**
```text
ModuleNotFoundError: No module named 'webpack'
```

**Solution:** Rebuild assets
```bash
invenio-cli assets build --development
# Or for production
invenio-cli assets build --production
```

###  Issue 6: Permission Denied Errors

**Multiple scenarios:**
- Docker socket access
- NPM global installations
- File system permissions

**Universal solution approach:**
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker

# Fix NPM permissions (use npm prefix method shown earlier)
npm config set prefix '~/.npm-global'

# Fix file permissions
sudo chown -R $(whoami) ~/.local ~/.npm ~/.cache
```

---

##  Hardware and Performance Recommendations

###  Minimum System Requirements

| Resource | Requirement | Usage During Development |
|----------|-------------|-------------------------|
| **RAM** | 8GB | 6GB+ used during development |
| **Storage** | 20GB+ free space | Docker images: ~5GB, dependencies: ~2GB, data: ~1GB |
| **CPU** | 4+ cores | Recommended for Docker and webpack builds |
| **Storage Type** | **SSD strongly recommended** | 3-5x faster build times vs HDD |

###  Performance Optimization Tips

#### **Docker optimization:**
```bash
# Increase Docker memory limit in Docker Desktop
# Recommended: 4GB+ for InvenioRDM

# Use multi-stage builds for faster rebuilds
invenio-cli containers build --parallel

# Clean up unused images periodically
docker system prune -a
```

#### **Development environment optimization:**
```bash
# Use development mode for faster builds
export FLASK_ENV=development

# Enable hot reloading
flask run --reload --debugger

# Use webpack development mode
invenio-cli assets build --development --watch
```

---

##  Contributing Your Solutions

### Documentation Contributions

This guide addresses real issues encountered during InvenioRDM setup. Consider contributing to:

#### **Primary targets:**
- **InvenioRDM Documentation:** https://inveniordm.docs.cern.ch/
- **GitHub Issues:** https://github.com/inveniosoftware/invenio-app-rdm/issues
- **InvenioRDM CLI:** https://github.com/inveniosoftware/invenio-cli

#### **Contribution areas:**
- WSL 2 setup guide improvements
- Python packaging best practices
- Dependency resolution troubleshooting
- Docker integration documentation
- Hardware requirement specifications

### 🔄 Creating Pull Requests

#### **For documentation improvements:**
```bash
# Fork the repository
git clone https://github.com/your-username/invenio-app-rdm.git

# Create feature branch
git checkout -b docs/improve-wsl-setup-guide

# Add your documentation improvements
# Include real error messages and tested solutions

# Create pull request with:
# - Clear title: "docs: Add WSL 2 troubleshooting guide"
# - Detailed description of issues solved
# - Reference to your testing environment
```

#### **Pull request template:**
```markdown
## Problem Solved
Brief description of the setup issues this PR addresses.

## Testing Environment
- OS: Windows 11 + WSL 2 Ubuntu 24.04.3
- Hardware: 8GB RAM, 256GB SSD
- Python: 3.11.x
- Docker: 28.3.2

## Changes Made
- [ ] Added troubleshooting section for Python packaging issues
- [ ] Included WSL Docker integration fixes
- [ ] Enhanced dependency resolution documentation
- [ ] Added hardware requirements based on real testing

## Validation
Tested solutions work on clean Ubuntu 24.04.3 LTS installation.
```

---

## Conclusion

This comprehensive guide addresses the critical gaps in InvenioRDM documentation by providing real-world solutions to common setup issues. The combination of WSL 2 Docker integration, Python packaging fixes, and dependency resolution strategies creates a robust foundation for InvenioRDM development.

### Key Success Factors:

-  **Proper Python module naming** (underscores, not hyphens)
-  **Pre-release dependency configuration** (`allow_prereleases = true`)
-  **Docker credential helper fixes** for WSL compatibility
-  **NPM permission-safe installation** methods
-  **Version compatibility matrix** awareness

### Development Environment Status Checklist:

- [ ] All pre-requirements met (`invenio-cli check-requirements --development`)
- [ ] Docker services running successfully (`docker ps`)
- [ ] Python dependencies installed (`pipenv install --skip-lock`)
- [ ] Database and search initialized (`flask db create`, `flask index create`)
- [ ] Application accessible at https://127.0.0.1:5000
- [ ] Admin user created and functional
- [ ] Extension packaging working (`pip wheel .`)

---

> **Pro Tip:** Bookmark this guide and contribute your own solutions back to the InvenioRDM community. Together, we can make InvenioRDM setup smoother for everyone!