// script.js (リストクリック時にリセットボタンへスクロールする機能を追加)

// グローバル変数
let map;
let currentMarker; // 現在地マーカー用
let hospitalMarkers = {}; // 病院ID -> マーカーオブジェクト のマッピング
let apiHospitals = []; // APIから取得した病院データを保持する配列

// 現在地アイコンの定義
const currentLocationIcon = L.icon({
    iconUrl: 'images/a.png', // アイコン画像のパス
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// --- 初期化処理 ---
document.addEventListener('DOMContentLoaded', () => {
    initializeMap(); // 地図の初期化
    setupEventListeners(); // イベントリスナーの設定
    loadAndDisplayHospitals(); // APIからデータを読み込んで表示
});

// 地図の初期化
function initializeMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error("Map container element not found!");
        return;
    }
    map = L.map(mapContainer, {
        scrollWheelZoom: false, // マウスホイールでのズームを無効化
        doubleClickZoom: false, // ダブルクリックでのズームも無効化
        zoomControl: true       // +/- ボタンは表示
    }).setView([36.083299729278174, 140.11157817450768], 13); // つくば駅の座標

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // ポップアップ内のボタンクリックイベントリスナー（イベント委任）
    map.getContainer().addEventListener('click', function(event) {
        if (event.target.classList.contains('go-here-button')) {
            const lat = event.target.dataset.lat;
            const lng = event.target.dataset.lng;
            zoomInOnHospital(lat, lng); // ズームイン関数を呼び出し
        }
    });
}

// APIから病院データを非同期で読み込み、マーカーなどを追加する関数
async function loadAndDisplayHospitals() {
    console.log("Fetching hospital data from API...");
    const apiUrl = '/api/hospitals';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        apiHospitals = await response.json();
        console.log(`Successfully fetched ${apiHospitals.length} hospitals.`);
        addHospitalMarkers(apiHospitals); // マーカー初期表示
    } catch (error) {
        console.error("病院データの取得に失敗しました:", error);
        displayErrorMessage("病院情報の読み込みに失敗しました。");
    }
}

// イベントリスナーの設定
function setupEventListeners() {
    const searchButton = document.getElementById('search-hospitals');
    if (searchButton) {
        searchButton.addEventListener('click', handleHospitalSearch);
    }
    const departmentSelect = document.getElementById("department-select");
    const languageSelect = document.getElementById("language-select");
    const medicinePickupSelect = document.getElementById("medicinePickupSelect");
    if (departmentSelect) departmentSelect.addEventListener('change', filterHospitals);
    if (languageSelect) languageSelect.addEventListener('change', filterHospitals);
    if (medicinePickupSelect) medicinePickupSelect.addEventListener('change', filterHospitals);
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            location.reload(); // ページをリロードしてリセット
        });
    }
}

