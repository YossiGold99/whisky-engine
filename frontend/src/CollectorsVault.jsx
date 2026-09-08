import { useState, useEffect } from 'react'

const CollectorsVault = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [vaultBottles, setVaultBottles] = useState([])
    const [catalogWhiskies, setCatalogWhiskies] = useState([]) //Stores available bottles for the dropdown
    const [selectedWhiskyId, setSelectedWhiskyId] = useState('') //Tracks what you select in the dropdown
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Fetch from Django when vault is unlocked
    useEffect(() => {
        if (isOpen) {
            fetchVaultItems()
            fetchCatalog() // Load the dropdown options
        }
    }, [isOpen])

    const fetchVaultItems = async () => {
        setLoading(true)
        const token = localStorage.getItem('vaultToken')

        if (!token) {
            setError('Please sign in to view your vault.')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/vault/', {
                headers: { 'Authorization': `Token ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                const formattedBottles = data.map(item => ({
                    id: item.id,
                    name: `${item.whisky_detail.distillery.name} - ${item.whisky_detail.name}`,
                    status: "Vaulted",
                    fill: "100%"
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

    //Fetch all whiskies so the dropdown has options
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

    // Now posts the selected dropdown bottle to Django
    const handleAddBottle = async (e) => {
        e.preventDefault()

        if (!selectedWhiskyId) return // Do nothing if no bottle is selected

        const token = localStorage.getItem('vaultToken')
        try {
            const response = await fetch('http://127.0.0.1:8000/api/vault/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({ whisky: selectedWhiskyId })
            })

            if (response.ok) {
                // Success! Re-fetch the vault to show the new bottle
                fetchVaultItems()
                setSelectedWhiskyId('') // Reset the dropdown back to default
            } else if (response.status === 400) {
                alert('This bottle is already in your vault!')
            } else {
                alert('Failed to add bottle. Make sure you are logged in.')
            }
        } catch (err) {
            console.error("Error adding bottle", err)
        }
    }

    // Deletes from the real Django database
    const handleDeleteBottle = async (id) => {
        const token = localStorage.getItem('vaultToken')
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/vault/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Token ${token}` }
            })

            if (response.ok) {
                setVaultBottles(vaultBottles.filter(bottle => bottle.id !== id))
            }
        } catch (err) {
            console.error("Failed to delete", err)
        }
    }

    // Function to change bottle status locally
    const handleStatusChange = (id, newStatus) => {
        setVaultBottles(vaultBottles.map(bottle => {
            if (bottle.id === id) {
                let newFill = bottle.fill
                if (newStatus === "Empty") newFill = "0%"
                else if (newStatus === "Vaulted") newFill = "100%"
                else if (newStatus === "Open" && (bottle.fill === "100%" || bottle.fill === "0%")) newFill = "95%"

                return { ...bottle, status: newStatus, fill: newFill }
            }
            return bottle
        }))
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

                <div className="relative rounded-2xl p-8 border border-white/10 bg-white/[0.02] backdrop-blur-sm max-w-xl mx-auto">
                    {!isOpen ? (
                        <div>
                            <h3 className="text-xl font-serif text-white mb-2">Access Your Curated Cabinet</h3>
                            <p className="text-slate-400 text-xs font-mono mb-6">
                                Open your private vault session to add bottles, update statuses, and clear empty inventory.
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
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs font-mono text-slate-400 hover:text-amber-500"
                                >
                                    [ Lock Vault ]
                                </button>
                            </div>

                            {error && <div className="text-red-400 text-xs font-mono mb-4">{error}</div>}
                            {loading && <div className="text-amber-500 text-xs font-mono mb-4 animate-pulse">Syncing with secure server...</div>}

                            {/* UPDATED: Database-connected Dropdown Form */}
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

                            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                                {vaultBottles.map(bottle => (
                                    <div key={bottle.id} className="flex justify-between items-center p-3 rounded-xl bg-black/30 border border-white/5 group hover:border-white/10 transition-colors">
                                        <span className="font-serif text-sm text-white">{bottle.name}</span>

                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-slate-500">
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
                                ))}
                                {!loading && vaultBottles.length === 0 && (
                                    <div className="text-center py-4 text-slate-500 font-mono text-xs">
                                        Your vault is completely empty.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default CollectorsVault