module.exports = {
    apps : [{
      name: 'File-Storage-Tool',
      script: 'main.js',
      instances : '1',
      watch: "server/*",
      max_memory_restart: '1024M',
      exec_mode : "cluster",
      env: {
          "NODE_ENV": "production"
      }
    }]
  };