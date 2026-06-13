import React from 'react'
import { LucideIcon } from 'lucide-react'

type FeaturesCardProps = {
  icon: LucideIcon;
  feature: string;
  para: string;
}

const Features_Card = ({ icon: Icon, feature, para }: FeaturesCardProps) => {
  return (
    <article className="feature-card card">
      <div className="feature-icon" style={{
        borderRadius: "8px",
        background: "var(--surface-soft)",
        padding: "0.55rem",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "48px",
        height: "48px",
        color: "var(--primary)",
        marginBottom: "1rem"
      }}>
        <Icon size={28} />
      </div>

      <h2>{feature}</h2>
      <p>{para}</p>
    </article>
  )
}

export default Features_Card
