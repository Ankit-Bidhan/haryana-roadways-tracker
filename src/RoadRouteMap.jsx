
import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function FitRoute({ positions }) {
    const map = useMap();

    useEffect(() => {
        if (positions.length > 0) {
            map.fitBounds(positions, { padding: [30, 30] });
        }
    }, [map, positions]);

    return null;
}

export default function RoadRouteMap({ stops = [] }) {
    const [roadRoute, setRoadRoute] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSimulating, setIsSimulating] = useState(false);
    const [progress, setProgress] = useState(0);

    // Accept latitude/longitude or lat/lng fields
    const validStops = stops
        .map((stop) => ({
            ...stop,
            lat: Number(stop.lat ?? stop.latitude),
            lng: Number(stop.lng ?? stop.lon ?? stop.longitude),
        }))
        .filter(
            (stop) =>
                Number.isFinite(stop.lat) &&
                Number.isFinite(stop.lng) &&
                Math.abs(stop.lat) <= 90 &&
                Math.abs(stop.lng) <= 180
        );

    const positions = validStops.map((stop) => [
        stop.lat,
        stop.lng,
    ]);

    useEffect(() => {
        let cancelled = false;

        async function getRoadRoute() {
            setRoadRoute([]);
            setError("");

            // Demo bus movement along the generated road route
            useEffect(() => {
                if (!isSimulating || roadRoute.length < 2) return;

                const interval = setInterval(() => {
                    setProgress((current) => {
                        if (current >= 1) {
                            setIsSimulating(false);
                            return 1;
                        }

                        return Math.min(current + 0.002, 1);
                    });
                }, 100);

                return () => clearInterval(interval);
            }, [isSimulating, roadRoute.length]);

            const busPosition = (() => {
                if (roadRoute.length === 0) return null;

                const index = Math.min(
                    Math.floor(progress * (roadRoute.length - 1)),
                    roadRoute.length - 1
                );

                return roadRoute[index];
            })();

            const busIcon = L.divIcon({
                className: "simulated-bus-icon",
                html: '<div class="bus-marker">🚌</div>',
                iconSize: [36, 36],
                iconAnchor: [18, 18],
            });

            if (validStops.length < 2) {
                setError("Route dikhane ke liye kam se kam 2 valid stops chahiye.");
                return;
            }

            setLoading(true);

            try {
                // OSRM expects longitude,latitude
                const coordinates = validStops
                    .map((stop) => `${stop.lng},${stop.lat}`)
                    .join(";");

                const url =
                    `https://router.project-osrm.org/route/v1/driving/${coordinates}` +
                    "?overview=full&geometries=geojson&steps=false";

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error("Routing service se response nahi mila.");
                }

                const data = await response.json();

                if (data.code !== "Ok" || !data.routes?.length) {
                    throw new Error("In stops ke beech road route nahi mila.");
                }

                // GeoJSON gives [longitude, latitude].
                // Leaflet needs [latitude, longitude].
                const routeCoordinates = data.routes[0].geometry.coordinates.map(
                    ([lng, lat]) => [lat, lng]
                );

                if (!cancelled) {
                    setRoadRoute(routeCoordinates);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.message ||
                        "Road route load nahi hua. Internet connection check karo."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        getRoadRoute();

        return () => {
            cancelled = true;
        };
    }, [stops]);

    if (validStops.length < 2) {
        return (
            <div className="map-message">
                {error || "Map ke liye valid stop coordinates chahiye."}
            </div>
        );
    }

    return (
        <div className="road-map-wrapper">
            <div className="map-status">
                {loading && "Road route load ho raha hai…"}
                {!loading && roadRoute.length > 0 &&
                    "Road route · Demo routing"}
                {error && <span className="map-error">{error}</span>}
            </div>

            <MapContainer
                center={positions[0]}
                zoom={8}
                scrollWheelZoom={true}
                className="road-map"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitRoute positions={roadRoute.length ? roadRoute : positions} />

                {roadRoute.length > 0 && (
                    <Polyline
                        positions={roadRoute}
                        pathOptions={{
                            color: "#1769e0",
                            weight: 5,
                            opacity: 0.85,
                        }}
                    />
                )}

                {validStops.map((stop, index) => (
                    <Marker
                        key={`${stop.name}-${index}`}
                        position={[stop.lat, stop.lng]}
                    >
                        <Popup>
                            <strong>{stop.name || stop.city || `Stop ${index + 1}`}</strong>
                            {stop.time && <div>Time: {stop.time}</div>}
                        </Popup>
                    </Marker>
                ))}
                {busPosition && (
                    <Marker
                        position={busPosition}
                        icon={busIcon}
                        zIndexOffset={1000}
                    >
                        <Popup>
                            <strong>Demo bus</strong>
                            <div>Simulated movement</div>
                            <div>
                                Progress: {Math.round(progress * 100)}%
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            <div className="simulation-controls">
                <button
                    onClick={() => setIsSimulating(true)}
                    disabled={
                        isSimulating ||
                        roadRoute.length < 2 ||
                        progress >= 1
                    }
                >
                    Start
                </button>

                <button
                    onClick={() => setIsSimulating(false)}
                    disabled={!isSimulating}
                >
                    Pause
                </button>

                <button
                    onClick={() => {
                        setIsSimulating(false);
                        setProgress(0);
                    }}
                    disabled={progress === 0 && !isSimulating}
                >
                    Reset
                </button>
            </div>

            <div className="simulation-note">
                Demo simulation only — actual bus GPS location nahi hai.
            </div>

            <div className="map-disclaimer">
                Road route is generated for demonstration. It may not match the
                actual Haryana Roadways bus route.
            </div>
        </div>
    );
}