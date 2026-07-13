export function normalizePhoneForWhatsapp(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export type WhatsappSendResult = "shared-with-file" | "opened-link";

export async function sendDocumentViaWhatsapp(params: {
  phone: string;
  message: string;
  file?: File;
}): Promise<WhatsappSendResult> {
  const { phone, message, file } = params;

  if (file && typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: message });
      return "shared-with-file";
    } catch {
      // user cancelled or share failed — fall through to link fallback
    }
  }

  const number = normalizePhoneForWhatsapp(phone);
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
  return "opened-link";
}
