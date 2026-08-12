/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#C9A96E',
    paddingBottom: 16,
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 9,
    color: '#666666',
    marginTop: 2,
  },
  invoiceBadge: {
    backgroundColor: '#1a1a1a',
    color: '#C9A96E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  metaCol: {
    flexDirection: 'column',
  },
  metaLabel: {
    fontSize: 8,
    color: '#888888',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  colService: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 2, textAlign: 'right' },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  totalInner: {
    width: 220,
    borderTopWidth: 1,
    borderTopColor: '#C9A96E',
    paddingTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalGrandLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  totalGrandValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#C9A96E',
  },
  noticeBox: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 6,
    padding: 12,
    marginBottom: 24,
  },
  noticeTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#92400e',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 8.5,
    color: '#78350f',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 36,
    right: 36,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 8,
    color: '#999999',
  },
})

interface InvoiceProps {
  bookingCode: string
  customerName: string
  customerPhone: string
  customerNotes?: string
  serviceName: string
  servicePrice: number
  bookingDate: string
  bookingTime: string
  createdAt?: string
}

export default function InvoiceDocument({
  bookingCode,
  customerName,
  customerPhone,
  customerNotes,
  serviceName,
  servicePrice,
  bookingDate,
  bookingTime,
  createdAt,
}: InvoiceProps) {
  const formattedBookingDate = bookingDate
    ? format(new Date(bookingDate), 'EEEE, d MMMM yyyy', { locale: localeId })
    : '-'

  const formattedCreated = createdAt
    ? format(new Date(createdAt), 'd MMM yyyy, HH:mm', { locale: localeId })
    : format(new Date(), 'd MMM yyyy, HH:mm', { locale: localeId })

  const priceFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(servicePrice || 0)

  return (
    <Document title={`Invoice-${bookingCode}`} author="BONE Barbershop">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>BONE BARBERSHOP</Text>
            <Text style={styles.brandSubtitle}>Gentlemen Barbershop & Grooming</Text>
          </View>
          <View>
            <Text style={styles.invoiceBadge}>INVOICE BOOKING</Text>
          </View>
        </View>

        {/* Metadata Grid */}
        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Kode Booking</Text>
            <Text style={styles.metaValue}>{bookingCode}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Tanggal Dibuat</Text>
            <Text style={styles.metaValue}>{formattedCreated}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={[styles.metaValue, { color: '#d97706' }]}>PENDING</Text>
          </View>
        </View>

        {/* Customer & Appointment Info */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={{ width: '48%' }}>
            <Text style={styles.sectionTitle}>Pelanggan</Text>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold' }}>{customerName}</Text>
            <Text style={{ fontSize: 9, color: '#555555', marginTop: 2 }}>{customerPhone}</Text>
            {customerNotes && (
              <Text style={{ fontSize: 8.5, color: '#666666', marginTop: 4, fontStyle: 'italic' }}>
                Catatan: {customerNotes}
              </Text>
            )}
          </View>

          <View style={{ width: '48%' }}>
            <Text style={styles.sectionTitle}>Jadwal Kedatangan</Text>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold' }}>{formattedBookingDate}</Text>
            <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1a1a1a', marginTop: 2 }}>
              Jam {bookingTime} WIB
            </Text>
          </View>
        </View>

        {/* Service Table */}
        <Text style={styles.sectionTitle}>Rincian Layanan</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colService}>Layanan</Text>
            <Text style={styles.colQty}>Jumlah</Text>
            <Text style={styles.colPrice}>Harga</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.colService, { fontFamily: 'Helvetica-Bold' }]}>{serviceName}</Text>
            <Text style={styles.colQty}>1x</Text>
            <Text style={[styles.colPrice, { fontFamily: 'Helvetica-Bold' }]}>{priceFormatted}</Text>
          </View>
        </View>

        {/* Total Box */}
        <View style={styles.totalBox}>
          <View style={styles.totalInner}>
            <View style={styles.totalRow}>
              <Text style={styles.totalGrandLabel}>TOTAL BIAYA</Text>
              <Text style={styles.totalGrandValue}>{priceFormatted}</Text>
            </View>
          </View>
        </View>

        {/* Next Steps Notice Box */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>Langkah Selanjutnya (Konfirmasi WhatsApp):</Text>
          <Text style={styles.noticeText}>
            1. Simpan atau download file Invoice PDF ini.{'\n'}
            2. Kirimkan invoice/kode booking ke WhatsApp Admin BONE Barbershop.{'\n'}
            3. Admin akan mengonfirmasi ketersediaan dan status booking Anda.{'\n'}
            4. Harap hadir 5-10 menit sebelum jam kedatangan ({bookingTime} WIB).
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            BONE Barbershop • Terima kasih telah mempercayakan penampilan Anda kepada kami.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
