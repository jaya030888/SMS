import React from "react";
import { LucideIcon } from "lucide-react";

type InfoCardProps = {
  icon: LucideIcon;
  feild: string;
  entry: string;
  className?: string;
};

const Info_Card = ({ icon: Icon, feild, entry, className }: InfoCardProps) => {
  return (
    <div className={className ?? "info-card"}>
      <div className="info-icon" style={{ display: "grid", placeItems: "center" }}>
        <Icon size={18} className="text-primary" />
      </div>

      <div>
        <h2>{feild}</h2>
        <p>{entry}</p>
      </div>
    </div>
  );
};

export default Info_Card;
