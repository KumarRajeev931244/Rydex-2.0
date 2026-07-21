"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import axios from "axios";
import { MapPin, Navigation2 } from "lucide-react";

type props = {
  pickUp: string;
  drop: string;
  onChange: (p: string, d: string) => void;
  onDistance: (d: number) => void;
};

function SearchMap({ pickUp, drop, onChange, onDistance }: props) {
  const [p1, setP1] = useState<[number, number]>();
  const [p2, setP2] = useState<[number, number]>();
  const [route, setRoute] = useState<[number, number][]>([]);
  const [km, setKm] = useState<number | null>(0);
  const [ready, setReady] = useState(false);

  //   fitbound

  function FitBounds({
    p1,
    p2,
  }: {
    p1: [number, number];
    p2: [number, number];
  }) {
    const map = useMap();
    useEffect(() => {
      map.invalidateSize();
      map.fitBounds([p1, p2], {
        padding: [72, 72],
        maxZoom: 15,
        animate: true,
      });
    }, [p1, p2, map]);
    return null;
  }

  // pick icon
  const pickUpIcon = new L.DivIcon({
    html: `<div style="display:flex; flex-direction:column; align-items:center; filter:drop-shadow(0 6px 18px rgba(0,0,0,0.22));">
  <div style="
    background:#0a0a0a; color:#fff;
    padding:5px 14px; border-radius:100px;
    font-size:10px; font-weight:800; letter-spacing:0.14em;
    text-transform:uppercase; white-space:nowrap;
    font-family:-apple-system,system-ui,sans-serif;
    box-shadow:0 2px 12px rgba(0,0,0,0.25);
  ">
    PICKUP
  </div>
  <div style="width:2px; height:10px; background:#0a0a0a; opacity:0.4;"></div>
  <div style="
    width:13px; height:13px; background:#0a0a0a; border-radius:50%;
    border:3px solid #fff;
    box-shadow:0 0 0 2px rgba(0,0,0,0.15), 0 3px 10px rgba(0,0,0,0.3);
  "></div>
</div>
`,
    className: "",
    iconSize: [90, 58],
    iconAnchor: [45, 58],
  });

  // drop icon
  const dropIcon = new L.DivIcon({
    html: `<div style="display:flex; flex-direction:column; align-items:center; filter:drop-shadow(0 6px 18px rgba(0,0,0,0.22));">
  <div style="
    background:#0a0a0a; color:#fff;
    padding:5px 14px; border-radius:100px;
    font-size:10px; font-weight:800; letter-spacing:0.14em;
    text-transform:uppercase; white-space:nowrap;
    font-family:-apple-system,system-ui,sans-serif;
    box-shadow:0 2px 12px rgba(0,0,0,0.25);
  ">
    Drop
  </div>
  <div style="width:2px; height:10px; background:#0a0a0a; opacity:0.4;"></div>
  <div style="
    width:13px; height:13px; background:#0a0a0a; border-radius:50%;
    border:3px solid #fff;
    box-shadow:0 0 0 2px rgba(0,0,0,0.15), 0 3px 10px rgba(0,0,0,0.3);
  "></div>
</div>
`,
    className: "",
    iconSize: [90, 58],
    iconAnchor: [45, 58],
  });

  // load route
  const loadRoute = async (p: [number, number], d: [number, number]) => {
    try {
      const { data } = await axios.get(
        `http://router.project-osrm.org/route/v1/driving/${p[1]},${p[0]};${d[1]},${d[0]}?overview=full&geometries=geojson`,
      );
      if (!data.routes.length) return;
      setRoute(
        data.routes[0].geometry.coordinates.map(([lon, lat]: number[]) => [
          lat,
          lon,
        ]),
      );
      const distanceKm = +(data.routes[0].distance / 1000).toFixed(2);
      setKm(distanceKm);
      onDistance(distanceKm);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  //   dragpickup
  const dragPickUp = async (lat: number, lon: number) => {
    const address =await reverseGeoCoding(lat,lon)
    setP1([lat, lon]);
    if (p2) {
      loadRoute([lat, lon], p2);
    }
    onChange(address!,drop)
  };

  // droppickup
  const dragDrop = async (lat: number, lon: number) => {
    const address =await reverseGeoCoding(lat,lon)
    setP2([lat, lon]);
    if (p1) {
      loadRoute(p1, [lat, lon]);
    }
    onChange?.(pickUp,address!)
  };
  const geoCoding = async (q: string): Promise<[number, number] | null> => {
    try {
      const { data } = await axios.get(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=1
`,
      );
      console.log("data:", data);
      if (!data.features.length) return null;

      const [lon, lat] = data.features[0].geometry.coordinates;
      return [lat, lon];
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const reverseGeoCoding = async (lat: number, lon: number) => {
    const { data } = await axios.get(
      `https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}`,
    );
    console.log("location data:", data);
    if (!data.features.length) return;
    const p = data.features[0].properties;
    return [p.name, p.street, p.city, p.state, p.country]
      .filter(Boolean)
      .join(",");
  };
  useEffect(() => {
    setReady(false);
    if (pickUp && drop) {
      (async () => {
        const a = await geoCoding(pickUp);
        console.log("a:", a);
        const b = await geoCoding(drop);

        console.log("b:", b);
        if (!a || !b) return;
        await loadRoute(a, b);
        setP1(a);
        setP2(b);
        setReady(true);
      })();
    }
  }, [pickUp, drop]);

  return (
    <div className="relative h-full w-full bg-zinc-100">
      <MapContainer
        style={{ width: "100%", height: "100%" }}
        center={p1 ?? [0, 0]}
        zoom={13}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; 
          <a href="https://carto.com">CARTO</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {p1 && p2 && <FitBounds p1={p1} p2={p2} />}
        {p1 && (
          <Marker
            position={p1}
            icon={pickUpIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = e.target.getLatLng();
                dragPickUp(m.lat, m.lng);
              },
            }}
          />
        )}
        {p2 && (
          <Marker
            position={p2}
            icon={dropIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = e.target.getLatLng();
                dragDrop(m.lat, m.lng);
              },
            }}
          />
        )}
        {route?.length > 0 && (
          <>
            <Polyline
              positions={route}
              pathOptions={{
                color: "#0a0a0a",
                weight: 3,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}
      </MapContainer>
      <AnimatePresence>
        {!ready && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 z-[999] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center gap-4"
          >
            <div className="relative w-14 h-14 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-900"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border border-transparent border-t-zinc-300"
              />
              <MapPin size={15} className="text-zinc-800" />
            </div>
            <div className="text-center">
              <p className="text-zinc-900 text-xs font-black tracking-[0.22em] uppercase">
                Loading Map
              </p>
              <p className="text-zinc-400 text-[10px] font-medium tracking-wider mt-0.5">
                Plotting your route...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {ready && km !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-20 left-4 z-[500] flex items-center gap-2 bg-white border border-zinc-200 px-3.5 py-2 rounded-xl shadow-lg "
          >
            <Navigation2 size={13} className="text-zinc-900" />
            <span className="text-zinc-900 text-xs font-bold">{km} km</span>
            <span className="w-px h-3 bg-zinc-200"></span>
            <span> ~{Math.max(3, Math.round((km / 25) * 60))} min </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchMap;
