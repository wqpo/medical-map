let map; // マップをグローバル変数として定義
let routingControl; // ルーティングコントロールをグローバル変数として定義
let currentMarker; // 現在地マーカーのグローバル変数

import { hospitals } from './hospitals.js';
import { additionalLocations } from './sub.js'; // 追加

// ここでadditionalHospitalsにassign
const additionalHospitals = additionalLocations; // これでエラー解消

document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    map = L.map(mapContainer, {
        scrollWheelZoom: false, // マウスホイールによるズームを無効にする
        touchZoom: false // タッチによるズームを無効にする
    }).setView([36.05, 140.12], 13); // Tsukubaの緯度と経度

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // 現在地を取得して地図の中心に設定
    getCurrentLocation();

    // 病院の位置がマップ上に表示
    addHospitalMarkers();
    addHospitalOptions(); // ここを修正：addHospitalOptionsの定義が不足している場合、定義が必要

});

// `addHospitalOptions` が未定義の場合、次のように仮に定義を追加
function addHospitalOptions() {
    // ここにオプションを追加する処理を書く
}

// 『Search from your current location』ボタンの処理
const searchButton = document.getElementById('nearby-hospitals');
if (searchButton) {
    searchButton.addEventListener('click', () => {
        // 位置情報を許可しているか確認する
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                displayNearbyHospitals(latitude, longitude); // 位置情報が許可された場合のみ病院リストを表示
            }, (error) => {
                alert("位置情報の取得に失敗しました。詳細: " + error.message);
            });
        } else {
            alert("このブラウザでは位置情報がサポートされていません。");
        }
    });
}

// 病院リストを表示する関数
let hospitalMarkers = {}; // 病院のマーカーを保持するオブジェクト

function displayNearbyHospitals(latitude, longitude) {
    const hospitalList = document.getElementById('hospital-list');
    hospitalList.innerHTML = ''; // リストをクリア

    // 現在地から近い病院を距離で計算
    const nearbyHospitals = hospitals.map(hospital => {
        const [hospitalLat, hospitalLng] = hospital.coordinates;
        const distance = calculateDistance(latitude, longitude, hospitalLat, hospitalLng);
        return { hospital, distance };
    })
    .filter(h => h.distance <= 10) // 10km以内の病院をフィルタリング
    .sort((a, b) => a.distance - b.distance) // 距離でソート
    .slice(0, 5); // 上位5つを取得

    // リストを作成
    if (nearbyHospitals.length === 0) {
        const noHospitalsItem = document.createElement('li');
        noHospitalsItem.textContent = '近くに病院はありません。';
        hospitalList.appendChild(noHospitalsItem);
    } else {
        nearbyHospitals.forEach(({ hospital, distance }) => {
            const listItem = document.createElement('li');
    
            // 病院名をリンクにする
            const link = document.createElement('a');
            link.href = '#'; // リンク先は不要
            link.textContent = `${hospital.name} (${distance.toFixed(2)} km)`;
    
            // リンククリック時に該当する病院のマーカーをクリック状態にする
            link.onclick = (event) => {
                event.preventDefault(); // デフォルトのリンク動作（スクロール）を防止
    
                // 対応する病院のマーカーを取得
                const marker = hospitalMarkers[hospital.name];
    if (marker) {
        // マーカーの位置を地図の中心にしてズーム
        map.setView(marker.getLatLng(), 13); // ズームレベルは適宜調整
        marker.openPopup();  // ポップアップを開く
                }
            };
    
            // リストアイテムにリンクを追加
            listItem.appendChild(link);
            hospitalList.appendChild(listItem);
        });
    
        // リストを表示
        hospitalList.style.display = 'block'; // リストを表示
    }
}

// 位置情報の距離を計算する関数（ハーサイン距離）
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球の半径 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 距離を返す
}

// 近くの病院を表示する関数
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;

            if (!currentMarker) {
                currentMarker = L.marker([latitude, longitude], { icon: currentLocationIcon }).addTo(map);
            }

            map.setView([latitude, longitude], 13);
            displayNearbyHospitals(latitude, longitude); // 引数を渡して呼び出す
        }, (error) => {
            alert("位置情報の取得に失敗しました。詳細: " + error.message);
        });
    } else {
        alert("このブラウザでは位置情報がサポートされていません。");
    }
}

