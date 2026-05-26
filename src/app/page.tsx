import Link from 'next/link'
import { Scissors, Clock, MapPin, Phone, Star, ExternalLink } from 'lucide-react'
import { SERVICES } from '@/lib/constants'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-sm border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-wider text-white">
            BONE
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/booking"
              className="bg-[#C9A96E] text-black px-5 py-2 rounded-full font-semibold text-sm hover:bg-[#b8954f] transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
        <div className="relative z-10 text-center px-4 animate-fade-in">
          <div className="mb-6">
            <Scissors className="w-12 h-12 text-[#C9A96E] mx-auto mb-4" />
          </div>
          <h1 className="text-6xl sm:text-8xl font-black tracking-wider mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            BONE
          </h1>
          <p className="text-xl sm:text-2xl text-[#C9A96E] font-light tracking-widest mb-2">
            BARBERSHOP
          </p>
          <p className="text-gray-400 text-lg mt-6 max-w-md mx-auto">
            Gaya rambut modern dengan sentuhan profesional. Satu barber, satu dedikasi.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="bg-[#C9A96E] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#b8954f] transition-all hover:scale-105"
            >
              Book Now
            </Link>
            <Link
              href="/my-bookings"
              className="border border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg hover:border-[#C9A96E] hover:text-[#C9A96E] transition-all"
            >
              My Bookings
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4" id="services">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Layanan Kami</h2>
          <p className="text-gray-400 text-center mb-12">Pilih layanan yang sesuai dengan kebutuhanmu</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, index) => (
              <div
                key={service.code}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 hover:border-[#C9A96E]/50 transition-all animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                  <span className="text-[#C9A96E] font-bold text-sm">
                    Rp {service.price.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration_minutes} menit</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Barber Section */}
      <section className="py-20 px-4 bg-[#111111]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Meet Your Barber</h2>
          <div className="mt-8">
            <div className="w-32 h-32 bg-[#2a2a2a] rounded-full mx-auto mb-6 flex items-center justify-center">
              <Scissors className="w-12 h-12 text-[#C9A96E]" />
            </div>
            <h3 className="text-2xl font-bold text-[#C9A96E]">Abi</h3>
            <p className="text-gray-400 mt-2">Professional Barber & Owner</p>
            <p className="text-gray-300 mt-4 max-w-lg mx-auto">
              Dengan pengalaman bertahun-tahun di dunia barbering, Abi menghadirkan potongan rambut modern
              dan klasik dengan presisi tinggi. Setiap pelanggan mendapat perhatian penuh dan hasil terbaik.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Kata Mereka</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Rizky', text: 'Potongan rapi dan sesuai request. Tempatnya nyaman banget!' },
              { name: 'Dimas', text: 'Abi emang jago, selalu puas sama hasilnya. Recommended!' },
              { name: 'Fajar', text: 'Booking online-nya gampang banget. Gak perlu antri lama.' },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C9A96E] text-[#C9A96E]" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                <p className="text-[#C9A96E] font-semibold">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 px-4 bg-[#111111]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Informasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Clock className="w-8 h-8 text-[#C9A96E] mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Jam Buka</h3>
              <p className="text-gray-400">Senin - Sabtu</p>
              <p className="text-gray-400">09:00 - 17:00</p>
            </div>
            <div>
              <MapPin className="w-8 h-8 text-[#C9A96E] mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Lokasi</h3>
              <p className="text-gray-400">Bone, Sulawesi Selatan</p>
            </div>
            <div>
              <Phone className="w-8 h-8 text-[#C9A96E] mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Kontak</h3>
              <p className="text-gray-400">WhatsApp: 08xx-xxxx-xxxx</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 BONE Barbershop. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-[#C9A96E] transition-colors flex items-center gap-1">
              <ExternalLink className="w-5 h-5" />
              <span className="text-sm">Instagram</span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
