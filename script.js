// script.js - cleaned & fixed

// -----------------------------
// Open Features (panels) logic
// -----------------------------
function OpenFetures() {
  const allElements = Array.from(document.querySelectorAll(".elems"));
  const fullElements = Array.from(document.querySelectorAll(".fullElem"));
  const backBtns = Array.from(document.querySelectorAll(".fullElem .back"));
  const allfeatures = document.querySelector(".allFeatures");

  // helper to open a particular index
  function openIndex(idx) {
    // hide all fullElems first
    fullElements.forEach((el) => (el.style.display = "none"));
    if (typeof fullElements[idx] !== "undefined") {
      fullElements[idx].style.display = "block";
      document.body.classList.add("panel-open"); // disables body scroll (CSS already has panel-open rule)
      if (allfeatures) allfeatures.style.display = "none";
    }
  }

  // helper to close (restore)
  function closeIndex(idx) {
    if (typeof fullElements[idx] !== "undefined") {
      fullElements[idx].style.display = "none";
    }
    // if no other panel is visible, remove panel-open and restore features
    const someVisible = fullElements.some((el) => el.style.display === "block");
    if (!someVisible) {
      document.body.classList.remove("panel-open");
      if (allfeatures) allfeatures.style.display = "";
    }
  }

  allElements.forEach((elem) => {
    elem.addEventListener("click", () => {
      // elem.id in your markup are "0","1",... safe to coerce to number
      const idx = Number(elem.id);
      if (!isNaN(idx)) openIndex(idx);
    });
  });

  backBtns.forEach((back) => {
    back.addEventListener("click", () => {
      const idx = Number(back.id);
      if (!isNaN(idx)) closeIndex(idx);
      else {
        // fallback: close parent panel
        const panel = back.closest(".fullElem");
        if (panel) panel.style.display = "none";
        const someVisible = fullElements.some((el) => el.style.display === "block");
        if (!someVisible) {
          document.body.classList.remove("panel-open");
          if (allfeatures) allfeatures.style.display = "";
        }
      }
    });
  });
}
OpenFetures();


// -------------------------------------------------------------
// ToDo List Script (fixed important vs completed, safer DOM)
// -------------------------------------------------------------
function todoList() {
  const addTodosForm = document.querySelector(".addTodos form");
  const addTodosFormInput = document.querySelector(".addTodos form #userValue");
  const addTodosFormTextarea = document.querySelector(".addTodos form textarea");
  const addTodosFormCheckbox = document.querySelector(".addTodos form #checkbox");
  const AllTaskSection = document.querySelector(".allTodos");

  // bail early if there's no task container and no form
  if (!AllTaskSection && !addTodosForm) return;

  let allTasks = [];
  if (localStorage.getItem("CurrentTask")) {
    try {
      allTasks = JSON.parse(localStorage.getItem("CurrentTask")) || [];
    } catch (err) {
      allTasks = [];
    }
  }

  function showNoDataMessage() {
    if (!AllTaskSection) return false;
    if (allTasks.length === 0) {
      AllTaskSection.innerHTML = `<p class="no-data">No Data to Display</p>`;
      return true;
    }
    return false;
  }

  function renderTasks() {
    if (!AllTaskSection) return;
    // persist current state
    localStorage.setItem("CurrentTask", JSON.stringify(allTasks));

    // if no tasks, show message and exit
    if (showNoDataMessage()) return;

    let taskHTML = "";
    allTasks.forEach((element, index) => {
      // element.completed -> whether task is completed (used by markCompleted)
      // element.important -> whether user marked it important on creation
      const titleClass = element.completed ? "todoTitle completed" : "todoTitle";
      const btnText = element.completed ? "Undo" : "Mark As Completed";
      const impClass = element.important ? "imp" : "";

      taskHTML += `<div class="task" data-index="${index}">
        <h5 class="${titleClass}">${element.task}<span class="${impClass}">imp</span></h5>
        <button class="markCompleted">${btnText}</button>
        <button class="delete">Delete</button>
      </div>`;
    });

    AllTaskSection.innerHTML = taskHTML;
  }

  // initial render
  renderTasks();

  // add task
  if (addTodosForm && addTodosFormInput && addTodosFormTextarea) {
    addTodosForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const taskVal = addTodosFormInput.value.trim();
      const detailsVal = addTodosFormTextarea.value.trim();

      if (taskVal.length === 0 || detailsVal.length === 0) {
        alert("Task And Details Both Are Mandatory !");
        return;
      }

      allTasks.push({
        task: taskVal,
        details: detailsVal,
        important: !!(addTodosFormCheckbox && addTodosFormCheckbox.checked),
        completed: false, // default false; completed toggled later
      });

      // persist and reset
      localStorage.setItem("CurrentTask", JSON.stringify(allTasks));
      if (addTodosFormCheckbox) addTodosFormCheckbox.checked = false;
      addTodosFormInput.value = "";
      addTodosFormTextarea.value = "";
      renderTasks();
    });
  }

  // event delegation for delete and markCompleted
  if (AllTaskSection) {
    AllTaskSection.addEventListener("click", function (e) {
      const target = e.target;
      const taskEl = target.closest(".task");
      if (!taskEl) return;
      const index = Number(taskEl.dataset.index);

      // delete
      if (target.classList.contains("delete")) {
        if (!isNaN(index)) {
          allTasks.splice(index, 1);
          localStorage.setItem("CurrentTask", JSON.stringify(allTasks));
          renderTasks();
        }
        return;
      }

      // mark as completed / undo
      if (target.classList.contains("markCompleted")) {
        if (!isNaN(index) && allTasks[index]) {
          allTasks[index].completed = !allTasks[index].completed;
          localStorage.setItem("CurrentTask", JSON.stringify(allTasks));
          renderTasks();
        }
        return;
      }
    });
  }
}
todoList();


