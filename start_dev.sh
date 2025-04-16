#!/bin/bash

echo "開発サーバーを起動します..."
echo "--------------------------------------------------"

# 1. 仮想環境を有効にする
echo "[1/3] 仮想環境を有効化中 (venv)..."
source venv/bin/activate
if [ $? -ne 0 ]; then
  echo "エラー: 仮想環境の有効化に失敗しました。"
  exit 1
fi
echo "仮想環境 OK"
echo "--------------------------------------------------"

# 2. バックエンドサーバーを起動する (バックグラウンドで実行)
echo "[2/3] バックエンドサーバー (API) を起動中 (cd backend && python app.py)..."
(cd backend && python app.py) &
BACKEND_PID=$! # バックグラウンドプロセスのIDを記憶
# 少し待ってから確認 (任意)
sleep 2
if ! ps -p $BACKEND_PID > /dev/null; then
   echo "エラー: バックエンドサーバーの起動に失敗した可能性があります。"
   # exit 1 # 必要ならここで終了
fi
echo "バックエンドサーバー起動プロセス開始 (PID: $BACKEND_PID)"
echo "--------------------------------------------------"

# 3. フロントエンドの開発サーバーを起動する (★必要なら編集★)
echo "[3/3] フロントエンドサーバーの起動..."
# もしVS CodeのLive Serverなどを使っている場合は、このスクリプトとは別に手動で起動してください。
# もし http-server などコマンドで起動するものがあれば、以下のコメント(#)を解除し、実際のコマンドに書き換えてください。
# (例: npx http-server -p 5502 &)
# FRONTEND_PID=$! # フロントエンドもバックグラウンド実行する場合
echo "（フロントエンドサーバーの起動コマンドはこのスクリプトには含まれていません。"
echo "  VS Code Live Serverなどを使用している場合は別途起動してください）"
echo "--------------------------------------------------"

echo "サーバーが起動しました。"
echo "バックエンドAPIはおそらく http://127.0.0.1:5001 で待機しています。"
echo "終了するにはこのターミナルで Ctrl + C を押してください。"
echo "--------------------------------------------------"

# Ctrl+C が押されたときにバックグラウンドのサーバーも停止する
# (もしFRONTEND_PIDがあればそれもkillリストに追加: kill $BACKEND_PID $FRONTEND_PID)
trap "echo 'サーバーを停止します...'; kill $BACKEND_PID; exit" INT TERM

# バックグラウンドプロセスが終了するのを待つ
wait $BACKEND_PID