# migration.py
import json
import boto3
import os
from decimal import Decimal # DynamoDBはfloatを直接サポートしないためDecimalを使う
import traceback # エラー詳細表示のため
import sys # Python実行パス表示用 (デバッグ追加)

# --- 設定 ---
# 必要に応じてAWSリージョンを指定してください (例: 'ap-northeast-1')
# AWS_REGION = 'ap-northeast-1'
AWS_REGION = None # Noneの場合、環境設定や ~/.aws/config に従います

# DynamoDBのテーブル名 (AWS上で作成したものと同じ名前)
TABLE_NAME = 'Hospitals'

# JSONファイル内の各病院オブジェクトで、DynamoDBのパーティションキーとして使うキー名
# ★★★ hospitals.json の内容に合わせて 'name' に設定済み ★★★
JSON_ID_KEY = 'name'

# DynamoDBテーブルのパーティションキー名 (テーブル作成時に指定したもの)
# ★★★ AWS上のテーブル定義に合わせて 'id' に設定済み ★★★
DYNAMODB_PARTITION_KEY = 'id'
# -----------

# DecimalをJSONシリアライズ可能にするためのクラス (エラー表示用)
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            # DynamoDBへの書き込み自体はboto3がDecimalを処理できるはずですが、
            # ここはエラー表示用なので、文字列に変換するのが一般的です。
            return str(obj)
        # Let the base class default method raise the TypeError
        return super(DecimalEncoder, self).default(obj)

# --- スクリプト本体 ---
print(f"【デバッグ情報】Python実行パス: {sys.executable}") # デバッグ情報追加
print("DynamoDBデータ移行スクリプトを開始します。")

# Boto3 DynamoDBリソースの初期化
try:
    session = boto3.Session()
    used_region = AWS_REGION or session.region_name or os.environ.get('AWS_REGION') or os.environ.get('AWS_DEFAULT_REGION')
    print(f"【デバッグ情報】使用するAWSリージョン: {used_region if used_region else '未指定/不明'}")
    if not used_region:
        print("警告: AWSリージョンが特定できません。 ~/.aws/config で default リージョンを設定するか、スクリプト内で AWS_REGION を指定してください。")
        # スクリプトを続行するか、ここで exit() するか選択可能

    if AWS_REGION:
        dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
    else:
        dynamodb = boto3.resource('dynamodb') # リージョン指定なし (デフォルト設定に依存)

    table = dynamodb.Table(TABLE_NAME)
    print(f"DynamoDBテーブル '{TABLE_NAME}' に接続しました。")
except Exception as e:
    print(f"エラー: DynamoDBへの接続に失敗しました。AWS認証情報やリージョン設定を確認してください。")
    print(f"詳細: {e}")
    traceback.print_exc()
    exit()

# JSONファイルからデータを読み込む
# スクリプトファイルと同じディレクトリにある 'hospitals.json' を想定
json_file_path = os.path.join(os.path.dirname(__file__), 'hospitals.json')
print(f"JSONファイル '{json_file_path}' を読み込みます。")
try:
    # 注意: hospitals.json が純粋なJSON配列 '[{...},{...}]' になっているか確認
    with open(json_file_path, 'r', encoding='utf-8') as f:
        # JSON内のfloatをDecimalに変換して読み込む
        hospitals_data = json.load(f, parse_float=Decimal)
    print(f"{len(hospitals_data)} 件の病院データを読み込みました。")
except FileNotFoundError:
    print(f"エラー: JSONファイル '{json_file_path}' が見つかりません。このスクリプトと同じディレクトリに置いてください。")
    exit()
except json.JSONDecodeError as e:
    print(f"エラー: '{json_file_path}' のJSON形式が正しくありません。")
    print(f"JavaScriptの 'const hospitals = ...;' や 'export ...;' が含まれていませんか？")
    print(f"ファイルの中身は '[{...},{...}]' の形式である必要があります。")
    print(f"詳細: {e}")
    exit()
except Exception as e:
    print(f"エラー: JSONファイルの読み込み中に予期せぬエラーが発生しました。")
    print(f"詳細: {e}")
    traceback.print_exc()
    exit()