// -------------------------------------------------------------
// Day Planner (guarded, 24-hr TTL handling kept)
// -------------------------------------------------------------
function dayPlans() {
  const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  // load and normalize stored data
  let raw = localStorage.getItem("dayPlans");
  let dayPlans = {};
  try {
    dayPlans = raw ? JSON.parse(raw) : {};
  } catch (e) {
    dayPlans = {};
  }

  const now = Date.now();
  Object.keys(dayPlans).forEach((key) => {
    const entry = dayPlans[key];

    if (entry === null || typeof entry === "string") {
      dayPlans[key] = { value: String(entry || ""), ts: now };
      return;
    }

    if (typeof entry === "object" && entry !== null) {
      const ts = Number(entry.ts) || 0;
      if (now - ts > TTL_MS) {
        delete dayPlans[key];
      }
      return;
    }
    delete dayPlans[key];
  });

  localStorage.setItem("dayPlans", JSON.stringify(dayPlans));

  const dayPlanner = document.querySelector(".dayPlanner");
  if (!dayPlanner) return; // guard: exit if no planner on page

  let hours = Array.from({ length: 18 }, function (elem, index) {
    const startHour = 6 + index;
    const endHour = 7 + index;

    const formatHour = (hour) => {
      const period = hour >= 12 ? "PM" : "AM";
      const formatted = hour > 12 ? hour - 12 : hour;
      return `${formatted}:00 ${period}`;
    };

    return `${formatHour(startHour)} - ${formatHour(endHour)}`;
  });

  let wholeDailyPlan = "";

  hours.forEach((element, index) => {
    const savedEntry = dayPlans[index];
    const savedPlans = savedEntry && savedEntry.value ? savedEntry.value : "";
    wholeDailyPlan += `
      <div class="dayPlanner-time">
        <p>${element}</p>
        <input id="${index}" type="text" placeholder="...." value="${String(savedPlans).replace(/"/g, "&quot;")}">
      </div>
    `;
  });

  dayPlanner.innerHTML = wholeDailyPlan;

  const dailyPlannerInputs = document.querySelectorAll(".dayPlanner input");
  dailyPlannerInputs.forEach((element) => {
    element.addEventListener("input", () => {
      const id = element.id;
      dayPlans[id] = { value: element.value, ts: Date.now() };
      localStorage.setItem("dayPlans", JSON.stringify(dayPlans));
    });
  });
}
dayPlans();


