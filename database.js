let projects = [];
let nextId = 1;

export const db = {
  async list() {
    return projects;
  },

  async create(project) {
    const row = {
      id: nextId++,
      ...project
    };

    projects.push(row);
    return row;
  },

  async update(id, project) {
    const index = projects.findIndex(
      (project) => project.id === id
    );

    if (index === -1) {
      return null;
    }

    projects[index] = {
      id,
      ...project
    };

    return projects[index];
  },

  async remove(id) {
    const exists = projects.some(
      (project) => project.id === id
    );

    projects = projects.filter(
      (project) => project.id !== id
    );

    return exists;
  }
};
