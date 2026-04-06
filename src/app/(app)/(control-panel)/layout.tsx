"use client";

import React, { useState } from 'react'
import Sidebar from '@/components/shared/sidebar'
import PanelNavbar from '@/components/shared/panel-navbar'

const PanelLayout = ({ children }: { children: React.ReactNode }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar integration */}
            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Navbar integration */}
                <PanelNavbar
                    onMenuClick={() => setIsMobileMenuOpen(true)}
                />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default PanelLayout