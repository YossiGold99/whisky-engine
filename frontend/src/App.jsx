import { useState, useEffect } from 'react'
import RadarChart from './RadarChart'
import CollectorsVault from './CollectorsVault'

function App() {
  const [whiskies, setWhiskies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeMatch, setActiveMatch] = useState(null)
  const [matchResults, setMatchResults] = useState([])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setLoading(true)
      fetch(`http://127.0.0.1:8000/api/whiskies/?search=${searchTerm}`)
        .then(response => response.json())
        .then(data => {
          setWhiskies(data)
          setLoading(false)
        })
        .catch(error => {
          console.error('Error fetching whisky data:', error)
          setLoading(false)
        })
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  // The Smart Match Algorithm
  const calculateMatches = (targetWhisky) => {
    // If clicking the same bottle, toggle it off
    if (activeMatch === targetWhisky.id) {
      setActiveMatch(null)
      return
    }

    const calculated = whiskies
      .filter(w => w.id !== targetWhisky.id) // Don't match the bottle with itself
      .map(w => {
        // Euclidean distance across 4 flavor axes
        const distance = Math.sqrt(
          Math.pow(w.smoke_level - targetWhisky.smoke_level, 2) +
          Math.pow(w.wood_level - targetWhisky.wood_level, 2) +
          Math.pow(w.fruit_level - targetWhisky.fruit_level, 2) +
          Math.pow(w.brine_level - targetWhisky.brine_level, 2)
        )
        return { ...w, distance }
      })
      .sort((a, b) => a.distance - b.distance) // Sort closest to furthest
      .slice(0, 3) // Take the top 3 closest matches

    setMatchResults(calculated)
    setActiveMatch(targetWhisky.id)
  }

  return (
    <div className="min-h-screen p-8">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-5xl font-serif text-white mb-4">
          What are you pouring <span className="text-amber-500">next?</span>
        </h1>
        <p className="font-mono text-sm text-slate-400 mb-8">
          {loading ? "Analyzing flavor profiles..." : `API Connection: Live (${whiskies.length} bottles indexed)`}
        </p>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl max-w-2xl mx-auto flex items-center gap-3">
          <input
            type="text"
            placeholder="Search distillery, region, or cask style..."
            className="w-full bg-transparent border-none text-white px-4 py-2 focus:outline-none font-mono text-sm placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="bg-amber-500 text-slate-900 px-6 py-2 rounded-xl font-bold hover:bg-amber-600 transition-all duration-300">
            Search
          </button>
        </div>
      </div>

      {/* Dynamic Whisky Feed */}
      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {whiskies.map(whisky => (
          <div key={whisky.id} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl transition-all duration-300 flex flex-col">
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

            <div className="mt-8 mb-4 border-t border-white/10 pt-6 flex justify-center">
              <RadarChart
                smoke={whisky.smoke_level}
                wood={whisky.wood_level}
                fruit={whisky.fruit_level}
                brine={whisky.brine_level}
              />
            </div>

            {/* Smart Match Button */}
            <button
              onClick={() => calculateMatches(whisky)}
              className="mt-auto w-full py-3 rounded-xl font-mono text-sm uppercase tracking-wider border border-white/10 text-slate-300 hover:bg-white/5 hover:text-amber-500 transition-colors"
            >
              {activeMatch === whisky.id ? "Close Matches" : "Find Similar Pours"}
            </button>

            {/* Match Results Dropdown */}
            {activeMatch === whisky.id && (
              <div className="mt-4 p-4 bg-black/40 rounded-xl border border-amber-500/20">
                <h4 className="text-amber-500 text-xs font-mono uppercase tracking-widest mb-3">Top Flavor Matches</h4>
                <div className="flex flex-col gap-3">
                  {matchResults.map(match => (
                    <div key={match.id} className="flex justify-between items-center text-sm">
                      <span className="text-white font-serif">{match.distillery?.name} {match.name}</span>
                      <span className="text-slate-400 font-mono text-xs ml-4 text-right">
                        {(100 - (match.distance * 5)).toFixed(0)}% Match
                      </span>
                    </div>
                  ))}
                  {matchResults.length === 0 && (
                    <span className="text-slate-500 font-mono text-xs">No close matches found. Expand database.</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <CollectorsVault />
    </div>
  )
}

export default App