// -------------------------------------------------------------
// Motivation Quotes (simple fetch, guarded)
// -------------------------------------------------------------
function motivationQuoteContent() {
  const motivationQuotes = document.querySelector(".motivation-2 p");
  const motivationQuotesAuthor = document.querySelector(".motivation-3 h2");
  if (!motivationQuotes || !motivationQuotesAuthor) return;

  async function fetchMotivationQuote() {
    try {
      let response = await fetch("https://quotes-api-self.vercel.app/quote");
      if (!response.ok) throw new Error("Quote fetch failed");
      const data = await response.json();
      motivationQuotes.innerHTML = data.quote || "Stay motivated!";
      motivationQuotesAuthor.innerHTML = data.author ? `- ${data.author}` : "";
    } catch (err) {
      console.warn("Quote fetch failed:", err);
      motivationQuotes.innerHTML = "Stay motivated!";
      motivationQuotesAuthor.innerHTML = "";
    }
  }
  fetchMotivationQuote();
}
motivationQuoteContent();


// -------------------------------------------------------------
// Pomodoro Timer (defensive)
// -------------------------------------------------------------
function PomodoroTimer() {
  const pomoTimerTime = document.querySelector(".pomodoroTimer .h2");
  const startbtn = document.querySelector(".startTimer");
  const pausebtn = document.querySelector(".pauseTimer");
  const resetbtn = document.querySelector(".resetTimer");
  const session = document.querySelector(".pomodoroTimerFullPage .session");

  if (!pomoTimerTime) return; // nothing to do

  let workSession = true;
  let totalSeconds = 25 * 60;
  let minutesLeft = null;

  function upDtateTime() {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    pomoTimerTime.innerHTML = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  if (startbtn) startbtn.addEventListener("click", startTimer);
  if (pausebtn) pausebtn.addEventListener("click", pauseTimer);
  if (resetbtn) resetbtn.addEventListener("click", resetTimer);

  function startTimer() {
    clearInterval(minutesLeft);
    if (workSession) {
      totalSeconds = 25 * 60;
      minutesLeft = setInterval(function () {
        if (totalSeconds > 0) totalSeconds--;
        else {
          workSession = false;
          clearInterval(minutesLeft);
          totalSeconds = 5 * 60;
          if (session) {
            session.innerHTML = "Break";
            session.style.backgroundColor = "var(--blue)";
          }
        }
        upDtateTime();
      }, 1000);
    } else {
      totalSeconds = 5 * 60;
      minutesLeft = setInterval(function () {
        if (totalSeconds > 0) totalSeconds--;
        else {
          workSession = true;
          clearInterval(minutesLeft);
          totalSeconds = 25 * 60;
          if (session) {
            session.innerHTML = "Work Session";
            session.style.backgroundColor = "var(--green)";
          }
        }
        upDtateTime();
      }, 1000);
    }
  }

  function pauseTimer() {
    clearInterval(minutesLeft);
  }

  function resetTimer() {
    totalSeconds = 25 * 60;
    clearInterval(minutesLeft);
    upDtateTime();
  }

  upDtateTime();
}
PomodoroTimer();


// -------------------------------------------------------------
// Notes App (guarded)
// -------------------------------------------------------------
function Notes() {
  function NotesApp() {
    const addNoteButton = document.querySelector(".AddNote");
    const AllNotes = document.querySelector(".AllNotes");

    if (!AllNotes) {
      console.error("Notes container (.AllNotes) not found — notes disabled on this page.");
      return;
    }

    if (addNoteButton) {
      addNoteButton.addEventListener("click", () => addNote());
    } else {
      console.warn("AddNote button not found.");
    }

    function addNote(text = "") {
      const note = document.createElement("div");
      note.classList.add("note");
      note.innerHTML = `
        <div class="tool">
          <button class="deleted">Delete</button>
          <button class="save">Save</button>
        </div>
        <textarea>${text}</textarea>
      `;

      note.querySelector(".deleted").addEventListener("click", () => {
        note.remove();
        saveNote();
      });

      note.querySelector(".save").addEventListener("click", () => {
        saveNote();
      });

      note.querySelector("textarea").addEventListener("blur", () => {
        saveNote();
      });

      AllNotes.appendChild(note);
      saveNote();
    }

    function saveNote() {
      const notes = document.querySelectorAll(".note textarea");
      const data = [];
      notes.forEach((element) => {
        data.push(element.value);
      });
      if (data.length === 0) {
        localStorage.removeItem("savedNotes");
      } else {
        localStorage.setItem("savedNotes", JSON.stringify(data));
      }
    }

    (function () {
      const getNote = JSON.parse(localStorage.getItem("savedNotes"));
      if (getNote === null || getNote.length === 0) {
        addNote();
      } else {
        getNote.forEach((element) => addNote(element));
      }
    })();
  }

  NotesApp();
}
Notes();


// -------------------------------------------------------------
// Productivity Tracker (guarded)
// -------------------------------------------------------------
function productivityTracker() {
  const canvas = document.getElementById("myChart");
  if (!canvas) return;

  const ctx = canvas.getContext ? canvas.getContext("2d") : null;
  if (!ctx) {
    console.error("Canvas context not available for Chart.");
    return;
  }

  let productivityChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Hours Spent",
          data: [],
          backgroundColor: "#52120b",
          borderColor: "darkred",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } },
    },
  });

  const form = document.querySelector("#dataForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const task = document.querySelector("#task").value.trim();
    const hoursInput = document.querySelector("#hours").value;
    const hours = Number(hoursInput);
    if (task && !isNaN(hours) && hours >= 0) {
      productivityChart.data.labels.push(task);
      productivityChart.data.datasets[0].data.push(hours);
      productivityChart.update();
      document.querySelector("#task").value = "";
      document.querySelector("#hours").value = "";
    }
  });
}
productivityTracker();


