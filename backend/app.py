# backend/app.py (修正後)
from flask import Flask, jsonify, request, send_from_directory # ★ send_from_directory を追加 ★
from flask_cors import CORS
import boto3
from boto3.dynamodb.conditions import Key
import os
from decimal import Decimal
import json
import traceback

# AWSとの連携
TABLE_NAME = 'Hospitals'
AWS_REGION = None # 環境変数 AWS_REGION から読み込まれることを期待

# DynamoDBのDecimal型をJSONで扱えるように変換するヘルパークラス
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, set):
            return list(obj)
        return super(DecimalEncoder, self).default(obj)

# Flaskアプリケーションの初期化
application = Flask(__name__)
CORS(application)

# DynamoDBリソースの初期化
dynamodb = None
table = None
try:
    session = boto3.Session()
    # 環境変数 AWS_REGION が設定されていればそれを使う
    used_region = os.environ.get('AWS_REGION') or AWS_REGION or session.region_name or os.environ.get('AWS_DEFAULT_REGION')
    print(f"DynamoDB Region: {used_region if used_region else 'Not Specified'}")
    if not used_region:
        # リージョンがどうしても取得できない場合のエラーハンドリング（より明確に）
        raise ValueError("AWS region could not be determined. Set AWS_REGION environment variable.")
    dynamodb = boto3.resource('dynamodb', region_name=used_region)
    table = dynamodb.Table(TABLE_NAME)
    print(f"Checking table '{TABLE_NAME}' in region '{used_region}' existence...")
    table.load() # テーブル存在確認とアクセス権確認
    print(f"Table '{TABLE_NAME}' found.")
except Exception as e:
    print(f"FATAL: Failed to initialize DynamoDB resource for table '{TABLE_NAME}'")
    print(traceback.format_exc())
    # dynamodb や table が None のままになる

# --- 座標データを float に変換し、キー名も変更するヘルパー関数 ---
def process_item_for_json(item):
    processed = {}
    if not item:
        return None
    for key, value in item.items():
        if key == 'coordinates' and isinstance(value, list):
            try:
                processed[key] = [float(coord) for coord in value]
            except (ValueError, TypeError) as e:
                print(f"Warning: Could not convert coordinates to float for item {item.get('hospital_id')}: {value}. Error: {e}")
                processed[key] = value
        elif isinstance(value, Decimal):
             processed[key] = float(value)
        elif isinstance(value, set):
            processed[key] = list(value)
        else:
            processed[key] = value

    if 'hospital_id' in processed:
        processed['id'] = processed.pop('hospital_id')

    return processed
# --- ヘルパー関数 End ---

# --- ★ ルートパス / で index.html を返すように変更 ★ ---
@application.route('/')
def index():
    # app.py は backend/ にあるため、../ で一つ上の階層（プロジェクトルート）を指定
    # プロジェクトルートにある index.html を返す
    return send_from_directory('../', 'index.html')

# --- APIエンドポイントの定義 ---
# (health_check は削除またはコメントアウト)
# @application.route('/health', methods=['GET']) # 必要なら /health など別のパスにする
# def health_check():
#     if table:
#         # DynamoDB接続確認メッセージはログに出力し、ここではシンプルなOKを返す等
#         print(f"Health check OK: Connected to DynamoDB table '{TABLE_NAME}'")
#         return jsonify({"status": "OK"}), 200
#     else:
#          return jsonify({"status": "ERROR", "message": "Failed to connect to DynamoDB"}), 500

@application.route('/api/hospitals', methods=['GET'])
def get_hospitals():
    print("Received request for /api/hospitals")
    if not table:
         return jsonify({"error": "DynamoDB connection not available"}), 500
    try:
        response = table.scan()
        items = response.get('Items', [])
        while 'LastEvaluatedKey' in response:
            print(f"Scanning next page...")
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response.get('Items', []))
        print(f"Found {len(items)} items in DynamoDB.")
        processed_items = [process_item_for_json(item) for item in items]
        return jsonify(processed_items)
    except Exception as e:
        print(f"Error during DynamoDB scan for /api/hospitals:")
        print(traceback.format_exc())
        return jsonify({"error": "Failed to retrieve hospital data from DynamoDB"}), 500

@application.route('/api/hospitals/<string:hospital_id_param>', methods=['GET'])
def get_hospital_by_id(hospital_id_param):
    print(f"Received request for /api/hospitals/{hospital_id_param}")
    if not table:
         return jsonify({"error": "DynamoDB connection not available"}), 500
    try:
        response = table.get_item(
            Key={'hospital_id': hospital_id_param}
        )
        item = response.get('Item')
        if item:
            processed_item = process_item_for_json(item)
            return jsonify(processed_item)
        else:
            return jsonify({"error": "Hospital not found"}), 404
    except Exception as e:
        print(f"Error during DynamoDB get_item for /api/hospitals/{hospital_id_param}:")
        print(traceback.format_exc())
        return jsonify({"error": "Failed to retrieve specific hospital data"}), 500

# --- ★ 静的ファイル配信ルートを追加 ★ ---
@application.route('/<path:filename>.js')
def serve_js(filename):
    # ../ ディレクトリ (プロジェクトルート) から .js ファイルを探して返す
    # セキュリティのため、ファイル名に .. が含まれていないかチェック推奨
    if '..' in filename:
        return "Invalid path", 400
    return send_from_directory('../', f"{filename}.js")

@application.route('/<path:filename>.css') # CSSファイルがあれば
def serve_css(filename):
    # ../ ディレクトリ (プロジェクトルート) から .css ファイルを探して返す
    if '..' in filename:
        return "Invalid path", 400
    return send_from_directory('../', f"{filename}.css")

@application.route('/images/<path:filename>')
def serve_images(filename):
    # ../images/ ディレクトリから画像ファイルを探して返す
    if '..' in filename:
        return "Invalid path", 400
    return send_from_directory('../images', filename)


# --- Flaskサーバーの起動 ---
if __name__ == '__main__':
    # ローカル実行用 (Gunicornからは呼ばれない)
    port = int(os.environ.get("PORT", 5001))
    # debug=True は開発時のみ。本番環境では False にするのが普通。
    # EB環境では Gunicorn 経由で起動されるため、ここの run は直接影響しないことが多い。
    application.run(debug=False, host='0.0.0.0', port=port)