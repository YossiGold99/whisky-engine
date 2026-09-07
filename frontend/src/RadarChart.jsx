import React from 'react';

const RadarChart = ({ smoke, wood, fruit, brine }) => {
    // SVG viewBox is 100x100. Center is at (50,50). 
    // Each axis goes outward by a maximum of 40 units (10 scale * 4).

    const cx = 50;
    const cy = 50;
    const multiplier = 4;

    // Calculate coordinates for the 4 points
    const points = `
    ${cx},${cy - (smoke * multiplier)} 
    ${cx + (wood * multiplier)},${cy} 
    ${cx},${cy + (fruit * multiplier)} 
    ${cx - (brine * multiplier)},${cy}
  `;

    return (
        <div className="relative w-24 h-24 mx-auto mt-4">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                {/* Background Grid (The Web) */}
                <polygon points="50,10 90,50 50,90 10,50" className="fill-none stroke-white/10 stroke-1" />
                <polygon points="50,30 70,50 50,70 30,50" className="fill-none stroke-white/10 stroke-1" />

                {/* Crosshairs */}
                <line x1="50" y1="10" x2="50" y2="90" className="stroke-white/10 stroke-1" />
                <line x1="10" y1="50" x2="90" y2="50" className="stroke-white/10 stroke-1" />

                {/* The Data Polygon (The Flavor Profile) */}
                <polygon
                    points={points}
                    className="fill-amber-500/30 stroke-amber-500 stroke-2"
                    style={{ transition: 'all 0.5s ease-out' }}
                />

                {/* Data Points (Glowing Dots) */}
                <circle cx={cx} cy={cy - (smoke * multiplier)} r="2" className="fill-amber-400" />
                <circle cx={cx + (wood * multiplier)} cy={cy} r="2" className="fill-amber-400" />
                <circle cx={cx} cy={cy + (fruit * multiplier)} r="2" className="fill-amber-400" />
                <circle cx={cx - (brine * multiplier)} cy={cy} r="2" className="fill-amber-400" />
            </svg>

            {/* Axis Labels */}
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-400 uppercase">Smoke</span>
            <span className="absolute top-1/2 -right-6 -translate-y-1/2 text-[9px] font-mono text-slate-400 uppercase">Wood</span>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-400 uppercase">Fruit</span>
            <span className="absolute top-1/2 -left-6 -translate-y-1/2 text-[9px] font-mono text-slate-400 uppercase">Brine</span>
        </div>
    );
};

export default RadarChart;