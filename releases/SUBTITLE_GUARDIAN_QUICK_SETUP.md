# 🍎 Subtitle Guardian - Mac Quick Setup

## 🚨 **Fixed Download Link for Mac**

The ZIP file was corrupted. Here's a working download:

### 📥 **Download (Mac-Compatible)**
🔗 **[📥 Download for Mac (.tar.gz - 142KB)](https://github.com/MesayBekele/integrationMB/blob/codegen-artifacts-store/releases/subtitle-guardian-mac-v1.0.0.tar.gz?raw=true)**

## 🛠️ **Mac Setup Instructions**

### **Step 1: Download and Extract**
```bash
# Go to Downloads folder
cd ~/Downloads

# Download the file
curl -L -o subtitle-guardian-mac-v1.0.0.tar.gz "https://github.com/MesayBekele/integrationMB/blob/codegen-artifacts-store/releases/subtitle-guardian-mac-v1.0.0.tar.gz?raw=true"

# Extract the file (Mac handles .tar.gz natively)
tar -xzf subtitle-guardian-mac-v1.0.0.tar.gz

# Create project folder and move files
mkdir subtitle-guardian-project
mv subtitle-guardian/* subtitle-guardian-project/
cd subtitle-guardian-project
```

### **Step 2: Install Prerequisites**
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js and Docker
brew install node@18 docker docker-compose

# Start Docker Desktop (install from https://docker.com/products/docker-desktop if needed)
open -a Docker
```

### **Step 3: Install Project Dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../subtitle-guardian-frontend
npm install

# Return to project root
cd ..
```

### **Step 4: Configure Environment**
```bash
# Copy environment template
cp .env.example .env.staging

# Edit with TextEdit (or your preferred editor)
open -a TextEdit .env.staging
```

**Add your API keys to .env.staging:**
```bash
OPENAI_API_KEY=sk-your-openai-key-here
TMDB_API_KEY=your-tmdb-key-here
OPENSUBTITLES_API_KEY=your-opensubtitles-key-here
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
```

### **Step 5: Deploy Locally**
```bash
# Make deployment script executable
chmod +x deployment/deploy.sh

# Start the application
./deployment/deploy.sh staging
```

### **Step 6: Access Your App**
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 🔧 **Alternative: Manual Setup (If Download Still Fails)**

If the download still doesn't work, I can provide you with the individual files to create manually. Let me know!

## 📞 **Need Help?**

If you're still having issues:
1. **Check if Docker is running** (whale icon in menu bar)
2. **Verify Node.js version**: `node --version` (should be 18+)
3. **Check ports**: Make sure ports 80 and 3000 aren't in use

Let me know if you need the individual files or have any other issues! 🚀