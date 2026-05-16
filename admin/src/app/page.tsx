import { redirect } from "next/navigation";

// Root page — always redirect to login
export default function HomePage() {
  redirect("/login");
}
