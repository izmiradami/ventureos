"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Twitter, Mail, Megaphone, Rocket } from "lucide-react";
import { Company } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function MarketingEngine({ company }: { company: Company }) {
  const m = company.marketing;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Marketing engine
        </h1>
        <p className="mt-1 text-muted-foreground">
          Launch-ready copy for every channel. Copy, tweak, ship.
        </p>
      </div>

      <Tabs defaultValue="tweet">
        <TabsList className="flex-wrap">
          <TabsTrigger value="tweet">
            <Twitter className="size-4" /> X / Twitter
          </TabsTrigger>
          <TabsTrigger value="ph">
            <Rocket className="size-4" /> Product Hunt
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="size-4" /> Email
          </TabsTrigger>
          <TabsTrigger value="ads">
            <Megaphone className="size-4" /> Ads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tweet">
          <CopyBlock label="Launch tweet" text={m.tweet} />
        </TabsContent>

        <TabsContent value="ph">
          <div className="space-y-4">
            <CopyBlock label="Tagline" text={m.productHunt.tagline} />
            <CopyBlock label="Launch post" text={m.productHunt.body} />
          </div>
        </TabsContent>

        <TabsContent value="email">
          <div className="space-y-4">
            <CopyBlock label="Subject line" text={m.email.subject} />
            <CopyBlock label="Email body" text={m.email.body} />
          </div>
        </TabsContent>

        <TabsContent value="ads">
          <div className="grid gap-4 md:grid-cols-2">
            {m.ads.map((ad) => (
              <div key={ad.platform} className="rounded-2xl glass p-5">
                <Badge variant="cyan" className="mb-3">
                  {ad.platform}
                </Badge>
                <p className="font-display font-medium">{ad.headline}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{ad.body}</p>
                <CopyButton text={`${ad.headline}\n${ad.body}`} className="mt-4" />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl glass p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <CopyButton text={text} />
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
        {text}
      </p>
    </motion.div>
  );
}

function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };
  return (
    <Button variant="ghost" size="sm" onClick={copy} className={className}>
      {copied ? (
        <>
          <Check className="size-3.5 text-emerald" /> Copied
        </>
      ) : (
        <>
          <Copy className="size-3.5" /> Copy
        </>
      )}
    </Button>
  );
}
