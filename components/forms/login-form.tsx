"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = React.useState("");
  const [isVisible, setIsVisible] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.refresh();
        router.push("/admin/dashboard");
      } else {
        setError(result.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          {...register("username")}
          placeholder="Username"
          disabled={isSubmitting}
        />
        {errors.username && <p>{errors.username.message}</p>}
      </div>

      <div className="relative">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type={isVisible ? "text" : "password"}
          {...register("password")}
          placeholder="Password"
          disabled={isSubmitting}
        />
        {errors.password && <p>{errors.password.message}</p>}
        <button
          type="button"
          className="absolute right-3 top-2/3 -translate-y-1/2 text-sm text-gray-300"
          onClick={() => setIsVisible((prev) => !prev)}
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>

      <button className="button-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Log in"}
      </button>
      {error && <p>{error}</p>}
    </form>
  );
};

export default LoginForm;
