import { QRCodeSVG } from 'qrcode.react'
import type { YapeChallenge } from './payment.ts'
import { demoQrValue } from './payment.ts'

export function YapeDemo({ challenge }: { challenge: YapeChallenge }) {
  return <div className="yape-demo">
    <QRCodeSVG value={demoQrValue(challenge.operationId)} size={200} marginSize={4}
      role="img" title="QR ficticio de demostración APF3. No inicia transferencias." />
    <p>Operación ficticia: <strong>{challenge.operationId}</strong></p>
    <p>Código ficticio de demostración: <strong>{challenge.code}</strong></p>
    <p className="control-help">El QR solo contiene un identificador ficticio APF3. No lo uses para pagar. Copia el código mostrado en el campo siguiente.</p>
  </div>
}
