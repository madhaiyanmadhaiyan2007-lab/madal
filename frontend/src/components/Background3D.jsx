import React from 'react';

/**
 * MockMate AI - Apple Cupertino Ambient Lighting Canvas
 * Replaces intrusive 3D wireframe meshes with serene, high-contrast Cupertino ambient glows:
 * - Ultra-soft luminous Apple Blue (#0071E3) & Electric Purple (#7B61FF) ambient lights
 * - Subtle geometric concentric contour rings with 0.04 opacity
 * - Preserves 100% typography contrast and optical clarity
 */
export default function Background3D() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#FCF8FB]"
    >
      {/* Top Primary Cupertino Luminous Light Halo */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[840px] h-[460px] rounded-full blur-3xl opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(0, 113, 227, 0.18) 0%, rgba(123, 97, 255, 0.10) 45%, transparent 75%)',
        }}
      />

      {/* Top-Right Secondary Atmospheric Indigo Glow */}
      <div
        className="absolute top-1/4 -right-28 w-[520px] h-[520px] rounded-full blur-3xl opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(123, 97, 255, 0.14) 0%, rgba(52, 199, 89, 0.06) 50%, transparent 75%)',
        }}
      />

      {/* Bottom-Left Emerald Accent Glow */}
      <div
        className="absolute -bottom-20 -left-28 w-[560px] h-[560px] rounded-full blur-3xl opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(52, 199, 89, 0.12) 0%, rgba(0, 113, 227, 0.06) 50%, transparent 75%)',
        }}
      />

      {/* Delicate Architectural Concentric Guide Rings (Subtle Apple Hardware Aesthetic) */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] opacity-[0.035] pointer-events-none"
        viewBox="0 0 1400 1400"
        fill="none"
      >
        <circle cx="700" cy="700" r="300" stroke="#0071E3" strokeWidth="1" strokeDasharray="6 6" />
        <circle cx="700" cy="700" r="500" stroke="#7B61FF" strokeWidth="1" />
        <circle cx="700" cy="700" r="680" stroke="#000000" strokeWidth="1" strokeDasharray="3 9" />
      </svg>
    </div>
  );
}
