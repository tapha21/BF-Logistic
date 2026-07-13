import type { Incoterm, InfosFinancieres, InfosTransit, ModeReglement, ModeTransport, RegimeDouanier } from "../../lib/types";

const MODES_TRANSPORT: ModeTransport[] = ["Maritime", "Aérien", "Routier", "Ferroviaire"];
const INCOTERMS: Incoterm[] = ["EXW", "FCA", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DDP", "DDU"];
const REGIMES_DOUANIERS: RegimeDouanier[] = ["Import", "Export", "Transit", "Admission temporaire", "Entrepôt sous douane"];
const MODES_REGLEMENT: ModeReglement[] = ["Virement bancaire", "Chèque", "Espèces", "Mobile Money", "Traite"];

type Fields = InfosTransit & InfosFinancieres;

export function TransitFieldsEditor({ value, onChange }: { value: Fields; onChange: (patch: Partial<Fields>) => void }) {
  return (
    <div className="space-y-5">
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Transport &amp; douane</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Field label="Mode de transport">
            <select value={value.modeTransport} onChange={(e) => onChange({ modeTransport: e.target.value as ModeTransport })} className="input">
              {MODES_TRANSPORT.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Incoterm">
            <select value={value.incoterm} onChange={(e) => onChange({ incoterm: e.target.value as Incoterm })} className="input">
              {INCOTERMS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="Régime douanier">
            <select value={value.regimeDouanier} onChange={(e) => onChange({ regimeDouanier: e.target.value as RegimeDouanier })} className="input">
              {REGIMES_DOUANIERS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Port d'embarquement"><input value={value.portEmbarquement} onChange={(e) => onChange({ portEmbarquement: e.target.value })} className="input" /></Field>
          <Field label="Port de débarquement"><input value={value.portDebarquement} onChange={(e) => onChange({ portDebarquement: e.target.value })} className="input" /></Field>
          <Field label="N° conteneur"><input value={value.numeroConteneur} onChange={(e) => onChange({ numeroConteneur: e.target.value })} className="input" /></Field>
          <Field label="N° BL / LTA / CMR"><input value={value.numeroTitreTransport} onChange={(e) => onChange({ numeroTitreTransport: e.target.value })} className="input" /></Field>
          <Field label="N° déclaration douane"><input value={value.numeroDeclaration} onChange={(e) => onChange({ numeroDeclaration: e.target.value })} className="input" /></Field>
          <Field label="Nature marchandise"><input value={value.natureMarchandise} onChange={(e) => onChange({ natureMarchandise: e.target.value })} className="input" /></Field>
          <Field label="Poids brut (kg)"><input type="number" value={value.poidsBrut} onChange={(e) => onChange({ poidsBrut: Number(e.target.value) })} className="input" /></Field>
          <Field label="Poids net (kg)"><input type="number" value={value.poidsNet} onChange={(e) => onChange({ poidsNet: Number(e.target.value) })} className="input" /></Field>
          <Field label="Volume (m³)"><input type="number" value={value.volumeCBM} onChange={(e) => onChange({ volumeCBM: Number(e.target.value) })} className="input" /></Field>
        </div>
      </section>

      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Fiscalité &amp; règlement</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Field label="Taux TVA (%)"><input type="number" value={value.tauxTVA} onChange={(e) => onChange({ tauxTVA: Number(e.target.value) })} className="input" /></Field>
          <Field label="Remise globale (%)"><input type="number" value={value.remiseGlobalePct} onChange={(e) => onChange({ remiseGlobalePct: Number(e.target.value) })} className="input" /></Field>
          <Field label="Timbre fiscal (FCFA)"><input type="number" value={value.timbreFiscal} onChange={(e) => onChange({ timbreFiscal: Number(e.target.value) })} className="input" /></Field>
          <Field label="Retenue à la source (%)"><input type="number" value={value.retenueSourcePct} onChange={(e) => onChange({ retenueSourcePct: Number(e.target.value) })} className="input" /></Field>
          <Field label="Mode de règlement">
            <select value={value.modeReglement} onChange={(e) => onChange({ modeReglement: e.target.value as ModeReglement })} className="input">
              {MODES_REGLEMENT.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Conditions de paiement" full><input value={value.conditionsPaiement} onChange={(e) => onChange({ conditionsPaiement: e.target.value })} className="input" /></Field>
        </div>
      </section>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={`space-y-1 ${full ? "col-span-2 md:col-span-3" : ""}`}>
      <label className="text-xs uppercase text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
