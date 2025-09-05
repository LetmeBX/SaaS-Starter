import { redirect } from "next/navigation";

export default function InvoiceReviewRedirect() {
  redirect("/invoices");
}
