import { PromotionForm } from '../../components/PromotionForm/PromotionForm';
import './AboutUs.css';

export const AboutUs = () => {
    return (
        <main className="about-us-page">
            <div className="about-us-container">
                <section className="about-us-hero">
                    <h1 className="about-us-title">About Absolute Cinema</h1>
                    <p className="about-us-subtitle">
                        Your premier destination for unforgettable movie experiences
                    </p>
                </section>

                <section className="about-us-content">
                    <div className="about-us-description">
                        <h2>Who We Are</h2>
                        <p>
                            Absolute Cinema has been bringing the magic of movies to audiences 
                            for years. We pride ourselves on providing state-of-the-art facilities, 
                            the latest blockbusters, and an unmatched viewing experience.
                        </p>
                        <p>
                            Our mission is to create memorable moments for every visitor, whether 
                            you're here for the latest Hollywood premiere or a classic film screening.
                        </p>
                    </div>

                    <div className="about-us-features">
                        <h2>What We Offer</h2>
                        <ul className="features-list">
                            <li>🎬 Latest movie releases and exclusive premieres</li>
                            <li>🎭 Premium viewing halls with cutting-edge technology</li>
                            <li>🍿 Comfortable seating and excellent amenities</li>
                            <li>🎫 Easy online booking system</li>
                            <li>🎉 Special events and screenings</li>
                        </ul>
                    </div>
                </section>

                <section className="contact-us-section" id="contact">
                    <h2 className="contact-us-title">
                        Want to place an advertisement with us?
                    </h2>
                    <div className="contact-us-group">
                        <div className="contact-us-info">
                            <p className="contact-us-text">
                                <span>Please send an offer<br />to our email:<br /></span>
                                <a href="mailto:ad@absolutecinema.com">
                                    ad@absolutecinema.com
                                </a>
                            </p>
                        </div>
                        <PromotionForm />
                    </div>
                </section>
            </div>
        </main>
    );
};
