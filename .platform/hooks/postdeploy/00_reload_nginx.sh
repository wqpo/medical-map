#!/bin/bash
echo "Reloading nginx configuration after deployment..."
sudo systemctl reload nginx
if [ $? -eq 0 ]; then
  echo "Nginx reloaded successfully."
else
  echo "Nginx reload failed! Check Nginx configuration." >&2
  # デプロイを失敗させたい場合は下の exit 1 のコメントを外す
  # exit 1
fi
exit 0 # とりあえずフック自体は成功させる