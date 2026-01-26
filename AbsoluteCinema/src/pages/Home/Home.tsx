import { Hero } from '../../components/Hero/Hero';
import { MovieGrid } from '../../components/MovieGrid/MovieGrid';
import { PromotionForm } from '../../components/PromotionForm/PromotionForm';
import { MOVIES } from '../../data/movies';
import './Home.css'

export const Home = () => {
    return (
        <main className='home-page'>
            <Hero />

            <div className='home-container'>
                <section className='movie-section'>
                    <h1 className='section-title'>Movie premiere</h1>
                    <MovieGrid movies={MOVIES} />
                </section>
                <section className='movie-section'>
                    <div className='section-header'>
                        <h1 className='section-title'>Watch at the cinema</h1>
                        <button className='weekly-schedule-btn'>Weekly schedule</button>
                    </div>
                    <MovieGrid movies={MOVIES} />
                </section>
                <section className='movie-section' id='coming-soon'>
                    <h1 className='section-title'>Coming soon...</h1>
                    <MovieGrid movies={MOVIES} />
                </section>
                <section className='promotion-section' id='promotion'>
                    <h1 className='section-title'>Want to place an advertisement with us?</h1>
                    <div className='promotion-group'>
                        <div className='promotion-info'>
                            <p className='promotion-text'><span>Please send an offer<br />to our email:<br /></span>
                                absolute.cinema@gmail.com
                            </p>
                            <p className='promotion-text-or'>or</p>
                        </div>
                        <PromotionForm/>
                    </div>
                </section>
            </div>
        </main>
    );
}