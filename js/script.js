const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const bgOrb = document.querySelector(".bg-orb");

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    body.classList.add("dark");
}

updateThemeButton();

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark");

        const currentTheme = body.classList.contains("dark") ? "dark" : "light";
        localStorage.setItem("theme", currentTheme);

        updateThemeButton();
    });
}

function updateThemeButton() {
    if (!themeToggle) return;

    themeToggle.textContent = body.classList.contains("dark")
        ? "Light Mode"
        : "Dark Mode";
}

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("show");
    });
}

window.addEventListener("scroll", () => {
    if (!bgOrb) return;

    const scrollY = window.scrollY;
    bgOrb.style.transform = `translateY(${scrollY * 0.12}px) scale(1.08)`;
});

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {
        item.classList.toggle("open");

        const symbol = question.querySelector("span");
        symbol.textContent = item.classList.contains("open") ? "−" : "+";
    });
});

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("name");
        const email = document.getElementById("email");
        const interest = document.getElementById("interest");
        const message = document.getElementById("message");
        const formSuccess = document.getElementById("formSuccess");

        let isValid = true;

        clearError(name);
        clearError(email);
        clearError(interest);
        clearError(message);

        if (name.value.trim() === "") {
            showError(name, "Name is required.");
            isValid = false;
        }

        if (email.value.trim() === "") {
            showError(email, "Email is required.");
            isValid = false;
        } else if (!isValidEmail(email.value.trim())) {
            showError(email, "Enter a valid email address.");
            isValid = false;
        }

        if (interest.value === "") {
            showError(interest, "Please select a project interest.");
            isValid = false;
        }

        if (message.value.trim() === "") {
            showError(message, "Message is required.");
            isValid = false;
        }

        if (isValid) {
            formSuccess.textContent =
                "Thank you! Your message has been received.";

            contactForm.reset();
        } else {
            formSuccess.textContent = "";
        }
    });
}

function showError(input, message) {
    const formGroup = input.parentElement;
    const errorMessage = formGroup.querySelector(".error-message");

    errorMessage.textContent = message;
}

function clearError(input) {
    const formGroup = input.parentElement;
    const errorMessage = formGroup.querySelector(".error-message");

    errorMessage.textContent = "";
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function loadGLBModel() {
    const container = document.getElementById("model-container");

    if (
        !container ||
        typeof THREE === "undefined" ||
        typeof THREE.GLTFLoader === "undefined"
    ) {
        return;
    }

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        10000
    );

    camera.position.set(0, 0.8, 7);

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const cyanLight = new THREE.DirectionalLight(0x00e5ff, 1.4);
    cyanLight.position.set(-4, 2, 4);
    scene.add(cyanLight);

    const orangeLight = new THREE.PointLight(0xff7a18, 1.2, 8);
    orangeLight.position.set(2, -2, 3);
    scene.add(orangeLight);

    let model;

    const loader = new THREE.GLTFLoader();

    loader.load(
        "./assets/models/esp32.glb",

        (gltf) => {
            model = gltf.scene;

            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.metalness = 0.25;
                    child.material.roughness = 0.38;

                    if (child.material.color) {
                        child.material.color.offsetHSL(0, 0.18, -0.05);
                    }

                    child.material.needsUpdate = true;
                }
            });

            const box = new THREE.Box3().setFromObject(model);
            const size = new THREE.Vector3();
            const center = new THREE.Vector3();

            box.getSize(size);
            box.getCenter(center);

            model.position.x -= center.x;
            model.position.y -= center.y;
            model.position.z -= center.z;

            const maxDimension = Math.max(size.x, size.y, size.z);
            const scale = 4 / maxDimension;

            model.scale.setScalar(scale);
            model.rotation.x = -0.35;
            model.rotation.z = 0.15;

            scene.add(model);
        },

        undefined,

        (error) => {
            console.error("GLB model failed to load:", error);
        }
    );

    function animate() {
        requestAnimationFrame(animate);

        if (model) {
            model.rotation.y += 0.008;
            model.position.y = Math.sin(Date.now() * 0.0014) * 0.15;
        }

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("resize", () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

loadGLBModel();

const sensorItems = document.querySelectorAll(".sensor-item");

sensorItems.forEach((sensor) => {
    sensor.addEventListener("click", () => {
        const parentCard = sensor.closest(".content-card");
        const preview = parentCard.querySelector(".sensor-preview");

        const image = preview.querySelector("img");
        const title = preview.querySelector("h4");
        const link = preview.querySelector("a");

        image.src = sensor.dataset.image;
        image.alt = sensor.dataset.name;
        title.textContent = sensor.dataset.name;
        link.href = sensor.dataset.link;
    });
});