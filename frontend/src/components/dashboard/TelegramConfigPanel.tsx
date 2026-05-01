"use client";

import { useState } from "react";
import { setTelegramWebhook } from "@/lib/api-client";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function TelegramConfigPanel() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSetWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await setTelegramWebhook(webhookUrl);
      if (res.ok) {
        toast.success("Webhook configured successfully!");
      } else {
        toast.error("Failed to set webhook. Check your backend logs.");
      }
    } catch (e: any) {
      toast.error(e.message || "Error setting webhook");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-[#0a0a0a] border-zinc-800 text-zinc-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0088cc]">send</span>
          Telegram Bot Configuration
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Link your distributor tenant to a live Telegram bot. Once the webhook is active, your retailers can place orders seamlessly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">Webhook URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://your-ngrok-url.app/api/v1/webhook/telegram/"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleSetWebhook}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Linking..." : "Set Webhook"}
            </button>
          </div>
        </div>

        <div className="rounded-md bg-zinc-900 p-4 border border-zinc-800">
          <h4 className="text-sm font-medium text-zinc-200 mb-2">Bot Status</h4>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            <span>Bot token configured globally in backend (.env)</span>
          </div>
          <div className="mt-3 text-xs text-zinc-500 max-w-lg">
            Ensure your webhook URL points directly to the `/api/v1/webhook/telegram/` route. All incoming messages from your mapped retailers will route to your dashboard automatically.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
