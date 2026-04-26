// Theme Toggle
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const icon = themeToggleBtn.querySelector('i');

// Check local storage for theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark');
    icon.classList.replace('fa-moon', 'fa-sun');
}

themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark');
    if (body.classList.contains('dark')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    }
});

// Navigation
function goToPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

document.getElementById('start-btn').addEventListener('click', () => {
    goToPage('form-page');
});

let currentUsername = "";

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUsername = document.getElementById('username').value;
        const greetingEl = document.getElementById('user-greeting');
        if (greetingEl) greetingEl.innerText = "Hello, " + currentUsername;
        goToPage('form-page');
    });
}

// Reset Form
function resetForm() {
    const predictionForm = document.getElementById('prediction-form');
    if (predictionForm) predictionForm.reset();

    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.reset();
}

// Logout function
function logout() {
    currentUsername = "";
    const greetingEl = document.getElementById('user-greeting');
    if (greetingEl) greetingEl.innerText = "";
    resetForm();
    goToPage('login-page');
}

// Form Submission
document.getElementById('prediction-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Get values
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const hb = parseFloat(document.getElementById('hemoglobin').value);
    const rbc = parseFloat(document.getElementById('rbc').value);
    const hct = parseFloat(document.getElementById('hematocrit').value);
    const mcv = parseFloat(document.getElementById('mcv').value);
    const mch = parseFloat(document.getElementById('mch').value);
    const mchc = parseFloat(document.getElementById('mchc').value);

    // Simulate Loading
    goToPage('loading-page');
    simulateLoading(() => {
        analyzeResults(age, gender, hb, mcv);
        goToPage('result-page');
    });
});

function simulateLoading(callback) {
    const progressBar = document.getElementById('loading-progress');
    const loadingText = document.getElementById('loading-text');
    let progress = 0;

    const steps = [
        "Analyzing Hemoglobin levels...",
        "Evaluating RBC count...",
        "Calculating MCV & MCH...",
        "Determining Anemia risk..."
    ];

    const interval = setInterval(() => {
        progress += 5;
        progressBar.style.width = `${progress}%`;

        if (progress === 25) loadingText.innerText = steps[1];
        if (progress === 50) loadingText.innerText = steps[2];
        if (progress === 75) loadingText.innerText = steps[3];

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(callback, 500);
        }
    }, 100);
}

function analyzeResults(age, gender, hb, mcv) {
    let hasAnemia = false;
    let severity = 'Normal';
    let type = 'N/A';

    // Hemoglobin logic
    let normalHb = 12.0;
    if (age < 12) {
        normalHb = 11.5; // lower threshold for children
    } else if (gender === 'male') {
        normalHb = 13.0; // male adult threshold
    }

    if (hb < normalHb) {
        hasAnemia = true;

        // Severity logic (approximate)
        if (hb >= 10.0) {
            severity = 'Low Risk';
        } else if (hb >= 7.0) {
            severity = 'Medium Risk';
        } else {
            severity = 'High Risk';
        }

        // Type logic
        if (mcv < 80) {
            type = 'Microcytic (Iron Deficient)';
        } else if (mcv > 100) {
            type = 'Macrocytic (B12/Folate Deficient)';
        } else {
            type = 'Normocytic (Chronic/Recent)';
        }
    }

    updateUI(hasAnemia, severity, type, hb, mcv, normalHb);

    // Save to Database
    const rbc = parseFloat(document.getElementById('rbc').value);
    const hct = parseFloat(document.getElementById('hematocrit').value);
    const mch = parseFloat(document.getElementById('mch').value);
    const mchc = parseFloat(document.getElementById('mchc').value);

    const payload = {
        username: currentUsername,
        age: age,
        gender: gender,
        hemoglobin: hb,
        rbc: rbc,
        hematocrit: hct,
        mcv: mcv,
        mch: mch,
        mchc: mchc,
        hasAnemia: hasAnemia,
        riskLevel: severity,
        anemiaType: type
    };

    fetch('http://localhost:3000/api/save-result', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => console.log('Saved to DB:', data))
        .catch(error => console.error('Error saving to DB:', error));
}

function updateUI(hasAnemia, severity, type, hb, mcv, normalHb) {
    const statusCard = document.getElementById('main-status-card');
    const statusIcon = document.getElementById('status-icon');
    const anemiaStatus = document.getElementById('anemia-status');
    const statusDesc = document.getElementById('status-desc');

    const severityBadge = document.getElementById('severity-badge');
    const typeBadge = document.getElementById('type-badge');

    // Reset classes
    statusCard.className = 'status-card';
    severityBadge.className = 'severity-badge';
    typeBadge.className = 'type-badge';

    if (hasAnemia) {
        let severityClass = severity === 'High Risk' ? 'danger' : (severity === 'Medium Risk' ? 'warning' : 'warning');
        let bgClass = severity === 'High Risk' ? 'bg-danger' : (severity === 'Medium Risk' ? 'bg-warning' : 'bg-warning');

        statusCard.classList.add(severityClass);
        anemiaStatus.innerText = 'Anemia Detected';
        statusDesc.innerText = `Hemoglobin is below the normal limit of ${normalHb} g/dL.`;

        severityBadge.innerText = severity;
        severityBadge.classList.add(bgClass);

        typeBadge.innerText = type;
        typeBadge.classList.add('bg-danger'); // just a red/warning badge
    } else {
        statusCard.classList.add('success');
        anemiaStatus.innerText = 'No Anemia Detected';
        statusDesc.innerText = 'Your hemoglobin levels are within the normal range.';

        severityBadge.innerText = 'Normal';
        severityBadge.classList.add('bg-success');

        typeBadge.innerText = 'N/A';
        typeBadge.classList.add('bg-neutral');
    }

    // Update Metrics
    document.getElementById('res-hb-val').innerText = `${hb} g/dL`;
    document.getElementById('res-mcv-val').innerText = `${mcv} fL`;

    // Hb Bar (Max roughly 20)
    const hbPercent = Math.min((hb / 20) * 100, 100);
    const hbBar = document.getElementById('hb-bar');
    // small delay for animation
    setTimeout(() => {
        hbBar.style.width = `${hbPercent}%`;
        hbBar.style.backgroundColor = hasAnemia ? (severity === 'High Risk' ? 'var(--danger)' : 'var(--warning)') : 'var(--success)';
    }, 100);

    // MCV Bar (Normal 80-100, max roughly 120)
    const mcvPercent = Math.min((mcv / 120) * 100, 100);
    const mcvBar = document.getElementById('mcv-bar');
    setTimeout(() => {
        mcvBar.style.width = `${mcvPercent}%`;
        if (mcv < 80 || mcv > 100) {
            mcvBar.style.backgroundColor = 'var(--warning)';
        } else {
            mcvBar.style.backgroundColor = 'var(--success)';
        }
    }, 100);
}
