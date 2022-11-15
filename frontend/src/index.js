import React from 'react'
import ReactDOM from 'react-dom/client'
import reportWebVitals from './reportWebVitals'

import { App } from './App'

import 'antd/dist/antd.dark.css'
import 'leaflet/dist/leaflet.css'
import "styles/custom_scrollbar.css"
import "leaflet-loading/src/Control.Loading.css"

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
