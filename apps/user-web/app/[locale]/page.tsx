import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function LandingPage() {
  const t = useTranslations('Landing');

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Pronađite Svoj <span className="text-yellow-300">Savršen Dom</span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-orange-100">
                Više od 10.000 nekretnina širom Srbije. Kupujte i iznajmljujte sa poverenjem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/prodaja"
                  className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Kupite Nekretninu
                </Link>
                <Link
                  href="/izdavanje"
                  className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300"
                >
                  Iznajmite Nekretninu
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-96 h-96 bg-white/10 rounded-full absolute -top-8 -right-8"></div>
                <div className="w-80 h-80 bg-white/20 rounded-full absolute -bottom-8 -left-8"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏠</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Olymp Nekretnine</h3>
                    <p className="text-gray-600">Vaš pouzdani partner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">10,000+</div>
              <div className="text-gray-600">Nekretnina</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">5,000+</div>
              <div className="text-gray-600">Zadovoljnih Klijenata</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">15</div>
              <div className="text-gray-600">Godina Iskustva</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Podrška</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Naše Usluge</h2>
            <p className="text-xl text-gray-600">Kompletno rešenje za vaše nekretninske potrebe</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl">🏠</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Prodaja Nekretnina</h3>
              <p className="text-gray-600 mb-6">Širok izbor stanova, kuća i poslovnih prostora širom Srbije</p>
              <Link href="/prodaja" className="text-orange-600 font-semibold hover:text-orange-700">
                Pogledajte Ponudu →
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl">🏢</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Izdavanje Nekretnina</h3>
              <p className="text-gray-600 mb-6">Stanovi i kuće za iznajmljivanje sa fleksibilnim ugovorima</p>
              <Link href="/izdavanje" className="text-orange-600 font-semibold hover:text-orange-700">
                Pronađite Stan →
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Procena Nekretnina</h3>
              <p className="text-gray-600 mb-6">Profesionalna procena vrednosti vaše nekretnine</p>
              <Link href="/kontakt" className="text-orange-600 font-semibold hover:text-orange-700">
                Kontaktirajte Nas →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cities */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Najpopularniji Gradovi</h2>
            <p className="text-xl text-gray-600">Pronađite nekretnine u najtraženijim lokacijama</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link href="/prodaja?city=beograd" className="group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white text-center hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
                <div className="text-2xl mb-2">🏛️</div>
                <h3 className="font-bold text-lg">Beograd</h3>
                <p className="text-blue-100">Prestonica</p>
              </div>
            </Link>
            <Link href="/prodaja?city=novi-sad" className="group">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white text-center hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
                <div className="text-2xl mb-2">🌉</div>
                <h3 className="font-bold text-lg">Novi Sad</h3>
                <p className="text-green-100">Vojvodina</p>
              </div>
            </Link>
            <Link href="/prodaja?city=nis" className="group">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white text-center hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
                <div className="text-2xl mb-2">🏰</div>
                <h3 className="font-bold text-lg">Niš</h3>
                <p className="text-purple-100">Južna Srbija</p>
              </div>
            </Link>
            <Link href="/prodaja?city=kragujevac" className="group">
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white text-center hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
                <div className="text-2xl mb-2">🏭</div>
                <h3 className="font-bold text-lg">Kragujevac</h3>
                <p className="text-red-100">Šumadija</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Spremni da Pronađete Svoj Dom?</h2>
          <p className="text-xl mb-8 text-orange-100">Pridružite se hiljadama zadovoljnih klijenata</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/prodaja"
              className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Započnite Pretragu
            </Link>
            <Link
              href="/kontakt"
              className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300"
            >
              Kontaktirajte Nas
            </Link>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Olymp Nekretnine</h3>
          <p className="text-gray-300 mb-6">Vaš pouzdani partner u svetu nekretnina</p>
          <div className="flex justify-center gap-6">
            <Link href="/kontakt" className="text-orange-400 hover:text-orange-300">Kontakt</Link>
            <Link href="/o-nama" className="text-orange-400 hover:text-orange-300">O nama</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
