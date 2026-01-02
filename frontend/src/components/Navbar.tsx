import { useAccount } from 'wagmi';
import React from 'react'

export default function Navbar() {
    const { isConnected, chain } = useAccount();
    return (
        <header className="...">
            {/* PARX Logo */}
            <div className="flex items-center gap-4">
                <appkit-button />
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Connect Wallet</button>
                {isConnected && (
                    <div className="text-xs bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                        Network: <span className="text-blue-400 font-mono">{chain?.name}</span>
                    </div>
                )}
            </div>
        </header>
    )
}
