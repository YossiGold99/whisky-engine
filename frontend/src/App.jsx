import { useState, useEffect } from 'react'
import RadarChart from './RadarChart'

function App() {
  const [whiskies, setWhiskies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetching data from our Django REST API endpoint
    fetch('http://127.0.0.1:8000/api/whiskies/')
      .then(response => response.json())
      .then(data => {
        setWhiskies(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching whisky data:', error)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen p-8">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-5xl font-serif text-white mb-4">
          What are you pouring <span className="text-amber-500">next?</span>
        </h1>
        <p className="font-mono text-sm text-slate-400 mb-8">
          {loading ? "Connecting to Django Backend..." : `API Connection: Live (${whiskies.length} bottles indexed)`}
        </p>

        {/* Search Bar Component */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl max-w-2xl mx-auto flex items-center gap-3">
          <input
            type="text"
            placeholder="Search distillery, region, or cask style..."
            className="w-full bg-transparent border-none text-white px-4 py-2 focus:outline-none font-mono text-sm placeholder:text-slate-500"
          />
          <button className="bg-amber-500 text-slate-900 px-6 py-2 rounded-xl font-bold hover:bg-amber-600 transition-all duration-300">
            Search
          </button>
        </div>
      </div>

      {/* Dynamic Whisky Feed from Django */}
      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {whiskies.map(whisky => (
          <div key={whisky.id} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl hover:border-amber-500/50 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-500">
                  {whisky.distillery?.region} • {whisky.cask_type || "Standard Cask"}
                </span>
                <h3 className="text-2xl font-serif text-white mt-1">
                  {whisky.distillery?.name} {whisky.name}
                </h3>
              </div>
              <span className="bg-white/10 text-slate-200 px-3 py-1 rounded-full font-mono text-xs">
                {whisky.abv}% ABV
              </span>
            </div>

            {/* Visual Flavor Profile */}
            <div className="mt-8 mb-4 border-t border-white/10 pt-6 flex justify-center">
              <RadarChart
                smoke={whisky.smoke_level}
                wood={whisky.wood_level}
                fruit={whisky.fruit_level}
                brine={whisky.brine_level}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App