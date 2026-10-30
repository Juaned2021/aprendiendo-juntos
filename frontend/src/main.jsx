import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/reset.css'
import './styles/variables.css'
import './styles/global.css'
import './styles/forms.css'
import './styles/tables.css'
import './styles/sweetalert.css'
import './utils/sweetalertConfig'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

