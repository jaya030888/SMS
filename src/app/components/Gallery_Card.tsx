import React from 'react'
import { LucideIcon } from 'lucide-react'

type GalleryCardProps = {
  icon: LucideIcon;
  alter: string;
  text: string;
}

const Gallery_card = ({ icon: Icon, alter, text }: GalleryCardProps) => {
  return (
    <article className="gallery-card card">
      <div className="gallery-icon" style={{
        borderRadius: "8px",
        background: "var(--surface-soft)",
        padding: "0.55rem",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "48px",
        height: "48px",
        color: "var(--primary)",
        margin: "0 auto"
      }}>
        <Icon size={28} />
      </div>
      <span>
        {text}
      </span>
    </article>
  )
}

export default Gallery_card
