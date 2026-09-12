import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import RadarChart from './RadarChart'

const FlightMenu = () => {
    const { id } = useParams()
    const [flight, setFlight] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchFlight = async () => {
            try {
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
        <div className="min-h-screen bg-slate-950 print:bg-white relative p-8 print:p-0">

            {/* Force Landscape Paper & High-Contrast Radar Charts */}
            <style>
                {`
                @media print {
                    @page { 
                        size: landscape; 
                        margin: 0; /* Removes browser default headers and footers */
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                    }
                    /* Forces SVG text inside the chart to be dark black and bold */
                    .radar-print-fix svg text { fill: #000 !important; font-weight: 800 !important; font-size: 14px !important; }
                    /* Forces the spider-web background lines to be darker */
                    .radar-print-fix svg line { stroke: #94a3b8 !important; stroke-width: 1.5px !important; }
                }
                `}
            </style>

            {/* Screen-only Background Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none print:hidden" />

            <div className="max-w-4xl mx-auto relative z-10 pt-10 print:pt-4 print:max-w-none print:w-full">

                {/* Header Section */}
                <div className="text-center mb-16 print:mb-6">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-500 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20 print:bg-transparent print:border-black print:text-black">
                        Curated Tasting Flight
                    </span>
                    <h1 className="text-5xl font-serif text-white print:text-black print:font-bold mt-4 mb-2">
                        {flight.name}
                    </h1>
                    {flight.description && (
                        <p className="text-slate-400 print:text-black font-mono text-sm max-w-2xl mx-auto">
                            {flight.description}
                        </p>
                    )}
                </div>

                {/* Flex-nowrap ensures all 5 items stay on a single horizontal row */}
                <div className="flex flex-col gap-12 print:flex-row print:justify-between print:items-start print:gap-4 print:flex-nowrap print:w-full">
                    {flight.whiskies_detail.map((whisky, index) => (
                        <div
                            key={whisky.id}
                            // print:flex-1 makes them dynamically shrink to share the page evenly
                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col md:flex-row gap-8 items-center print:bg-transparent print:border-none print:shadow-none print:flex-col print:flex-1 print:p-0 print:gap-2 print:break-inside-avoid"
                        >

                            {/* Glass Placement Ring: Slightly smaller (w-24) to fit 5 across, darker border */}
                            <div className="hidden print:flex w-24 h-24 rounded-full border-2 border-dashed border-slate-800 mx-auto items-center justify-center text-slate-800 font-mono text-[9px] text-center leading-relaxed tracking-widest">
                                <span>PLACE<br />GLASS<br />HERE</span>
                            </div>

                            {/* Pour Number & Details: Adjusted text sizing to fit 5 columns */}
                            <div className="flex-1 text-center md:text-left print:text-center w-full">
                                <div className="text-amber-500 font-mono text-sm font-bold uppercase tracking-widest mb-2 print:text-black print:text-[10px]">
                                    Pour N° {index + 1}
                                </div>
                                <h3 className="text-3xl font-serif text-white print:text-black print:text-xl print:font-bold print:leading-tight mb-1">
                                    {whisky.distillery?.name}
                                </h3>
                                <h4 className="text-xl font-serif text-slate-300 print:text-black print:font-semibold print:text-sm mb-2">
                                    {whisky.name}
                                </h4>
                                <div className="text-xs font-mono text-slate-400 print:text-black print:font-bold print:text-[10px] uppercase tracking-wider">
                                    {whisky.distillery?.region} • {whisky.abv}% ABV
                                </div>
                            </div>

                            {/* Flavor Profile: Added radar-print-fix class and scaled it up */}
                            <div className="w-full md:w-64 h-64 flex-shrink-0 flex items-center justify-center bg-black/20 rounded-xl border border-white/5 p-4 print:bg-transparent print:border-none print:h-40 print:p-0 radar-print-fix print:scale-125 print:mt-4">
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

                {/* Print Footer */}
                <div className="mt-20 print:mt-16 text-center pb-10">
                    <p className="text-slate-600 print:text-black font-mono text-[10px] uppercase tracking-widest">
                        Curated via SpiritsBase
                    </p>
                </div>
            </div>
        </div>
    )
}

export default FlightMenu