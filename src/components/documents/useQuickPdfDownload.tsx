import { useEffect, useRef, useState } from "react";
import { DocumentTemplate } from "./DocumentTemplate";
import type { Client, Devis, Facture, Societe } from "../../lib/types";
import { downloadNodeAsPdf } from "../../lib/pdf";

type Target = {
  doc: (Devis | Facture) & { kind: "devis" | "facture" };
  client: Client | undefined;
  societe: Societe;
  skinId: string;
  filename: string;
};

export function useQuickPdfDownload() {
  const [target, setTarget] = useState<Target | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!target) return;
    const id = requestAnimationFrame(() => {
      if (!ref.current) return;
      downloadNodeAsPdf(ref.current, target.filename).finally(() => {
        setTarget(null);
        setDownloadingId(null);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [target]);

  const download = (t: Target) => {
    setDownloadingId(t.doc.id);
    setTarget(t);
  };

  const node = target ? (
    <div style={{ position: "fixed", left: -99999, top: 0 }} aria-hidden>
      <DocumentTemplate ref={ref} doc={target.doc} client={target.client} societe={target.societe} skinId={target.skinId} />
    </div>
  ) : null;

  return { download, downloadingId, node };
}
