import Image from "next/image";
import Link from "next/link";

type SidebarCardProps = {
  image: string;
  alter: string;
  name: string;
  href: string;
  active?: boolean;
};

const Sidebar_Card = (props: SidebarCardProps) => {
  return (
    <Link className={`sidebar-link ${props.active ? "active" : ""}`} href={props.href}>
      <Image src={props.image} alt={props.alter} width={18} height={18} />
      <p>{props.name}</p>
    </Link>
  );
};

export default Sidebar_Card;
