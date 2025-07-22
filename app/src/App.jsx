import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Dashboard from './components/Dashboard'
import Search from './components/Search'
import About from './components/About'
import BookDetails from './components/BookDetails'
import './App.css'

function App() {
  return (
    <Router>
      <Navigation />
      <div className='content'>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/search/:id" element={<Search />} />
          <Route path="/book/:bookKey" element={<BookDetails />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
