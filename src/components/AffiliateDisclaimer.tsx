import { Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DEFAULT_BRAND_NAME } from '@/lib/constants';

export function AffiliateDisclaimer() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-8 flex items-start gap-3">
      <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
      <div className="text-sm text-slate-500 leading-relaxed m-0">
        <strong>Transparenz-Hinweis:</strong> {DEFAULT_BRAND_NAME} ist ein redaktionelles Informationsportal und tritt als Tippgeber auf. Inhalte, Vergleichsrechner, Formulare oder Angebotsstrecken können ganz oder teilweise von externen Partnern bereitgestellt werden. Wir erbringen selbst keine individuelle Fach-, Vertrags-, Rechts- oder Steuerberatung und sind nicht selbst Anbieter oder Vertragspartner der auf den Zielseiten dargestellten Produkte, Tarife oder Verträge.
        <br /><br />
        <strong>Bedeutung der Sternchen (*):</strong> Sofern Links oder Buttons mit einem Stern (*) gekennzeichnet sind, handelt es sich um Affiliate-Links. Wenn du auf einen solchen Link klickst und auf der Zielseite einen Vertrag abschließt oder einen Kauf tätigst, erhalten wir von dem jeweiligen Anbieter oder Partnernetzwerk eine Provision. Für dich entstehen dabei in der Regel keine zusätzlichen Kosten oder Preisnachteile.
        {' '}
        <Link to="/wie-wir-vergleichen" className="text-blue-600 hover:underline font-medium">
          So funktioniert unser Vergleich
        </Link>.
      </div>
    </div>
  );
}
