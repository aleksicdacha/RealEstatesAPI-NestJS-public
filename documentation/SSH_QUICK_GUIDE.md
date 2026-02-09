# 🔐 SSH Key Quick Reference - Hetzner Setup

## ❓ Which File Do I Copy to Hetzner?

### ✅ SHORT ANSWER:
Copy the **PUBLIC KEY** - the file ending with **`.pub`**

---

## 📋 Step-by-Step Instructions

### 1️⃣ Find Your Public Key

Run this command in your terminal:

```bash
cat ~/.ssh/id_ed25519.pub
```

**OR** if you have an older RSA key:

```bash
cat ~/.ssh/id_rsa.pub
```

**OR** see all available public keys:

```bash
ls -la ~/.ssh/*.pub
```

### 2️⃣ Copy the ENTIRE Output

You'll see something like:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGQx7Jz... your-email@example.com
```

**Copy this ENTIRE line** (from `ssh-ed25519` to the end).

### 3️⃣ Add to Hetzner

1. In Hetzner Console (server creation page)
2. Scroll to **"SSH Keys"** section
3. Click **"Add SSH Key"**
4. Paste the public key
5. Name it (e.g., "My Laptop")
6. Click **Add**
7. Make sure it's **selected/checked** for your new server

---

## 🚫 What NOT to Copy

**NEVER share or upload these:**

- `id_ed25519` (without `.pub`) - This is your PRIVATE key
- `id_rsa` (without `.pub`) - This is your PRIVATE key
- Any file in `~/.ssh/` that doesn't end with `.pub`

**Private keys stay on YOUR computer only!**

---

## 🆕 Don't Have SSH Keys Yet?

### Create New SSH Key:

```bash
ssh-keygen -t ed25519 -C "hetzner-realestates"
```

Press Enter for all prompts (or set a passphrase for extra security).

This creates:
- **Private key:** `~/.ssh/id_ed25519` ← Keep this secret!
- **Public key:** `~/.ssh/id_ed25519.pub` ← Copy this to Hetzner

### Then Display Your New Public Key:

```bash
cat ~/.ssh/id_ed25519.pub
```

Copy the output to Hetzner.

---

## 🔍 Visual Guide

```
~/.ssh/
├── id_ed25519          ← 🔒 PRIVATE (Never share)
├── id_ed25519.pub      ← 📋 PUBLIC (Copy to Hetzner) ✅
├── id_rsa              ← 🔒 PRIVATE (Never share)
└── id_rsa.pub          ← 📋 PUBLIC (Copy to Hetzner) ✅
```

---

## ✅ Quick Checklist

- [ ] Found public key file (`.pub` extension)
- [ ] Copied **entire** line (starts with `ssh-ed25519` or `ssh-rsa`)
- [ ] Pasted into Hetzner "Add SSH Key" dialog
- [ ] Named the key descriptively
- [ ] Key is selected/checked for new server
- [ ] Did NOT share private key (file without `.pub`)

---

## 🆘 Troubleshooting

### "No such file or directory"

You don't have SSH keys yet. Create them:

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

### "Permission denied"

```bash
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

### Multiple Keys - Which One?

Use the most recent `ed25519` key. If you only have `rsa`, that works too.

---

## 📚 Next Steps

After adding your SSH key to Hetzner:

1. ✅ Select CPX22 server type
2. ✅ Choose Ubuntu 24.04 image
3. ✅ Select Nuremberg location
4. ✅ Click "Create & Buy now"
5. ✅ Wait for server IP address
6. ✅ SSH into server: `ssh root@YOUR_SERVER_IP`

Then follow: [`HETZNER_DEPLOYMENT_GUIDE.md`](./HETZNER_DEPLOYMENT_GUIDE.md)

---

**Remember:** Public key (`.pub`) goes to Hetzner. Private key stays on your computer! 🔐
