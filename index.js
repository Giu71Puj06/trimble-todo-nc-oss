(async function () {
  const tbody = document.querySelector("#todoTable tbody");
  const stats = document.getElementById("stats");

  function esc(s) {
    return (s ?? "").toString()
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  try {
    // API Trimble Connect Extension runtime
    const tc = window.trimbleConnect;

    if (!tc?.project?.getCurrentProject || !tc?.todo?.getTodos) {
      stats.textContent = "Errore: runtime Trimble Connect non disponibile. Apri questa pagina dall’estensione dentro Trimble.";
      return;
    }

    const project = await tc.project.getCurrentProject();

    // Prendo tutti i ToDo del progetto
    const todos = await tc.todo.getTodos({ projectId: project.id });

    // Ordine cronologico per data di creazione
    todos.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let nc = 1;
    let oss = 1;
    let countNC = 0;
    let countOSS = 0;
    let countOther = 0;

    for (const todo of todos) {
      const tags = todo.tags || [];

      let ncOssId = "—";
      if (tags.includes("NC")) {
        ncOssId = `NC-${String(nc++).padStart(2, "0")}`;
        countNC++;
      } else if (tags.includes("OSS")) {
        ncOssId = `OSS-${String(oss++).padStart(2, "0")}`;
        countOSS++;
      } else {
        countOther++;
      }

      const tr = document.createElement("tr");
      if (ncOssId === "—") tr.classList.add("warning");

      const created = todo.createdAt ? new Date(todo.createdAt).toLocaleDateString() : "";
      const assignee = todo.assignedTo?.name || todo.assignedTo?.email || "";
      const status = todo.status || "";
      const title = todo.title || "";
      const desc = todo.description || "";

      tr.innerHTML = `
        <td><strong>${esc(ncOssId)}</strong></td>
        <td>${esc(todo.id || "")}</td>
        <td>${esc(title)}</td>
        <td class="desc">${esc(desc)}</td>
        <td>${esc(tags.join(", "))}</td>
        <td>${esc(status)}</td>
        <td>${esc(assignee)}</td>
        <td>${esc(created)}</td>
      `;

      tbody.appendChild(tr);
    }

    stats.textContent =
      `Totale: ${todos.length} | NC: ${countNC} | OSS: ${countOSS} | Non classificati: ${countOther}`;

  } catch (e) {
    console.error(e);
    stats.textContent = `Errore: ${e?.message || e}`;
  }
})();
