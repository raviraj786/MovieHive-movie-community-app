// const TRAKT_CLIENT_ID = "4cb1a6b81f667f5971d4e3090b2e868d773942415c2cf8e316645723e46a12d5"; 
// const BASE = "https://api.trakt.tv";

// async function safeFetch(url, opts = {}) {
//   const res = await fetch(url, opts);
//   if (!res.ok) {
//     const txt = await res.text();
//     throw new Error(`${res.status} ${txt}`);
//   }
//   return res.json();
// }

// export async function fetchTrendingMovies() {
//   const data = await safeFetch(`${BASE}/movies/trending`, {
//     headers: {
//       "Content-Type": "application/json",
//       "trakt-api-version": "2",
//       "trakt-api-key": TRAKT_CLIENT_ID,
//     },
//   });
 
//   return data.map((it) => {
//     const m = it.movie || it;
//     return {
//       id: m.ids?.tmdb ? String(m.ids.tmdb) : m.ids?.slug ?? `${m.title}_${m.year}`,
//       title: m.title,
//       year: m.year,
//       overview: m.overview || "",
//       poster: m.ids?.tmdb ? `https://image.tmdb.org/t/p/w500${m.ids.tmdb}` : m.images?.poster?.full ?? null,
//       backdrop: m.images?.fanart?.full ?? m.images?.poster?.full ?? null,
//       rating: m.rating ?? 0,
//       genres: m.genres ?? [],
//       raw: m,
//     };
//   });
// }



// src/utils/trakApi.js
const OMDB_API_KEY = "9f32f55";
const BASE = "https://www.omdbapi.com";

let currentPage = 1;
let totalResults = 0;

export async function fetchTrendingMovies(page = 1) {
  try {
    currentPage = page;
    
    // OMDb mein pagination ke saath search
    const data = await fetch(`${BASE}/?apikey=${OMDB_API_KEY}&s=movie&type=movie&y=2025&page=${page}`)
      .then(res => res.json());
    
    if (data.Response === "False") {
      throw new Error(data.Error || "Movies fetch nahi ho payi");
    }

    totalResults = parseInt(data.totalResults) || 0;

    // Detailed information ke liye
    const detailedMovies = await Promise.all(
      data.Search.map(async (movie) => {
        try {
          const details = await fetchMovieDetails(movie.imdbID);
          return details;
        } catch (error) {
          return { ...movie, Plot: "", imdbRating: "0", Genre: "" };
        }
      })
    );

    return detailedMovies.filter(movie => movie !== null).map((m) => ({
      id: m.imdbID,
      title: m.Title,
      year: parseInt(m.Year) || 0,
      overview: m.Plot || "No description available",
      poster: m.Poster !== "N/A" ? m.Poster : null,
      backdrop: null,
      rating: parseFloat(m.imdbRating) || 0,
      votes: m.imdbVotes || "0",
      genre: m.Genre ? m.Genre.split(", ") : [],
      runtime: m.Runtime || "N/A",
      raw: m,
    }));
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
}

export async function fetchMovieDetails(movieId) {
  const data = await fetch(`${BASE}/?apikey=${OMDB_API_KEY}&i=${movieId}&plot=short`)
    .then(res => res.json());
  
  if (data.Response === "False") {
    throw new Error(data.Error);
  }
  
  return data;
}

export function hasMorePages() {
  return currentPage * 10 < totalResults;
}

export function getCurrentPage() {
  return currentPage;
}