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

     displayNearbyHospitals();

    // 病院の位置がマップ上に表示
    addHospitalMarkers();
    addHospitalOptions(); 
});

// フィルター
// フィルター機能の実装
function filterHospitals(department, language, pickupLocation) {
    console.log(`Selected Pickup Location: ${pickupLocation}`); // ここに追加
    return hospitals.filter(hospital => {
        const departmentMatch = department === 'all' || hospital.departments.includes(department);
        const languageMatch = language === 'all' || hospital.languages.includes(language);
        const pickupLocationMatch = pickupLocation === 'all' || hospital.medicinePickupLocation === pickupLocation;


           // それぞれのマッチ結果をコンソールに出力
           console.log(`Checking hospital: ${hospital.name}`);
           console.log(`Department match: ${departmentMatch}`);
           console.log(`Language match: ${languageMatch}`);
           console.log(`Pickup location match: ${pickupLocationMatch}`);
   

           return departmentMatch && languageMatch && pickupLocationMatch;

    });
}
function displayHospitalsOnMap(hospitals) {
    console.log('Displaying hospitals on map:', hospitals);
    
    // 既存のマーカーをクリアする
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // フィルタリングされた病院を地図に表示
    hospitals.forEach(hospital => {
        const [lat, lng] = hospital.coordinates;
        const marker = L.marker([lat, lng]).addTo(map);
        
        // 初期ポップアップ内容を設定
        const initialPopupContent = `
            <strong>${hospital.name}</strong><br>
            <strong>Medicine Pickup Location:</strong> ${hospital.medicinePickupLocation}<br>
            <button id="view-info">この病院情報を見る</button>
        `;
        marker.bindPopup(initialPopupContent).openPopup();

        // ポップアップが開いたときのイベント
        marker.on('popupopen', () => {
            const button = document.getElementById('view-info');
            if (button) {
                button.onclick = () => {
                    const popupContent = `
                        <strong>Name:</strong> ${hospital.name}<br>
                        <strong>Departments:</strong> ${hospital.departments.join(', ')}<br>
                        <strong>Languages:</strong> ${hospital.languages.join(', ')}<br>
                        <strong>Patients Information:</strong> ${hospital.patientsInformation.join(', ')}<br>
                        <strong>Interview Sheet:</strong> ${hospital.interviewSheet.join(', ')}<br>
                        <strong>Flow From Reception To Examination:</strong> ${hospital.flowFromReceptionToExamination.join(', ')}<br>
                        <strong>Medicine Pickup Location:</strong> ${hospital.medicinePickupLocation}
                    `;
                    marker.setPopupContent(popupContent);
                    marker.openPopup();
                };
            }
        });
    });
}




// フィルターボタンのクリックイベント
document.getElementById('filter-button').addEventListener('click', () => {
    const selectedDepartment = document.getElementById('department-select').value;
    const selectedLanguage = document.getElementById('language-select').value;
    const selectedPickupLocation = document.getElementById('medicinePickupSelect').value; // 修正済み

    console.log(`Selected Department: ${selectedDepartment}`);
    console.log(`Selected Language: ${selectedLanguage}`);
    console.log(`Selected Pickup Location: ${selectedPickupLocation}`);


    const filteredHospitals = filterHospitals(selectedDepartment, selectedLanguage, selectedPickupLocation);

    // ここでフィルタリングされた病院の数を表示
    console.log(`Filtered hospitals: ${filteredHospitals.length}`);
    
    // ここでフィルタリングされた病院を地図に表示する関数を呼び出す
    displayHospitalsOnMap(filteredHospitals);
});




    

   // 近くの病院を表示
