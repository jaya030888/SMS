import React from "react";
import { LucideIcon } from "lucide-react";

type ContactCardProps = {
  icon: LucideIcon;
  name: string;
  l1: string;
  l2: string;
}

const Contact_Card = ({ icon: Icon, name, l1, l2 }: ContactCardProps) => {
  return (
    <div className="contact-card">
      <div className="contact-icon" style={{ display: "grid", placeItems: "center" }}>
        <Icon size={20} className="text-primary" />
      </div>

      <div>
        <h3>{name}</h3>
        <p>{l1}</p>
        <p>{l2}</p>
      </div>
    </div>
  )
}

export default Contact_Card
