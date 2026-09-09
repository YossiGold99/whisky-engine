import { useState, useEffect, useMemo } from 'react'
import RadarChart from './RadarChart'
import CollectorsVault from './CollectorsVault'
import AuthModal from './AuthModal'

function App() {
  const [allWhiskies, setAllWhiskies] = useState([])
  const [loading, setLoading] = useState(true)

  // Advanced Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [peatedOnly, setPeatedOnly] = useState(false)
  const [caskStrengthOnly, setCaskStrengthOnly] = useState(false)
  const [minSmoke, setMinSmoke] = useState(0)

  const [activeMatch, setActiveMatch] = useState(null)
  const [matchResults, setMatchResults] = useState([])

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check local storage for the token when the app loads
  useEffect(() => {
    const token = localStorage.getItem('vaultToken')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('vaultToken')
    setIsLoggedIn(false)
  }

  // Fetch ALL whiskies once on initial load
  useEffect(() => {
    setLoading(true)
    fetch(`http://127.0.0.1:8000/api/whiskies/`)
      .then(response => response.json())
      .then(data => {
        setAllWhiskies(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching whisky data:', error)
        setLoading(false)
      })
  }, [])

  // Instant In-Memory Filtering
  const filteredWhiskies = useMemo(() => {
    return allWhiskies.filter(whisky => {
      const distilleryName = whisky.distillery?.name || ''
      const matchesSearch =
        whisky.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        distilleryName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPeat = !peatedOnly || whisky.is_peated
      const matchesCask = !caskStrengthOnly || whisky.is_cask_strength
      const matchesSmoke = (whisky.smoke_level ?? 0) >= minSmoke

      return matchesSearch && matchesPeat && matchesCask && matchesSmoke
    })
  }, [allWhiskies, searchTerm, peatedOnly, caskStrengthOnly, minSmoke])

  const handleResetFilters = () => {
    setSearchTerm('')
    setPeatedOnly(false)
    setCaskStrengthOnly(false)
    setMinSmoke(0)
  }

  const hasActiveFilters = searchTerm || peatedOnly || caskStrengthOnly || minSmoke > 0

  const calculateMatches = (targetWhisky) => {
    if (activeMatch === targetWhisky.id) {
      setActiveMatch(null)
      return
    }

    // Search against ALL whiskies, not just the filtered view
    const calculated = allWhiskies
      .filter(w => w.id !== targetWhisky.id)
      .map(w => {
        const distance = Math.sqrt(
          Math.pow(w.smoke_level - targetWhisky.smoke_level, 2) +
          Math.pow(w.wood_level - targetWhisky.wood_level, 2) +
          Math.pow(w.fruit_level - targetWhisky.fruit_level, 2) +
          Math.pow(w.brine_level - targetWhisky.brine_level, 2)
        )
        return { ...w, distance }
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)

    setMatchResults(calculated)
    setActiveMatch(targetWhisky.id)
  }

  return (
    <div className="min-h-screen relative p-8">
      {/* Top Navigation Bar */}
      <div className="max-w-6xl mx-auto flex justify-end mb-4">
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">
              Hello, Collector!
            </span>
            <button
              onClick={handleSignOut}
              className="text-xs font-mono text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-400/50 px-4 py-2 rounded-xl transition-all duration-300 uppercase tracking-widest"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="text-xs font-mono text-amber-500 hover:text-white border border-amber-500/20 hover:bg-white/5 px-4 py-2 rounded-xl transition-all duration-300 uppercase tracking-widest"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center py-10">
        <h1 className="text-5xl font-serif text-white mb-4">
          What are you pouring <span className="text-amber-500">next?</span>
        </h1>

        {/* NEW ADVANCED FILTER BAR */}
        <div className="bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-6 mt-8 shadow-xl text-left">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

            {/* Search Input */}
            <div className="md:col-span-5">
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Search Vault
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Distillery, expression..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Boolean Toggles */}
            <div className="md:col-span-4 flex items-end gap-2">
              <button
                type="button"
                onClick={() => setPeatedOnly(!peatedOnly)}
                className={`flex-1 py-2.5 px-3 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-colors border ${peatedOnly
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-black/20 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
              >
                Peated
              </button>
              <button
                type="button"
                onClick={() => setCaskStrengthOnly(!caskStrengthOnly)}
                className={`flex-1 py-2.5 px-3 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-colors border ${caskStrengthOnly
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                    : 'bg-black/20 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
              >
                Cask Str.
              </button>
            </div>

            {/* Min Smoke Slider */}
            <div className="md:col-span-3">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono uppercase text-slate-400">
                  Min Smoke
                </label>
                <span className="text-xs font-mono text-amber-500 font-bold">
                  {minSmoke}/10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={minSmoke}
                onChange={(e) => setMinSmoke(Number(e.target.value))}
                className="w-full accent-amber-500 bg-black/40 cursor-pointer"
              />
            </div>
          </div>

          {/* Status bar */}
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">
              Showing <strong className="text-white">{filteredWhiskies.length}</strong> of {allWhiskies.length} expressions
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-amber-500 hover:text-amber-400 transition-colors"
              >
                [ Clear Filters ]
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Whisky Feed */}
      <div className="max-w-6xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredWhiskies.length === 0 && !loading && (
          <div className="col-span-full text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <p className="text-slate-400 font-mono text-sm mb-3">
              No bottles match your active search criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="text-xs font-mono uppercase tracking-wider text-amber-500 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Note the mapping is now over filteredWhiskies instead of whiskies */}
        {filteredWhiskies.map(whisky => (
          <div key={whisky.id} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl transition-all duration-300 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-500">
                  {whisky.distillery?.region || 'Global'} • {whisky.cask_type || "Standard Cask"}
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

            <button
              onClick={() => calculateMatches(whisky)}
              className="mt-auto w-full py-3 rounded-xl font-mono text-sm uppercase tracking-wider border border-white/10 text-slate-300 hover:bg-white/5 hover:text-amber-500 transition-colors"
            >
              {activeMatch === whisky.id ? "Close Matches" : "Find Similar Pours"}
            </button>

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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={() => setIsLoggedIn(true)}
      />
    </div>
  )
}

export default App