// 病院の位置情報をマップに表示する関数
function addHospitalMarkers() {
    hospitals.forEach(hospital => {
        const [lat, lng] = hospital.coordinates;
        const marker = L.marker([lat, lng]).addTo(map);

        // 病院の情報を含むポップアップを設定
        const departments = Array.isArray(hospital.departments) ? hospital.departments.join(', ') : '情報なし';
        const languages = Array.isArray(hospital.languages) ? hospital.languages.join(', ') : '情報なし';
        const patientsInformation = Array.isArray(hospital.patientsInformation) ? hospital.patientsInformation.join('<br>') : '情報なし';
        const interviewSheet = Array.isArray(hospital.interviewSheet) ? hospital.interviewSheet.join('<br>') : '情報なし';
        const flowFromReception = Array.isArray(hospital.flowFromReceptionToExamination) ? hospital.flowFromReceptionToExamination.join('<br>') : '情報なし';
        const whatWeWantToKnow = hospital.whatWeWantYouToKnowBeforeComing && Array.isArray(hospital.whatWeWantYouToKnowBeforeComing) ? hospital.whatWeWantYouToKnowBeforeComing.join('<br>') : '';

        const popupContent = `
            <strong>${hospital.name}</strong><br>
            <strong>Departments:</strong> ${departments}<br>
            <strong>Languages:</strong> ${languages}<br>
            <strong>Patients Information:</strong> ${patientsInformation}<br>
            <strong>Interview Sheet:</strong> ${interviewSheet}<br>
            <strong>Flow From Reception To Examination:</strong> ${flowFromReception}<br>
            <strong>Medicine Pickup Location:</strong> ${hospital.medicinePickupLocation}<br>
            ${whatWeWantToKnow ? `<strong>What We Want You To Know Before Coming:</strong> ${whatWeWantToKnow}` : ''}<br>
        `;

        marker.bindPopup(popupContent); // ポップアップをバインド

        // 病院名をキーにしてマーカーを保存
        hospitalMarkers[hospital.name] = marker;
    });
}

// `currentLocationIcon` を定義
const currentLocationIcon = L.icon({
    iconUrl: 'path_to_icon.png', // アイコンのパスを適宜修正
    iconSize: [32, 32], // サイズ
    iconAnchor: [16, 32], // アイコンのアンカー位置
    popupAnchor: [0, -32] // ポップアップのアンカー位置
});

// ルート計算ボタンのクリックイベント
const routeButton = document.getElementById('route-button'); // ここで routeButton を取得
const startLocationSelect = document.getElementById('start-location'); // セレクトボックスの取得
const goalSelect = document.getElementById('goal'); // セレクトボックスの取得

// セレクトボックスの要素を取得
if (!startLocationSelect || !goalSelect) {
    console.error('Start Location または Goal セレクトボックスが見つかりませんでした');
} else {
    // calculateRoute 関数を宣言
    function calculateRoute() {
        const startLocation = startLocationSelect.value; // 修正
        const goal = goalSelect.value;

        if (!routingControl) { // ルーティングコントロールが初期化されていない場合
            addRoutingControl(); // 初期化する
        }

        if (startLocation && goal) {
            const startHospital = hospitals.find(h => h.name === startLocation);
            const goalHospital = hospitals.find(h => h.name === goal);

            if (startHospital && goalHospital) {
                const startCoords = startHospital.coordinates;
                const goalCoords = goalHospital.coordinates;

                routingControl.setWaypoints([
                    L.latLng(startCoords[0], startCoords[1]),
                    L.latLng(goalCoords[0], goalCoords[1])
                ]);
            } else {
                alert("選択した病院の情報が見つかりません。");
            }
        } else {
            alert("出発地と目的地を選択してください。");
        }
    }

    // ルート計算ボタンのイベントリスナー
    if (routeButton) {
        routeButton.addEventListener('click', () => {
            calculateRoute();
        });
    }
}

// ルーティングコントロールを追加する関数
function addRoutingControl() {
    routingControl = L.Routing.control({
        waypoints: [],
        routeWhileDragging: true,
        geocoder: L.Control.Geocoder.nominatim()
    }).addTo(map);  // ルーティングコントロールを地図に追加

} // 関数の終了括弧を追加
