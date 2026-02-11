const addExerciseBtn = document.querySelector("#addExerciseBtn");
const popupContainer = document.querySelector(".popup-container");
const closePopupBtn = document.querySelector(".closeBtn");

const exerciseName = document.querySelector("#exercise-name");
const exerciseCount = document.querySelector("#exercise-count");
const addExercise = document.querySelector(".popup .add");

const activityList = document.querySelector(".activity-list");
const dayContainer = document.querySelector(".day-caroussel");

let data = {};
let currentDay = null;
let editIndex = null;

// =======================
// Storage
// =======================
function saveData() {
    localStorage.setItem("exerciseData", JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem("exerciseData");
    if (saved) {
        data = JSON.parse(saved);
    }
}

// =======================
// Generate Days (90 Tage)
// =======================
function generateDays(amount = 90) {
    dayContainer.innerHTML = "";

    const today = new Date();

    for (let i = amount - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);

        const key = date.toISOString().split("T")[0];

        const day = document.createElement("div");
        day.classList.add("day");
        day.textContent = date.getDate();

        day.addEventListener("click", () => {
            selectDay(key, day);
        });

        dayContainer.appendChild(day);

        // Heute automatisch auswählen
        if (i === 0) {
            selectDay(key, day);
            day.scrollIntoView({ behavior: "smooth", inline: "center" });
        }
    }
}

let startX = 0;
let endX = 0;

dayContainer.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
});

dayContainer.addEventListener("touchend", e => {
    endX = e.changedTouches[0].clientX;
    handleSwipe();
});

// Maus Support (Desktop)
dayContainer.addEventListener("mousedown", e => {
    startX = e.clientX;
});

dayContainer.addEventListener("mouseup", e => {
    endX = e.clientX;
    handleSwipe();
});

function handleSwipe() {
    const threshold = 50; // minimale Swipe-Distanz
    const diff = endX - startX;

    if (Math.abs(diff) < threshold) return;

    const days = document.querySelectorAll(".day");
    const selected = document.querySelector(".day.selected");

    if (!selected) return;

    const index = Array.from(days).indexOf(selected);

    if (diff < 0 && index < days.length - 1) {
        // Swipe nach links → nächster Tag
        days[index + 1].click();
        days[index + 1].scrollIntoView({ behavior: "smooth", inline: "center" });
    }

    if (diff > 0 && index > 0) {
        // Swipe nach rechts → vorheriger Tag
        days[index - 1].click();
        days[index - 1].scrollIntoView({ behavior: "smooth", inline: "center" });
    }
}


// =======================
// Day Selection
// =======================
function selectDay(key, element) {
    document.querySelectorAll(".day").forEach(d =>
        d.classList.remove("selected")
    );

    element.classList.add("selected");
    currentDay = key;

    if (!data[currentDay]) {
        data[currentDay] = [];
    }

    renderExercises();
}

// =======================
// Render
// =======================
function renderExercises() {
    activityList.innerHTML = "";

    if (!currentDay) return;

    data[currentDay].forEach((exercise, index) => {
        const activity = document.createElement("div");
        activity.classList.add("activity");

        const name = document.createElement("h2");
        name.textContent = exercise.name;

        const count = document.createElement("button");
        count.textContent = exercise.count;

        count.addEventListener("click", () => {
            editIndex = index;
            exerciseName.value = exercise.name;
            exerciseCount.value = exercise.count;
            popupContainer.classList.add("visible");
        });

        activity.appendChild(name);
        activity.appendChild(count);
        activityList.appendChild(activity);
    });
}

// =======================
// Popup
// =======================
addExerciseBtn.addEventListener("click", () => {
    if (!currentDay) return;
    editIndex = null;
    popupContainer.classList.add("visible");
});

closePopupBtn.addEventListener("click", () => {
    popupContainer.classList.remove("visible");
});

// =======================
// Add / Edit
// =======================
addExercise.addEventListener("click", () => {

    if (!currentDay) return;

    const name = exerciseName.value.trim();
    const count = parseInt(exerciseCount.value);

    if (!name || isNaN(count)) return;

    if (editIndex !== null) {
        data[currentDay][editIndex] = { name, count };
    } else {
        data[currentDay].push({ name, count });
    }

    saveData();
    renderExercises();

    exerciseName.value = "";
    exerciseCount.value = "";
    popupContainer.classList.remove("visible");
});

// =======================
// Init
// =======================
loadData();
generateDays(120);

// =======================
// Service Worker
// =======================
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js")
            .then(() => console.log("Service Worker registriert"))
            .catch(err => console.log("SW Fehler:", err));
    });
}
