import Info2liner_Card from "@/src/app/components/Info2liner_Card";
import Month_Card from "@/src/app/components/Month_Card";
import ProgressCircle from "@/src/app/components/ProgressCircle";
import StuNav from "@/src/app/components/StuNav";
import { Sparkles } from "lucide-react";

const Page = () => {
  return (
    <>
      <StuNav name="My Attendance" />

      <main className="dashboard-page">
        <section className="dashboard-grid two">
          <div className="panel attendance-summary">
            <h2>Overall Attendance</h2>
            <ProgressCircle percentage={92} label="Safe" />
            <div className="mini-stats">
              <Info2liner_Card label="24" entry="Present" />
              <Info2liner_Card label="2" entry="Absent" />
            </div>
          </div>

          <div className="panel notice-panel">
            <div className="panel-heading">
              <Sparkles className="text-primary" size={18} />
              <h2>You are on track</h2>
            </div>
            <p>
              Your attendance is 92%, safely above the 75% minimum. Keep attending
              consistently to maintain exam eligibility.
            </p>
            <div className="mini-stats">
              <Info2liner_Card label="26" entry="Total Days" />
              <Info2liner_Card label="0" entry="Days Buffer" />
              <Info2liner_Card label="Yes" entry="Exam Eligible" />
            </div>
          </div>
        </section>

        <Month_Card month="April" year="2026" />
        <Month_Card month="May" year="2026" />
      </main>
    </>
  );
};

export default Page;
