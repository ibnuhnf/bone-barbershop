'use client'

import dynamic from 'next/dynamic'

const InvoiceDownloadButton = dynamic(
  () => import('./InvoiceDownloadButton'),
  { ssr: false, loading: () => null }
)

export default InvoiceDownloadButton
