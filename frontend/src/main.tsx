import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App'
import { PieceColorFilters } from './components/pieces/PieceColorFilters'
import { SitePage } from './components/lobby/SitePage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <PieceColorFilters />
      <BrowserRouter>
        <Routes>
          <Route path="/p/:slug" element={<SitePage />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </>
  </React.StrictMode>
)
