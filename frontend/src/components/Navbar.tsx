'use client'
import React from 'react'
import { useAppKit } from '@reown/appkit/react';
import { useConnection } from 'wagmi';

function ConnectWallet() {
    const { open } = useAppKit();
    const { isConnected } = useConnection();
    return (
        <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => {
                if (isConnected) {
                    open({ view: 'Account' });
                } else {
                    open({ view: 'Connect' })
                }
            }}
        >
            Connect Wallet
        </button>
    )
}

export default function Navbar() {
    const { isConnected, chain } = useConnection();
    return (
        <header className="flex items-center justify-between p-4">
            <div>
                <h1 className="text-4xl font-bold tracking-tighter text-white">
                    PARX<span className="text-blue-500">.</span>
                </h1>
                <p className="text-gray-400 mt-2">Parameterized Action Runner for EVM</p>
            </div>

            <div className="flex items-center gap-4">
                <ConnectWallet />
                {isConnected && (
                    <div className="text-xs bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                        Network: <span className="text-blue-400 font-mono">{chain?.name}</span>
                    </div>
                )}
            </div>
        </header>
    )
}
