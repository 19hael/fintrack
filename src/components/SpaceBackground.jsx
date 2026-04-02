export default function SpaceBackground() {
  return (
    <>
      {/* Deep space background */}
      <div className="space-bg" />

      {/* Grid overlay */}
      <div className="grid-pattern" />

      {/* Nebula glow effects */}
      <div className="nebula-glow nebula-1" />
      <div className="nebula-glow nebula-2" />
      <div className="nebula-glow nebula-3" />

      {/* Planets */}
      <div className="planet planet-large" />
      <div className="planet planet-medium" />
      <div className="planet planet-small" />
      <div className="planet planet-tiny" />

      {/* Decorative star */}
      <svg className="star-decoration" viewBox="0 0 40 40" fill="none">
        <path d="M20 0L23 17L40 20L23 23L20 40L17 23L0 20L17 17Z" fill="rgba(200,220,255,0.5)" />
      </svg>
    </>
  )
}
