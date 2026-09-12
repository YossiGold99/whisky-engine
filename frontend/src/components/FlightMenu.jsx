import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import RadarChart from './RadarChart'

const FlightMenu = () => {
    const { id } = useParams() // Grabs the UUID from the web address
    const [flight, setFlight] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchFlight = async () => {
            try {
                // Notice we don't send a token here! This is public.
                const response = await fetch(`http://127.0.0.1:8000/api/flights/${id}/`)
                if (response.ok) {
                    const data = await response.json()
                    setFlight(data)
                } else {
                    setError('Flight not found. The link might be broken or expired.')
                }
            } catch (err) {
                setError('Failed to connect to the server.')
            } finally {
                setLoading(false)
            }
        }

        fetchFlight()
    }, [id])

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-amber-500 font-mono text-sm animate-pulse">Decanting flight details...</div>
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
            <div className="text-red-400 font-mono text-sm mb-4">{error}</div>
            <Link to="/" className="text-amber-500 hover:text-amber-400 font-mono text-xs uppercase tracking-widest underline">
                Return to Main Catalog
            </Link>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-950 relative p-8">
            {/* Background Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10 pt-10">
                <div className="text-center mb-16">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-500 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
                        Curated Tasting Flight
                    </span>
                    <h1 className="text-5xl font-serif text-white mt-6 mb-4">
                        {flight.name}
                    </h1>
                    {flight.description && (
                        <p className="text-slate-400 font-mono text-sm max-w-2xl mx-auto">
                            {flight.description}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-12">
                    {flight.whiskies_detail.map((whisky, index) => (
                        <div key={whisky.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col md:flex-row gap-8 items-center">

                            {/* Pour Number & Details */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="text-amber-500 font-mono text-sm font-bold uppercase tracking-widest mb-2">
                                    Pour N° {index + 1}
                                </div>
                                <h3 className="text-3xl font-serif text-white mb-1">
                                    {whisky.distillery?.name} {whisky.name}
                                </h3>
                                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-6">
                                    {whisky.distillery?.region} • {whisky.abv}% ABV • {whisky.cask_type || "Standard Cask"}
                                </div>

                                <div className="flex gap-2 justify-center md:justify-start">
                                    {whisky.is_peated && (
                                        <span className="px-3 py-1 bg-slate-800 border border-slate-600 rounded-full text-xs font-mono text-slate-300 uppercase">Peated</span>
                                    )}
                                    {whisky.is_cask_strength && (
                                        <span className="px-3 py-1 bg-slate-800 border border-slate-600 rounded-full text-xs font-mono text-slate-300 uppercase">Cask Strength</span>
                                    )}
                                </div>
                            </div>

                            {/* Flavor Profile */}
                            <div className="w-full md:w-64 h-64 flex-shrink-0 flex items-center justify-center bg-black/20 rounded-xl border border-white/5 p-4">
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

                <div className="mt-20 text-center pb-10">
                    <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">
                        Curated via SpiritsBase
                    </p>
                </div>
            </div>
        </div>
    )
}

export default FlightMenu