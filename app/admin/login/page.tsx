import { Metadata } from "next";
import LoginForm from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false,
  },
};

const AdminLogin = () => {
  return (
    <section id="login">
      <div className="login-container">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Admin Login
          </h2>
          <p className="mt-1 text-center text-sm">
            Sign in to access the admin dashboard
          </p>
        </div>
        <LoginForm />

        <div className="text-center">
          <p className="text-xs">
            Access restricted to authorized administrators only
          </p>
        </div>
      </div>
    </section>
  );
};

export default AdminLogin;
