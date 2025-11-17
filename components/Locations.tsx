import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { Challenge, Perk, PartnerDeal } from '../types';

interface LocationsProps {
  challenges: Challenge[];
  perks: Perk[];
  deals: PartnerDeal[];
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 36.1627,
  lng: -86.7816
};

export const Locations: React.FC<LocationsProps> = ({ challenges, perks, deals }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ""
  })

  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [showChallenges, setShowChallenges] = useState(true);
  const [showPerks, setShowPerks] = useState(true);
  const [showDeals, setShowDeals] = useState(true);

  const handleMarkerClick = (markerId: string) => {
    setActiveMarker(markerId);
  };

  return isLoaded ? (
      <div>
        <div className="flex justify-center space-x-4 mb-4">
          <button onClick={() => setShowChallenges(!showChallenges)} className={`py-2 px-4 rounded-md font-bold ${showChallenges ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>Challenges</button>
          <button onClick={() => setShowPerks(!showPerks)} className={`py-2 px-4 rounded-md font-bold ${showPerks ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'}`}>Perks</button>
          <button onClick={() => setShowDeals(!showDeals)} className={`py-2 px-4 rounded-md font-bold ${showDeals ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'}`}>Deals</button>
        </div>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={9}
        >
          <Circle
            center={center}
            radius={120700} // 75 miles in meters
            options={{
              strokeColor: '#FF0000',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#FF0000',
              fillOpacity: 0.15,
            }}
          />
          {showChallenges && challenges.map(challenge => (
            <Marker
              key={`challenge-${challenge.id}`}
              position={{ lat: challenge.position[0], lng: challenge.position[1] }}
              onClick={() => handleMarkerClick(`challenge-${challenge.id}`)}
            >
              {activeMarker === `challenge-${challenge.id}` && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div>
                    <h4>{challenge.venueName}</h4>
                    <p>{challenge.description}</p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
          {showPerks && perks.map(perk => (
            <Marker
              key={`perk-${perk.id}`}
              position={{ lat: perk.position[0], lng: perk.position[1] }}
              onClick={() => handleMarkerClick(`perk-${perk.id}`)}
            >
              {activeMarker === `perk-${perk.id}` && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div>
                    <h4>{perk.name}</h4>
                    <p>{perk.description}</p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
          {showDeals && deals.map(deal => (
            <Marker
              key={`deal-${deal.id}`}
              position={{ lat: deal.position[0], lng: deal.position[1] }}
              onClick={() => handleMarkerClick(`deal-${deal.id}`)}
            >
              {activeMarker === `deal-${deal.id}` && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div>
                    <h4>{deal.name}</h4>
                    <p>{deal.description}</p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      </div>
  ) : <></>
}