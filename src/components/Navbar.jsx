import React from 'react'
import { assets } from '../assets/images/assets'
import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <div>
            <nav className="nav row">
                <figure>
                    <img src={assets.main_logo} alt="" className="personal-logo" />
                    <h2 className="personal-text">Movies</h2>
                </figure>
                <ul className="nav__link--list">
                    <li className="nav__link">
                        <Link to="/" className="nav__link--anchor link__hover-effect">Home</Link>
                    </li>
                    <li className="nav__link">
                        <Link to="/movies" className="nav__link--anchor link__hover-effect">Find Your Movie</Link>
                    </li>
                    <li className="nav__link">
                        <button
                            className="nav__link--anchor
                            link__hover-effect
                            nav__link--primary
                            no__effect
                            nav__link--mobile
                            no__click"
                        >
                            Contact
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default Navbar