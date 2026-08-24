// Load .env so all existing env vars (Azure, MongoDB, SendGrid, etc.) are available.
// ecosystem.config env block only adds/overrides specific vars on top of .env.
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  apps: [
    {
      name: "clonos_backend",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "1G",
      env: {
        ...process.env,
        NODE_ENV: "production",
        // SSL certificate paths — set these for HTTPS, remove for HTTP
        SSL_KEY_PATH: "/home/clonosadmin/certs/clientcert.key",
        SSL_CERT_PATH: "/home/clonosadmin/certs/clientcert.cer",
        SSL_CA_PATH: "/home/clonosadmin/certs/cacerts.cer",
      },
      kill_timeout: 5000,
      listen_timeout: 10000,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
