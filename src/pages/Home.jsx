import { useEffect, useState } from 'react'
import { assets } from '../assets/images/assets'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

const Home = () => {
  useEffect(() => {
    document.title = 'Home | Movies'
  }, [])

  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('search') ?? '')
  const navigate = useNavigate()
  const trimmedQuery = query.trim()
  const searchTarget = trimmedQuery
    ? `/movies?${new URLSearchParams({ search: trimmedQuery })}`
    : '/movies'

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      navigate(searchTarget)
    }
  }

  return (
    <section>
      <div className="header">
        <div className="header__content row">
            <h1 className="title">Welcome to the best place for <b className="highlight">movies!</b></h1>
            <h2 className="header__para">Find your favorite movies <b className="highlight">here!</b></h2>
        </div>
        <div className="header__search row">
            <input
                id="landing-search"
                className="header__input"
                type="text"
                placeholder="Search by Movie title"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
            />
            <div className="header__btn">
                <Link to={searchTarget} className="search-btn" aria-label="Search movies">
                    <i className="fa-solid fa-magnifying-glass"></i>
                </Link>
            </div>
        </div>
      </div>
      <div className="row">
        <img src={assets.background} alt="" className="movie__background" />
      </div>
    </section>
  )
}

export default Home