import { useEffect, useRef } from 'react';

function Fireworks() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = 0, height = 0, dpr = 1, rockets = [], particles = [], stars = [], lastLaunch = 0, raf;
    const colors = [28, 38, 350, 15, 48];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: Math.floor(width * height / 6500) }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        r: Math.random() * 1.5 + .3, a: Math.random() * .7 + .2, p: Math.random() * 6
      }));
    }
    function burst(x, y) {
      const hue = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 65; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.8 + .7;
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          life: 55 + Math.random() * 35, max: 90, hue, size: Math.random() * 2 + 1 });
      }
    }
    function launch() {
      rockets.push({ x: Math.random() * width * .8 + width * .1, y: height + 10,
        vx: (Math.random() - .5) * 1.3, vy: -(6 + Math.random() * 3),
        target: height * (.16 + Math.random() * .38), hue: colors[Math.floor(Math.random() * colors.length)] });
    }
    function frame(time) {
      ctx.clearRect(0, 0, width, height);
      const heroVisible = document.querySelector('.hero')?.getBoundingClientRect().bottom > 0;
      stars.forEach(star => {
        ctx.globalAlpha = star.a * (.7 + .3 * Math.sin(time * .001 + star.p));
        ctx.fillStyle = '#fff4d4'; ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (heroVisible && time - lastLaunch > 1150 + Math.random() * 700) { launch(); lastLaunch = time; }
      rockets.forEach(rocket => {
        rocket.x += rocket.vx; rocket.y += rocket.vy; rocket.vy += .035;
        ctx.fillStyle = `hsl(${rocket.hue} 100% 75%)`;
        ctx.beginPath(); ctx.arc(rocket.x, rocket.y, 2, 0, Math.PI * 2); ctx.fill();
        if (rocket.y <= rocket.target) { burst(rocket.x, rocket.y); rocket.y = -100; }
      });
      rockets = rockets.filter(rocket => rocket.y > 0);
      particles = particles.filter(particle => particle.life > 0);
      particles.forEach(particle => {
        particle.x += particle.vx; particle.y += particle.vy; particle.vy += .035;
        particle.vx *= .99; particle.life--;
        ctx.globalAlpha = Math.max(0, particle.life / particle.max);
        ctx.fillStyle = `hsl(${particle.hue} 100% ${65 + Math.random() * 15}%)`;
        ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(frame);

    const observed = new Set();
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting && !observed.has(entry.target)) {
        observed.add(entry.target);
        for (let i = 0; i < 3; i++) {
          window.setTimeout(() => burst(width * (.2 + Math.random() * .6), height * (.15 + Math.random() * .3)), i * 250);
        }
      }
    }), { threshold: .45 });
    document.querySelectorAll('.section, .finale').forEach(section => observer.observe(section));

    let pointerX = width / 2, pointerY = height / 2;
    const onPointer = event => {
      pointerX = event.clientX; pointerY = event.clientY;
      document.querySelectorAll('[data-parallax]').forEach(element => {
        const factor = Number(element.dataset.parallax);
        element.style.transform = `translate3d(${(pointerX - width / 2) * factor}px, ${(pointerY - height / 2) * factor}px, 0)`;
      });
    };
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      document.getElementById('progress').style.width = `${maxScroll > 0 ? window.scrollY / maxScroll * 100 : 0}%`;
      document.documentElement.style.setProperty('--scroll', `${window.scrollY}px`);
      document.querySelectorAll('[data-parallax]').forEach(element => {
        const rect = element.parentElement.getBoundingClientRect();
        element.style.translate = `0 ${-rect.top * .035}px`;});
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    const petals = Array.from({ length: 22 }, () => {
      const petal = document.createElement('i');
      petal.className = 'petal';
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.animationDuration = `${9 + Math.random() * 13}s`;
      petal.style.animationDelay = `${-Math.random() * 20}s`;
      petal.style.setProperty('--drift', `${Math.random() * 160 - 80}px`);
      petal.style.opacity = .25 + Math.random() * .55;
      document.body.appendChild(petal);
      return petal;
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
      petals.forEach(petal => petal.remove());
    };
  }, []);

  return <canvas id="sky" ref={canvasRef} aria-hidden="true" />;
}

