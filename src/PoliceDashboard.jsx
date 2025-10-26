import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons
const stationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const alertIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const PoliceDashboard = ({ stationId = "station_001" }) => {
  const [alerts, setAlerts] = useState([]);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const stationLocation = [19.206314, 72.872836];

  useEffect(() => {
    const s = io("https://smart-surveillance-system-backend-japk.onrender.com");
    setSocket(s);

    s.on("connect", () => {
      console.log("Connected to Socket.io, joining room", stationId);
      setConnected(true);
      s.emit("join_station", stationId);
    });

    s.on("disconnect", () => {
      setConnected(false);
    });

    s.on("incoming_alert", (alert) => {
      console.log("New alert received:", alert);
      setAlerts((prev) => [alert, ...prev]);
    });

    return () => s.disconnect();
  }, [stationId]);

  const getAlertColor = (type) => {
    const colors = {
      violence: "#dc2626",
      theft: "#ea580c",
      suspicious: "#eab308",
      emergency: "#991b1b",
    };
    return colors[type?.toLowerCase()] || "#dc2626";
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <svg style={styles.logo} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <h1 style={styles.title}>Police Alert Dashboard</h1>
              <p style={styles.subtitle}>Station ID: {stationId}</p>
            </div>
          </div>
          <div style={styles.statusContainer}>
            <div style={{...styles.statusDot, backgroundColor: connected ? "#4ade80" : "#f87171"}}></div>
            <span style={styles.statusText}>
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Alerts Panel */}
        <div style={styles.alertsPanel}>
          <div style={styles.panelHeader}>
            <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h2 style={styles.panelTitle}>Incoming Alerts</h2>
            <span style={styles.alertBadge}>{alerts.length}</span>
          </div>
          <div style={styles.alertsList}>
            {alerts.length === 0 ? (
              <div style={styles.emptyState}>
                <svg style={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p style={styles.emptyText}>No alerts received yet</p>
              </div>
            ) : (
              alerts.map((alert, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.alertItem,
                    ...(idx === 0 ? styles.alertItemNew : {}),
                  }}
                >
                  <div style={styles.alertContent}>
                    <div style={{...styles.alertIconContainer, backgroundColor: getAlertColor(alert.event_type)}}>
                      <svg style={styles.alertIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div style={styles.alertDetails}>
                      <div style={styles.alertHeader}>
                        <h3 style={styles.alertType}>{alert.event_type}</h3>
                        {idx === 0 && <span style={styles.newBadge}>NEW</span>}
                      </div>
                      <div style={styles.alertInfo}>
                        <div style={styles.infoRow}>
                          <svg style={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span style={styles.infoText}>
                            {new Date(alert.timestamp_utc).toLocaleString("en-IN", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                        <div style={styles.infoRow}>
                          <svg style={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span style={styles.infoText}>
                            {alert.location.lat.toFixed(4)}, {alert.location.lon.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map Panel */}
        <div style={styles.mapPanel}>
          <div style={styles.panelHeader}>
            <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 style={styles.panelTitle}>Alert Map</h2>
          </div>
          <div style={styles.mapContainer}>
            <MapContainer
              center={stationLocation}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Police Station Marker */}
              <Marker position={stationLocation} icon={stationIcon}>
                <Popup>
                  <div style={styles.popup}>
                    <strong>Police Station</strong>
                    <br />
                    {stationLocation[0].toFixed(6)}, {stationLocation[1].toFixed(6)}
                  </div>
                </Popup>
              </Marker>
              
              {/* Station Coverage Circle */}
              <Circle
                center={stationLocation}
                radius={1000}
                pathOptions={{
                  color: "#3b82f6",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.1,
                }}
              />

              {/* Alert Markers */}
              {alerts.map((alert, idx) => (
                <Marker
                  key={idx}
                  position={[alert.location.lat, alert.location.lon]}
                  icon={alertIcon}
                >
                  <Popup>
                    <div style={styles.popup}>
                      <strong style={{color: getAlertColor(alert.event_type)}}>
                        {alert.event_type}
                      </strong>
                      <br />
                      <small>
                        {new Date(alert.timestamp_utc).toLocaleString("en-IN")}
                      </small>
                      <br />
                      <small>
                        {alert.location.lat.toFixed(6)}, {alert.location.lon.toFixed(6)}
                      </small>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    minWidth: "100vw",
    backgroundColor: "#f9fafb",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: {
    backgroundColor: "#1e3a8a",
    color: "white",
    padding: "1rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  headerContent: {
    padding: "0 1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  logo: {
    width: "2rem",
    height: "2rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#bfdbfe",
    margin: 0,
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  statusDot: {
    width: "0.75rem",
    height: "0.75rem",
    borderRadius: "50%",
    animation: "pulse 2s infinite",
  },
  statusText: {
    fontSize: "0.875rem",
  },
  mainContent: {
    padding: "1rem",
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "1rem",
    height: "calc(100vh - 100px)",
  },
  alertsPanel: {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  panelHeader: {
    backgroundColor: "#1e40af",
    color: "white",
    padding: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  icon: {
    width: "1.25rem",
    height: "1.25rem",
  },
  panelTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    margin: 0,
    flex: 1,
  },
  alertBadge: {
    backgroundColor: "#dc2626",
    color: "white",
    padding: "0.25rem 0.5rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: "bold",
  },
  alertsList: {
    height: "calc(100vh - 160px)",
    overflowY: "auto",
  },
  emptyState: {
    padding: "4rem 2rem",
    textAlign: "center",
    color: "#9ca3af",
  },
  emptyIcon: {
    width: "3rem",
    height: "3rem",
    margin: "0 auto 0.5rem",
    opacity: 0.5,
  },
  emptyText: {
    margin: 0,
  },
  alertItem: {
    borderBottom: "1px solid #e5e7eb",
    padding: "1rem",
    transition: "background-color 0.2s",
    cursor: "pointer",
  },
  alertItemNew: {
    backgroundColor: "#fef2f2",
    borderLeft: "4px solid #dc2626",
  },
  alertContent: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
  },
  alertIconContainer: {
    padding: "0.5rem",
    borderRadius: "0.5rem",
    color: "white",
  },
  alertIcon: {
    width: "1.25rem",
    height: "1.25rem",
  },
  alertDetails: {
    flex: 1,
  },
  alertHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.25rem",
  },
  alertType: {
    fontWeight: "bold",
    color: "#111827",
    margin: 0,
    fontSize: "1rem",
  },
  newBadge: {
    fontSize: "0.75rem",
    backgroundColor: "#dc2626",
    color: "white",
    padding: "0.125rem 0.5rem",
    borderRadius: "0.25rem",
  },
  alertInfo: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    marginBottom: "0.25rem",
  },
  infoIcon: {
    width: "0.875rem",
    height: "0.875rem",
  },
  infoText: {
    margin: 0,
  },
  mapPanel: {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  mapContainer: {
    height: "calc(100vh - 160px)",
    width: "100%",
  },
  popup: {
    fontSize: "0.875rem",
  },
};

export default PoliceDashboard;