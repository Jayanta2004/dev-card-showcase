const graph = document.getElementById("graph");
const lines = document.getElementById("lines");
const explain = document.getElementById("explain");

function clearCanvas() {
  graph.innerHTML = "";
  lines.innerHTML = "";
}

function commitBox(label, branch, head, merge = false) {
  const box = document.createElement("div");
  box.className = "commit-box" + (merge ? " merge" : "");
  box.innerText = label;

  if (branch) {
    const b = document.createElement("div");
    b.className = "branch-label";
    b.innerText = branch;
    box.appendChild(b);
  }

  if (head) {
    const h = document.createElement("div");
    h.className = "head-label";
    h.innerText = "HEAD";
    box.appendChild(h);
  }

  return box;
}

function line(from, to, curve = false) {
  const x1 = 75 + from * 150;
  const x2 = 75 + to * 150;
  const y = 120;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    curve
      ? `M${x1},${y} Q${(x1 + x2) / 2},${y - 50} ${x2},${y}`
      : `M${x1},${y} L${x2},${y}`
  );
  path.setAttribute("stroke", "#64748b");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("fill", "none");
  lines.appendChild(path);
}

/* ---------- STATES ---------- */

function renderState(state) {
  clearCanvas();

  if (state === "init") {
    graph.appendChild(commitBox("C0", "main", true));
    explain.innerText =
      "git init: Creates a repository with an initial commit. main and HEAD point to the same commit.";
  }

  if (state === "commit") {
    graph.append(
      commitBox("C1"),
      commitBox("C2", "main", true)
    );
    line(0, 1);
    explain.innerText =
      "git commit: Creates a new commit that points to the previous commit. Branch pointer and HEAD move forward.";
  }

  if (state === "branch") {
    graph.append(
      commitBox("C1", "main", true),
      commitBox("C2", "feature")
    );
    line(0, 1);
    explain.innerText =
      "git branch: Creates a new branch pointer. No commits are created.";
  }

  if (state === "checkout") {
    graph.append(
      commitBox("C1", "main"),
      commitBox("C2", "feature", true)
    );
    line(0, 1);
    explain.innerText =
      "git checkout: Moves HEAD to another branch. Commits remain unchanged.";
  }

  if (state === "merge") {
    graph.append(
      commitBox("C1", "main"),
      commitBox("C2", "feature"),
      commitBox("M1", "main", true, true)
    );
    line(0, 2);
    line(1, 2, true);
    explain.innerText =
      "git merge: Creates a merge commit with two parents.";
  }

  if (state === "rebase") {
    graph.append(
      commitBox("C1", "main"),
      commitBox("C2'","feature", true)
    );
    line(0, 1);
    explain.innerText =
      "git rebase: Rewrites commit history by replaying commits on a new base.";
  }

  if (state === "reset") {
    graph.append(
      commitBox("C1", "main", true),
      commitBox("C2")
    );
    line(0, 1);
    explain.innerText =
      "git reset --hard: Moves branch and HEAD pointer backward. Commits may be lost.";
  }

  if (state === "revert") {
    graph.append(
      commitBox("C1"),
      commitBox("C2"),
      commitBox("R1", "main", true)
    );
    line(0, 1);
    line(1, 2);
    explain.innerText =
      "git revert: Creates a new commit that undoes a previous commit.";
  }
}

/* default */
renderState("init");
