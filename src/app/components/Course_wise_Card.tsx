import Image from "next/image";
import Info_sameliner from "./Info_sameliner";

type CourseWiseCardProps = {
  image: string;
  alter: string;
  course: string;
  totalStudents: string;
  feesPaid: string;
  feesPending: string;
};

const Course_wise_Card = ({
  image,
  alter,
  course,
  totalStudents,
  feesPaid,
  feesPending,
}: CourseWiseCardProps) => {
  return (
    <div className="course-summary">
      <div className="panel-heading">
        <Image src={image} alt={alter} width={20} height={20} />
        <h2>{course}</h2>
      </div>

      <Info_sameliner label="Total Students" entry={totalStudents} />
      <Info_sameliner label="Fees Paid" entry={feesPaid} entryColor="var(--success)" />
      <Info_sameliner label="Fees Pending" entry={feesPending} entryColor="var(--warning)" />

      <button className="button button-secondary">View Details</button>
    </div>
  );
};

export default Course_wise_Card;
