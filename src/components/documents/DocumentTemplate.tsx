import { forwardRef } from "react";
import { Ship, Plane, Truck, TrainFront, Building2, Landmark, MapPin, Phone, Mail } from "lucide-react";
import type { Client, Devis, Facture, ModeTransport, Societe } from "../../lib/types";
import { computeTotals, ligneMontantHT } from "../../lib/documents";
import { formatXOF } from "../../lib/mock-data";

type Doc = (Devis | Facture) & { kind: "devis" | "facture" };

const TRANSPORT_ICON: Record<ModeTransport, typeof Ship> = {
  Maritime: Ship,
  Aérien: Plane,
  Routier: Truck,
  Ferroviaire: TrainFront,
};

type Skin = {
  accent: string;
  accentSoft: string;
  headerBg: string;
  headerText: string;
  ring: string;
  band: string;
};

const SKINS: Record<string, Skin> = {
  classique: {
    accent: "#1f2937",
    accentSoft: "#f3f4f6",
    headerBg: "bg-white",
    headerText: "text-gray-900",
    ring: "border-gray-300",
    band: "bg-gray-100",
  },
  moderne: {
    accent: "#2563eb",
    accentSoft: "#eff6ff",
    headerBg: "bg-blue-600",
    headerText: "text-white",
    ring: "border-blue-100",
    band: "bg-blue-50",
  },
  "senegal-export": {
    accent: "#0f7a3d",
    accentSoft: "#eafaf0",
    headerBg: "bg-emerald-700",
    headerText: "text-white",
    ring: "border-emerald-100",
    band: "bg-emerald-50",
  },
};

