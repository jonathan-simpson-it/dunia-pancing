import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

interface BarcodeProps {
  value: string
  height?: number
  width?: number
  fontSize?: number
}

export default function Barcode({ value, height = 40, width = 1.5, fontSize = 12 }: BarcodeProps) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (ref.current && value) {
      try {
        JsBarcode(ref.current, value, {
          format: 'CODE128',
          width,
          height,
          displayValue: true,
          fontSize,
          font: 'monospace',
          margin: 4,
          background: '#ffffff',
          lineColor: '#000000',
        })
      } catch { /* noop */ }
    }
  }, [value, height, width, fontSize])

  return <svg ref={ref} className="w-full max-w-[260px]" />
}
