// script.js - full code from start

function OpenFetures() {
  const allElements = document.querySelectorAll(".elems");
  const fullElements = document.querySelectorAll(".fullElem");
  const btn = document.querySelectorAll(".fullElem .back");

  allElements.forEach((elem) => {
    elem.addEventListener("click", () => {
      if (fullElements[elem.id]) fullElements[elem.id].style.display = "block";
    });
  });

  btn.forEach((back) => {
    back.addEventListener("click", () => {
      if (fullElements[back.id]) fullElements[back.id].style.display = "none";
    });
  });
}

OpenFetures();

// -------------------------------------------------------------
// ToDo List Script
// -------------------------------------------------------------
function todoList() {
  const addTodosForm = document.querySelector(".addTodos form");
  const addTodosFormInput = document.querySelector(".addTodos form #userValue");
  const addTodosFormTextarea = document.querySelector(
    ".addTodos form textarea"
  );
  const addTodosFormCheckbox = document.querySelector(
    ".addTodos form #checkbox"
  );
  const AllTaskSection = document.querySelector(".allTodos");

  // setting Local Storage For TodoPage
  let allTasks = [];
  if (localStorage.getItem("CurrentTask")) {
    try {
      allTasks = JSON.parse(localStorage.getItem("CurrentTask")) || [];
    } catch (err) {
      allTasks = [];
    }
  }

  function showNoDataMessage() {
    if (!AllTaskSection) return;
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
      const titleClass = element.checked ? "todoTitle completed" : "todoTitle";
      const btnText = element.checked ? "Undo" : "Mark As Completed";
      // ensure checked value used as class for span is safe (true/false => string)
      const impClass = element.checked ? "imp" : "";

      taskHTML += `<div class="task" data-index="${index}">
        <h5 key="${index}" class="${titleClass}">${element.task}<span class="${impClass}">imp</span></h5>
        <button key="${index}" class="markCompleted">${btnText}</button>
        <button key="${index}" class="delete">Delete</button>
      </div>`;
    });

    AllTaskSection.innerHTML = taskHTML;
  }

  // initial render
  renderTasks();

  // add task
  if (addTodosForm) {
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
        checked: !!addTodosFormCheckbox.checked,
      });

      // persist and reset
      localStorage.setItem("CurrentTask", JSON.stringify(allTasks));
      addTodosFormCheckbox.checked = false;
      addTodosFormInput.value = "";
      addTodosFormTextarea.value = "";
      renderTasks();
    });
  }

  // event delegation for delete and markCompleted
  if (AllTaskSection) {
    AllTaskSection.addEventListener("click", function (e) {
      const target = e.target;

      // delete
      if (target.classList.contains("delete")) {
        const key = target.getAttribute("key") || target.closest(".task")?.dataset.index;
        const index = Number(key);
        if (!isNaN(index)) {
          allTasks.splice(index, 1);
          localStorage.setItem("CurrentTask", JSON.stringify(allTasks));
          renderTasks();
        }
        return;
      }

      // mark as completed / undo
      if (target.classList.contains("markCompleted")) {
        const key = target.getAttribute("key") || target.closest(".task")?.dataset.index;
        const index = Number(key);
        if (!isNaN(index) && allTasks[index]) {
          allTasks[index].checked = !allTasks[index].checked;
          localStorage.setItem("CurrentTask", JSON.stringify(allTasks));
          renderTasks();
        }
        return;
      }
    });
  }

}

todoList();

//Todo List Script Completed


//Daily Planner Script