const nearbyHospitalsButton = document.getElementById('nearby-hospitals');
if (nearbyHospitalsButton) {
    nearbyHospitalsButton.addEventListener('click', () => {
        getCurrentLocation(); // 現在地取得
        displayNearbyHospitals(); // ボタンが押されたときに病院リストを表示
    });
} else {
    console.error('Nearby hospitals button (ID: nearby-hospitals) が見つかりません。');
}

    // 矢印ボタンの処理
    const upButton = document.querySelector('.arrow-button.up');
    const downButton = document.querySelector('.arrow-button.down');
    const leftButton = document.querySelector('.arrow-button.left');
    const rightButton = document.querySelector('.arrow-button.right');

    if (upButton) {
        upButton.addEventListener('click', () => {
            map.panBy([0, -100]); // 上に100px移動
        });
    }
    if (downButton) {
        downButton.addEventListener('click', () => {
            map.panBy([0, 100]); // 下に100px移動
        });
    }
    if (leftButton) {
        leftButton.addEventListener('click', () => {
            map.panBy([-100, 0]); // 左に100px移動
        });
    }
    if (rightButton) {
        rightButton.addEventListener('click', () => {
            map.panBy([100, 0]); // 右に100px移動
        });
    }




// 現在地マーカーのアイコンを定義
const currentLocationIcon = L.icon({
    iconUrl: 'images/red-pin.png',
    iconSize: [30, 30], // 幅と高さを調整
    iconAnchor: [15, 30],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
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
                alert("Invalid hospital selected.");
            }
        } else {
            alert("出発地点と目的地を選択してください。");
        }
    }

    if (routeButton) {
        routeButton.addEventListener('click', calculateRoute);
    } else {
        console.error('Route button (ID: route-button) が見つかりません。');
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
            <button class="route-button" data-lat="${lat}" data-lng="${lng}">この病院へ行く</button>
        `;

        marker.bindPopup(popupContent); // ポップアップをバインド

        // ポップアップが開いたときにボタンにイベントリスナーを追加
        marker.on('popupopen', () => {
            const routeButton = document.querySelector('.route-button'); // ボタンを正しく取得

            // ボタンのイベントリスナーを設定
            routeButton.onclick = (event) => {
                const goalCoords = L.latLng(lat, lng);
                if (currentMarker) {
                    const startCoords = currentMarker.getLatLng();

                    // ルート案内を表示
                    if (!routingControl) {
                        addRoutingControl();
                    } else {
                        routingControl.spliceWaypoints(0, routingControl.getWaypoints().length); // 以前のルートをクリア
                    }
                    routingControl.setWaypoints([startCoords, goalCoords]);
                } else {
                    alert("現在地が取得できていません。");
                }
            };
        });
    });
}





    // ルートボタンのクリックイベントを設定
    document.querySelectorAll('.route-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // ポップアップのクリックイベントをキャンセル
    
            const lat = parseFloat(e.target.dataset.lat);
            const lng = parseFloat(e.target.dataset.lng);
    
            if (currentMarker) {
                const startCoords = currentMarker.getLatLng();
                const goalCoords = L.latLng(lat, lng);
    
                // ルート案内を表示
                if (!routingControl) {
                    addRoutingControl(); // ルーティングコントロールを追加
                }
                routingControl.setWaypoints([startCoords, goalCoords]); // ルートを設定
            } else {
                alert("現在地が取得できていません。");
            }
        });
    });
    





  






// ルート計算
function addHospitalOptions() {
    startLocationSelect.innerHTML = '';
    goalSelect.innerHTML = '';

  

    // 初期値を追加
    const defaultStartOption = document.createElement('option');
    defaultStartOption.value = '';
    defaultStartOption.textContent = 'Select an option';
    startLocationSelect.appendChild(defaultStartOption);

    const defaultGoalOption = document.createElement('option');
    defaultGoalOption.value = '';
    defaultGoalOption.textContent = 'Select an option';
    goalSelect.appendChild(defaultGoalOption);

      // hospitalsとadditionalLocationsを統合
      const allHospitals = [...hospitals, ...additionalLocations];

    allHospitals.forEach(hospital => {
        const startOption = document.createElement('option');
        startOption.value = hospital.name;
        startOption.textContent = hospital.name;
        startLocationSelect.appendChild(startOption);

        const goalOption = document.createElement('option');
        goalOption.value = hospital.name;
        goalOption.textContent = hospital.name;
        goalSelect.appendChild(goalOption);
    });
}

// ルーティングコントロールを追加
function addRoutingControl() {
    if (map) { // マップが初期化されている場合のみコントロールを追加
        routingControl = L.Routing.control({
            waypoints: [],
            routeWhileDragging: true,
            createMarker: function() { return null; } // マーカーは作成しない
        }).addTo(map);
    } else {
        console.error("Map is not initialized yet.");
    }
}





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



// 近くの病院を表示する関数
// ページがロードされたときにリストを非表示に設定
// ページがロードされたときにリストを非表示に設定
// ページがロードされたときにリストを非表示に設定
window.addEventListener('load', function() {
    const hospitalList = document.getElementById('hospital-list');
    hospitalList.style.display = 'none'; // 初期状態で非表示にする

    // 現在地から探すボタンのイベントリスナーを追加
    const findNearbyButton = document.getElementById('nearby-hospitals'); // IDを修正
    if (findNearbyButton) { // 要素が存在するか確認
        findNearbyButton.addEventListener('click', function() {
            // 位置情報を取得して表示関数を呼び出す
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                displayNearbyHospitals(latitude, longitude);
            },
            (error) => {
                console.error("位置情報取得エラー:", error);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert("位置情報の取得が拒否されました。ブラウザの設定を確認してください。");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("位置情報が利用できません。");
                        break;
                    case error.TIMEOUT:
                        alert("位置情報の取得がタイムアウトしました。");
                        break;
                    case error.UNKNOWN_ERROR:
                        alert("不明なエラーが発生しました。");
                        break;
                }
            });
        });
    }

    // "Search for Hospitals" ボタンのクリックイベント
    const searchButton = document.getElementById('search-for-hospitals');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            // 位置情報を取得して近くの病院を表示
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                displayNearbyHospitals(latitude, longitude);
            });
        });
    }
});

// 近くの病院を表示する関数
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
            listItem.textContent = `${hospital.name} (${distance.toFixed(2)} km)`;

            listItem.onclick = () => {
                goalSelect.value = hospital.name; // 目的地を選択
                calculateRoute(); // ルート計算を呼び出す
            };
            hospitalList.appendChild(listItem);
        });
    }

    // すべての病院を見るボタンを追加
    const seeAllButton = document.createElement('button');
    seeAllButton.textContent = 'See all hospitals near you';
    seeAllButton.onclick = () => {
        displayAllNearbyHospitals(latitude, longitude); // すべての病院を表示する関数を呼び出す
    };
    hospitalList.appendChild(seeAllButton);

    // リストを表示
    hospitalList.style.display = 'block'; // リストを表示
}


// すべての近くの病院を表示する関数
function displayAllNearbyHospitals(latitude, longitude) {
    const hospitalList = document.getElementById('hospital-list');
    hospitalList.innerHTML = ''; // リストをクリア

    const allNearbyHospitals = hospitals.map(hospital => {
        const [hospitalLat, hospitalLng] = hospital.coordinates;
        const distance = calculateDistance(latitude, longitude, hospitalLat, hospitalLng);
        return { hospital, distance };
    })
    .filter(h => h.distance <= 10) // 10km以内の病院をフィルタリング
    .sort((a, b) => a.distance - b.distance); // 距離でソート

    if (allNearbyHospitals.length === 0) {
        const noHospitalsItem = document.createElement('li');
        noHospitalsItem.textContent = '近くに病院はありません。';
        hospitalList.appendChild(noHospitalsItem);
    } else {
        allNearbyHospitals.forEach(({ hospital, distance }) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${hospital.name} (${distance.toFixed(2)} km)`;

            listItem.onclick = () => {
                goalSelect.value = hospital.name; // 目的地を選択
                calculateRoute(); // ルート計算を呼び出す
            };
            hospitalList.appendChild(listItem);
        });
    }

    // リストを表示
    hospitalList.style.display = 'block'; // リストを表示
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
