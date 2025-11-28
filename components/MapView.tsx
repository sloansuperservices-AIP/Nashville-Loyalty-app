import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Challenge, Perk, ThemeSettings } from '../types';
import ReactDOMServer from 'react-dom/server';

interface MapViewProps {
    challenges: Challenge[];
    perks: Perk[];
    iconMap: { [key: string]: React.ReactNode };
    themeSettings: ThemeSettings;
}

const GoldRecordIcon: React.FC<{ color: string }> = ({ color }) => (
    <svg viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-lg">
        <circle cx="50" cy="50" r="48" fill="#1a1a1a" stroke={color} strokeWidth="4" />
        <circle cx="50" cy="50" r="35" fill="gold" />
        <circle cx="50" cy="50" r="32" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx="50" cy="50" r="15" fill={color} />
        <circle cx="50" cy="50" r="8" fill="#1a1a1a" />
    </svg>
);

const GuitarPickPinIcon: React.FC<{ color: string }> = ({ color }) => (
    <svg viewBox="0 0 100 100" fill={color} className="w-10 h-10 drop-shadow-lg">
        <path d="M50 0 L95 45 A30 30 0 0 1 5 45 Z" />
    </svg>
);

const RockstarMansionIcon: React.FC<{ color: string }> = ({ color }) => (
    <svg viewBox="0 0 24 24" className="w-20 h-20 drop-shadow-xl">
        <path fill={color} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <path fill="gold" stroke="#000" strokeWidth="0.5" d="M12 11.5l-1.93 1.4.73-2.28-1.93-1.4h2.39L12 7l.74 2.22h2.39l-1.93 1.4.73 2.28L12 11.5z"/>
    </svg>
);

interface MansionItem {
    id: string;
    type: 'mansion';
    name: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
}

