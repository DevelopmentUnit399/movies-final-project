import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { assets } from '../assets/images/assets'

const API_KEY = '3c9e8caa418c70d648f20eec57b9a92b'
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

async function fetchTmdb(path, params, signal) {
    const searchParams = new URLSearchParams({ api_key: API_KEY, ...params })
    const response = await fetch(`${BASE_URL}${path}?${searchParams}`, { signal })

    if (!response.ok) {
        throw new Error(`TMDB request failed (${response.status})`)
    }

    return response.json()
}

function formatRuntime(minutes) {
    if (!minutes) return 'N/A'

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
        return `${hours}hr/s ${remainingMinutes}min`
    }

    return `${minutes}min`
}

function sortMovies(movies, filter) {
    const sorted = [...movies]

    switch (filter) {
        case 'RATING_DESC':
            return sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
        case 'RATING_ASC':
            return sorted.sort((a, b) => (a.vote_average || 0) - (b.vote_average || 0))
        case 'YEAR_DESC':
            return sorted.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0))
        case 'YEAR_ASC':
            return sorted.sort((a, b) => new Date(a.release_date || 0) - new Date(b.release_date || 0))
        case 'TITLE_ASC':
            return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
        case 'TITLE_DESC':
            return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''))
        default:
            return sorted
    }
}

