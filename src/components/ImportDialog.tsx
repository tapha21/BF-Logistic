import { useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Modal } from "./Modal";
import { readFileAsText } from "../lib/csv";

export function ImportDialog<T>({
  open,
  onClose,
  title,
  hint,
  parse,
  onImport,
  accept = ".csv,text/csv",
  fileLabel = "un fichier CSV",
  roundtripNote = "Le fichier exporté depuis cette page peut être ré-importé tel quel.",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  hint: string;
  parse: (text: string) => { items: T[]; errors: string[] };
  onImport: (items: T[]) => void;
  accept?: string;
  fileLabel?: string;
  roundtripNote?: string;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<{ items: T[]; errors: string[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => { setFileName(null); setResult(null); onClose(); };

  const onFile = async (file: File) => {
    setFileName(file.name);
    const text = await readFileAsText(file);
    setResult(parse(text));
  };

  const confirm = () => {
    if (!result || result.items.length === 0) return;
    onImport(result.items);
    close();
  };

  return (
    <Modal open={open} onClose={close} title={title} size="md">
      <div className="p-5 space-y-4">
        <p className="text-xs text-muted-foreground">{hint}</p>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          <UploadCloud className="w-7 h-7" />
          <span className="text-sm font-medium">{fileName ?? `Choisir ${fileLabel}`}</span>
          <span className="text-xs">Cliquez pour parcourir vos fichiers</span>
        </button>

        {result && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm bg-success/10 text-success border border-success/25 rounded-md px-3 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {result.items.length} élément(s) prêt(s) à importer
            </div>
            {result.errors.length > 0 && (
              <div className="text-sm bg-warning/10 text-[oklch(0.5_0.15_75)] border border-warning/30 rounded-md px-3 py-2 max-h-32 overflow-y-auto">
                <div className="flex items-center gap-2 font-medium mb-1"><AlertTriangle className="w-4 h-4 shrink-0" /> {result.errors.length} ligne(s) ignorée(s)</div>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
          <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" /> {roundtripNote}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button type="button" onClick={close} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted">Annuler</button>
          <button
            type="button"
            onClick={confirm}
            disabled={!result || result.items.length === 0}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
          >
            Importer {result ? `(${result.items.length})` : ""}
          </button>
        </div>
      </div>
    </Modal>
  );
}
