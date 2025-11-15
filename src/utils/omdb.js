const OMDB_API_KEY = "9f32f55";

export async function fetchMovieDetails(imdbID) {
  const url = `https://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${OMDB_API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.Response === "False") {
    throw new Error(json.Error);
  }
  return json;
}
