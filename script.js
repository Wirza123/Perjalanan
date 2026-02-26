document.addEventListener('DOMContentLoaded', () => {

    // --- Config & State ---
    const config = {
        secretCode: "ISMI UMAYAH",
        transitionDuration: 1.2
    };

    let state = {
        currentLayer: 1,
        isAnimating: false,
        audioPlaying: false
    };

    // --- DOM Elements ---
    const layers = document.querySelectorAll('.layer');
    const audioBtn = document.getElementById('audio-toggle');
    const bgMusic = document.getElementById('bg-music');
    const cursor = document.querySelector('.cursor-glow');
    const nextBtns = document.querySelectorAll('[data-next]');
    const secretInput = document.getElementById('secret-code');
    const unlockBtn = document.getElementById('unlock-secret');

    // --- Audio Logic ---
    audioBtn.addEventListener('click', () => {
        if (state.audioPlaying) {
            bgMusic.pause();
            audioBtn.classList.remove('playing');
            audioBtn.querySelector('.text').textContent = "SOUND OFF";
        } else {
            bgMusic.play().then(() => {
                audioBtn.classList.add('playing');
                audioBtn.querySelector('.text').textContent = "SOUND ON";
            }).catch(e => console.log("Audio autoplay blocked", e));
        }
        state.audioPlaying = !state.audioPlaying;
    });

    // --- Custom Cursor ---
    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.2,
            ease: "power2.out"
        });
    });

    // --- Layer Transition Logic ---
    function goToLayer(nextIndex) {
        if (state.isAnimating) return;
        state.isAnimating = true;

        const currentEl = document.querySelector(`#layer-${state.currentLayer}`);
        const nextEl = document.querySelector(`#layer-${nextIndex}`);

        if (!currentEl || !nextEl) return;

        // Timeline for transition
        const tl = gsap.timeline({
            onComplete: () => {
                state.isAnimating = false;
                state.currentLayer = nextIndex;
                currentEl.classList.remove('active');

                // Post-transition triggers
                if (nextIndex === 3) initTypewriter();
                if (nextIndex === 4) gsap.to('.secret-trigger-area', { opacity: 1, delay: 3, duration: 1 });
            }
        });

        // Current Layer Exit
        tl.to(currentEl, {
            opacity: 0,
            scale: 0.95,
            filter: "blur(10px)",
            duration: config.transitionDuration,
            ease: "power2.inOut"
        });

        // Next Layer Enter
        nextEl.classList.add('active'); // Make visible for animation
        tl.fromTo(nextEl, {
            opacity: 0,
            scale: 1.05,
            filter: "blur(20px)"
        }, {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: config.transitionDuration,
            ease: "power2.out"
        }, "-=0.8"); // Overlap slightly

        // Staggered Content Animation for Next Layer
        const content = nextEl.querySelectorAll('.text-reveal, .title, .btn-cinematic, .peak-line, .peak-title');
        if (content.length > 0) {
            tl.fromTo(content, {
                y: 30,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                stagger: 0.3,
                duration: 1,
                ease: "power2.out"
            }, "-=0.5");
        }
    }

    // --- Navigation Listeners ---
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const nextIdx = parseInt(btn.dataset.next);
            goToLayer(nextIdx);
        });
    });

    // --- Typewriter Effect (Layer 3) ---
    function initTypewriter() {
        const text = "Bahaya mungkin Menanti.\nTapi aku akan Berusaha Semaksimal Mungkin Untuk Menghindarinya.";
        const el = document.getElementById('typewriter-1');
        let i = 0;
        el.innerHTML = ""; // Clear

        function type() {
            if (i < text.length) {
                el.innerHTML += text.charAt(i) === '\n' ? '<br>' : text.charAt(i);
                i++;
                setTimeout(type, 50 + Math.random() * 50); // Random typing speed
            } else {
                // Show button after typing
                gsap.to('#layer-3 .btn-cinematic', { opacity: 1, y: 0, duration: 1 });
            }
        }

        // Hide button initially just for this layer
        gsap.set('#layer-3 .btn-cinematic', { opacity: 0, y: 20 });
        setTimeout(type, 500);
    }

    // --- Secret Code Logic ---
    function checkSecret() {
        const val = secretInput.value.trim().toUpperCase();
        if (val === config.secretCode) {
            // Unlock!
            unlockBtn.textContent = "Unlocking...";
            gsap.to(secretInput, { borderColor: "#ffd700", duration: 0.3 });

            setTimeout(() => {
                goToLayer(5); // Go to secret layer
            }, 800);
        } else {
            // Shake effect
            gsap.fromTo(secretInput, { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true });
            secretInput.style.borderColor = "red";
            setTimeout(() => secretInput.style.borderColor = "rgba(255,255,255,0.2)", 1000);
        }
    }

    unlockBtn.addEventListener('click', checkSecret);
    secretInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkSecret();
    });

    // --- Initial Animation ---
    // Remove loading state
    document.body.classList.remove('loading-state');

    // Animate Layer 1 In
    const l1 = document.querySelector('#layer-1 .content-wrapper');
    gsap.from(l1, { opacity: 0, y: 50, duration: 1.5, delay: 0.5, ease: "power3.out" });

    // --- Security: Disable Right Click & Inspect ---
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    document.addEventListener('keydown', (e) => {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
            (e.ctrlKey && (e.key === 'u' || e.key === 'U'))
        ) {
            e.preventDefault();
        }
    });

});
