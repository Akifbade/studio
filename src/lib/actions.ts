"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1, "Tracking number is required."),
});

export async function trackShipment(
  prevState: { error: string } | null,
  formData: FormData
) {
  const parsed = schema.safeParse({
    token: formData.get("token"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const token = parsed.data.token;
  redirect(`/track/${token}`);
}