// 「近くの病院を検索」ボタンの処理（現在地表示とリスト表示）
function handleHospitalSearch() {
    if (!apiHospitals || apiHospitals.length === 0) { alert("病院データがまだ読み込まれていません。"); return; }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Current location obtained: ${latitude}, ${longitude}`);

                if (currentMarker) map.removeLayer(currentMarker); // 古いマーカーを削除
                currentMarker = L.marker([latitude, longitude], { icon: currentLocationIcon }).addTo(map);
                map.setView([latitude, longitude], 13); // 現在地中心に表示
                displayNearbyHospitalsList(latitude, longitude); // 近くの病院リスト表示
                document.getElementById('hospital-list-container').style.display = 'block'; // リストコンテナを表示
            },
            (error) => { alert("位置情報の取得に失敗しました。詳細: " + error.message); }
        );
    } else { alert("このブラウザでは位置情報がサポートされていません。"); }
}

// フィルター処理
function filterHospitals() {
    if (!apiHospitals || apiHospitals.length === 0) return; // APIデータがなければ何もしない
    const departmentSelect = document.getElementById("department-select");
    const languageSelect = document.getElementById("language-select");
    const medicinePickupSelect = document.getElementById("medicinePickupSelect");

    const selectedDepartment = departmentSelect ? departmentSelect.value : "all";
    const selectedLanguage = languageSelect ? languageSelect.value : "all";
    const selectedMedicineLocation = medicinePickupSelect ? medicinePickupSelect.value : "all";

    // APIから取得した全病院データに対してフィルタリング
    const filteredHospitals = apiHospitals.filter(hospital => {
        // 各フィルター条件に合致するかチェック
        const matchesDepartment = selectedDepartment === "all" || (hospital.departments && Array.isArray(hospital.departments) && hospital.departments.includes(selectedDepartment));
        const matchesLanguage = selectedLanguage === "all" || (hospital.languages && Array.isArray(hospital.languages) && hospital.languages.some(lang => typeof lang === 'string' && lang.includes(selectedLanguage)));
        const matchesMedicineLocation = selectedMedicineLocation === "all" || hospital.medicinePickupLocation === selectedMedicineLocation;
        return matchesDepartment && matchesLanguage && matchesMedicineLocation;
    });

    addHospitalMarkers(filteredHospitals); // フィルター結果に基づいてマーカーを再描画
    displayFilteredResults(filteredHospitals); // フィルター結果をリスト表示
}

// フィルター結果リストの表示
function displayFilteredResults(filteredHospitals) {
    const resultList = document.getElementById("filter-list");
    if (!resultList) return;
    resultList.innerHTML = ""; // リストをクリア

    if (filteredHospitals.length > 0) {
        filteredHospitals.forEach(hospital => {
            const listItem = document.createElement("li");
            const hospitalLink = document.createElement("a");
            hospitalLink.href = "#"; // ページ遷移を防ぐ
            hospitalLink.textContent = hospital.name || hospital.id; // ★ IDキーを 'id' に修正
            hospitalLink.style.marginLeft = "10px";
            hospitalLink.addEventListener("click", (event) => {
                 event.preventDefault(); // デフォルトのリンク動作をキャンセル
                 centerMapOnHospital(hospital); // 地図を中央寄せ＆ポップアップ

                 // ★ スクロール処理を追加
                 const resetButton = document.getElementById('reset-button');
                 if (resetButton) {
                     resetButton.scrollIntoView({ behavior: 'smooth', block: 'start' });
                 } else {
                     console.warn("Reset button not found for scrolling.");
                 }
            });
            listItem.appendChild(hospitalLink);
            resultList.appendChild(listItem);
        });
    } else {
        resultList.innerHTML = "<li>該当する病院は見つかりませんでした。</li>";
    }
}


// 地図を指定した病院中心に移動し、ポップアップを開く（再修正版）
function centerMapOnHospital(hospital) {
    // 座標データのチェック (null/undefinedでないこと、数値であること)
    if (!hospital?.coordinates || !Array.isArray(hospital.coordinates) || hospital.coordinates.length < 2 || hospital.coordinates[0] == null || hospital.coordinates[1] == null || typeof hospital.coordinates[0] !== 'number' || typeof hospital.coordinates[1] !== 'number') {
        console.warn("Cannot center map: Invalid coordinates in hospital data", hospital);
        return;
    }

    // 座標は数値なのでそのまま使う
    const lat = hospital.coordinates[0];
    const lng = hospital.coordinates[1];

    map.setView([lat, lng], 15); // 通常のズームレベル

    // 正しいキー名 'id' を使ってマーカーを探す
    const markerId = hospital.id;
    const marker = hospitalMarkers[markerId];

    if (marker) {
        marker.openPopup(); // マーカーが見つかればポップアップを開く
    } else {
        // マーカーが見つからない場合の警告
        console.warn(`Marker not found for hospital: ${markerId}`);
    }
}

// 病院マーカーとポップアップを地図に追加する関数 (再修正版)
function addHospitalMarkers(hospitalsToDisplay) {
    Object.values(hospitalMarkers).forEach(marker => map.removeLayer(marker)); // 古いマーカーを削除
    hospitalMarkers = {}; // マーカーリストを初期化
    if (!hospitalsToDisplay || hospitalsToDisplay.length === 0) { console.log("No hospitals to display markers for."); return; }
    console.log(`Attempting to add markers for ${hospitalsToDisplay.length} hospitals...`);

    hospitalsToDisplay.forEach((hospital, index) => {
        // ID取得を正しいキー名 'id' に修正
        const hospitalId = hospital.id;

        // スキップ条件1 (チェックするIDも修正)
        if (!hospital?.coordinates || !Array.isArray(hospital.coordinates) || hospital.coordinates.length < 2 || !hospitalId || hospital.coordinates[0] == null || hospital.coordinates[1] == null) {
            console.warn(`[${index}] Skipping hospital (${hospitalId || 'ID missing'}) due to missing/invalid coordinates or id:`, hospital);
            return; // スキップ
        }

        // 座標は数値型で来ているはずなので、そのまま取得
        const lat = hospital.coordinates[0];
        const lng = hospital.coordinates[1];

        // データ型が数値(Number)かチェック (parseFloatは不要)
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            console.warn(`[${index}] Skipping hospital (${hospitalId}) due to non-numeric coordinates: Lat type=${typeof lat}, Lng type=${typeof lng}`, hospital);
            return; // スキップ
        }

        try {
            // 正しい数値 lat, lng を使用してマーカーを作成
            const marker = L.marker([lat, lng]).addTo(map);
            const hospitalName = hospital.name || hospitalId; // name がなければ ID を表示

            // ポップアップ内容 (DynamoDB形式も少し考慮)
            const departments = Array.isArray(hospital.departments) ? hospital.departments.join(', ') : (hospital.departments?.SS?.join(', ') || 'N/A');
            const languages = Array.isArray(hospital.languages) ? hospital.languages.join(', ') : (hospital.languages?.SS?.join(', ') || 'N/A');
            const patientsInfo = Array.isArray(hospital.patientsInformation) ? hospital.patientsInformation.map(item => item?.S || item).join('<br>') : 'N/A';
            const sheetInfo = Array.isArray(hospital.interviewSheet) ? hospital.interviewSheet.map(item => item?.S || item).join('<br>') : 'N/A';
            const flowInfo = Array.isArray(hospital.flowFromReceptionToExamination) ? hospital.flowFromReceptionToExamination.map(item => item?.S || item).join('<br>') : 'N/A';
            const pickupLocation = hospital.medicinePickupLocation?.S || hospital.medicinePickupLocation || 'N/A';
            const knowBeforeComing = Array.isArray(hospital.whatWeWantYouToKnowBeforeComing) ? hospital.whatWeWantYouToKnowBeforeComing.map(item => item?.S || item).join('<br>') : '';
            const religionInfo = Array.isArray(hospital.religionOfPatients) ? hospital.religionOfPatients.map(item => item?.S || item).join('<br>') : '';
            const specialNoteInfo = hospital.specialNote?.S || hospital.specialNote || '';

            let popupContent = `<strong>${hospitalName}</strong><br>`;
            if (hospital.departments && departments !== 'N/A') popupContent += `<strong>Departments:</strong> ${departments}<br>`;
            if (hospital.languages && languages !== 'N/A') popupContent += `<strong>Languages:</strong> ${languages}<br>`;
            if (hospital.patientsInformation && patientsInfo !== 'N/A') popupContent += `<strong>Patient Information:</strong><br>${patientsInfo}<br>`;
            if (hospital.interviewSheet && sheetInfo !== 'N/A') popupContent += `<strong>Interview Sheet:</strong><br>${sheetInfo}<br>`;
            if (hospital.flowFromReceptionToExamination && flowInfo !== 'N/A') popupContent += `<strong>Flow from Reception to Examination:</strong><br>${flowInfo}<br>`;
            if (hospital.medicinePickupLocation && pickupLocation !== 'N/A') popupContent += `<strong>Medicine Pickup Location:</strong> ${pickupLocation}<br>`;
            if (knowBeforeComing) popupContent += `<strong>What We Want You To Know Before Coming:</strong><br>${knowBeforeComing}<br>`;
            if (religionInfo) popupContent += `<strong>Patient Religions:</strong><br>${religionInfo}<br>`;
            if (specialNoteInfo) popupContent += `<strong>Special Notes:</strong> ${specialNoteInfo}<br>`;


            popupContent += `<br><button class="go-here-button" data-lat="${lat}" data-lng="${lng}">Zoom in!</button>`;

            marker.bindPopup(popupContent);
            // 正しい hospitalId でマーカーを登録
            hospitalMarkers[hospitalId] = marker;
        } catch (error) {
             console.error(`[${index}] Error creating or adding marker for hospital (${hospitalId}):`, hospital, error);
        }
    });
    console.log("Finished adding markers.");
}


// 近くの病院リストの表示
function displayNearbyHospitalsList(latitude, longitude) {
    const hospitalList = document.getElementById('hospital-list');
    if (!hospitalList) return;
    hospitalList.innerHTML = ''; // リストをクリア
    const nearbyHospitals = apiHospitals.map(hospital => {
        // 座標のチェックと数値変換
        if (!hospital?.coordinates || !Array.isArray(hospital.coordinates) || hospital.coordinates.length < 2 || hospital.coordinates[0] == null || hospital.coordinates[1] == null) {
             return { hospital, distance: Infinity }; // 座標が無効なら距離無限大
        }
        // 座標は数値のはずなので parseFloat は不要かもしれないが、念のため残す
        const hospitalLat = parseFloat(hospital.coordinates[0]);
        const hospitalLng = parseFloat(hospital.coordinates[1]);
        if (isNaN(hospitalLat) || isNaN(hospitalLng)) {
            return { hospital, distance: Infinity }; // 数値変換失敗なら距離無限大
        }
        const distance = calculateDistance(latitude, longitude, hospitalLat, hospitalLng);
        return { hospital, distance };
    })
    .filter(h => h.distance <= 100000) // 100km 以内 (適宜調整)
    .sort((a, b) => a.distance - b.distance) // 距離でソート
    .slice(0, 5); // 上位5件表示

    if (nearbyHospitals.length === 0) {
        hospitalList.innerHTML = '<li>近くに病院はありません。</li>';
    } else {
        nearbyHospitals.forEach(({ hospital, distance }) => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = `${hospital.name || hospital.id} (${distance.toFixed(2)} km)`; // ★ IDキーを 'id' に修正
            link.onclick = (event) => { // onclick を使う場合
                event.preventDefault();
                centerMapOnHospital(hospital); // 地図を中央寄せ＆ポップアップ

                // ★ スクロール処理を追加
                const resetButton = document.getElementById('reset-button');
                if (resetButton) {
                    resetButton.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    console.warn("Reset button not found for scrolling.");
                }
            };
            listItem.appendChild(link);
            hospitalList.appendChild(listItem);
        });
    }
}

// 2点間の距離を計算 (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球の半径 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 距離 (km)
}

// 指定座標にスムーズにズームインする関数
function zoomInOnHospital(latStr, lngStr) {
    console.log(`Zooming in on: ${latStr}, ${lngStr}`);
    // この関数に渡される latStr, lngStr は data属性から取得されるため、文字列のまま parseFloat するのが適切
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
        console.error("Invalid coordinates for zooming:", latStr, lngStr);
        return;
    }

    map.flyTo([lat, lng], 17, { // ズームレベル17にアニメーション付きで移動
        animate: true,
        duration: 1.0 // アニメーション時間（秒）
    });
}

// エラーメッセージ表示用の関数
function displayErrorMessage(message) {
    const errorContainer = document.getElementById('error-container'); // エラー表示用の要素を取得 (HTMLに追加が必要かも)
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.color = 'red';
        errorContainer.style.display = 'block';
    } else {
        // エラー表示用要素がなければアラートで表示
        console.error("Error container not found, using alert:", message);
        alert(message);
    }
}