const Movies = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const query = searchParams.get('search') ?? ''
    const [displayLimit, setDisplayLimit] = useState(6)
    const [filter, setFilter] = useState('')
    const [movieRequest, setMovieRequest] = useState({ key: '', status: 'loading', movies: [], error: '' })
    const [selectedMovie, setSelectedMovie] = useState(null)
    const [movieDetailRequest, setMovieDetailRequest] = useState({ id: null, status: 'idle', details: null, error: '' })

    const searchTerm = query.trim()
    const pageCount = Math.ceil(displayLimit / 20)
    const requestKey = `${searchTerm}:${pageCount}`
    const currentMovieRequest = movieRequest.key === requestKey ? movieRequest : null
    const movies = currentMovieRequest?.movies ?? []
    const isLoading = !currentMovieRequest || currentMovieRequest.status === 'loading'
    const error = currentMovieRequest?.error ?? ''
    const visibleMovies = sortMovies(movies, filter).slice(0, displayLimit)
    const isCurrentDetail = movieDetailRequest.id === selectedMovie?.id
    const movieDetails = isCurrentDetail ? movieDetailRequest.details : null
    const isModalLoading = Boolean(selectedMovie && (!isCurrentDetail || movieDetailRequest.status === 'loading'))
    const modalError = isCurrentDetail ? movieDetailRequest.error : ''
    const modalMovie = movieDetails ?? selectedMovie

    useEffect(() => {
        document.title = searchTerm ? `${searchTerm} | Movies` : 'Browse Movies | Movies'
    }, [searchTerm])

    useEffect(() => {
        const controller = new AbortController()

        const loadMovies = async () => {
            try {
                const endpoint = searchTerm ? '/search/movie' : '/movie/top_rated'
                const pages = await Promise.all(
                    Array.from({ length: pageCount }, (_, index) => {
                        const params = { page: String(index + 1) }
                        if (searchTerm) params.query = searchTerm
                        return fetchTmdb(endpoint, params, controller.signal)
                    })
                )

                setMovieRequest({
                    key: requestKey,
                    status: 'loaded',
                    movies: pages.flatMap((page) => page.results ?? []),
                    error: '',
                })
            } catch (requestError) {
                if (requestError.name !== 'AbortError') {
                    setMovieRequest({
                        key: requestKey,
                        status: 'error',
                        movies: [],
                        error: 'Failed to load movies. Please try again.',
                    })
                }
            }
        }

        loadMovies()
        return () => controller.abort()
    }, [requestKey, searchTerm, pageCount])

    useEffect(() => {
        if (!selectedMovie) return undefined

        const controller = new AbortController()

        fetchTmdb(`/movie/${selectedMovie.id}`, {}, controller.signal)
            .then((details) => {
                setMovieDetailRequest({ id: selectedMovie.id, status: 'loaded', details, error: '' })
            })
            .catch((requestError) => {
                if (requestError.name !== 'AbortError') {
                    setMovieDetailRequest({
                        id: selectedMovie.id,
                        status: 'error',
                        details: null,
                        error: 'Failed to load movie details.',
                    })
                }
            })

        return () => controller.abort()
    }, [selectedMovie])

    useEffect(() => {
        if (!selectedMovie) return undefined

        document.body.classList.add('no-scroll')
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setSelectedMovie(null)
        }
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.classList.remove('no-scroll')
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [selectedMovie])

    const handleSearchChange = (event) => {
        const nextQuery = event.target.value
        setSearchParams(nextQuery ? { search: nextQuery } : {}, { replace: true })
    }

    const handleSearchSubmit = (event) => {
        event.preventDefault()
        const normalizedQuery = query.trim()
        setSearchParams(normalizedQuery ? { search: normalizedQuery } : {}, { replace: true })
    }

    const closeModal = () => setSelectedMovie(null)
    const openMovieDetails = (movie) => {
        setSelectedMovie(movie)
        setMovieDetailRequest({ id: movie.id, status: 'loading', details: null, error: '' })
    }

    return (
        <>
            <div className="landing-page landing-page--movies">
                <div className="background">
                    <img src={assets.movie_posters} alt="" className="background__img" />
                </div>

                <div className="header header--movies">
                    <div className="header__content row">
                        <h1 className="title nav__link--white">Browse Our Movies</h1>
                        <div className="header__content--main">
                            <form className="header__search header__search--movies" onSubmit={handleSearchSubmit}>
                                <input
                                    className="header__search--input"
                                    type="search"
                                    placeholder="Search by Movie title, year, or type."
                                    value={query}
                                    onChange={handleSearchChange}
                                    aria-label="Search movies"
                                />
                                <button className="header__search--icon click" type="submit" aria-label="Submit movie search">
                                    <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className="search__results">
                <div className="row white__row">
                    <div className="results__titles">
                        <h2 className="results__title">Search results for:</h2>
                        <h2 className="results__search highlight">
                            {searchTerm ? `"${searchTerm}"` : '"Top Rated"'}
                        </h2>
                    </div>

                    <div className="filter__section">
                        <div className="row filter__row">
                            <div className="filter__group">
                                <label htmlFor="limit" className="filter__label">Show:</label>
                                <select
                                    id="limit"
                                    className="filter__select"
                                    value={displayLimit}
                                    onChange={(event) => setDisplayLimit(Number(event.target.value))}
                                >
                                    <option value={6}>6 Results</option>
                                    <option value={12}>12 Results</option>
                                    <option value={18}>18 Results</option>
                                    <option value={20}>20 Results</option>
                                    <option value={50}>50 Results</option>
                                    <option value={100}>100 Results</option>
                                </select>
                            </div>

                            <label htmlFor="filter" className="filter__label">Sort By:</label>
                            <select
                                id="filter"
                                className="filter__select"
                                value={filter}
                                onChange={(event) => setFilter(event.target.value)}
                            >
                                <option value="">Select Sorting</option>
                                <option value="RATING_DESC">Rating (High to Low)</option>
                                <option value="RATING_ASC">Rating (Low to High)</option>
                                <option value="YEAR_DESC">Release Year (Newest)</option>
                                <option value="YEAR_ASC">Release Year (Oldest)</option>
                                <option value="TITLE_ASC">Alphabetical (A - Z)</option>
                                <option value="TITLE_DESC">Alphabetical (Z - A)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="movie__card">
                <div className="row">
                    <div className={`cards${isLoading ? ' movies__loading' : ''}`} aria-busy={isLoading}>
                        {isLoading && <i className="fas fa-spinner movies__loading--spinner" aria-label="Loading movies"></i>}
                        {!isLoading && error && <h3 className="no-movies" role="alert">{error}</h3>}
                        {!isLoading && !error && visibleMovies.length === 0 && (
                            <h3 className="no-movies">No movies found.</h3>
                        )}
                        {!isLoading && !error && visibleMovies.map((movie) => {
                            const poster = movie.poster_path
                                ? `${IMAGE_BASE_URL}${movie.poster_path}`
                                : assets.test_poster
                            const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A'
                            const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'

                            return (
                                <article className="card" key={movie.id}>
                                    <button
                                        type="button"
                                        className="card__poster-button"
                                        onClick={() => openMovieDetails(movie)}
                                        aria-label={`View details for ${movie.title}`}
                                    >
                                        <img src={poster} alt={movie.title} className="card__image image__click" />
                                    </button>
                                    <h2 className="card__title">{movie.title}</h2>
                                    <div className="card__rating--card">
                                        <i className="fa-solid fa-star" style={{ color: 'gold' }} aria-hidden="true"></i>
                                        <h3 className="card__rating--text">Rating: {rating} / 10</h3>
                                    </div>
                                    <div className="card__released--card">
                                        <i className="fa-solid fa-calendar" aria-hidden="true"></i>
                                        <h3 className="card__released--text">Released: {year}</h3>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className={`modal${selectedMovie ? ' modal--open' : ''}`} role="dialog" aria-modal="true" aria-label="Movie details" aria-hidden={!selectedMovie}>
                <button className="modal__overlay" type="button" onClick={closeModal} aria-label="Close movie details"></button>
                <div className="modal__content">
                    <button className="modal__close" type="button" onClick={closeModal} aria-label="Close movie details">
                        <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                    </button>
                    <div className="modal__body">
                        {isModalLoading && <div className="movies__loading"><i className="fa-solid fa-spinner fa-spin" aria-label="Loading details"></i></div>}
                        {modalError && <p role="alert">{modalError}</p>}
                        {!isModalLoading && !modalError && modalMovie && (
                            <div className="modal__details">
                                <img
                                    src={modalMovie.poster_path ? `${IMAGE_BASE_URL}${modalMovie.poster_path}` : assets.test_poster}
                                    alt={modalMovie.title}
                                    className="modal__poster"
                                />
                                <div className="modal__info">
                                    <h2 className="modal__title">{modalMovie.title}</h2>
                                    {modalMovie.tagline && <p className="modal__tagline"><em>"{modalMovie.tagline}"</em></p>}
                                    <div className="modal__meta">
                                        <span><i className="fa-solid fa-star" style={{ color: 'gold' }} aria-hidden="true"></i> {modalMovie.vote_average ? modalMovie.vote_average.toFixed(1) : 'N/A'}/10</span>
                                        <span><i className="fa-solid fa-calendar" aria-hidden="true"></i> {modalMovie.release_date ? modalMovie.release_date.split('-')[0] : 'N/A'}</span>
                                        <span><i className="fa-solid fa-clock" aria-hidden="true"></i> {formatRuntime(modalMovie.runtime)}</span>
                                    </div>
                                    <p className="modal__genres"><strong>Genres:</strong> {modalMovie.genres?.length ? modalMovie.genres.map((genre) => genre.name).join(', ') : 'N/A'}</p>
                                    <div className="modal__overview-container">
                                        <h3>Overview</h3>
                                        <p className="modal__overview">{modalMovie.overview || 'No description available for this movie.'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Movies