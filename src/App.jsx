import { useEffect, useState } from 'react'
import MapWrapper from './MapWrapper'
import './App.css'


function App() {

  return (
    <div className="App">

      <MapWrapper />

      <select name="cars" id="cars">
        <option value="volvo">Volvo</option>
        <option value="saab">Saab</option>
        <option value="mercedes">Mercedes</option>
        <option value="audi">Audi</option>
      </select>

    </div>
  )
}

export default App
