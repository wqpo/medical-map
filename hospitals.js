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
