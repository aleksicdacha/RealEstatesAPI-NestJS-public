export interface FetchParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  order?: "ASC" | "DESC";
  filters?: Record<string, { value: string | number; matchMode?: string }>;
  [key: string]: any; // Allow any additional query parameters
}

export async function fetchData(endpoint: string, params: FetchParams) {
  const query: Record<string, string> = {
    page: String(params.page || 1),
    limit: String(params.limit || 10),
    sortBy: params.sortBy || "createdAt",
    order: params.order || "DESC",
  };

  // Include filters directly as top-level query parameters
  if (params.filters) {
    for (const [key, filter] of Object.entries(params.filters)) {
      const filterValue = filter as { value: string | number; matchMode?: string };
      if (filterValue?.value !== null && filterValue?.value !== "") {
        query[key] = String(filterValue.value); // Add filter directly as a query parameter
      }
    }
  }

  // Add any additional parameters that are not standard FetchParams fields
  const standardFields = ['page', 'limit', 'sortBy', 'order', 'filters'];
  for (const [key, value] of Object.entries(params)) {
    if (!standardFields.includes(key) && value !== undefined && value !== null && value !== '') {
      query[key] = String(value);
    }
  }

  const queryString = new URLSearchParams(query).toString();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const url = `${baseUrl}/v1/${endpoint}?${queryString}`;
  
  console.log('🌐 fetchData URL:', url);
  console.log('🌐 Query params:', query);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add authorization header if token exists
        ...(typeof window !== 'undefined' && localStorage.getItem('accessToken') 
          ? { "Authorization": `Bearer ${localStorage.getItem('accessToken')}` }
          : {}
        ),
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch data error:", error);
    throw error;
  }
}

