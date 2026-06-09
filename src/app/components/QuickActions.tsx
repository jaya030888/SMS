"use client";

import Link from "next/link";

const QuickActions = () => {
  return (
    <section className="quick-actions">
      <h2>Quick Actions</h2>
      <div>
        <Link className="button button-primary" href="/pages/Admin/Student">
          View All Students
        </Link>
        <Link className="button button-secondary" href="/pages/Home/Addmission_Application_Form">
          New Admission
        </Link>
      </div>
    </section>
  );
};

export default QuickActions;
