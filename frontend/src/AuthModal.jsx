import { useState } from 'react'

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMsg('') // Clear previous errors

        if (isLogin) {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                })

                const data = await response.json()

                if (response.ok) {
                    // Success! Save the token to local storage
                    localStorage.setItem('vaultToken', data.token)
                    console.log("Secure token received:", data.token)

                    // Tell the main App that we are logged in!
                    if (onClose) onClose()
                    if (onLoginSuccess) onLoginSuccess()

                    // Clear form
                    setUsername('')
                    setPassword('')
                } else {
                    // Django rejected the credentials
                    setErrorMsg('Invalid username or password.')
                }
            } catch (err) {
                setErrorMsg('Database connection failed. Is the server running?')
            }
        } else {
            // The Registration Flow
            try {
                const response = await fetch('http://127.0.0.1:8000/api/register/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                })

                const data = await response.json()

                if (response.ok) {
                    // Success! User is created and we got a token back instantly
                    localStorage.setItem('vaultToken', data.token)
                    console.log("New account created! Token:", data.token)

                    if (onClose) onClose()
                    if (onLoginSuccess) onLoginSuccess()

                    setUsername('')
                    setPassword('')
                } else {
                    // Django returns specific errors (e.g., username already exists)
                    if (data.username) {
                        setErrorMsg(data.username[0])
                    } else {
                        setErrorMsg('Registration failed. Please try a different username.')
                    }
                }
            } catch (err) {
                setErrorMsg('Database connection failed. Is the server running?')
            }
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden">
                {/* Glow Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-amber-500/20 blur-[50px] pointer-events-none" />

                <button
                    onClick={() => {
                        setErrorMsg('')
                        onClose()
                    }}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    ✕
                </button>

                <h2 className="text-3xl font-serif text-white mb-2 relative z-10">
                    {isLogin ? 'Welcome Back' : 'Join the Vault'}
                </h2>
                <p className="text-slate-400 font-mono text-xs mb-6 relative z-10">
                    {isLogin ? 'Access your personal cellar.' : 'Create your secure profile.'}
                </p>

                {/* Error Message Display */}
                {errorMsg && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono relative z-10">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-mono text-amber-500 mb-1 uppercase tracking-wider">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                            placeholder="e.g. peatmonster"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-amber-500 mb-1 uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-4 bg-amber-500 text-slate-950 font-bold font-mono uppercase tracking-wider py-3 rounded-xl hover:bg-amber-600 transition-colors"
                    >
                        {isLogin ? 'Access Vault' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center relative z-10">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setErrorMsg('')
                        }}
                        className="text-slate-400 text-xs font-mono hover:text-amber-500 transition-colors"
                    >
                        {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AuthModal