import { isEmail } from "@/utils";

/** Signup sources the footer/home/popup forms may tag signups with. */
const VALID_SOURCES = ["footer", "home", "popup"] as const;

/** Latest Klaviyo API revision the profile-subscription endpoint accepts. */
const KLAVIYO_REVISION = "2026-10-15";
const KLAVIYO_SUBSCRIBE_URL = "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/";

type NewsletterRequest = {
  email?: unknown;
  consent?: unknown;
  source?: unknown;
};

/**
 * Newsletter signup (spec §6) — `POST /api/newsletter`.
 *
 * Validates email + explicit consent server-side, then subscribes the profile
 * to the marketing list through Klaviyo's Subscribe Profiles endpoint using
 * KLAVIYO_PRIVATE_KEY + KLAVIYO_LIST_ID (both read server-side only — never
 * exposed to the browser). When the keys are missing (local dev / previews)
 * the route responds with `devMode: true` and nothing is sent.
 */
export async function POST(request: Request) {
  let body: NewsletterRequest;
  try {
    body = (await request.json()) as NewsletterRequest;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const consent = body.consent === true;
  const source = typeof body.source === "string" ? body.source : "";

  if (!isEmail(email)) {
    return Response.json(
      { ok: false, error: "A valid email address is required." },
      { status: 400 },
    );
  }
  if (!consent) {
    return Response.json({ ok: false, error: "Explicit consent is required." }, { status: 400 });
  }
  if (!(VALID_SOURCES as readonly string[]).includes(source)) {
    return Response.json({ ok: false, error: "Unknown signup source." }, { status: 400 });
  }

  const privateKey = process.env.KLAVIYO_PRIVATE_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;
  if (!privateKey || !listId) {
    return Response.json({ ok: true, devMode: true });
  }

  try {
    const response = await fetch(KLAVIYO_SUBSCRIBE_URL, {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${privateKey}`,
        "content-type": "application/vnd.api+json",
        accept: "application/vnd.api+json",
        revision: KLAVIYO_REVISION,
      },
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            custom_source: source,
            profiles: {
              data: [
                {
                  type: "profile",
                  attributes: {
                    email,
                    subscriptions: {
                      email: { marketing: { consent: "SUBSCRIBED" } },
                    },
                  },
                },
              ],
            },
          },
          relationships: {
            list: { data: { type: "list", id: listId } },
          },
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error(`Klaviyo subscribe failed: ${response.status}`);
      return Response.json(
        { ok: false, error: "The list service rejected the signup." },
        { status: 502 },
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Klaviyo subscribe errored:", error);
    return Response.json({ ok: false, error: "The list service is unreachable." }, { status: 502 });
  }
}
