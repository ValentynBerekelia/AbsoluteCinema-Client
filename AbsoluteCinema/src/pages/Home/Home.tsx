import { Hero } from '../../components/Hero/Hero';
import { MovieGrid } from '../../components/MovieGrid/MovieGrid';
import { HERO_MOVIES } from '../../data/movies';
import './Home.css'

export const Home = () => {
    return (
        <main className='home-page'>
            <Hero />

            <div className='home-container'>
                <section className='movie-section'>
                    <h1 className='section-title'>Movie premiere</h1>
                    <MovieGrid movies={HERO_MOVIES} />
                </section>
                <section className='movie-section'>
                    <div className='section-header'>
                        <h1 className='section-title'>Watch at the cinema</h1>
                        <button className='weekly-schedule-btn'>Weekly schedule</button>
                    </div>
                    <MovieGrid movies={HERO_MOVIES} />
                </section>
                <section className='movie-section'>
                    <h1 className='section-title'>Coming soon...</h1>
<<<<<<< HEAD
                    <MovieGrid movies={HERO_MOVIES}/>
=======
                    <MovieGrid movies={HERO_MOVIES} />
>>>>>>> 834622b22331f6651be5c585bed5baa69c9beb5a
                </section>
                <section className='promotion-section'>
                    <h1 className='section-title'>Want to place an advertisement with us?</h1>
                    <div className='promotion-group'>
                        <div className='promotion-info'>
<<<<<<< HEAD
                            <p className='promotion-text'><span>Please send an offer<br/>to our email:<br/></span>
=======
                            <p className='promotion-text'><span>Please send an offer<br />to our email:<br /></span>
>>>>>>> 834622b22331f6651be5c585bed5baa69c9beb5a
                                absolute.cinema@gmail.com
                            </p>
                            <p className='promotion-text-or'>or</p>
                        </div>
                        <form className='promotion-form'>
                            <textarea
                                className='promotion-textarea'
                                placeholder='Enter your message here...'
                            ></textarea>
<<<<<<< HEAD
                            <button type="submit" className='promotion-submit-btn'>Send message</button>
=======
                            <div className="promotion-form-footer">
                                <button type="submit" className="promotion-submit-btn">
                                    Send message
                                </button>
                            </div>
>>>>>>> 834622b22331f6651be5c585bed5baa69c9beb5a
                        </form>
                    </div>
                </section>
            </div>
        </main>
    );
}