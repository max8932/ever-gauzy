(function () {
  "use strict";

  const STORAGE_KEY = "chess-courses-tracker:courses";

  /** @typedef {{id:string,title:string,platform:string,category:string,level:string,totalLessons:number,completedLessons:number,link:string,notes:string,createdAt:number}} Course */

  /** @type {Course[]} */
  let courses = loadCourses();
  let editingId = null;

  const form = document.getElementById("courseForm");
  const listEl = document.getElementById("courseList");
  const emptyState = document.getElementById("emptyState");
  const template = document.getElementById("courseCardTemplate");
  const searchInput = document.getElementById("search");
  const filterStatus = document.getElementById("filterStatus");
  const sortBy = document.getElementById("sortBy");
  const exportBtn = document.getElementById("exportBtn");
  const importInput = document.getElementById("importInput");

  function loadCourses() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Konnte gespeicherte Kurse nicht laden:", e);
      return [];
    }
  }

  function saveCourses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function getStatus(course) {
    if (course.completedLessons <= 0) return "not-started";
    if (course.completedLessons >= course.totalLessons) return "completed";
    return "in-progress";
  }

  const statusLabels = {
    "not-started": "Nicht begonnen",
    "in-progress": "In Bearbeitung",
    completed: "Abgeschlossen",
  };

  function resetForm() {
    form.reset();
    editingId = null;
    form.querySelector(".btn-primary").textContent = "Kurs hinzufügen";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const totalLessons = parseInt(document.getElementById("totalLessons").value, 10);
    if (!title || !totalLessons || totalLessons < 1) return;

    if (editingId) {
      const course = courses.find((c) => c.id === editingId);
      if (course) {
        course.title = title;
        course.platform = document.getElementById("platform").value.trim();
        course.category = document.getElementById("category").value;
        course.level = document.getElementById("level").value;
        course.totalLessons = totalLessons;
        course.completedLessons = Math.min(course.completedLessons, totalLessons);
        course.link = document.getElementById("link").value.trim();
        course.notes = document.getElementById("notes").value.trim();
      }
    } else {
      courses.push({
        id: uid(),
        title,
        platform: document.getElementById("platform").value.trim(),
        category: document.getElementById("category").value,
        level: document.getElementById("level").value,
        totalLessons,
        completedLessons: 0,
        link: document.getElementById("link").value.trim(),
        notes: document.getElementById("notes").value.trim(),
        createdAt: Date.now(),
      });
    }

    saveCourses();
    resetForm();
    render();
  });

  function startEdit(course) {
    editingId = course.id;
    document.getElementById("title").value = course.title;
    document.getElementById("platform").value = course.platform;
    document.getElementById("category").value = course.category;
    document.getElementById("level").value = course.level;
    document.getElementById("totalLessons").value = course.totalLessons;
    document.getElementById("link").value = course.link;
    document.getElementById("notes").value = course.notes;
    form.querySelector(".btn-primary").textContent = "Kurs aktualisieren";
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function deleteCourse(id) {
    if (!confirm("Diesen Kurs wirklich löschen?")) return;
    courses = courses.filter((c) => c.id !== id);
    saveCourses();
    render();
  }

  function setProgress(course, value) {
    course.completedLessons = Math.max(0, Math.min(course.totalLessons, value));
    saveCourses();
    render();
  }

  function getFilteredSortedCourses() {
    const query = searchInput.value.trim().toLowerCase();
    const status = filterStatus.value;

    let result = courses.filter((c) => {
      const matchesQuery =
        !query ||
        c.title.toLowerCase().includes(query) ||
        c.platform.toLowerCase().includes(query) ||
        c.notes.toLowerCase().includes(query);
      const matchesStatus = status === "all" || getStatus(c) === status;
      return matchesQuery && matchesStatus;
    });

    switch (sortBy.value) {
      case "progress":
        result = result.sort(
          (a, b) => b.completedLessons / b.totalLessons - a.completedLessons / a.totalLessons
        );
        break;
      case "title":
        result = result.sort((a, b) => a.title.localeCompare(b.title, "de"));
        break;
      default:
        result = result.sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
  }

  function render() {
    renderStats();
    const filtered = getFilteredSortedCourses();
    listEl.innerHTML = "";
    emptyState.style.display = courses.length === 0 ? "block" : "none";

    if (courses.length > 0 && filtered.length === 0) {
      const noResults = document.createElement("p");
      noResults.className = "empty-state";
      noResults.style.display = "block";
      noResults.textContent = "Keine Kurse gefunden, die den Filtern entsprechen.";
      listEl.appendChild(noResults);
      return;
    }

    filtered.forEach((course) => listEl.appendChild(renderCourseCard(course)));
  }

  function renderStats() {
    const total = courses.length;
    const inProgress = courses.filter((c) => getStatus(c) === "in-progress").length;
    const completed = courses.filter((c) => getStatus(c) === "completed").length;
    const avgProgress = total
      ? Math.round(
          courses.reduce((sum, c) => sum + c.completedLessons / c.totalLessons, 0) / total * 100
        )
      : 0;

    document.getElementById("statTotal").textContent = total;
    document.getElementById("statInProgress").textContent = inProgress;
    document.getElementById("statCompleted").textContent = completed;
    document.getElementById("statAvgProgress").textContent = avgProgress + "%";
  }

  function renderCourseCard(course) {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".course-card");
    card.dataset.id = course.id;

    node.querySelector(".card-title").textContent = course.title;
    node.querySelector(".badge.category").textContent = course.category;
    node.querySelector(".badge.level").textContent = course.level;
    node.querySelector(".platform").textContent = course.platform ? "· " + course.platform : "";
    node.querySelector(".card-notes").textContent = course.notes || "";

    const linkEl = node.querySelector(".card-link");
    if (course.link) {
      linkEl.href = course.link;
    } else {
      linkEl.removeAttribute("href");
    }

    const percent = Math.round((course.completedLessons / course.totalLessons) * 100);
    node.querySelector(".lessons-done").textContent = course.completedLessons;
    node.querySelector(".lessons-total").textContent = course.totalLessons;
    node.querySelector(".progress-percent").textContent = percent + "%";
    node.querySelector(".progress-fill").style.width = percent + "%";

    const slider = node.querySelector(".progress-slider");
    slider.max = course.totalLessons;
    slider.value = course.completedLessons;
    slider.addEventListener("input", () => setProgress(course, parseInt(slider.value, 10)));

    node.querySelector(".decrement").addEventListener("click", () =>
      setProgress(course, course.completedLessons - 1)
    );
    node.querySelector(".increment").addEventListener("click", () =>
      setProgress(course, course.completedLessons + 1)
    );

    const status = getStatus(course);
    const statusBadge = node.querySelector(".status-badge");
    statusBadge.textContent = statusLabels[status];
    statusBadge.classList.add(status);

    node.querySelector(".edit-btn").addEventListener("click", () => startEdit(course));
    node.querySelector(".delete-btn").addEventListener("click", () => deleteCourse(course.id));

    return node;
  }

  exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(courses, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schach-kurse-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  importInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported)) throw new Error("Ungültiges Format");
        const existingIds = new Set(courses.map((c) => c.id));
        imported.forEach((c) => {
          if (!c.id || existingIds.has(c.id)) c.id = uid();
        });
        courses = courses.concat(imported);
        saveCourses();
        render();
      } catch (err) {
        alert("Import fehlgeschlagen: Datei ist kein gültiges Kurse-JSON.");
      } finally {
        importInput.value = "";
      }
    };
    reader.readAsText(file);
  });

  searchInput.addEventListener("input", render);
  filterStatus.addEventListener("change", render);
  sortBy.addEventListener("change", render);

  render();
})();
