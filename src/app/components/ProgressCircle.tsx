type Props = {
  percentage: number
  label: string
}

export default function ProgressCircle({
  percentage,
  label,
}: Props) {

  const degree = (percentage / 100) * 360

  return (
    <div
      className="relative flex items-center justify-center w-52 h-52 rounded-full"
      style={{
        background: `conic-gradient(var(--primary) ${degree}deg, var(--accent-soft) ${degree}deg)`,
      }}
    >
      {/* Inner Circle */}
      <div className="absolute w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold" style={{ color: "var(--primary-dark)" }}>
          {percentage}%
        </h1>

        <p className="text-xl" style={{ color: "var(--muted)" }}>
          {label}
        </p>
      </div>
    </div>
  )
}
