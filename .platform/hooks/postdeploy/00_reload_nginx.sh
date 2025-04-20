#!/bin/bash
echo "Executing postdeploy hook 00_reload_nginx.sh..."
date > /tmp/postdeploy_hook_ran.txt
echo "Created /tmp/postdeploy_hook_ran.txt"
exit 0