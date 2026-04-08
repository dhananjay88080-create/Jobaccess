"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [alertPreference, setAlertPreference] = useState<"all" | "government" | "private">("all");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/alerts/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, alertPreference })
    });

    setLoading(false);
    if (!response.ok) {
      setMessage("Subscription failed. Please try again.");
      return;
    }

    setEmail("");
    setMessage(
      alertPreference === "all"
        ? "Subscribed for all job alerts."
        : alertPreference === "government"
          ? "Subscribed for govt job alerts."
          : "Subscribed for private job alerts."
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={alertPreference}
          onChange={(event) => setAlertPreference(event.target.value as "all" | "government" | "private")}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          aria-label="Alert type"
        >
          <option value="all">All Job Alerts</option>
          <option value="government">Govt Job Alerts</option>
          <option value="private">Private Job Alerts</option>
        </select>
        <Input
          type="email"
          required
          placeholder="Enter email for job alerts"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Subscribe"}
        </Button>
      </div>
      {message ? <p className="w-full text-xs text-muted-foreground">{message}</p> : null}
    </form>
  );
}