// -------------------------------------------------------------
// Weather Podcast (fixed https and q param handling & guards)
// -------------------------------------------------------------
function weatherPodcast() {
  const header1Data = document.querySelector(".header-1 h1");
  const header1Date = document.querySelector(".header-1 .h2");
  const temp = document.querySelector(".header-2 .temp");
  const condition = document.querySelector(".header-2 .condition");
  const preciption = document.querySelector(".header-2 .preciption");
  const humidity = document.querySelector(".header-2 .humidity");
  const wind = document.querySelector(".header-2 .wind");

  // if header not present, bail
  if (!header1Date || !header1Data) return;

  const weatherApiKey = "456b683fa5ca457ab7c62509250911";
  let data = null;

  // Function to get weather data using coordinates or city
  async function weatherApiCall(latOrCity, lon) {
    try {
      // support either (lat, lon) OR (cityString)
      const q = typeof lon === "undefined" ? encodeURIComponent(latOrCity) : `${latOrCity},${lon}`;
      // use https to avoid mixed-content errors
      const url = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${q}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Weather fetch failed");
      data = await response.json();
    } catch (error) {
      console.error("Weather API error:", error);
      data = null;
    }
  }

  // Function to get user's location
  function getLocationAndWeather() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          weatherApiCall(lat, lon);
        },
        (error) => {
          console.warn("Geolocation failed, defaulting to Meerut");
          weatherApiCall("Meerut"); // city fallback
        }
      );
    } else {
      console.warn("Geolocation not supported, defaulting to Meerut");
      weatherApiCall("Meerut");
    }
  }

  getLocationAndWeather();

  function timeDate() {
    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    const week = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    const date = new Date();
    const dayOfWeek = week[date.getDay()];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const todayDate = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    // Only update weather info if data is available
    if (data && data.current) {
      if (preciption) preciption.innerHTML = `Heat Index: ${data.current.heatindex_c ?? data.current.temp_c} °C`;
      if (humidity) humidity.innerHTML = `Humidity: ${data.current.humidity}%`;
      if (wind) wind.innerHTML = `Wind: ${data.current.wind_kph} Km/h`;
      if (temp) temp.innerHTML = `${data.current.temp_c} °C`;
      if (condition) condition.innerHTML = `${data.current.condition?.text ?? ""}`;
    }

    header1Date.innerHTML = `${todayDate} ${months[month]}, ${year}`;

    if (hours > 12) {
      header1Data.innerHTML = `${dayOfWeek}, ${String(hours - 12).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} PM`;
    } else {
      header1Data.innerHTML = `${dayOfWeek}, ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} AM`;
    }
  }

  // Update every second
  setInterval(timeDate, 1000);
}
weatherPodcast();
