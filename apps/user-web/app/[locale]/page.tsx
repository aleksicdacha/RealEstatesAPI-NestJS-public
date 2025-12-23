import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            {t('title', { default: 'Pronađite Svoj Savršen Dom' })}
          </h1>
          <p className="text-xl mb-8">
            {t('subtitle', { default: 'Hiljade nekretnina na jednom mestu' })}
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select className="px-4 py-3 rounded border text-gray-900">
                <option>Prodaja</option>
                <option>Izdavanje</option>
              </select>
              <select className="px-4 py-3 rounded border text-gray-900">
                <option>Tip nekretnine</option>
                <option>Stan</option>
                <option>Kuća</option>
                <option>Plac</option>
              </select>
              <input 
                type="text" 
                placeholder="Lokacija" 
                className="px-4 py-3 rounded border text-gray-900"
              />
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded font-semibold">
                Pretraži
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Izdvojene Nekretnine
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">Stan 65m², Centar</h3>
                  <p className="text-gray-600 mb-2">Beograd, Vračar</p>
                  <p className="text-primary-600 font-bold text-xl">120,000 €</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Zašto Izabrati Nas?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-primary-600 text-2xl">🏠</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Velika Ponuda</h3>
              <p className="text-gray-600">Hiljade verifikovanih oglasa</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-primary-600 text-2xl">🗺️</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Interaktivna Mapa</h3>
              <p className="text-gray-600">Pronađite nekretninu po lokaciji</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-primary-600 text-2xl">✓</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Bez Provizije</h3>
              <p className="text-gray-600">Direktan kontakt sa vlasnicima</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