export const MapView: React.FC<MapViewProps> = ({ challenges, perks, themeSettings }) => {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [activeFilter, setActiveFilter] = useState<'challenges' | 'perks'>('challenges');
    const [selectedPin, setSelectedPin] = useState<{ type: string, id: number | string } | null>(null);
    const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);

    // Effect for initializing the map instance and fetching user location
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [36.158, -86.778], // Default to Nashville center
                zoom: 14,
            });
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            }).addTo(map);
            mapRef.current = map;

            // Get user's location
            map.locate({ setView: true, maxZoom: 16 });

            function onLocationFound(e: L.LocationEvent) {
                setUserLocation(e.latlng);
                L.circleMarker(e.latlng, {
                    radius: 8,
                    fillColor: "#4285F4",
                    color: "#fff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map!)
                  .bindPopup("You are here").openPopup();
            }

            map.on('locationfound', onLocationFound);
            map.on('locationerror', () => {
                console.log("Geolocation error.");
            });

            // Invalidate size to ensure map renders correctly after resize
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    }, []);

    // Effect for updating markers when data or filters change
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        // Ensure map resizes correctly if container changes
        map.invalidateSize();

        // Add Rockstar Mansion Pin (always visible)
        const mansionLatLng: L.LatLngTuple = [36.1645, -86.7795];
        const isMansionSelected = selectedPin?.type === 'mansion' && selectedPin?.id === 'mansion-1';
        const mansionIconHtml = `<div class="${isMansionSelected ? 'selected-pin-wrapper' : ''}">${ReactDOMServer.renderToString(<RockstarMansionIcon color={themeSettings.secondaryColor} />)}</div>`;
        const mansionIcon = L.divIcon({ html: mansionIconHtml, className: 'custom-pin-icon', iconSize: [80, 80], iconAnchor: [40, 80], popupAnchor: [0, -80] });
        const mansionMarker = L.marker(mansionLatLng, { icon: mansionIcon, zIndexOffset: 1000 }).addTo(map);

        // Remove popup logic
        mansionMarker.unbindPopup();
        
        mansionMarker.on('click', (e) => {
            if (!mapRef.current) return;
            setSelectedPin({ type: 'mansion', id: 'mansion-1' });
            mapRef.current.flyTo(e.target.getLatLng(), map.getZoom(), { animate: true, duration: 0.5 });
        });
        
        const markers = L.markerClusterGroup({
            iconCreateFunction: (cluster) => L.divIcon({ html: `<span>${cluster.getChildCount()}</span>`, className: 'marker-cluster-custom', iconSize: [40, 40] })
        });

        const dataToDisplay = activeFilter === 'challenges' ? challenges : perks.filter(p => p.latitude && p.longitude);

        dataToDisplay.forEach(item => {
            if (!item.latitude || !item.longitude) return;

            const isSelected = selectedPin?.type === activeFilter && selectedPin?.id === item.id;
            const iconType = activeFilter === 'challenges' ? <GoldRecordIcon color={themeSettings.primaryColor} /> : <GuitarPickPinIcon color={themeSettings.secondaryColor} />;
            const iconHtml = `<div class="${isSelected ? 'selected-pin-wrapper' : ''}">${ReactDOMServer.renderToString(iconType)}</div>`;
            const customIcon = L.divIcon({ html: iconHtml, className: 'custom-pin-icon', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] });
            const markerLatLng = L.latLng(item.latitude, item.longitude);
            const marker = L.marker(markerLatLng, { icon: customIcon });
            
            // Remove popup logic
            marker.unbindPopup();

            marker.on('click', (e) => {
                if (!mapRef.current) return;
                setSelectedPin({ type: activeFilter, id: item.id });
                mapRef.current.flyTo(e.target.getLatLng(), map.getZoom(), { animate: true, duration: 0.5 });
            });

            markers.addLayer(marker);
        });

        map.addLayer(markers);

        return () => {
            map.eachLayer((layer) => {
                // Do not remove tile layer or user location marker
                if (layer instanceof L.Marker || layer instanceof L.MarkerClusterGroup) {
                    map.removeLayer(layer);
                }
            });
        };
    }, [challenges, perks, themeSettings, activeFilter, selectedPin, userLocation]);

    const getSelectedItem = () => {
        if (!selectedPin) return null;
        if (selectedPin.type === 'mansion') {
            return {
                type: 'mansion' as const,
                title: "The Rockstar Mansion",
                description: "Your home base for this tour!",
                address: "210 3rd Ave N",
                points: null,
                latitude: 36.1645,
                longitude: -86.7795
            };
        }
        if (selectedPin.type === 'challenges') {
            const item = challenges.find(c => c.id === selectedPin.id);
            return item ? { ...item, type: 'challenge' as const, title: item.venueName, points: item.points } : null;
        }
        if (selectedPin.type === 'perks') {
            const item = perks.find(p => p.id === selectedPin.id);
            return item ? { ...item, type: 'perk' as const, title: item.name, points: null } : null;
        }
        return null;
    };

    const selectedItem = getSelectedItem();

    return (
        <div className="h-[calc(100vh-80px)] w-full flex flex-col relative">
            <div className="h-[75%] w-full relative">
                 <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[5000] bg-slate-800/80 p-1 rounded-full flex space-x-1 backdrop-blur-sm shadow-lg pointer-events-auto">
                    <button
                        onClick={() => setActiveFilter('challenges')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${activeFilter === 'challenges' ? 'text-white' : 'text-slate-300'}`}
                        style={{ backgroundColor: activeFilter === 'challenges' ? themeSettings.primaryColor : 'transparent' }}
                    >
                        Challenges
                    </button>
                    <button
                        onClick={() => setActiveFilter('perks')}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${activeFilter === 'perks' ? 'text-white' : 'text-slate-300'}`}
                        style={{ backgroundColor: activeFilter === 'perks' ? themeSettings.secondaryColor : 'transparent' }}
                    >
                        Perks
                    </button>
                </div>
                <div ref={mapContainerRef} className="h-full w-full z-0" style={{ background: '#1e293b' }}></div>
            </div>

            <div className="h-[25%] w-full bg-slate-900 border-t border-slate-700 p-4 overflow-y-auto z-10">
                {selectedItem ? (
                    <div className="text-white">
                        <h3 className="font-bold text-lg" style={{ color: selectedItem.type === 'challenge' ? themeSettings.primaryColor : themeSettings.secondaryColor }}>
                            {selectedItem.title}
                        </h3>
                        <p className="text-slate-300 text-sm mt-1">{selectedItem.description}</p>
                        {selectedItem.address && <p className="text-slate-400 text-xs mt-2">{selectedItem.address}</p>}
                        {selectedItem.points && <p className="font-bold mt-2 text-base" style={{ color: themeSettings.primaryColor }}>+{selectedItem.points} TC</p>}

                        <div className="flex space-x-2 mt-3">
                            {selectedItem.type === 'challenge' && (
                                <button
                                    className="flex-1 text-center px-3 py-2 text-sm font-bold text-white rounded-md transition-opacity hover:opacity-90"
                                    style={{ backgroundColor: themeSettings.primaryColor }}
                                >
                                    Details
                                </button>
                            )}
                            {userLocation && selectedItem.latitude && selectedItem.longitude && (
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedItem.latitude},${selectedItem.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-center px-3 py-2 text-sm font-bold text-white bg-slate-600 rounded-md transition-colors hover:bg-slate-500"
                                >
                                    Get Directions
                                </a>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <p className="text-center text-sm">Select an icon on the map to see details</p>
                    </div>
                )}
            </div>

            <style>{`
                .custom-pin-icon {
                    background: transparent;
                    border: none;
                }
            `}</style>
        </div>
    );
};
