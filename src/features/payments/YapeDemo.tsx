import { QRCodeSVG } from 'qrcode.react'
import type { YapeChallenge } from './payment.ts'
import { demoQrValue } from './payment.ts'

export function YapeDemo({ challenge }: { challenge: YapeChallenge }) {
  return <div className="yape-demo">
    <QRCodeSVG value={demoQrValue(challenge.operationId)} size={200} marginSize={4}
      role="img" title="QR de prueba. No inicia transferencias." />
    <p>Operación de prueba: <strong>{challenge.operationId}</strong></p>
    <p>Código de prueba: <strong>{challenge.code}</strong></p>
    <p className="control-help">El QR solo contiene un identificador de prueba. No lo uses para pagar. Copia el código mostrado en el campo siguiente.</p>
  </div>
}
