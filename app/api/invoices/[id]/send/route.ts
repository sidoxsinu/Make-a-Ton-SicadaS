import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/mail";
import { formatMoney } from "@/components/ui/Money";
import { formatDate } from "@/components/ui/DateText";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    // Verify team permission
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));

    // Fetch invoice with customer and lines
    const { data: invoice, error: invError } = await supabase
      .from("invoices")
      .select("*, customer:customers(*), lines:invoice_lines(*)")
      .eq("id", id)
      .single();

    if (invError || !invoice) {
      return NextResponse.json(
        { ok: false, message: "Invoice not found" },
        { status: 404 }
      );
    }

    // If Draft, confirm first only if confirm=true was passed
    if (invoice.status === "draft") {
      if (body.confirm) {
        await supabase
          .from("invoices")
          .update({ status: "confirmed" })
          .eq("id", id);
      } else {
        return NextResponse.json(
          {
            ok: false,
            message: "Cannot send a draft invoice without confirming it first.",
          },
          { status: 400 }
        );
      }
    }

    const recipientEmail = invoice.customer?.email;
    if (!recipientEmail) {
      return NextResponse.json(
        { ok: false, message: "Customer email is missing" },
        { status: 400 }
      );
    }

    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/portal/invoices/${invoice.id}`;

    // Build email HTML safely
    const lineRowsHtml = (invoice.lines || [])
      .map(
        (l: any) => `
        <tr style="border-bottom: 1px solid #CBC4B4;">
          <td style="padding: 8px;">${String(l.description || "").replace(/</g, "&lt;")}</td>
          <td style="padding: 8px; text-align: right;">${l.quantity}</td>
          <td style="padding: 8px; text-align: right;">${formatMoney(l.unit_price)}</td>
          <td style="padding: 8px; text-align: right;">${formatMoney(l.line_total)}</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <div style="font-family: sans-serif; background: #F7F4EC; color: #1B1F23; padding: 24px;">
        <h2 style="margin-top: 0;">Invoice ${invoice.number}</h2>
        <p>Dear ${String(invoice.customer?.name || "Customer").replace(/</g, "&lt;")},</p>
        <p>Your subscription invoice for the period ${formatDate(invoice.period_start)} to ${formatDate(invoice.period_end)} is available.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="border-bottom: 2px solid #1B1F23; text-align: left;">
              <th style="padding: 8px;">Description</th>
              <th style="padding: 8px; text-align: right;">Qty</th>
              <th style="padding: 8px; text-align: right;">Unit Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${lineRowsHtml}
          </tbody>
        </table>

        <p style="font-size: 16px; font-weight: bold; text-align: right;">
          Total Due: ${formatMoney(invoice.total - (invoice.amount_paid || 0))}
        </p>

        <p>
          <a href="${portalUrl}" style="background: #1E4D5C; color: #F7F4EC; padding: 10px 16px; text-decoration: none; display: inline-block;">
            View & Pay in Customer Portal
          </a>
        </p>
      </div>
    `;

    await sendEmail({
      to: recipientEmail,
      subject: `Invoice ${invoice.number} from Brightloop`,
      text: `Your invoice ${invoice.number} for ${formatMoney(invoice.total)} is ready. Due date: ${formatDate(invoice.due_date)}. View online at ${portalUrl}`,
      html: emailHtml,
    });

    // Update sent_at timestamp
    await supabase
      .from("invoices")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({
      ok: true,
      message: `Invoice sent to ${recipientEmail}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
