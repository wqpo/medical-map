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

            // 現在位置にマーカーを追加
            if (!currentMarker) {
                currentMarker = L.marker([latitude, longitude], { icon: currentLocationIcon }).addTo(map);
            }

            // 地図を現在地に設定
            map.setView([latitude, longitude], 13);

            // 近くの病院を表示
            displayNearbyHospitals(latitude, longitude); 

            // 病院名リストを表示
            document.getElementById('hospital-list').style.display = 'block';
        }, (error) => {
            alert("位置情報の取得に失敗しました。詳細: " + error.message);
        });
    } else {
        alert("このブラウザでは位置情報がサポートされていません。");
    }
}

// ボタンがクリックされたときに位置情報を取得する処理を追加
document.getElementById('nearby-hospitals').addEventListener('click', function() {
    // ボタンが押されたときに、病院リストを表示
    document.getElementById('hospital-list').style.display = 'block';
    
    // 現在地取得（位置情報を取得する関数）
    getCurrentLocation();
});

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
            <button id="go-to-hospital" class="popup-button">ここへ行く</button>
        `;

        marker.bindPopup(popupContent); // ポップアップをバインド

        // ボタンのクリックイベントを設定
        marker.on('popupopen', () => {
            const button = document.getElementById('go-to-hospital');
            if (button) {
                button.onclick = () => {
                    // ルートを計算するために必要な情報を取得
                    const userLocation = map.getCenter();  // ユーザーの現在地
                    const hospitalLocation = marker.getLatLng();  // 病院の位置

                    // ユーザーの現在地から病院までのルートを計算
                    calculateRoute(userLocation, hospitalLocation);
                };
            }
        });
    });
}
// ルート計算の関数（例として、現在地から病院までのルートを計算）
function calculateRoute(start, end) {
    const routeControl = L.Routing.control({
        waypoints: [start, end],
        routeWhileDragging: true
    }).addTo(map);
}

// 現在地マーカーのアイコンを定義
const currentLocationIcon = L.icon({
    iconUrl: 'images/a.png',  // アイコンのURLをimages/a.pngに変更
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});
// ⭐️フィルター	
// ⭐️フィルター
// フィルタリングされた病院を表示する関数
function filterHospitals() {
    // フィルタ条件を取得
    const department = document.getElementById("department-select").value;
    const language = document.getElementById("language-select").value;
    const medicinePickup = document.getElementById("medicinePickupSelect").value;

    // すべてが「all」の場合、病院リストは非表示に
    if (department === "all" && language === "all" && medicinePickup === "all") {
        clearResults(); // 結果をクリア
        return; // 何も表示しない
    }

    // hospitalsデータのフィルタリング
    const filteredHospitals = hospitals.filter(hospital => {
        // 部署でフィルタリング
        const isDepartmentMatch = department === "all" || hospital.departments.some(dept => dept.toLowerCase() === department.toLowerCase());
        // 言語でフィルタリング
        const isLanguageMatch = language === "all" || hospital.languages.some(lang => lang.toLowerCase() === language.toLowerCase());
        // 薬の受け取り場所でフィルタリング
        const isMedicinePickupMatch = medicinePickup === "all" || hospital.medicinePickupLocation.toLowerCase() === medicinePickup.toLowerCase();
        return isDepartmentMatch && isLanguageMatch && isMedicinePickupMatch;
    });

    // 結果表示をクリア
    clearResults();
    // 結果を病院名だけ表示（箇条書き）
    displayHospitalNames(filteredHospitals);
}

// 病院名を箇条書きで表示する関数
// 病院名をクリックしたときに該当するマーカーをクリックする関数
function handleHospitalClick(hospital) {
    // hospital.coordinatesが未定義でないことを確認
    if (hospital.coordinates && hospital.coordinates.length === 2) {
        const [lat, lng] = hospital.coordinates;  // coordinatesから緯度と経度を取得
        const marker = hospitalMarkers[hospital.name]; // マーカー取得
        if (marker) {
            // マーカーの位置を地図の中心にしてズーム
            map.setView([lat, lng], 13); // ズームレベルは適宜調整
            marker.openPopup();  // ポップアップを開く

            // 地図のスクロールを適切に反映させる
            map.invalidateSize();  // 地図サイズを再計算

            // 地図が表示される要素へスクロール
            const mapContainer = document.getElementById("map");  // 地図を表示する要素のIDを指定
            if (mapContainer) {
                mapContainer.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    } else {
        console.error(`Hospital ${hospital.name} does not have valid coordinates.`);
    }
}




// 病院名を箇条書きで表示する関数
function displayHospitalNames(filteredHospitals) {
    const resultsDiv = document.getElementById("filter-list"); // idを"filter-list"に変更
    // 既存の結果をリスト形式で表示するため、ulを作成
    const ul = document.createElement("ul"); // <ul>タグを作成
    if (filteredHospitals.length === 0) {
        const noResultsMessage = document.createElement("div");
        noResultsMessage.textContent = "No hospitals found with the selected filters.";
        resultsDiv.appendChild(noResultsMessage);
    } else {
        filteredHospitals.forEach(hospital => {
            const li = document.createElement("li"); // <li>タグを作成
            const link = document.createElement("a"); // クリック可能なリンクを作成
            link.href = "#"; // リンク先は不要なので "#" に設定
            link.textContent = hospital.name; // 病院名をリンクとして設定
            link.style.cursor = "pointer"; // カーソルをクリック可能なスタイルに変更
            link.addEventListener("click", (e) => {
                e.preventDefault(); // デフォルトのリンク動作を無効化
                handleHospitalClick(hospital); // 病院名クリック時に対応するマーカーをクリック
            });
            li.appendChild(link); // リンクをリストアイテムに追加
            ul.appendChild(li); // <ul>に <li> を追加
        });
        resultsDiv.appendChild(ul); // 最終的に <ul> を表示
    }
}

// 結果表示をクリアする関数
function clearResults() {
    const resultsDiv = document.getElementById("filter-list"); // idを"filter-list"に変更
    resultsDiv.innerHTML = ''; // 既存の結果をクリア
}

// イベントリスナーを設定
document.getElementById('department-select').addEventListener('change', filterHospitals);
document.getElementById('language-select').addEventListener('change', filterHospitals);
document.getElementById('medicinePickupSelect').addEventListener('change', filterHospitals);

// 初期表示（すべての病院を表示しない）
clearResults(); // 初期状態では何も表示しない


// ❤️ルート
// ❤️
