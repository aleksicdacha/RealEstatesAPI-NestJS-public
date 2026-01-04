'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchProperties, Property } from '@/lib/api';
import { PropertyCard } from '@/app/components/PropertyCard';
import { PropertyMap } from '@/app/components/PropertyMap';
import { LoadScript } from '@react-google-maps/api';
import { FavouritePropertyCard } from '@/app/components/FavouritePropertyCard';
import { useFavourites } from '@/app/contexts/FavouritesContext';

export default function IzdavanjePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const { favourites } = useFavourites();

  useEffect(() => {
    // Fetch latest properties for rent, only rents clients and active status
    fetchProperties({
      page: 1,
      limit: 12,
      sortBy: 'createdAt',
      order: 'DESC',
      clientTransactionType: 'rents'
    }).then((data) => {
      setProperties(data.items);
    });
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Nekretnine za Izdavanje
          </h1>
          <p className="text-xl mb-8">
            Pronađite idealan stan ili kuću za iznajmljivanje
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select className="px-4 py-3 rounded border text-gray-900" defaultValue="rent">
                <option value="sale">Prodaja</option>
                <option value="rent">Izdavanje</option>
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
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-semibold">
                Pretraži
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="px-2">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Nekretnine za Izdavanje
            </h2>

            {/* Map Toggle Switch */}
            <div className="flex items-center gap-3 bg-white rounded-full p-1 shadow-sm border">
              <button
                onClick={() => setShowMap(true)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  showMap
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Prikaži mapu
              </button>
              <button
                onClick={() => setShowMap(false)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  !showMap
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sakrij mapu
              </button>
            </div>
          </div>

          {/* Split layout: 65% Properties List, 35% Map */}
          <div className={`grid gap-8 transition-all duration-500 ease-in-out ${
            showMap ? 'lg:grid-cols-[65%_35%]' : 'grid-cols-1'
          }`}>
            {/* Properties List */}
            <div className="">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <div className={`w-[95%] transition-all duration-500 ease-in-out ${
              showMap
                ? 'opacity-100 max-h-[800px] h-[800px]'
                : 'opacity-0 max-h-0 h-0 overflow-hidden'
            } sticky top-4 rounded-lg overflow-hidden shadow-lg`}>
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} libraries={['places']}>
                <PropertyMap
                  properties={properties}
                  selectedPropertyId={selectedPropertyId || undefined}
                />
              </LoadScript>
            </div>
          </div>
        </div>
      </section>

      {/* Favourite Properties */}
      {favourites.length > 0 && (
        <section key={favourites.length} className="py-16 bg-white">
          <div className="px-2">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Omiljene Nekretnine
              </h2>
              <p className="text-center text-gray-600">
                Vaše sačuvane nekretnine ({favourites.length})
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {properties
                .filter(property => favourites.includes(property.id))
                .map((property) => (
                  <FavouritePropertyCard
                    key={property.id}
                    property={property}
                  />
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Zašto Izabrati Olymp Nekretnine?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-blue-600 text-2xl">🏠</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Fleksibilni Ugovori</h3>
              <p className="text-gray-600">Iznajmljivanje sa fleksibilnim uslovima i rokovima</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-blue-600 text-2xl">🗺️</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Interaktivna Mapa</h3>
              <p className="text-gray-600">Pronađite nekretninu po lokaciji</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-blue-600 text-2xl">✓</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Brza Verifikacija</h3>
              <p className="text-gray-600">Svi oglasi su verifikovani i pouzdani</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}