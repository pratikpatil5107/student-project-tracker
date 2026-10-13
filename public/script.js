const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');

const projects = [];

function renderProjects() {
  projectList.replaceChildren();

  for (const project of projects) {
    const item = document.createElement('li');

    const name = document.createElement('h3');
    name.textContent = project.name;

    const status = document.createElement('p');
    status.textContent = 'Status: ' + project.status;

    item.append(name, status);
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
    nameInput.focus();
    return;
  }

  projects.push({
    id: Date.now().toString() + '-' + Math.random().toString(36).slice(2),
    name: name,
    status: status
  });

  renderProjects();
  form.reset();
  nameInput.focus();
});
