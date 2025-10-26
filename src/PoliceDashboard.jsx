import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const PoliceDashboard = ({ stationId }) => {
  const [alerts, setAlerts] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io("https://smart-surveillance-system-backend-japk.onrender.com"); // your backend URL
    setSocket(s);

    s.on("connect", () => {
      console.log("Connected to Socket.io, joining room", stationId);
      s.emit("join_station", stationId);
    });

    s.on("incoming_alert", (alert) => {
      console.log("New alert received:", alert);
      setAlerts((prev) => [alert, ...prev]); // prepend newest
    });

    return () => s.disconnect();
  }, [stationId]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Police Dashboard</h1>
      <div className="flex gap-4">
        {/* Alerts List */}
        <div className="w-1/3 border p-2 overflow-y-auto max-h-[80vh]">
          <h2 className="font-semibold mb-2">Incoming Alerts</h2>
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className="mb-2 p-2 border rounded bg-red-50 hover:bg-red-100"
            >
              <p>
                <b>Type:</b> {alert.event_type}
              </p>
              <p>
                <b>Time:</b>{" "}
                {new Date(alert.timestamp_utc).toLocaleString()}
              </p>
              <p>
                <b>Location:</b> {alert.location.lat}, {alert.location.lon}
              </p>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="w-2/3 h-[80vh] border">
          <MapContainer
            center={[19.206314, 72.872836]} // default center
            zoom={14}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {alerts.map((alert, idx) => (
              <Marker
                key={idx}
                position={[alert.location.lat, alert.location.lon]}
              >
                <Popup>
                  <b>{alert.event_type}</b>
                  <br />
                  {new Date(alert.timestamp_utc).toLocaleString()}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default PoliceDashboard;
