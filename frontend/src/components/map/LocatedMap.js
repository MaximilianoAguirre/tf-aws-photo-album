import React from "react"
import { MapContainer, TileLayer, Rectangle } from 'react-leaflet'
import 'leaflet-loading'

import { geohash } from "util/geohash"

const geohash_length_to_zoom = {
    3: 5,
    4: 8,
    5: 10,
    6: 12,
    7: 14,
    8: 16,
}

export const LocatedMap = ({ hash, style }) => {
    if (!hash) return

    const [minLat, minLon, maxLat, maxLon] = geohash.decode_bbox(hash)


    return <>
        <MapContainer
            center={[(maxLat + minLat) / 2, (maxLon + minLon) / 2]}
            zoom={geohash_length_to_zoom[hash.length]}
            minZoom={4}
            dragging={false}
            scrollWheelZoom={false}
            loadingControl={true}
            style={{ ...style, height: "20vh", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a target="_blank" href="https://www.linkedin.com/in/MaximilianoAguirre/">Maxi Aguirre</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Rectangle pathOptions={{ fillColor: "red", color: "red" }} bounds={[[minLat, minLon], [maxLat, maxLon]]} />
        </MapContainer>
    </>
}

