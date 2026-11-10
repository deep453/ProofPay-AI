
const PAYPAL_BASE_URL =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are missing from environment variables");
  }

  const credentials = Buffer
    .from(`${clientId}:${clientSecret}`)
    .toString("base64");

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("PayPal OAuth HTTP status:", response.status);
    throw new Error("Unable to authenticate with PayPal");
  }

  return data.access_token;
}

async function createInvoice({ recipientEmail, title, description, amount, currency }) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/invoicing/invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      detail: {
        currency_code: currency,
        invoice_number: `PP-${Date.now()}`,
        reference: title,
        note: description,
        payment_term: {
          term_type: "NET_10"
        }
      },
      invoicer: {
  email_address: process.env.PAYPAL_INVOICER_EMAIL,
  name: {
    given_name: process.env.PAYPAL_INVOICER_NAME || "ProofPay Agent"
  }
},
      primary_recipients: [
        {
          billing_info: {
            email_address: recipientEmail
          }
        }
      ],
      items: [
        {
          name: title,
          description,
          quantity: "1",
          unit_amount: {
            currency_code: currency,
            value: Number(amount).toFixed(2)
          },
          unit_of_measure: "QUANTITY"
        }
      ]
    })
  });

  const data = await response.json();

    if (!response.ok) {
    console.error("PayPal invoice creation failed:", {
      status: response.status,
      name: data.name,
      message: data.message,
      details: data.details,
      debug_id: data.debug_id
    });

    throw new Error("Unable to create PayPal invoice");
  }
  return data;
}

async function sendInvoice(invoiceId) {
  if (!invoiceId) {
    throw new Error("PayPal invoice ID is required");
  }

  const accessToken = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/invoicing/invoices/${encodeURIComponent(invoiceId)}/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        send_to_recipient: true,
        send_to_invoicer: false
      })
    }
  );

  if (!response.ok) {
    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    console.error("PayPal invoice send failed:", {
      status: response.status,
      name: data.name,
      message: data.message,
      details: data.details,
      debug_id: data.debug_id
    });

    throw new Error("Unable to send PayPal invoice");
  }

  return {
    invoiceId,
    status: "SENT"
  };
}


async function verifyWebhookSignature(headers, webhookEvent) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!webhookId) {
    throw new Error("PAYPAL_WEBHOOK_ID is not configured");
  }

  const requiredHeaders = [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time"
  ];

  for (const header of requiredHeaders) {
    if (!headers[header]) {
      return false;
    }
  }

  const accessToken = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: webhookId,
        webhook_event: webhookEvent
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("PayPal webhook verification failed:", {
      status: response.status,
      name: data.name,
      message: data.message,
      debug_id: data.debug_id
    });

    throw new Error("Unable to verify PayPal webhook signature");
  }

  if (data.verification_status !== "SUCCESS") {
  console.error("PayPal webhook verification returned:", {
    httpStatus: response.status,
    verificationStatus: data.verification_status,
    webhookIdConfigured: Boolean(webhookId)
  });
}

return data.verification_status === "SUCCESS";
}



async function getInvoiceDetails(invoiceId) {
  if (!invoiceId) {
    throw new Error("PayPal invoice ID is required");
  }

  const accessToken = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/invoicing/invoices/${encodeURIComponent(invoiceId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("PayPal invoice details request failed:", {
      status: response.status,
      name: data.name,
      message: data.message,
      debug_id: data.debug_id
    });

    throw new Error("Unable to retrieve PayPal invoice details");
  }

  return {
    id: data.id,
    status: data.status,
    invoiceUrl: data.detail?.metadata?.recipient_view_url || null
  };
}
module.exports = {
  getAccessToken,
  createInvoice,
  sendInvoice,
  getInvoiceDetails,
  verifyWebhookSignature
};
