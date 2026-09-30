import React from 'react';
import { PALETTE } from './palette.js';

export default function Painting({ art, colored = [], colors, preview = false, onPaint, phase = 'answer', sum, className = '', reveal = false }) {
  const interactive = typeof onPaint === 'function';
  return <svg className={`painting ${className}`} viewBox="0 0 600 510" role={interactive ? 'group' : 'img'} aria-label={`${art.title}${preview ? ', aperçu en couleurs' : ', peinture'}`}>
    <g className="scene-sparkles" fill="none" stroke="#d3c5ba" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M 55 187 h 12 m -6 -6 v 12 M 530 149 h 12 m -6 -6 v 12 M 197 54 h 9 m -4 -4 v 9 M 533 358 h 10 m -5 -5 v 10"/>
      <circle cx="68" cy="337" r="3"/><circle cx="399" cy="57" r="3"/><circle cx="209" cy="465" r="2"/>
    </g>
    {art.zones.map(zone => {
      const painted = preview || !!colors?.[zone.id] || colored.includes(zone.id);
      const allowed = interactive && phase === 'paint' && !painted && sum === zone.number;
      const activate = () => onPaint?.(zone.id);
      return <g key={zone.id} role={interactive ? 'button' : undefined} tabIndex={interactive && !painted ? 0 : undefined}
        aria-label={interactive ? `Zone ${zone.number}, ${zone.id}${painted ? ', coloriée' : ''}` : undefined}
        aria-disabled={interactive ? !allowed : undefined} data-zone={zone.id} data-number={zone.number}
        className={`paint-zone ${painted ? 'painted' : ''} ${allowed ? 'available' : ''}`}
        onClick={interactive ? activate : undefined} onKeyDown={interactive ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } } : undefined}>
        <path d={zone.d} fill={painted ? (colors?.[zone.id] || PALETTE[zone.number].hex) : '#fffdf8'} stroke={reveal&&!painted?'#eee7ee':'#786880'} strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round"/>
        {!reveal && !preview && !colors && !painted && <g className="zone-label" pointerEvents="none" aria-hidden="true"><circle cx={zone.x} cy={zone.y} r="12.5" fill="#fffdf8" fillOpacity=".9"/><text x={zone.x} y={zone.y} dominantBaseline="central" textAnchor="middle">{zone.number}</text></g>}
      </g>;
    })}
    <g fill="none" stroke={reveal&&colored.length<art.zones.length?'#d6cbd7':'#655770'} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" aria-hidden="true">{art.details.map((d,i)=><path d={d} key={i}/>)}</g>
  </svg>;
}
