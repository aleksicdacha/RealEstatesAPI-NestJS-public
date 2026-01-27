# 🔍 Repository Clone Issue - Troubleshooting

## Your Problem:
```
Repository cloned, but only seeing:
- .git/
- README.md
- (Missing: apps/, packages/, docker-compose.yml, etc.)
```

---

## 🎯 DIAGNOSIS & FIX

### Step 1: Check What Branch You're On

```bash
cd ~/RealEstatesAPI-NestJS
git branch
git status
```

**You're probably on a different branch!** The repository might have:
- `main` branch (with all code)
- `master` branch (with all code)
- Or you're on an empty/initial branch

### Step 2: List All Branches

```bash
git branch -a
```

This shows all local and remote branches.

### Step 3: Switch to Correct Branch

**Try these in order:**

```bash
# Try main branch
git checkout main
ls -la

# OR try master branch
git checkout master
ls -la

# OR try develop branch
git checkout develop
ls -la
```

After checkout, you should see:
```
apps/
packages/
docker-compose.yml
package.json
turbo.json
etc.
```

---

## 🚨 ALTERNATIVE: Repository Might Be Empty

### Check if repository has code:

```bash
cd ~/RealEstatesAPI-NestJS
ls -la
git log --oneline
git remote -v
```

If `git log` shows no commits or very few, **the repository might not have been pushed yet!**

---

## ✅ SOLUTION A: Clone from Correct Repository

The repository URL in the guide might be a **placeholder**. 

### Find Your Actual Repository:

1. **On your LOCAL machine** (where the code works):
   ```bash
   cd /home/dalibor/Projects/RealEstatesAPI-NestJS
   git remote -v
   ```
   
   This shows the actual GitHub URL.

2. **Check if you've pushed to GitHub:**
   ```bash
   git log --oneline
   git branch -a
   ```

3. **If you HAVEN'T pushed yet, push now:**
   ```bash
   # On your LOCAL machine
   cd /home/dalibor/Projects/RealEstatesAPI-NestJS
   
   # Check current branch
   git branch
   
   # If not in a repo yet, initialize:
   git init
   git add .
   git commit -m "Initial commit - Real Estate Platform"
   
   # Add remote (create repo on GitHub first!)
   git remote add origin git@github.com:aleksicdacha/RealEstatesAPI-NestJS.git
   
   # Push to GitHub
   git push -u origin main
   ```

4. **Then on Hetzner server, re-clone:**
   ```bash
   cd ~
   rm -rf RealEstatesAPI-NestJS  # Remove incomplete clone
   git clone git@github.com:aleksicdacha/RealEstatesAPI-NestJS.git
   cd RealEstatesAPI-NestJS
   ls -la  # Should now see all files
   ```

---

## ✅ SOLUTION B: Use Different Method to Transfer Code

If GitHub repository is empty or having issues, **transfer code directly:**

### Option 1: SCP from Local Machine

**On your LOCAL machine:**

```bash
# Compress the project (exclude node_modules, .git, etc.)
cd /home/dalibor/Projects/RealEstatesAPI-NestJS
tar --exclude='node_modules' --exclude='.git' --exclude='uploads' --exclude='dist' -czf realestates.tar.gz .

# Copy to server
scp realestates.tar.gz realestates@YOUR_SERVER_IP:~/

# On server, extract
ssh realestates@YOUR_SERVER_IP
cd ~
mkdir -p RealEstatesAPI-NestJS
tar -xzf realestates.tar.gz -C RealEstatesAPI-NestJS
cd RealEstatesAPI-NestJS
ls -la  # Verify files
```

### Option 2: rsync (Better for Large Projects)

**On your LOCAL machine:**

```bash
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='uploads' --exclude='dist' \
  /home/dalibor/Projects/RealEstatesAPI-NestJS/ \
  realestates@YOUR_SERVER_IP:~/RealEstatesAPI-NestJS/
```

---

## 🔍 DIAGNOSTIC COMMANDS (Run on Server)

```bash
cd ~/RealEstatesAPI-NestJS

# 1. Show all files (including hidden)
ls -la

# 2. Show Git status
git status

# 3. Show current branch
git branch

# 4. Show all branches
git branch -a

# 5. Show commit history
git log --oneline

# 6. Show remote URL
git remote -v

# 7. Count files
find . -type f | wc -l

# 8. Show directory tree (if tree installed)
tree -L 2 -a
```

**Expected output should show:**
```
apps/
  api/
  admin-web/
  user-web/
packages/
  types/
  api-client/
  utils/
docker-compose.yml
package.json
turbo.json
README.md
.git/
```

---

## 🎯 MOST LIKELY CAUSE

Your local project **hasn't been pushed to GitHub yet!**

### Quick Check:

**On your LOCAL machine:**
```bash
cd /home/dalibor/Projects/RealEstatesAPI-NestJS
git status
git remote -v
```

If you see "no remote configured" or errors, you need to:

1. **Create GitHub repository** (if not exists):
   - Go to: https://github.com/new
   - Name: `RealEstatesAPI-NestJS`
   - Make it **private** or public
   - **Don't** initialize with README
   - Click "Create repository"

2. **Push your code:**
   ```bash
   # On LOCAL machine
   cd /home/dalibor/Projects/RealEstatesAPI-NestJS
   
   git init  # If not already a repo
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin git@github.com:aleksicdacha/RealEstatesAPI-NestJS.git
   git push -u origin main
   ```

3. **Then clone on server:**
   ```bash
   # On Hetzner server
   cd ~
   rm -rf RealEstatesAPI-NestJS
   git clone git@github.com:aleksicdacha/RealEstatesAPI-NestJS.git
   cd RealEstatesAPI-NestJS
   ls -la
   ```

---

## 📋 IMMEDIATE ACTION STEPS

**Run these commands on your Hetzner server:**

```bash
cd ~/RealEstatesAPI-NestJS
echo "Current directory:"
pwd
echo ""
echo "Files present:"
ls -la
echo ""
echo "Git status:"
git status
echo ""
echo "Current branch:"
git branch
echo ""
echo "All branches:"
git branch -a
echo ""
echo "Recent commits:"
git log --oneline -5
echo ""
echo "Remote URL:"
git remote -v
```

**Copy and paste the output here, and I'll tell you exactly what to do next!**

---

## 🆘 Quick Recovery

If you just want to move forward quickly:

### Transfer via SCP (Fastest):

```bash
# ON LOCAL MACHINE:
cd /home/dalibor/Projects/RealEstatesAPI-NestJS
tar --exclude='node_modules' --exclude='.git' --exclude='dist' -czf /tmp/realestates.tar.gz .
scp /tmp/realestates.tar.gz realestates@YOUR_SERVER_IP:~/

# ON HETZNER SERVER:
cd ~
rm -rf RealEstatesAPI-NestJS
mkdir RealEstatesAPI-NestJS
cd RealEstatesAPI-NestJS
tar -xzf ~/realestates.tar.gz
ls -la  # Verify files

# Clean up
rm ~/realestates.tar.gz
```

Replace `YOUR_SERVER_IP` with your actual server IP.

---

**What do you see when you run the diagnostic commands above?**
