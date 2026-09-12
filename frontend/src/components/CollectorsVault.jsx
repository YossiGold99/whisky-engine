import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const CollectorsVault = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [vaultBottles, setVaultBottles] = useState([])
    const [catalogWhiskies, setCatalogWhiskies] = useState([])
    const [selectedWhiskyId, setSelectedWhiskyId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Journal Modal State
    const [journalBottle, setJournalBottle] = useState(null)
    const [editNotes, setEditNotes] = useState('')
    const [editRating, setEditRating] = useState(0)

    // Flight Builder State
    const [flightName, setFlightName] = useState('')
    const [flightDescription, setFlightDescription] = useState('')
    const [selectedFlightBottles, setSelectedFlightBottles] = useState([])
    const [generatedFlightLink, setGeneratedFlightLink] = useState('')
    const [isCreatingFlight, setIsCreatingFlight] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchVaultItems()
            fetchCatalog()
        }
    }, [isOpen])

    const fetchVaultItems = async () => {
        setLoading(true)
        const token = sessionStorage.getItem('vaultToken')

        if (!token) {
            setError('Please sign in to view your vault.')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/vault/', {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                const formattedBottles = data.map(item => ({
                    id: item.id,
                    whisky_id: item.whisky_detail.id, // Needed for flight building
                    name: `${item.whisky_detail.distillery.name} - ${item.whisky_detail.name}`,
                    status: item.status,
                    fill: item.fill,
                    notes: item.notes || '',
                    rating: item.personal_rating || 0
                }))
                setVaultBottles(formattedBottles)
            } else {
                setError('Failed to load vault items.')
            }
        } catch (err) {
            setError('Database connection failed.')
        } finally {
            setLoading(false)
        }
    }

    const fetchCatalog = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/whiskies/')
            if (response.ok) {
                const data = await response.json()
                setCatalogWhiskies(data)
            }
        } catch (err) {
            console.error("Failed to fetch catalog", err)
        }
    }

    const handleAddBottle = async (e) => {
        e.preventDefault()
        if (!selectedWhiskyId) return

        const token = sessionStorage.getItem('vaultToken')
        try {
            const response = await fetch('http://127.0.0.1:8000/api/vault/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ whisky: selectedWhiskyId })
            })

            if (response.ok) {
                fetchVaultItems()
                setSelectedWhiskyId('')
            } else if (response.status === 400) {
                alert('This bottle is already in your vault!')
            }
        } catch (err) {
            console.error("Error adding bottle", err)
        }
    }

    const handleDeleteBottle = async (id) => {
        const token = sessionStorage.getItem('vaultToken')
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/vault/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (response.ok) {
                setVaultBottles(vaultBottles.filter(bottle => bottle.id !== id))
                // Also remove it from the flight builder if it was selected
                setSelectedFlightBottles(selectedFlightBottles.filter(bId => bId !== vaultBottles.find(b => b.id === id).whisky_id))
            }
        } catch (err) {
            console.error("Failed to delete", err)
        }
    }

    const handleStatusChange = async (id, newStatus) => {
        let newFill = "100%"
        const currentBottle = vaultBottles.find(b => b.id === id)
        if (currentBottle) newFill = currentBottle.fill

        if (newStatus === "Empty") newFill = "0%"
        else if (newStatus === "Vaulted") newFill = "100%"
        else if (newStatus === "Open" && (newFill === "100%" || newFill === "0%")) newFill = "95%"

        setVaultBottles(vaultBottles.map(bottle =>
            bottle.id === id ? { ...bottle, status: newStatus, fill: newFill } : bottle
        ))

        const token = sessionStorage.getItem('vaultToken')
        try {
            await fetch(`http://127.0.0.1:8000/api/vault/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus, fill: newFill })
            })
        } catch (err) {
            console.error("Failed to save status", err)
        }
    }

    const openJournal = (bottle) => {
        setJournalBottle(bottle)
        setEditNotes(bottle.notes)
        setEditRating(bottle.rating)
    }

    const handleSaveJournal = async () => {
        const token = sessionStorage.getItem('vaultToken')
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/vault/${journalBottle.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    personal_rating: editRating,
                    notes: editNotes
                })
            })

            if (response.ok) {
                setVaultBottles(vaultBottles.map(b =>
                    b.id === journalBottle.id ? { ...b, notes: editNotes, rating: editRating } : b
                ))
                setJournalBottle(null)
            }
        } catch (err) {
            console.error("Failed to save journal", err)
        }
    }

    // Flight Builder Logic
    const toggleFlightBottle = (whisky_id) => {
        if (selectedFlightBottles.includes(whisky_id)) {
            setSelectedFlightBottles(selectedFlightBottles.filter(id => id !== whisky_id))
        } else {
            if (selectedFlightBottles.length < 5) {
                setSelectedFlightBottles([...selectedFlightBottles, whisky_id])
            } else {
                alert("Maximum 5 bottles per flight!")
            }
        }
    }

    const handleCreateFlight = async (e) => {
        e.preventDefault()
        if (selectedFlightBottles.length === 0 || !flightName) return

        setIsCreatingFlight(true)
        const token = sessionStorage.getItem('vaultToken')

        try {
            const response = await fetch('http://127.0.0.1:8000/api/flights/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: flightName,
                    description: flightDescription,
                    whiskies: selectedFlightBottles
                })
            })

            if (response.ok) {
                const data = await response.json()
                setGeneratedFlightLink(`/flight/${data.id}`)
                setFlightName('')
                setFlightDescription('')
                setSelectedFlightBottles([])
            } else {
                // Catch and display the hidden backend error!
                const errorData = await response.json()
                console.error("Backend Error:", errorData)
                alert(`Django says: ${JSON.stringify(errorData)}`)
            }
        } catch (err) {
            console.error("Error creating flight", err)
            alert("Failed to connect to the server.")
        } finally {
            setIsCreatingFlight(false)
        }
    }

    return (
        <section className="relative mt-24 pt-16 pb-20 border-t border-white/10 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    Personal Cellar
                </span>
                <h2 className="text-4xl font-serif text-white mt-4 mb-3">
                    The Collector’s Vault
                </h2>
                <p className="text-slate-400 font-mono text-sm max-w-lg mx-auto mb-10">
                    Track fill levels, catalog rare acquisitions, and manage your private inventory in real time.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10 text-left">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                        <span className="text-slate-400 font-mono text-xs uppercase">Total History</span>
                        <p className="text-2xl font-serif text-white mt-1">{vaultBottles.length} <span className="text-xs text-amber-500 font-mono">/ Bottles Logged</span></p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                        <span className="text-slate-400 font-mono text-xs uppercase">Inventory Status</span>
                        <p className="text-xl font-serif text-white mt-1 flex gap-2 items-end">
                            <span>{vaultBottles.filter(b => b.status === "Open").length} <span className="text-slate-400 text-xs font-mono">Open</span></span>
                            <span>•</span>
                            <span>{vaultBottles.filter(b => b.status === "Vaulted").length} <span className="text-slate-400 text-xs font-mono">Vaulted</span></span>
                            <span>•</span>
                            <span>{vaultBottles.filter(b => b.status === "Empty").length} <span className="text-slate-400 text-xs font-mono">Empty</span></span>
                        </p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                        <span className="text-slate-400 font-mono text-xs uppercase">Vault Status</span>
                        <p className="text-2xl font-serif text-amber-400 mt-1">{isOpen ? "Unlocked" : "Locked"}</p>
                    </div>
                </div>

                <div className="relative rounded-2xl p-8 border border-white/10 bg-white/[0.02] backdrop-blur-sm max-w-2xl mx-auto">
                    {!isOpen ? (
                        <div>
                            <h3 className="text-xl font-serif text-white mb-2">Access Your Curated Cabinet</h3>
                            <p className="text-slate-400 text-xs font-mono mb-6">
                                Open your private vault session to add bottles, update statuses, and create curated tasting flights.
                            </p>
                            <button
                                onClick={() => setIsOpen(true)}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono text-xs uppercase tracking-wider font-semibold py-3 px-8 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300"
                            >
                                Unlock Private Vault
                            </button>
                        </div>
                    ) : (
                        <div className="text-left animate-fadeIn">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-serif text-white">Active Vault Inventory</h3>
                                <button
                                    onClick={() => {
                                        setIsOpen(false)
                                        setGeneratedFlightLink('') // Reset link on close
                                    }}
                                    className="text-xs font-mono text-slate-400 hover:text-amber-500"
                                >
                                    [ Lock Vault ]
                                </button>
                            </div>

                            {error && <div className="text-red-400 text-xs font-mono mb-4">{error}</div>}
                            {loading && <div className="text-amber-500 text-xs font-mono mb-4 animate-pulse">Syncing with secure server...</div>}

                            <form onSubmit={handleAddBottle} className="flex gap-2 mb-6">
                                <select
                                    value={selectedWhiskyId}
                                    onChange={(e) => setSelectedWhiskyId(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                                >
                                    <option value="" disabled className="text-slate-500">
                                        Select a bottle from the catalog...
                                    </option>
                                    {catalogWhiskies.map(whisky => (
                                        <option key={whisky.id} value={whisky.id} className="bg-slate-900 text-white">
                                            {whisky.distillery ? whisky.distillery.name : 'Unknown'} - {whisky.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="submit"
                                    className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl font-mono text-xs font-bold hover:bg-amber-600 transition-colors whitespace-nowrap"
                                >
                                    Add Bottle
                                </button>
                            </form>

                            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1 mb-8">
                                {vaultBottles.map(bottle => {
                                    const isSelectedForFlight = selectedFlightBottles.includes(bottle.whisky_id)
                                    return (
                                        <div key={bottle.id} className={`flex justify-between items-center p-3 rounded-xl bg-black/30 border transition-colors group ${isSelectedForFlight ? 'border-amber-500/50' : 'border-white/5 hover:border-white/10'}`}>

                                            <div className="flex items-center gap-3">
                                                {/* NEW: Flight Selection Checkbox */}
                                                <button
                                                    onClick={() => toggleFlightBottle(bottle.whisky_id)}
                                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelectedForFlight ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-white/20 hover:border-amber-500/50 text-transparent'}`}
                                                >
                                                    ✓
                                                </button>
                                                <div className="flex flex-col">
                                                    <span className="font-serif text-sm text-white">{bottle.name}</span>
                                                    {bottle.rating > 0 && (
                                                        <span className="text-amber-500 text-xs">
                                                            {'★'.repeat(bottle.rating)}{'☆'.repeat(5 - bottle.rating)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => openJournal(bottle)}
                                                    className="text-xs font-mono text-slate-400 hover:text-amber-500 border border-white/10 hover:border-amber-500/50 px-2 py-1 rounded transition-colors"
                                                >
                                                    Journal
                                                </button>

                                                <span className="text-xs font-mono text-slate-500 w-10 text-center">
                                                    {bottle.fill}
                                                </span>

                                                <select
                                                    value={bottle.status}
                                                    onChange={(e) => handleStatusChange(bottle.id, e.target.value)}
                                                    className={`text-xs font-mono px-2 py-1 rounded outline-none border border-transparent hover:border-white/10 cursor-pointer ${bottle.status === 'Empty' ? 'bg-red-500/10 text-red-400' :
                                                        bottle.status === 'Vaulted' ? 'bg-amber-500/10 text-amber-500' :
                                                            'bg-emerald-500/10 text-emerald-400'
                                                        }`}
                                                >
                                                    <option value="Vaulted" className="bg-slate-900 text-white">Vaulted</option>
                                                    <option value="Open" className="bg-slate-900 text-white">Open</option>
                                                    <option value="Empty" className="bg-slate-900 text-white">Empty</option>
                                                </select>

                                                <button
                                                    onClick={() => handleDeleteBottle(bottle.id)}
                                                    className="text-slate-600 hover:text-red-500 transition-colors px-1 text-lg opacity-0 group-hover:opacity-100"
                                                    title="Delete Bottle"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                                {!loading && vaultBottles.length === 0 && (
                                    <div className="text-center py-4 text-slate-500 font-mono text-xs">
                                        Your vault is completely empty.
                                    </div>
                                )}
                            </div>

                            {/* Flight Builder Panel */}
                            <div className="border-t border-white/10 pt-6 mt-6">
                                <h3 className="text-lg font-serif text-white mb-2">Curate a Tasting Flight</h3>
                                <p className="text-slate-400 text-xs font-mono mb-4">
                                    Select up to 5 bottles from your inventory above using the checkboxes, give the lineup a name, and generate a shareable digital menu.
                                </p>

                                {generatedFlightLink ? (
                                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                                        <p className="text-emerald-400 text-xs font-mono mb-2 uppercase tracking-widest">Menu Generated Successfully</p>
                                        <Link
                                            to={generatedFlightLink}
                                            target="_blank"
                                            className="text-white hover:text-amber-500 font-serif text-lg underline decoration-amber-500/50 underline-offset-4 transition-colors"
                                        >
                                            Open Digital Menu in New Tab
                                        </Link>
                                        <button
                                            onClick={() => setGeneratedFlightLink('')}
                                            className="block mx-auto mt-4 text-xs font-mono text-slate-500 hover:text-white"
                                        >
                                            Create Another Flight
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleCreateFlight} className="flex flex-col gap-3">
                                        <input
                                            type="text"
                                            placeholder="Flight Name (e.g., The Islay Exploration)"
                                            value={flightName}
                                            onChange={(e) => setFlightName(e.target.value)}
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Description or Theme (Optional)"
                                            value={flightDescription}
                                            onChange={(e) => setFlightDescription(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={selectedFlightBottles.length === 0 || isCreatingFlight}
                                            className={`w-full py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-widest transition-all ${selectedFlightBottles.length > 0
                                                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20'
                                                : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
                                                }`}
                                        >
                                            {isCreatingFlight ? 'Generating Link...' : `Generate Shareable Link (${selectedFlightBottles.length}/5 Bottles)`}
                                        </button>
                                    </form>
                                )}
                            </div>

                        </div>
                    )}
                </div>

                {/* Journal Modal Remains */}
                {journalBottle && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                        <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden text-left">
                            <h3 className="text-2xl font-serif text-white mb-1">{journalBottle.name}</h3>
                            <p className="text-amber-500 font-mono text-xs mb-6 uppercase tracking-widest">Tasting Journal</p>
                            <div className="mb-6">
                                <label className="block text-slate-400 text-xs font-mono mb-2 uppercase">Personal Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setEditRating(star)}
                                            className={`text-3xl transition-colors ${editRating >= star ? 'text-amber-500' : 'text-slate-700 hover:text-amber-500/50'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-slate-400 text-xs font-mono mb-2 uppercase">Tasting Notes</label>
                                <textarea
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder="Nose, palate, finish, and overall impressions..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 min-h-[120px] resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSaveJournal}
                                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono text-xs uppercase tracking-wider font-bold py-3 rounded-xl transition-colors"
                                >
                                    Save Journal
                                </button>
                                <button
                                    onClick={() => setJournalBottle(null)}
                                    className="flex-1 bg-transparent border border-white/10 hover:border-white/30 text-white font-mono text-xs uppercase tracking-wider font-bold py-3 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default CollectorsVault