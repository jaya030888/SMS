import { Zap, Cog, Monitor, GraduationCap } from "lucide-react";
import Info_sameliner from "./Info_sameliner";

type CourseWiseCardProps = {
  image: string; // Keep for compatibility
  alter: string;
  course: string;
  totalStudents: string;
  feesPaid: string;
  feesPending: string;
};

const Course_wise_Card = ({
  alter,
  course,
  totalStudents,
  feesPaid,
  feesPending,
}: CourseWiseCardProps) => {
  const getIcon = (courseName: string) => {
    const c = courseName.toLowerCase();
    if (c.includes("electrician")) return <Zap size={20} className="text-primary" />;
    if (c.includes("fitter")) return <Cog size={20} className="text-primary" />;
    if (c.includes("copa")) return <Monitor size={20} className="text-primary" />;
    return <GraduationCap size={20} className="text-primary" />;
  };

  return (
    <div className="course-summary">
      <div className="panel-heading">
        {getIcon(course)}
        <h2>{course}</h2>
      </div>

      <Info_sameliner label="Total Students" entry={totalStudents} />
      <Info_sameliner label="Fees Paid" entry={feesPaid} entryColor="var(--success)" />
      <Info_sameliner label="Fees Pending" entry={feesPending} entryColor="var(--warning)" />

      {/* View Details button removed */}
    </div>
  );
};

export default Course_wise_Card;
