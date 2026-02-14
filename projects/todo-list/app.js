const addBtn = document.querySelector("#add-btn");
      const newTaskInput = document.querySelector("#wrapper input");
      const tasksContainer = document.querySelector("#tasks");
      const error = document.getElementById("error");
      const countValue = document.querySelector(".count-value");
      let taskCount = 0;

      // Drag and Drop variables
      let draggedElement = null;
      let placeholder = null;

      const displayCount = (taskCount) => {
        countValue.innerText = taskCount;
      };

      // Create placeholder element for drag feedback
      const createPlaceholder = () => {
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder';
        placeholder.innerHTML = 'Drop task here';
        return placeholder;
      };

      // Drag and Drop event handlers
      const handleDragStart = (e) => {
        draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);

        // Create and insert placeholder
        placeholder = createPlaceholder();
        e.target.parentNode.insertBefore(placeholder, e.target.nextSibling);
      };

      const handleDragEnd = (e) => {
        e.target.classList.remove('dragging');

        // Remove placeholder if it exists
        if (placeholder && placeholder.parentNode) {
          placeholder.parentNode.removeChild(placeholder);
        }

        draggedElement = null;
        placeholder = null;
      };

      const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const target = e.target.closest('.task');
        if (!target || target === draggedElement) return;

        const rect = target.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        if (placeholder && placeholder.parentNode) {
          placeholder.parentNode.removeChild(placeholder);
        }

        if (e.clientY < midpoint) {
          // Insert before target
          target.parentNode.insertBefore(placeholder, target);
        } else {
          // Insert after target
          target.parentNode.insertBefore(placeholder, target.nextSibling);
        }
      };

      const handleDragEnter = (e) => {
        e.preventDefault();
        const target = e.target.closest('.task');
        if (target && target !== draggedElement) {
          target.classList.add('drag-over');
        }
      };

      const handleDragLeave = (e) => {
        const target = e.target.closest('.task');
        if (target) {
          target.classList.remove('drag-over');
        }
      };

      const handleDrop = (e) => {
        e.preventDefault();

        const target = e.target.closest('.task');
        if (!target || target === draggedElement) return;

        // Remove drag-over class
        target.classList.remove('drag-over');

        // Remove placeholder and insert dragged element
        if (placeholder && placeholder.parentNode) {
          placeholder.parentNode.replaceChild(draggedElement, placeholder);
        }

        // Update task count display (no change in count, just reordering)
        displayCount(taskCount);
      };

      // Function to make tasks draggable
      const makeTasksDraggable = () => {
        const tasks = document.querySelectorAll('.task');
        tasks.forEach(task => {
          if (!task.hasAttribute('draggable')) {
            task.setAttribute('draggable', 'true');
            task.addEventListener('dragstart', handleDragStart);
            task.addEventListener('dragend', handleDragEnd);
            task.addEventListener('dragover', handleDragOver);
            task.addEventListener('dragenter', handleDragEnter);
            task.addEventListener('dragleave', handleDragLeave);
            task.addEventListener('drop', handleDrop);
          }
        });
      };

      const addTask = () => {
        const taskName = newTaskInput.value.trim();
        error.style.display = "none";

        if (!taskName) {
          setTimeout(() => {
            error.style.display = "block";
          }, 200);
          return;
        }

        const task = `
<div class="task">
<input type="checkbox" class="task-check">
<span class="taskname">${taskName}</span>
<button class="edit"><i class="fas fa-edit"></i></button>
<button class="delete"><i class="far fa-trash-alt"></i></button>
</div>
`;

        tasksContainer.insertAdjacentHTML("beforeend", task);

        const deleteButtons = document.querySelectorAll(".delete");
        deleteButtons.forEach((button) => {
          button.onclick = () => {
            button.parentNode.remove();
            taskCount -= 1;
            displayCount(taskCount);
          };
        });
        const editButtons = document.querySelectorAll(".edit");
        editButtons.forEach((editBtn) => {
          editBtn.onclick = (e) => {
            let targetElement = e.target;
            if (!(e.target.className == "edit")) {
              targetElement = e.target.parentElement;
            }
            newTaskInput.value =
              targetElement.previousElementSibling?.innerText;
            targetElement.parentNode.remove();
            taskCount -= 1;
            displayCount(taskCount);
          };
        });
        const tasksCheck = document.querySelectorAll(".task-check");
        tasksCheck.forEach((checkBox) => {
          checkBox.onchange = () => {
            checkBox.nextElementSibling.classList.toggle("completed");
            if (checkBox.checked) {
              taskCount -= 1;
              console.log("checked");
            } else {
              taskCount += 1;
            }
            displayCount(taskCount);
          };
        });
        taskCount += 1;
        displayCount(taskCount);
        newTaskInput.value = "";

        // Make the new task draggable
        makeTasksDraggable();
      };

      addBtn.addEventListener("click", addTask);
      window.onload = () => {
        taskCount = 0;
        displayCount(taskCount);
        newTaskInput.value = "";
      };