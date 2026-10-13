const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const formTitle = document.querySelector('#form-title');
const message = document.querySelector('#message');

const STORAGE_KEY = 'workshop-projects-v1';

const projects = [];
let editingId = null;
let storageDataValid = true;

function loadProjects() {
  let storedText;

  try {
    storedText = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    message.textContent =
      'Browser storage could not be read. Changes may not persist.';
    return;
  }

  if (storedText === null) {
    return;
  }

  try {
    const savedProjects = JSON.parse(storedText);
    const ids = new Set();

    const validProjects =
      Array.isArray(savedProjects) &&
      savedProjects.every(function (project) {
        if (
          project === null ||
          typeof project !== 'object' ||
          Array.isArray(project) ||
          typeof project.id !== 'string' ||
          project.id.trim() === '' ||
          typeof project.name !== 'string' ||
          project.name.trim() === '' ||
          typeof project.status !== 'string' ||
          !['Planned', 'In Progress', 'Completed'].includes(
            project.status
          ) ||
          ids.has(project.id)
        ) {
          return false;
        }

        ids.add(project.id);
        return true;
      });

    if (!validProjects) {
      storageDataValid = false;
      message.textContent =
        'Saved project data is invalid. It has not been overwritten.';
      return;
    }

    projects.push(...savedProjects);
  } catch (error) {
    storageDataValid = false;
    message.textContent =
      'Saved project data could not be read. It has not been overwritten.';
  }
}

function saveProjects() {
  if (!storageDataValid) {
    message.textContent =
      'Changes cannot be saved because the existing stored data is invalid.';
    return false;
  }

  try {
    const savedText = JSON.stringify(projects);
    localStorage.setItem(STORAGE_KEY, savedText);
    return true;
  } catch (error) {
    message.textContent =
      'Changes could not be saved to browser storage. They remain in memory for this session.';
    return false;
  }
}

function createProjectId() {
  let id;

  do {
    id =
      typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Date.now().toString() +
          '-' +
          Math.random().toString(36).slice(2);
  } while (projects.some(function (project) {
    return project.id === id;
  }));

  return id;
}

function resetForm() {
  form.reset();
  editingId = null;
  saveButton.textContent = 'Add Project';
  cancelButton.hidden = true;
  formTitle.textContent = 'Add a Project';
}

function renderProjects() {
  projectList.replaceChildren();

  for (const project of projects) {
    const item = document.createElement('li');

    const name = document.createElement('h3');
    name.textContent = project.name;

    const status = document.createElement('p');
    status.textContent = 'Status: ' + project.status;

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';

    editButton.addEventListener('click', function () {
      editingId = project.id;

      nameInput.value = project.name;
      statusInput.value = project.status;

      saveButton.textContent = 'Save changes';
      cancelButton.hidden = false;
      formTitle.textContent = 'Edit Project';

      message.textContent = '';
      nameInput.focus();
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';

    deleteButton.addEventListener('click', function () {
      const confirmed = window.confirm(
        'Are you sure you want to delete "' +
        project.name +
        '"?'
      );

      if (!confirmed) {
        return;
      }

      const index = projects.findIndex(function (item) {
        return item.id === project.id;
      });

      if (index === -1) {
        return;
      }

      const deletingEditedProject = editingId === project.id;

      projects.splice(index, 1);

      if (deletingEditedProject) {
        resetForm();
      }

      renderProjects();

      if (saveProjects()) {
        message.textContent = 'Project deleted and saved.';
      }
    });

    item.append(name, status, editButton, deleteButton);
    projectList.appendChild(item);
  }

  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (!name) {
    message.textContent = 'Please enter a project name.';
    nameInput.focus();
    return;
  }

  if (
    !['Planned', 'In Progress', 'Completed'].includes(status)
  ) {
    message.textContent = 'Please select a valid project status.';
    statusInput.focus();
    return;
  }

  const wasEditing = editingId !== null;

  if (wasEditing) {
    const project = projects.find(function (item) {
      return item.id === editingId;
    });

    if (!project) {
      resetForm();
      renderProjects();
      message.textContent =
        'Project not found. Please try again.';
      return;
    }

    project.name = name;
    project.status = status;
  } else {
    projects.push({
      id: createProjectId(),
      name: name,
      status: status
    });
  }

  resetForm();
  renderProjects();

  if (saveProjects()) {
    message.textContent = wasEditing
      ? 'Project updated and saved.'
      : 'Project added and saved.';
  }

  nameInput.focus();
});

cancelButton.addEventListener('click', function () {
  resetForm();
  message.textContent = 'Edit cancelled.';
  nameInput.focus();
});

loadProjects();
renderProjects();