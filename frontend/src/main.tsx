import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { PieceColorFilters } from './components/pieces/PieceColorFilters'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <PieceColorFilters />
      <App />
    </>
  </React.StrictMode>
)
