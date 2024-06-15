import React, { useEffect, useState } from 'react';
import './Map.css'; // 맵 스타일을 위한 CSS 파일

const { kakao } = window;

const Map = () => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const locPosition = new kakao.maps.LatLng(latitude, longitude);

      const mapOption = {
        center: locPosition,
        level: 3,
      };

      const mapInstance = new kakao.maps.Map(document.getElementById('map'), mapOption);
      setMap(mapInstance);

      new kakao.maps.Marker({
        map: mapInstance,
        position: locPosition,
      });

      mapInstance.setCenter(locPosition);
    });
  }, []);

  const searchPlaces = () => {
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch('코인세탁소', placesSearchCB, {
      bounds: map.getBounds()
    });
  };

  const placesSearchCB = (data, status) => {
    if (status === kakao.maps.services.Status.OK) {
      displayPlaces(data);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
      alert('검색 결과가 존재하지 않습니다.');
    } else if (status === kakao.maps.services.Status.ERROR) {
      alert('검색 결과 중 오류가 발생했습니다.');
    }
  };

  const displayPlaces = (places) => {
    const bounds = new kakao.maps.LatLngBounds();
    places.forEach((place) => {
      const placePosition = new kakao.maps.LatLng(place.y, place.x);
      const marker = new kakao.maps.Marker({
        map: map,
        position: placePosition,
      });

      kakao.maps.event.addListener(marker, 'click', () => {
        window.location.href = `reservation.html?name=${encodeURIComponent(place.place_name)}`;
      });

      bounds.extend(placePosition);
    });

    map.setBounds(bounds);
  };

  const handleLocationButtonClick = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const newPosition = new kakao.maps.LatLng(latitude, longitude);
      map.setCenter(newPosition);
    });
  };

  return (
    <div id="mapWrapper" style={{ position: 'relative', width: '100%', height: '1000px' }}>
      <div id="map" style={{ width: '100%', height: '100%' }}></div>
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1 }}>
        <button id="refreshButton" onClick={searchPlaces}>현재 위치에서 갱신</button>
        <button id="currentLocationButton" onClick={handleLocationButtonClick}>현재 위치로 이동</button>
      </div>
    </div>
  );
};

export default Map;
