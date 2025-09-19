# HostPay Deployment Guide - Oracle Cloud

This guide covers deploying the HostPay backend to Oracle Cloud using PM2 process manager with SSL certificate setup.

## Prerequisites

- Oracle Cloud instance (Ubuntu 20.04+ recommended)
- Domain name `api.1899rp.store` pointing to your Oracle Cloud IP
- Git installed on the server
- Node.js 18+ and npm installed
- PM2 installed globally

## DNS Configuration

Before starting the deployment, ensure your DNS is configured:

1. Create an A record for `api.1899rp.store` pointing to your Oracle Cloud instance public IP
2. Wait for DNS propagation (can take up to 24 hours)
3. Verify with: `nslookup api.1899rp.store`

## Server Setup

### 1. Initial Server Configuration

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install git -y

# Create application directory
sudo mkdir -p /var/www/HostPay
sudo chown -R $USER:$USER /var/www/HostPay

# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2
```

### 2. Clone and Setup Application

```bash
# Navigate to application directory
cd /var/www/HostPay

# Clone your repository
git clone https://github.com/your-username/your-repo.git .

# Install backend dependencies
cd backend
npm install

# Copy production environment file
cp .env.production .env

# Build the application
npm run build

# Return to root directory
cd ..
```

### 3. Configure Environment Variables

Edit the production environment files with your actual values:

```bash
# Edit backend production environment
nano backend/.env.production

# Update the following values:
# - COINBASE_API_KEY: Your production Coinbase Commerce API key
# - COINBASE_WEBHOOK_SECRET: Your production webhook secret
# - CDP_API_KEY_ID: Your production CDP API key ID
# - CDP_PRIVATE_KEY: Your production CDP private key
# - FRONTEND_URL: https://1899rp.store
```

## SSL Certificate Setup

### Option 1: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# Create symbolic link
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Install Nginx (for reverse proxy)
sudo apt install nginx -y

# Configure Nginx
sudo nano /etc/nginx/sites-available/hostpay
```

Add the following Nginx configuration:

```nginx
server {
    listen 80;
    server_name api.1899rp.store;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/hostpay /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.1899rp.store

# Test automatic renewal
sudo certbot renew --dry-run
```

### Option 2: Oracle Cloud Load Balancer SSL

If using Oracle Cloud Load Balancer:

1. Upload your SSL certificate to Oracle Cloud
2. Configure the load balancer to terminate SSL
3. Forward traffic to your backend on port 3001

## PM2 Deployment

### 1. Start Application with PM2

```bash
# Start the application using ecosystem file
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

### 2. PM2 Management Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs hostpay-backend

# Restart application
pm2 restart hostpay-backend

# Stop application
pm2 stop hostpay-backend

# Monitor application
pm2 monit

# Reload application (zero-downtime)
pm2 reload hostpay-backend
```

## Firewall Configuration

### Oracle Cloud Security Rules

1. Go to Oracle Cloud Console
2. Navigate to Networking > Virtual Cloud Networks
3. Select your VCN > Security Lists
4. Add ingress rules:
   - Port 80 (HTTP): Source 0.0.0.0/0
   - Port 443 (HTTPS): Source 0.0.0.0/0
   - Port 22 (SSH): Source your-ip/32

### Server Firewall (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow backend port (if direct access needed)
sudo ufw allow 3001

# Check status
sudo ufw status
```

## Monitoring and Maintenance

### 1. Log Management

```bash
# View PM2 logs
pm2 logs --lines 100

# View system logs
sudo journalctl -u nginx -f

# Rotate logs (add to crontab)
0 2 * * * pm2 flush
```

### 2. Automated Deployment Script

Create a deployment script:

```bash
# Create deployment script
nano deploy.sh
```

```bash
#!/bin/bash
set -e

echo "Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
cd backend
npm install

# Build application
npm run build

# Reload PM2
cd ..
pm2 reload ecosystem.config.js --env production

echo "Deployment completed successfully!"
```

```bash
# Make executable
chmod +x deploy.sh
```

### 3. Health Checks

Add a health check endpoint to your backend and monitor it:

```bash
# Add to crontab for health monitoring
*/5 * * * * curl -f http://localhost:3001/health || pm2 restart hostpay-backend
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :3001
   sudo kill -9 <PID>
   ```

2. **Permission issues**
   ```bash
   sudo chown -R $USER:$USER /var/www/HostPay
   ```

3. **PM2 not starting on boot**
   ```bash
   pm2 unstartup
   pm2 startup
   pm2 save
   ```

4. **SSL certificate issues**
   ```bash
   sudo certbot renew
   sudo systemctl reload nginx
   ```

### Logs Location

- PM2 logs: `/var/log/pm2/`
- Nginx logs: `/var/log/nginx/`
- Application logs: Check PM2 logs

## Security Checklist

- [ ] SSL certificate installed and working
- [ ] Firewall configured properly
- [ ] Environment variables secured
- [ ] Regular security updates scheduled
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting setup
- [ ] Rate limiting configured (if needed)

## Backup Strategy

```bash
# Create backup script
nano backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/hostpay"

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/hostpay_$DATE.tar.gz /var/www/HostPay

# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 $BACKUP_DIR/pm2_dump_$DATE.pm2

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.pm2" -mtime +7 -delete
```

## Performance Optimization

1. **Enable gzip compression in Nginx**
2. **Configure PM2 cluster mode** (already configured in ecosystem.config.js)
3. **Set up caching** (Redis/Memcached if needed)
4. **Monitor resource usage** with PM2 monit

For any issues, check the logs and ensure all environment variables are properly configured.