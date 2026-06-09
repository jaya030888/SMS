import Image from "next/image";

type CardProps = {
  label: string;
  entry: string;
  image: string;
  alter: string;
};

const Card = ({ label, entry, image, alter }: CardProps) => {
  return (
    <div className="admin-stat">
      <div>
        <p>{label}</p>
        <strong>{entry}</strong>
      </div>

      <Image src={image} alt={alter} width={20} height={20} />
    </div>
  );
};

export default Card;