function City() {
  return <div className="city" data-parallax=".045">
    <div className="building b1" /><div className="building b2" /><div className="building b3" />
    <div className="balcony left" /><div className="balcony right" />
    <div className="diyas"><div className="diya" /></div>
    <div className="diyas two"><div className="diya" /></div><div className="horizon" />
  </div>;
}

export default function App() {
  return <>
    <div className="progress" id="progress" />
    <Fireworks />
    <section className="scene hero">
      <div className="stars" />
      <div className="moon" data-parallax=".025" />
      <div className="hero-copy" data-parallax="-.035">
        <div className="eyebrow">A little festival wish · just for you</div>
        <h1>Happy<br />Diwali, Diya</h1>
        <p>Even a thousand lights feel brighter<br />when I imagine celebrating beside you.</p>
        <div className="scrollhint">SCROLL TO LIGHT UP OUR NIGHT ↓</div>
      </div>
      <City />
    </section>

    <section className="section">
      <div className="content">
        <div className="eyebrow">01 · lights, laughter & little wishes</div>
        <h2>May your world glow</h2>
        <p className="wish">May this Diwali bring you the kind of happiness that stays long after the last sparkler fades. May your days be gentle, your dreams feel closer, and may you always find a reason to smile that beautiful smile of yours. You are astronomically beautiful, Diya — genuinely the hottest Diya the world has ever seen, and somehow even more magical than all the lights in the sky.</p>
        <div className="ornament">✺ ✧ 🪔 ✧ ✺</div>
        <div className="lantern-row"><div className="lantern" /><div className="lantern" /><div className="lantern" /></div>
      </div>
    </section>

    <section className="section alt">
      <div className="content">
        <div className="eyebrow">02 · one wish, every year</div>
        <h2>Not just this Diwali.</h2>
        <p className="wish">I keep thinking about all the festivals still waiting for us. Diwalis with rows of little diyas, Holis with colours everywhere, Christmas lights, New Year countdowns, and all the ordinary evenings in between.</p>
        <p className="wish"><strong>I want the togetherness in all of it.</strong> Different seasons, changing traditions — but the same two people making new memories together, year after year.</p>
        <div className="ornament">❀ ❀ ❀</div>
      </div>
    </section>

    <section className="section">
      <div className="content letter-wrap">
        <div className="eyebrow letter-eyebrow">A note from your favourite person</div>
        <h2>To my beautiful Diya ❤️</h2>
        <p>Happy Diwali, my love. 🪔❤️</p>
        <p>I can already picture us celebrating together — lighting diyas, watching the sky burst into colours, stealing sweets from the box, and probably annoying you with a hundred pictures of the decorations. I am so excited for all the little moments we are going to make tonight.</p>
        <p>And while we celebrate together, I hope you know that the best part of every festival will always be having <strong>you</strong> there. When I think about Diwali, I don't just picture the lights or the celebrations. I picture your smile, your laughter, and all the little things that make every moment with you special.</p>
        <p>You are my favourite kind of magic — the kind that makes an ordinary evening feel special. I hope you never forget just how stunning, rare, and wonderfully you you are. I am ridiculously lucky to celebrate you, too.</p>
        <p>I want this to be one of many Diwalis we celebrate together. I want the messy rangolis, the late-night sweets, the family chaos, the tiny traditions that become ours, and all the festivals we haven't even imagined yet.</p>
        <p>Here's to growing together, making a home feel warmer, collecting memories in every season, and choosing each other through all the years ahead. May we never run out of reasons to celebrate — or reasons to be grateful that we have each other.</p>
        <p><strong>Happy Diwali, my favourite baddie. May every light remind you that you are loved, today and on all the days that follow.</strong></p>
        <p className="sign">Forever your Nirmal 🫶🏻❤️</p>
      </div>
    </section>

    <section className="finale">
      <div className="content">
        <div className="eyebrow">03 · until all the lights go out — and after</div>
        <h2>Every festival.<br />Every year.<br />Us.</h2>
        <p>One sky, a million lights, and my favourite person.</p>
        <div className="ornament">🪔 ✨ ❤️ ✨ 🪔</div>
