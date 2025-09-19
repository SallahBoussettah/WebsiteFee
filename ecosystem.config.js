module.exports = {
  apps: [
    {
      name: 'hostpay-backend',
      script: './backend/dist/index.js',
      cwd: '/var/www/HostPay',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      // Logging
      log_file: '/var/log/pm2/hostpay-backend.log',
      out_file: '/var/log/pm2/hostpay-backend-out.log',
      error_file: '/var/log/pm2/hostpay-backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto restart configuration
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '1G',
      
      // Process management
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      
      // Advanced features
      source_map_support: true,
      instance_var: 'INSTANCE_ID'
    }
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-oracle-cloud-ip',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/your-repo.git',
      path: '/var/www/HostPay',
      'pre-deploy-local': '',
      'post-deploy': 'cd backend && npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};