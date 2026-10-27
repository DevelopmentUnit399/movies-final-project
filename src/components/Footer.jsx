import React from 'react'
import { assets } from '../assets/images/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <div className="footer">
            <div className="row footer__row">
                <figure>
                    <img src={assets.main_logo} alt="" className="footer__logo--img" />
                    <h2 className="personal-text">Movies</h2>
                </figure>

                <div className="footer__nav">
                    <div className="footer__nav--list">
                        <Link to="/" className="nav__link--anchor link__hover-effect">
                            Home
                        </Link>
                    </div>
                    <div className="footer__nav--list">
                        <Link to="/movies" className="nav__link--anchor link__hover-effect">
                            Find Your Movie
                        </Link>
                    </div>
                    <div className="footer__nav--list">
                        <button
                            className="nav__link--anchor
                        link__hover-effect
                        nav__link--primary
                        footer__nav--primary
                        no__click"
                        >
                            Contact
                        </button>
                    </div>
                </div>

                <div className="footer__copyright">
                    Copyright © 2026 Garrett Uichanco
                </div>
            </div>
        </div>
    )
}

export default Footer