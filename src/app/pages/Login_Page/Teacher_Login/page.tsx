// src/app/pages/Login_Page/Teacher_Login/page.tsx
import Login_Card from '@/src/app/components/Login_Card';

export default function Page() {
  const path = "/pages/Teacher/DashBoard";

  return (
    <Login_Card
      image="/file.svg"
      alter="Teacher login icon"
      role="Teacher"
      para="Sign in to access your assigned trade instructor profile and departmental schedule"
      label="Teacher Email"
      type="email"
      placeholder="teacher@mgiti.edu"
      dashboardPath={path}
    />
  );
}
