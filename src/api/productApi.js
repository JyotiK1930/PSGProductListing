// Simple API layer — plain fetch, no extra libraries.
const BASE_URL = 'https://dummyjson.com/products';


export async function getProducts({limit = 20, skip=0}={}) {
  const res = await fetch(`${BASE_URL}?limit=${limit}&skip=${skip}`)
  if(!res.ok){
    throw new Error(`get products failed`)
  }
  const json = await res.json();
  return {
    products:json.products ?? [],
    total : json.total ?? 0,
    skip :json.skip ?? skip,
    limit: json.limit ?? limit
  };
}

export async function searchProducts({query, limit = 20, skip=0}={}) {
  const q = encodeURIComponent(query?? "");

  const res = await fetch(`${BASE_URL}/search?q=${query}&limit=${limit}&skip=${skip}`)
  if(!res.ok){
    throw new Error(`search products failed`)
  }
  const json = await res.json();
  return {
    products:json.products ?? [],
    total : json.total ?? 0,
    skip :json.skip ?? skip,
    limit: json.limit ?? limit
  };
}

