# backend/app.py (座標をfloatに変換する修正適用版)
from flask import Flask, jsonify, request
from flask_cors import CORS
import boto3
from boto3.dynamodb.conditions import Key
import os
from decimal import Decimal
import json
import traceback

# AWSとの連携
TABLE_NAME = 'Hospitals'
AWS_REGION = None 

# DynamoDBのDecimal型をJSONで扱えるように変換するヘルパークラス
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            # ここでも変換するが、リスト内要素には適用されない可能性を考慮
            return float(obj)
        if isinstance(obj, set):
            return list(obj)
        return super(DecimalEncoder, self).default(obj)

# Flaskアプリケーションの初期化
app = Flask(__name__)
# app.json_encoder = DecimalEncoder # DecimalEncoderのみに頼らないので不要かも
CORS(app)

# DynamoDBリソースの初期化
try:
    session = boto3.Session()
    used_region = AWS_REGION or session.region_name or os.environ.get('AWS_REGION') or os.environ.get('AWS_DEFAULT_REGION')
    print(f"DynamoDB Region: {used_region if used_region else 'Default'}")
    dynamodb = boto3.resource('dynamodb', region_name=used_region)
    table = dynamodb.Table(TABLE_NAME)
    print(f"Checking table '{TABLE_NAME}' existence...")
    table.load()
    print(f"Table '{TABLE_NAME}' found.")
except Exception as e:
    print(f"FATAL: Failed to initialize DynamoDB resource for table '{TABLE_NAME}'")
    print(traceback.format_exc())
    dynamodb = None
    table = None

# --- ★★★ 座標データを float に変換し、キー名も変更するヘルパー関数 ★★★ ---
def process_item_for_json(item):
    processed = {}
    if not item: # itemがNoneの場合のガード
        return None
    for key, value in item.items():
        # coordinates キーを見つけたら中身を float に変換
        if key == 'coordinates' and isinstance(value, list):
            try:
                # Decimal や 文字列になっている可能性を考慮して float に変換
                processed[key] = [float(coord) for coord in value]
            except (ValueError, TypeError) as e:
                print(f"Warning: Could not convert coordinates to float for item {item.get('hospital_id')}: {value}. Error: {e}")
                processed[key] = value # 変換失敗時は元の値を保持
        elif isinstance(value, Decimal):
             processed[key] = float(value) # Decimal も float に
        elif isinstance(value, set):
            processed[key] = list(value) # Set は List に
        else:
            processed[key] = value # その他はそのまま

    # hospital_id を id に変名
    if 'hospital_id' in processed:
        processed['id'] = processed.pop('hospital_id')

    return processed
# --- ヘルパー関数 End ---


# --- APIエンドポイントの定義 ---

@app.route('/', methods=['GET'])
def health_check():
    if table:
        return jsonify({"status": "OK", "message": f"Connected to DynamoDB table '{TABLE_NAME}'"}), 200
    else:
         return jsonify({"status": "ERROR", "message": "Failed to connect to DynamoDB"}), 500

@app.route('/api/hospitals', methods=['GET'])
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

        # ★★★ 各アイテムをヘルパー関数で処理してからリストに追加 ★★★
        processed_items = [process_item_for_json(item) for item in items]

        # ★★★ jsonify に処理済みリストを渡す ★★★
        # Flask の jsonify は内部で json.dumps を使うので、カスタムエンコーダーより
        # 事前に変換しておく方が確実
        return jsonify(processed_items)

    except Exception as e:
        print(f"Error during DynamoDB scan for /api/hospitals:")
        print(traceback.format_exc())
        return jsonify({"error": "Failed to retrieve hospital data from DynamoDB"}), 500

@app.route('/api/hospitals/<string:hospital_id_param>', methods=['GET'])
def get_hospital_by_id(hospital_id_param):
    print(f"Received request for /api/hospitals/{hospital_id_param}")
    if not table:
         return jsonify({"error": "DynamoDB connection not available"}), 500

    try:
        # DynamoDB には 'hospital_id' で問い合わせる
        response = table.get_item(
            Key={'hospital_id': hospital_id_param}
        )
        item = response.get('Item')

        if item:
            # ★★★ アイテムをヘルパー関数で処理 ★★★
            processed_item = process_item_for_json(item)
            # ★★★ jsonify に処理済みアイテムを渡す ★★★
            return jsonify(processed_item)
        else:
            return jsonify({"error": "Hospital not found"}), 404

    except Exception as e:
        print(f"Error during DynamoDB get_item for /api/hospitals/{hospital_id_param}:")
        print(traceback.format_exc())
        return jsonify({"error": "Failed to retrieve specific hospital data"}), 500

# --- Flaskサーバーの起動 ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)