export const DocumentTemplate = forwardRef<HTMLDivElement, { doc: Doc; client: Client | undefined; societe: Societe; skinId?: string }>(
  function DocumentTemplate({ doc, client, societe, skinId }, ref) {
  const skin = SKINS[skinId ?? ""] ?? SKINS.classique;
  const totaux = computeTotals(doc);
  const isFacture = doc.kind === "facture";
  const title = isFacture ? "FACTURE" : "DEVIS";
  const statut = (doc as Facture).statut;
  const TransportIcon = TRANSPORT_ICON[doc.modeTransport];

  return (
    <div
      ref={ref}
      className="bg-white text-gray-900 mx-auto shadow-xl print:shadow-none"
      style={{ width: "210mm", minHeight: "297mm", fontSize: "12px" }}
      data-print-area
    >
      {/* Header */}
      <div className={`${skin.headerBg} ${skin.headerText} px-10 py-8 flex items-start justify-between`}>
        <div className="flex items-start gap-4">
          {societe.logoDataUrl ? (
            <img src={societe.logoDataUrl} alt="Logo" className="w-16 h-16 rounded-md object-contain bg-white/90 p-1" />
          ) : (
            <div className="w-14 h-14 rounded-md bg-white/15 flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>
          )}
          <div>
            <div className="text-lg font-bold tracking-wide">{societe.raisonSociale}</div>
            <div className="text-[11px] opacity-90 max-w-[280px]">{societe.formeJuridique}</div>
            <div className="text-[11px] opacity-90 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {societe.adresse}, {societe.ville}, {societe.pays}</div>
            <div className="text-[11px] opacity-90 flex items-center gap-1"><Phone className="w-3 h-3" /> {societe.telephone} · <Mail className="w-3 h-3" /> {societe.email}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tracking-wider">{title}</div>
          <div className="text-sm font-mono opacity-95 mt-1">{doc.numero}</div>
          <div className="text-[11px] opacity-90 mt-2">Date : {doc.date}</div>
          {isFacture && <div className="text-[11px] opacity-90">Échéance : {(doc as Facture).echeance}</div>}
          {!isFacture && <div className="text-[11px] opacity-90">Validité : {(doc as Devis).validiteJours} jours</div>}
          {statut && (
            <div className="mt-2 inline-block px-2.5 py-1 rounded-full bg-white/20 text-[11px] font-semibold uppercase tracking-wide">
              {statut}
            </div>
          )}
        </div>
      </div>

      <div className="px-10 py-6 space-y-5">
        {/* NINEA / RCCM strip */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[10px] text-gray-500 border-b border-gray-200 pb-3">
          <span>NINEA : <span className="font-medium text-gray-700">{societe.ninea}</span></span>
          <span>RCCM : <span className="font-medium text-gray-700">{societe.rccm}</span></span>
          <span>Régime fiscal : <span className="font-medium text-gray-700">{societe.regimeFiscal}</span></span>
        </div>

        {/* Client + doc info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-1">{isFacture ? "Facturé à" : "Adressé à"}</div>
            <div className="font-semibold text-sm">{client?.nom ?? "—"}</div>
            <div className="text-gray-600 text-[11px] leading-relaxed">
              {client?.contact}<br />
              {client?.adresse}, {client?.ville}, {client?.pays}<br />
              {client?.email} · {client?.telephone}<br />
              {client?.ninea && <>NINEA : {client.ninea} · </>}{client?.rccm && <>RCCM : {client.rccm}</>}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-1">Objet</div>
            <div className="text-[11px] text-gray-700 leading-relaxed">{doc.objet}</div>
          </div>
        </div>

        {/* Transit / douane band */}
        <div className={`rounded-lg ${skin.band} border ${skin.ring} p-4`}>
          <div className="flex items-center gap-2 mb-3 text-[11px] font-semibold" style={{ color: skin.accent }}>
            <TransportIcon className="w-4 h-4" /> Informations transport &amp; douane — {doc.modeTransport}
          </div>
          <div className="grid grid-cols-4 gap-3 text-[10.5px]">
            <Field label="Incoterm" value={doc.incoterm} />
            <Field label="Régime douanier" value={doc.regimeDouanier} />
            <Field label="Port d'embarquement" value={doc.portEmbarquement} />
            <Field label="Port de débarquement" value={doc.portDebarquement} />
            <Field label="N° conteneur" value={doc.numeroConteneur} />
            <Field label="N° BL / LTA / CMR" value={doc.numeroTitreTransport} />
            <Field label="N° déclaration douane" value={doc.numeroDeclaration} />
            <Field label="Marchandise" value={doc.natureMarchandise} />
            <Field label="Poids brut" value={`${doc.poidsBrut.toLocaleString("fr-FR")} kg`} />
            <Field label="Poids net" value={`${doc.poidsNet.toLocaleString("fr-FR")} kg`} />
            <Field label="Volume" value={`${doc.volumeCBM.toLocaleString("fr-FR")} m³`} />
          </div>
        </div>

        {/* Line items */}
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr style={{ backgroundColor: skin.accent }} className="text-white">
              <th className="text-left px-3 py-2 font-medium rounded-l-md">Désignation</th>
              <th className="text-right px-3 py-2 font-medium">Qté</th>
              <th className="text-left px-3 py-2 font-medium">Unité</th>
              <th className="text-right px-3 py-2 font-medium">P.U.</th>
              <th className="text-right px-3 py-2 font-medium">Remise</th>
              <th className="text-right px-3 py-2 font-medium rounded-r-md">Montant HT</th>
            </tr>
          </thead>
          <tbody>
            {doc.lignes.map((l, i) => (
              <tr key={l.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-3 py-2 border-b border-gray-100">
                  <div className="font-medium">{l.designation}</div>
                  {l.description && <div className="text-gray-400 text-[10px]">{l.description}</div>}
                </td>
                <td className="px-3 py-2 border-b border-gray-100 text-right">{l.quantite}</td>
                <td className="px-3 py-2 border-b border-gray-100">{l.unite}</td>
                <td className="px-3 py-2 border-b border-gray-100 text-right font-mono">{formatXOF(l.prixUnitaire)}</td>
                <td className="px-3 py-2 border-b border-gray-100 text-right">{l.remisePct > 0 ? `${l.remisePct}%` : "—"}</td>
                <td className="px-3 py-2 border-b border-gray-100 text-right font-mono font-medium">{formatXOF(ligneMontantHT(l))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals + payment info */}
        <div className="grid grid-cols-2 gap-6 pt-2">
          <div className="text-[10.5px] text-gray-600 space-y-2">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-1">Modalités de règlement</div>
              <div>Mode : {doc.modeReglement}</div>
              <div>Conditions : {doc.conditionsPaiement}</div>
              {doc.modeReglement === "Virement bancaire" && (
                <div className="mt-1">Banque : {societe.banque}<br />IBAN : <span className="font-mono">{societe.iban}</span></div>
              )}
            </div>
            {doc.notes && (
              <div>
                <div className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-1">Notes</div>
                <div>{doc.notes}</div>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-gray-200 overflow-hidden self-start">
            <Row label="Total HT" value={formatXOF(totaux.totalHT)} />
            {totaux.remiseGlobale > 0 && <Row label={`Remise globale (${doc.remiseGlobalePct}%)`} value={`- ${formatXOF(totaux.remiseGlobale)}`} />}
            <Row label={`TVA (${doc.tauxTVA}%)`} value={formatXOF(totaux.montantTVA)} />
            {totaux.timbreFiscal > 0 && <Row label="Timbre fiscal" value={formatXOF(totaux.timbreFiscal)} />}
            {totaux.retenueSource > 0 && <Row label={`Retenue à la source (${doc.retenueSourcePct}%)`} value={`- ${formatXOF(totaux.retenueSource)}`} />}
            <div className="px-3 py-2.5 flex justify-between items-center font-bold text-white" style={{ backgroundColor: skin.accent }}>
              <span>Net à payer</span>
              <span className="font-mono">{formatXOF(totaux.netAPayer)}</span>
            </div>
            {isFacture && (doc as Facture).montantPaye > 0 && (
              <div className="px-3 py-2 flex justify-between bg-emerald-50 text-emerald-700 font-medium">
                <span>Déjà réglé</span>
                <span className="font-mono">{formatXOF((doc as Facture).montantPaye)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-10 py-4 mt-4 border-t border-gray-200 text-[9px] text-gray-400 leading-relaxed">
        {societe.piedPageMentions}
        <div className="mt-1 flex items-center gap-1 text-gray-400">
          <Landmark className="w-3 h-3" /> {societe.raisonSociale} · NINEA {societe.ninea} · RCCM {societe.rccm} · {societe.siteWeb}
        </div>
      </div>
    </div>
  );
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wide text-gray-400">{label}</div>
      <div className="font-medium text-gray-700 truncate">{value || "—"}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2 flex justify-between border-b border-gray-100 last:border-b-0 bg-white">
      <span className="text-gray-500">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}
