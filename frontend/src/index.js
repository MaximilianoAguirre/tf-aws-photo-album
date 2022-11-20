import React from 'react'
import ReactDOM from 'react-dom/client'
import reportWebVitals from './reportWebVitals'

import { App } from './App'

// Reset style provided by AntD
import "antd/dist/reset.css"

// Leaflet styles
import 'leaflet/dist/leaflet.css'
import "leaflet-loading/src/Control.Loading.css"

// Custom styles
import "styles/custom_scrollbar.css"
import "styles/antd_modal_fullscreen.css"

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
