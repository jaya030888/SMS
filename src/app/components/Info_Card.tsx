import Image from "next/image";

type InfoCardProps = {
  image: string;
  alter: string;
  feild: string;
  entry: string;
  className?: string;
};

const Info_Card = (props: InfoCardProps) => {
  return (
    <div className={props.className ?? "info-card"}>
      <div className="info-icon">
        <Image src={props.image} alt={props.alter} height={18} width={18} />
      </div>

      <div>
        <h2>{props.feild}</h2>
        <p>{props.entry}</p>
      </div>
    </div>
  );
};

export default Info_Card;
