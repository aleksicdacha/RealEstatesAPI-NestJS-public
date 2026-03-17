import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { fetchProperty } from '@/lib/api';
import PropertyDetailClient from './PropertyDetailClient';

interface PropertyDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string[];
  }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const resolvedParams = await params;
  // First element is always the ID
  const id = resolvedParams.slug[0];
  const t = await getTranslations('property');
  
  try {
    const property = await fetchProperty(id);
    
    return <PropertyDetailClient property={property} />;
  } catch (error) {
    notFound();
  }
}
