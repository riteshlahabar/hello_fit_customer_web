import Image from 'next/image';
import { HeroSearch } from '@/components/HeroSearch';
import { TrainerCard } from '@/components/TrainerCard';
import {
  aboutPoints,
  categories,
  heroAvatars,
  steps,
  testimonials,
  trainers,
  trustItems,
} from '@/data/home';

export default function Home() {
  return (
    <main id="home">
      {/* Hero ------------------------------------------------------------------ */}
      <section className="hero hero-banner">
        <div className="hero-banner-image" aria-hidden="true" />
        <div className="hero-banner-overlay" />

        <div className="container hero-banner-content">
          <div className="hero-copy-wrap">
            <div className="eyebrow">Fitness that fits your life</div>
            <h1>
              Your goals.
              <br />
              Your space.
              <br />
              <em>Your HelloFit.</em>
            </h1>
            <p className="hero-copy">
              Meet the right fitness professional for your goals, your routine, and your
              space. From personal training to yoga, make every session work for you.
            </p>

            <div className="hero-buttons">
              <a className="btn btn-primary" href="#search">
                Find your trainer <span>↗</span>
              </a>
              <a className="btn btn-light" href="#categories">
                <span>▶</span> Explore fitness
              </a>
            </div>

            <div className="micro-proof">
              <div className="avatar-stack">
                {heroAvatars.map((src) => (
                  <Image key={src} src={src} alt="" width={30} height={30} />
                ))}
              </div>
              <div>
                <div className="stars">★★★★★</div>
                <span>Built around your time and your place</span>
              </div>
            </div>
          </div>

          <div className="hero-banner-side-note">
            <span className="banner-kicker">YOUR TIME, YOUR PLACE</span>
            <strong>
              Move better.
              <br />
              Feel stronger.
            </strong>
            <span>Find a fitness professional who fits your lifestyle.</span>
          </div>
        </div>

        <HeroSearch />
      </section>

      {/* Trust strip ---------------------------------------------------------- */}
      <div className="trust-strip">
        <div className="container trust-grid">
          {trustItems.map((item) => (
            <div className="trust-item" key={item.title}>
              <div className="trust-icon">{item.icon}</div>
              <div>
                <strong>{item.title}</strong>
                <span>{item.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About ---------------------------------------------------------------- */}
      <section className="about-section" id="about-hellofit">
        <div className="container about-grid">
          <div className="about-visual">
            <Image
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=85"
              alt="Person building a healthy fitness routine"
              width={1000}
              height={1000}
            />
            <div className="about-stamp">
              <strong>
                Your time.
                <br />
                Your place.
              </strong>
              Fitness that works around you.
            </div>
          </div>

          <div className="about-copy">
            <div className="eyebrow">A little about HelloFit</div>
            <h2>
              Fitness should fit <span style={{ color: 'var(--orange)' }}>your life.</span>
            </h2>
            <p>
              HelloFit helps you discover fitness professionals and services that match your
              goals, preferences, and routine. Whether you&rsquo;re beginning your fitness
              journey or building on the progress you&rsquo;ve made, find options that work
              for you.
            </p>
            <p>
              From personal training to yoga and mobility, our goal is to make finding and
              booking a session feel simple, clear, and convenient.
            </p>

            <div className="about-points">
              {aboutPoints.map((point) => (
                <div className="about-point" key={point.label}>
                  <span>{point.icon}</span>
                  <div>{point.label}</div>
                </div>
              ))}
            </div>

            <a className="btn btn-primary" href="#search">
              Discover HelloFit <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* Categories ----------------------------------------------------------- */}
      <section id="categories">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Find your kind of movement</div>
              <h2>
                One goal. So many ways
                <br />
                to get there.
              </h2>
            </div>
            <p>
              Start with what you love, or try something new. Explore fitness services and
              find the professional who fits your goals.
            </p>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <a className="category-card" href="#search" key={category.title}>
                <Image
                  src={category.image}
                  alt={category.alt}
                  fill
                  sizes="(max-width:950px) 50vw, 25vw"
                />
                <span className="category-number">{category.number}</span>
                <div className="category-content">
                  <h3>{category.title}</h3>
                  <p>{category.blurb}</p>
                </div>
                <span className="circle-arrow">↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured trainers ---------------------------------------------------- */}
      <section className="featured" id="trainers">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">A great place to start</div>
              <h2>
                Meet your next
                <br />
                fitness favourite.
              </h2>
            </div>
            <p>
              Explore a few sample profiles to see how you&rsquo;ll discover fitness
              professionals. Real provider listings will be connected to the HelloFit
              backend.
            </p>
            <a className="text-link" href="#search">
              Explore all trainers ↗
            </a>
          </div>

          <div className="trainer-grid">
            {trainers.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </div>

          <p style={{ fontSize: 10, color: '#898178', margin: '18px 0 0' }}>
            *Trainer names, ratings, and prices are illustrative prototype content, not live
            listings.
          </p>
        </div>
      </section>

      {/* How it works --------------------------------------------------------- */}
      <section id="how">
        <div className="container how-grid">
          <div className="how-visual">
            <Image
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85"
              alt="Person working towards their fitness goals"
              fill
              sizes="(max-width:950px) 100vw, 40vw"
            />
            <div className="visual-note">
              <strong>
                Your time.
                <br />
                Your place.
              </strong>
              <span>Fitness that works around you.</span>
            </div>
          </div>

          <div>
            <div className="eyebrow">Simple from the start</div>
            <h2
              style={{
                fontFamily: "'Anton',sans-serif",
                fontSize: 'clamp(38px,4.4vw,54px)',
                fontWeight: 400,
                lineHeight: 1.08,
                textTransform: 'uppercase',
                margin: '14px 0 0',
              }}
            >
              Your next step
              <br />
              is a few clicks away.
            </h2>
            <p
              style={{
                color: 'var(--muted)',
                fontSize: 12,
                marginTop: 15,
                maxWidth: 450,
              }}
            >
              Finding fitness support should feel easy. HelloFit is designed to help you go
              from exploring to booking with clarity.
            </p>

            <div className="steps">
              {steps.map((step) => (
                <div className="step" key={step.no}>
                  <div className="step-no">{step.no}</div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote band ----------------------------------------------------------- */}
      <section className="quote-band" id="about">
        <div className="container">
          <div className="quote-box">
            <div>
              <h2>Make space for the stronger, healthier you.</h2>
              <p>Start with one session. Build a routine that feels like yours.</p>
            </div>
            <a className="btn" href="#search">
              Find your HelloFit ↗
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials --------------------------------------------------------- */}
      <section className="testimonials" id="testimonials">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Real stories, real motivation</div>
              <h2>
                What our clients
                <br />
                <span style={{ color: 'var(--orange)' }}>say about HelloFit.</span>
              </h2>
            </div>
            <p>
              Every fitness journey is personal. Here&rsquo;s the kind of experience we want
              every HelloFit customer to have.
            </p>
          </div>

          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <article className="testimonial-card" key={testimonial.name}>
                <div className="testimonial-stars">★★★★★</div>
                <p>&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="testimonial-person">
                  <Image
                    src={testimonial.image}
                    alt="Customer portrait"
                    width={46}
                    height={46}
                  />
                  <div>
                    <strong>{testimonial.name}</strong>
                    <small>{testimonial.role}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p style={{ fontSize: 10, color: '#8b8178', margin: '18px 0 0' }}>
            Note: These are placeholder testimonial examples for the design prototype.
            Replace them with approved customer feedback before launch.
          </p>
        </div>
      </section>
    </main>
  );
}
