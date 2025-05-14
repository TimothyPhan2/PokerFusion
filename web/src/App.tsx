import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AnimatedRoutes from './components/AnimatedRoutes.tsx'
import { ToastContainer } from "react-toastify";

function App () {
  return (
    <><ToastContainer 
    position="top-right"
    autoClose={5000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    pauseOnHover
    draggable
  /><BrowserRouter>
  <AnimatedRoutes />
</BrowserRouter></>
    
  )
}

export default App
