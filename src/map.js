<WebView
        style={{ flex: 1 }}
        source={{ uri: 'http://192.168.2.151:3000/map/company' }}
        ref={webViewRef}
        onContentProcessDidTerminate={() => {
          webViewRef.current?.reload();
        }}
        ></WebView>

        import { useState, useEffect, useRef } from 'react';
        import Inactive from '../asset/pins/inactive.png';
        import FInactive from '../asset/pins/inactive_f.png';
        
        const dummyApi = () => {
          return new Promise((r) => {
            const locations = [];
        
            for (let i = 0; i < 800; i++) {
              const lat = Math.random() * (38 - 33) + 33;
              const lon = Math.random() * (129 - 126) + 126;
        
              locations.push({ lat, lon });
            }
        
            r(locations);
          });
        };
        
        const Map = () => {
          const [company, setCompany] = useState([]);
          const [likeList, setLikeList] = useState([]);
          const mapRef = useRef(null);
          const markersRef = useRef([]);
        
          useEffect(() => {
            if (!mapRef.current || company.length === 0) return;
        
            markersRef.current.forEach((marker) => marker.setMap(null));
            markersRef.current = [];
        
            const markers = company.map((c) => createMarker(c));
            markersRef.current = markers;
        
            const { naver } = window;
        
            naver.maps.Event.addListener(mapRef.current, 'idle', () => {
              updateMarkers(markers);
            });
            // naver.maps.Event.addListener(mapRef.current, 'click', initSelectedCompany);
        
            function createMarker(c) {
              const { naver } = window;
        
              const isLiked = likeList.includes(String(c.id));
              const icon = isLiked ? FInactive : Inactive;
        
              const m = new naver.maps.Marker({
                map: mapRef.current,
                position: new naver.maps.LatLng(c.lat, c.lon),
                icon: icon,
              });
              naver.maps.Event.addListener(m, 'click', function (e) {
                mapRef.current.panTo(e.coord);
              });
        
              return m;
            }
        
            function updateMarkers(markers) {
              const bounds = mapRef.current.getBounds();
              const showMarkers = [];
              markers.forEach((marker) => {
                const position = marker.getPosition();
                if (bounds.hasLatLng(position)) {
                  showMarkers.push(marker);
                  showMarker(marker);
                } else {
                  hideMarker(marker);
                }
              });
        
              import('../utils/cluster').then(({ MarkerClustering }) => {
                const htmlMarker1 = {
                    content: `
                          <div style='width: 24px; height: 24px; border-radius: 50%; background-color: rgba(234, 42, 58, 0.70);
                          display: flex; align-items: center; justify-content: center'>
                            <span style='color: white; font-size: 14px; font-weight: 700;'></span>
                          </div>
                        `,
                    size: new naver.maps.Size(24, 24),
                  },
                  htmlMarker2 = {
                    content: `
                          <div style='width: 48px; height: 48px; border-radius: 50%; background-color: rgba(234, 42, 58, 0.20);
                          display: flex; align-items: center; justify-content: center'>
                          <div style='width: 32px; height: 32px; border-radius: 50%; background-color: rgba(234, 42, 58, 0.70);
                          display: flex; align-items: center; justify-content: center'>
                            <span style='color: white; font-size: 14px; font-weight: 700;'></span>
                          </div>
                          </div>
                        `,
                    size: new naver.maps.Size(48, 48),
                  },
                  htmlMarker3 = {
                    content: `
                          <div style='width: 60px; height: 60px; border-radius: 50%; background-color: rgba(234, 42, 58, 0.20);
                          display: flex; align-items: center; justify-content: center'>
                          <div style='width: 40px; height: 40px; border-radius: 50%; background-color: rgba(234, 42, 58, 0.70);
                          display: flex; align-items: center; justify-content: center'>
                            <span style='color: white; font-size: 14px; font-weight: 700;'></span>
                          </div>
                          </div>
                        `,
                    size: new naver.maps.Size(60, 60),
                  },
                  htmlMarker4 = {
                    content: `
                          <div style='width: 60px; height: 60px; border-radius: 50%; background-color: rgba(234, 42, 58, 0.20);
                          display: flex; align-items: center; justify-content: center'>
                          <div style='width: 40px; height: 40px; border-radius: 50%; background-color: rgba(234, 42, 58, 0.70);
                          display: flex; align-items: center; justify-content: center'>
                            <span style='color: white; font-size: 14px; font-weight: 700;'></span>
                          </div>
                          </div>
                        `,
                    size: new naver.maps.Size(60, 60),
                  },
                  htmlMarker5 = {
                    content: `
                          <div style='width: 60px; height: 60px; border-radius: 50%; background-color: rgba(234, 42, 58, 0.20);
                          display: flex; align-items: center; justify-content: center'>
                          <div style='width: 40px; height: 40px; border-radius: 50%; background-color: rgba(234, 42, 58, 0.70);
                          display: flex; align-items: center; justify-content: center'>
                            <span style='color: white; font-size: 14px; font-weight: 700;'></span>
                          </div>
                          </div>
                        `,
                    size: new naver.maps.Size(60, 60),
                  };
        
                new MarkerClustering({
                  minClusterSize: 2,
                  // maxZoom: 24,
                  maxZoom: 16,
                  map: mapRef.current,
                  markers: showMarkers,
                  disableClickZoom: false,
                  gridSize: 200,
                  icons: [
                    htmlMarker1,
                    htmlMarker2,
                    htmlMarker3,
                    htmlMarker4,
                    htmlMarker5,
                  ],
                  indexGenerator: [9, 100, 300, 500, 1000],
                  stylingFunction: function (clusterMarker, count) {
                    clusterMarker.getElement().querySelector('span').textContent =
                      count;
                  },
                });
              });
            }
        
            function showMarker(marker) {
              if (!marker.getMap()) marker.setMap(mapRef.current);
            }
        
            function hideMarker(marker) {
              if (marker.getMap()) marker.setMap(null);
            }
        
            return () => {
              if (mapRef.current) {
                naver.maps.Event.clearListeners(mapRef.current, 'idle');
                naver.maps.Event.clearListeners(mapRef.current, 'click');
              }
            };
          }, [company, likeList]);
        
          const requestData = async () => {
            const res = await dummyApi();
            setCompany(res);
            console.log(res);
          };
        
          useEffect(() => {
            // 지도 초기화 및 설정
            const initMap = () => {
              const { naver } = window;
              const mapOptions = {
                center: new naver.maps.LatLng(37.534515, 126.989693),
                zoomControl: false,
                zoom: 18,
              };
              mapRef.current = new naver.maps.Map('map', mapOptions);
        
              requestData();
            };
            initMap();
          }, []);
        
          return <div id='map' style={{ width: '100vw', height: '100vh' }}></div>;
        };
        
        export default Map;