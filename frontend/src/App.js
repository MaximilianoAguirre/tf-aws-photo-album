import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

import { Main } from "components/MainLayout"
import { AllPhotos } from "pages/AllPhotos"
import { Located } from "pages/Located"
import { Map } from "pages/Map"

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />}>
          <Route path="photos" element={<AllPhotos />} />
          <Route path="map" element={<Map />} />
          <Route path="located/:geohash" element={<Located />} />
          <Route path="*" element={<Navigate to="/photos" />} />
          <Route index element={<Navigate to="/photos" />} />
        </Route>
      </Routes>
    </Router>
  )
}
