'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchProperties, Property } from '@/lib/api';
import { PropertyCard } from '@/app/components/PropertyCard';
import { PropertyMap } from '@/app/components/PropertyMap';

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch latest properties from API
    // Public API automatically returns only active properties
    fetchProperties({
      page: 1,
      limit: 6,
      sortBy: 'createdAt',
      order: 'DESC',
    }).then((data) => {
      setProperties(data.items);
    });
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Pronađite Svoj Savršen Dom
          </h1>
          <p className="text-xl mb-8">
            Hiljade nekretnina na jednom mestu
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
        <div className="px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Izdvojene Nekretnine
          </h2>
          
          {/* Split layout: 50% Properties List, 50% Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Properties List */}
            <div className="pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property}
                    onHover={setSelectedPropertyId}
                  />
                ))}
              </div>
            </div>
            
            {/* Map */}
            <div className="h-[800px] sticky top-4 rounded-lg overflow-hidden shadow-lg">
              <PropertyMap 
                properties={properties}
                selectedPropertyId={selectedPropertyId || undefined}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="px-4">
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
              <h3 className="font-bold text-xl mb-2">3% Provizije</h3>
              <p className="text-gray-600">Direktan kontakt sa vlasnicima</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
