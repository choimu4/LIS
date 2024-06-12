import React, { useEffect, useState } from "react";

const NaverMap = () => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    // 현재 위치를 가져와서 맵을 로드
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      loadNaverMap(latitude, longitude);
    });
  }, []);

  const loadNaverMap = (lat, lng) => {
    const mapOptions = {
      center: new naver.maps.LatLng(lat, lng),
      zoom: 15,
      minZoom: 6,
      draggable: true,
      pinchZoom: true,
      scrollWheel: true,
      disableKineticPan: false,
      scaleControl: false,
      logoControl: true,
      logoControlOptions: {
        position: naver.maps.Position.BOTTOM_RIGHT,
      },
      mapDataControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_LEFT,
      },
      mapTypeControl: false,
    };

    const mapInstance = new naver.maps.Map("map", mapOptions);

    const markerInstance = new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map: mapInstance,
      title: "현재 위치",
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  };

  const handleLocationButtonClick = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const newPosition = new naver.maps.LatLng(latitude, longitude);

      if (map && marker) {
        map.setCenter(newPosition);
        marker.setPosition(newPosition);
      }
    });
  };

  return (
    <div id="mapWrapper" style={{ position: "relative", width: "100%", height: "1000px" }}>
      <div id="map" style={{ width: "100%", height: "100%" }}></div>
      <button id="myLocationButton" style={{ position: "absolute", top: "20px", right: "20px", zIndex: 1 }} onClick={handleLocationButtonClick}>
        현재 위치로 이동
      </button>
    </div>
  );
};

export default NaverMap;