# DynamoDBにデータを書き込む (Batch Writerを使用)
print("DynamoDBへのデータ書き込みを開始します...")
items_written = 0
items_skipped = 0
try:
    with table.batch_writer() as batch:
        # hospitals_dataがリストであることを確認
        if not isinstance(hospitals_data, list):
            print(f"エラー: JSONデータのトップレベルがリスト形式ではありません。[{...}, {...}] の形式である必要があります。")
            exit()

        for i, hospital_item in enumerate(hospitals_data):
            # 各要素が辞書型であることを確認
            if not isinstance(hospital_item, dict):
                print(f"\n警告: {i+1}番目のデータがオブジェクト（辞書型）ではありません。スキップします。データ: {hospital_item}")
                items_skipped += 1
                continue

            print(f"  処理中 ({i+1}/{len(hospitals_data)}): ", end="")

            # パーティションキーの存在チェックと設定 (JSON_ID_KEY = 'name' でチェック)
            if JSON_ID_KEY not in hospital_item or hospital_item[JSON_ID_KEY] is None or hospital_item[JSON_ID_KEY] == "":
                print(f"警告: パーティションキーとして指定された '{JSON_ID_KEY}' が見つからないか空です。この項目をスキップします。 Item: {json.dumps(hospital_item, cls=DecimalEncoder, ensure_ascii=False)}")
                items_skipped += 1
                continue

            # hospital_item をコピーして処理（元のリストに影響を与えないように）
            item_to_write = hospital_item.copy()

            # ★★★ 元の変数を使う形に戻す ★★★
            # 新しいキー名(DYNAMODB_PARTITION_KEY = 'id')でパーティションキーを設定し、古いキー(JSON_ID_KEY = 'name')を削除
            item_to_write[DYNAMODB_PARTITION_KEY] = str(item_to_write.pop(JSON_ID_KEY))

            # --- データ型の調整 (必要に応じて) ---
            # 例1: リストをDynamoDBのSet型に変換 (空のリストはエラーになることがあるので注意)
            keys_to_convert_to_set = ['departments', 'languages', 'patientsInformation', 'interviewSheet', 'flowFromReceptionToExamination', 'whatWeWantYouToKnowBeforeComing', 'religionOfPatients'] # Setにしたいキー名のリスト
            for key in keys_to_convert_to_set:
                if key in item_to_write and isinstance(item_to_write[key], list):
                    if not any(x for x in item_to_write[key] if x is not None and x != ""):
                        del item_to_write[key]
                        print(f"空または無効な要素のみのリスト '{key}' を削除しました。", end=" ")
                    else:
                        valid_items = {str(x).strip() for x in item_to_write[key] if x is not None and str(x).strip() != ""}
                        if valid_items:
                            item_to_write[key] = valid_items
                        else:
                            del item_to_write[key]
                            print(f"有効な要素がないリスト '{key}' を削除しました。", end=" ")

            # coordinates を lat, lng のMap型に変換
            if 'coordinates' in item_to_write and isinstance(item_to_write['coordinates'], list) and len(item_to_write['coordinates']) == 2:
                try:
                    # 文字列に一度変換してからDecimalにすることで、float由来の誤差を防ぐ
                    lat = Decimal(str(item_to_write['coordinates'][0]))
                    lng = Decimal(str(item_to_write['coordinates'][1]))
                    item_to_write['location'] = {'lat': lat, 'lng': lng}
                    del item_to_write['coordinates']
                    print(f"'coordinates' を 'location' Mapに変換しました。", end=" ")
                except (TypeError, ValueError, IndexError):
                    print(f"警告: 'coordinates' の値が数値に変換できません。削除します: {item_to_write.get('coordinates')}", end=" ")
                    if 'coordinates' in item_to_write: del item_to_write['coordinates']
            elif 'coordinates' in item_to_write:
                 print(f"警告: 'coordinates' が期待した形式（2要素のリスト）ではありません。削除します: {item_to_write.get('coordinates')}", end=" ")
                 del item_to_write['coordinates']

            # 空文字の属性を削除
            keys_to_remove_if_empty_string = ['medicinePickupLocation', 'specialNote']
            keys_to_remove = [key for key in keys_to_remove_if_empty_string if key in item_to_write and isinstance(item_to_write[key], str) and item_to_write[key] == ""]
            for key in keys_to_remove:
                del item_to_write[key]
                print(f"空文字の属性 '{key}' を削除しました。", end=" ")

            # None値の属性を削除
            keys_to_remove_if_none = list(item_to_write.keys())
            keys_to_remove = [key for key in keys_to_remove_if_none if key in item_to_write and item_to_write[key] is None]
            for key in keys_to_remove:
                 del item_to_write[key]
                 print(f"None値の属性 '{key}' を削除しました。", end=" ")
            # ----------------------------------

            # アイテムを書き込みバッチに追加
            try:
                # === ↓↓↓ デバッグ用プリントを追加 ↓↓↓ ===
                print("\n--- DEBUG ---")
                print(f"Item keys before put_item: {list(item_to_write.keys())}")
                print(f"Value for 'id' key: {item_to_write.get('id')}")
                print(f"Value for 'hospital_id' key: {item_to_write.get('hospital_id')}")
                print("--- END DEBUG ---")
                # === ↑↑↑ デバッグ用プリントを追加 ↑↑↑ ===

                batch.put_item(Item=item_to_write)
                # DynamoDBのパーティションキーは 'id' になっているはず (表示処理も 'id' を見るように修正)
                print(f"ID '{item_to_write.get('id', 'IDキー不明')}' を書き込み準備完了。")
                items_written += 1
            except Exception as put_error:
                 # エラー表示部分も 'id' を見るように修正
                 print(f"\nエラー: アイテム書き込み準備中にエラーが発生しました。ID: {item_to_write.get('id', '不明')}")
                 print(f"詳細: {put_error}")
                 # エラーになったアイテムの内容を表示 (DecimalEncoderを使用)
                 print("問題のアイテム:", json.dumps(item_to_write, cls=DecimalEncoder, indent=2, ensure_ascii=False))
                 items_skipped += 1
                 # raise put_error # エラー時にスクリプト停止する場合

    print("-" * 20)
    print("DynamoDBへのデータ書き込み処理が完了しました。")
    print(f"書き込み成功 (準備完了): {items_written} 件")
    print(f"スキップ: {items_skipped} 件")
    print("-" * 20)

except Exception as e:
    print("\nエラー: DynamoDBへの書き込み処理中に予期せぬエラーが発生しました。")
    print(f"詳細: {e}")
    print("=== エラー発生時のアイテム (可能な場合) ===")
    item_context = None
    if 'item_to_write' in locals():
        item_context = item_to_write
    elif 'hospital_item' in locals():
         if isinstance(hospital_item, dict):
              item_context = hospital_item

    if item_context:
        try:
            # エラー表示用に DecimalEncoder を使う
            print(json.dumps(item_context, indent=2, ensure_ascii=False, cls=DecimalEncoder))
        except Exception as dump_e:
            print(f"(アイテム表示中にエラー: {dump_e})")
            print(f"Raw item data: {item_context}")
    else:
         print("(エラー発生時のアイテム特定不可)")

    print("=" * 30)
    traceback.print_exc()

print("スクリプトの実行が終了しました。")