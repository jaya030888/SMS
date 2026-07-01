import Login_Card from '@/src/app/components/Login_Card'

export default function Page() {
  const path = "/pages/Admin/DashBoard"

  return (
    <Login_Card
      image="/file.svg"
      alter="Admin login icon"
      role="Admin"
      para="Sign in to access the admin dashboard"
      label="Email Address"
      type="email"
      placeholder="admin@institute.edu"
      dashboardPath={path}
    />
  )
}