function dayPlans(){
// script.js — day planner with 24-hour expiry

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

// Motivation Quotes Script 333333333333333333333333333333333.......................................................

function motivationQuoteContent(){
  const motivationQuotes=document.querySelector(".motivation-2 p");
const motivationQuotesAuthor=document.querySelector(".motivation-3 h2");

async function fetchMotivationQuote(){
  let response=await fetch("https://quotes-api-self.vercel.app/quote");
  const data=await response.json();
  motivationQuotes.innerHTML=data.quote;
  motivationQuotesAuthor.innerHTML=`- ${data.author}`;

}
fetchMotivationQuote();
}

motivationQuoteContent();


// Pomodoro Timer Script 444444444444444444444444444444444444444444444444444444444

function PomodoroTimer(){
let pomoTimerTime = document.querySelector(".pomodoroTimer .h2");
let startbtn = document.querySelector(".startTimer");
let pausebtn = document.querySelector(".pauseTimer");
let resetbtn = document.querySelector(".resetTimer");
let session = document.querySelector(".pomodoroTimerFullPage .session");
let workSession = true;
let totalSeconds = 25 * 60;
let minutesLeft = null;

function upDtateTime() {
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  pomoTimerTime.innerHTML = `${String(minutes).padStart("2", "0")}:${String(seconds).padStart("2", "0")}`;
}

startbtn.addEventListener("click", startTimer);
pausebtn.addEventListener("click", pauseTimer);
resetbtn.addEventListener("click", resetTimer);

function startTimer() {
  clearInterval(minutesLeft);
  if (workSession) {
    // start work session (25:00)
    totalSeconds = 25 * 60;
    minutesLeft = setInterval(function () {
      if (totalSeconds > 0) {
        totalSeconds--;
      } else {
        workSession = false;
        clearInterval(minutesLeft);
        totalSeconds = 5 * 60;
        session.innerHTML = "Break";
        session.style.backgroundColor = "var(--blue)";
      }
      upDtateTime();
    }, 1000); 
  } else {
    // start break session (05:00)
    totalSeconds = 5 * 60;
    minutesLeft = setInterval(function () {
      if (totalSeconds > 0) {
        totalSeconds--;
      } else {
        workSession = true;
        clearInterval(minutesLeft);
        totalSeconds = 25 * 60; 
        session.innerHTML = "Work Session";
        session.style.backgroundColor = "var(--green)";
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



//Notes App Script 5555555555555555555555555555555555555555555555555555555555555555555555555555555555555
function Notes(){
  function NotesApp(){
  const addNoteButton = document.querySelector(".AddNote");
const AllNotes = document.querySelector(".AllNotes");

if (addNoteButton) {
  addNoteButton.addEventListener("click", () => {
    addNote();
  });
} else {
  console.error("❌ Element with class '.AddNote' not found in DOM");
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

  // changed focusout → blur (more reliable)
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
  if (getNote === null) {
    addNote();
  } else {
    getNote.forEach((element) => {
      addNote(element);
    });
  }
})();
}

NotesApp();
}

Notes();


//Productivity Tracker Script 66666666666666666666666666666666666666666666
function productivityTracker(){
  
const ctx = document.getElementById('myChart');

let productivityChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [], // labels go here
    datasets: [{
      label: 'Hours Spent',
      data: [], // data goes here
      backgroundColor: '#52120b', // red bars
      borderColor: 'darkred',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

document.querySelector("#dataForm").addEventListener("submit", (e) => {
  e.preventDefault();
  let task = document.querySelector("#task").value;
  let hours = document.querySelector("#hours").value;

  if (task && hours) {
    // ✅ Correct property paths
    productivityChart.data.labels.push(task);
    productivityChart.data.datasets[0].data.push(hours);
    productivityChart.update();
    document.querySelector("#task").value="";
    document.querySelector("#hours").value="";
  }

});

}
productivityTracker();


// Weather Podcast Script 777777777777777777777777777777777777777777777777777777777777
function weatherPodcast(){
  let header1Data=document.querySelector(".header-1 h1");
let header1Date=document.querySelector(".header-1 .h2");
let weatherApiKey="456b683fa5ca457ab7c62509250911";
let temp=document.querySelector(".header-2 .temp");
let condition=document.querySelector(".header-2 .condition");
let preciption=document.querySelector(".header-2 .preciption");
let humidity=document.querySelector(".header-2 .humidity");
let wind=document.querySelector(".header-2 .wind");

    
let city="Meerut";
let data=null;
async function weatherApiCall(){
  let response=await fetch(`http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${city}`);
  data =await response.json();;
}

weatherApiCall();

function timeDate(){
  const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
  const week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let date=new Date();
  let dayOfWeek=week[date.getDay()];
  let hours=date.getHours();
  let minutes=date.getMinutes();
  let seconds=date.getSeconds();
  let todayDate=date.getDate();
  let month=date.getMonth();
  let year=date.getFullYear();
  preciption.innerHTML=`Heat Index: ${data.current.heatindex_c}%`;
  humidity.innerHTML=`Humidity: ${data.current.humidity}%`;
  wind.innerHTML=` Wind: ${data.current.wind_kph} Km/h`;
  temp.innerHTML=`${data.current.temp_c} °c`;

  condition.innerHTML=`${data.current.condition.text}`;
  header1Date.innerHTML=`${todayDate} ${months[month]}, ${year}`;
  if(hours>12){
    header1Data.innerHTML=`${dayOfWeek}, ${String(hours-12).padStart("2","0")}:${String(minutes).padStart("2","0")}:${String(seconds).padStart("2","0")} PM`;
  }
  else{
      header1Data.innerHTML=`${dayOfWeek}, ${String(hours).padStart("2","0")}:${String(minutes).padStart("2","0")}:${String(seconds).padStart("2","0")} AM`;
  }
}
setInterval(()=>{
timeDate();
},1)

}

weatherPodcast();








