module.exports = {
  apps: [
    {
      name: 'realestates-api',
      cwd: './apps/api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Memory guard — restart before OOM kill
      max_memory_restart: '450M',
      // Crash resilience
      autorestart: true,
      max_restarts: 10,           // stop restart loop after 10 fast crashes
      min_uptime: '15s',          // process must live 15s to count as a successful start
      restart_delay: 3000,        // wait 3s between crash restarts (reduces 502 storm)
      kill_timeout: 8000,         // 8s for graceful SIGTERM before SIGKILL
      watch: false,
    },
    {
      name: 'realestates-admin',
      cwd: './apps/admin-web',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/admin-error.log',
      out_file: './logs/admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '450M',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '15s',
      restart_delay: 3000,
      kill_timeout: 8000,
      watch: false,
    },
    {
      name: 'realestates-user',
      cwd: './apps/user-web',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      error_file: './logs/user-error.log',
      out_file: './logs/user-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '450M',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '15s',
      restart_delay: 3000,
      kill_timeout: 8000,
      watch: false,
    },
  ],
};
