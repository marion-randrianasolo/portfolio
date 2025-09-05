import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import Layout from '../components/Layout';

interface ProjectForm {
  id?: number;
  title: string;
  description: string;
  imageUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  // Lorsque lu depuis l'API existante
  image_url?: string;
  demo_url?: string;
  github_url?: string;
}

interface ExperienceForm {
  id?: number;
  title: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  description?: string;
  // API legacy
  start_date?: string;
  end_date?: string;
}

interface EducationForm {
  id?: number;
  degree: string;
  institution?: string;
  startYear?: string;
  endYear?: string;
  description?: string;
  // API legacy
  start_year?: string;
  end_year?: string;
}

interface LanguageForm {
  id?: number;
  name: string;
  level?: string;
}

interface SkillForm {
  id?: number;
  name: string;
  category?: string;
}

interface InterestForm {
  id?: number;
  title: string;
  description?: string;
}

interface PersonalInfoForm {
  fullName?: string;
  title?: string;
  summary?: string;
  email?: string;
  phone?: string;
  location?: string;
  photoUrl?: string;
  // legacy
  full_name?: string;
  photo_url?: string;
}

export default function Admin() {
  // Lists
  const [projects, setProjects] = useState<ProjectForm[]>([]);
  const [experiences, setExperiences] = useState<ExperienceForm[]>([]);
  const [education, setEducation] = useState<EducationForm[]>([]);
  const [languages, setLanguages] = useState<LanguageForm[]>([]);
  const [skills, setSkills] = useState<SkillForm[]>([]);
  const [interests, setInterests] = useState<InterestForm[]>([]);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoForm>({});

  // Forms
  const [projectForm, setProjectForm] = useState<ProjectForm>({ title: '', description: '', imageUrl: '', demoUrl: '', githubUrl: '' });
  const [experienceForm, setExperienceForm] = useState<ExperienceForm>({ title: '', company: '', location: '', startDate: '', endDate: '', category: '', description: '' });
  const [educationForm, setEducationForm] = useState<EducationForm>({ degree: '', institution: '', startYear: '', endYear: '', description: '' });
  const [languageForm, setLanguageForm] = useState<LanguageForm>({ name: '', level: '' });
  const [skillForm, setSkillForm] = useState<SkillForm>({ name: '', category: '' });
  const [interestForm, setInterestForm] = useState<InterestForm>({ title: '', description: '' });
  const [personalForm, setPersonalForm] = useState<PersonalInfoForm>({ fullName: '', title: '', summary: '', email: '', phone: '', location: '', photoUrl: '' });

  // Editing IDs
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null);
  const [editingEducationId, setEditingEducationId] = useState<number | null>(null);
  const [editingLanguageId, setEditingLanguageId] = useState<number | null>(null);
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [editingInterestId, setEditingInterestId] = useState<number | null>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    await Promise.all([
      fetch('http://localhost:4000/api/projects').then(r => r.json()).then(setProjects),
      fetch('http://localhost:4000/api/experiences').then(r => r.json()).then(setExperiences),
      fetch('http://localhost:4000/api/education').then(r => r.json()).then(setEducation),
      fetch('http://localhost:4000/api/languages').then(r => r.json()).then(setLanguages),
      fetch('http://localhost:4000/api/skills').then(r => r.json()).then(setSkills),
      fetch('http://localhost:4000/api/interests').then(r => r.json()).then(setInterests),
      fetch('http://localhost:4000/api/personal-info').then(r => r.json()).then(data => {
        setPersonalInfo(data || {});
        setPersonalForm({
          fullName: data?.full_name ?? data?.fullName ?? '',
          title: data?.title ?? '',
          summary: data?.summary ?? '',
          email: data?.email ?? '',
          phone: data?.phone ?? '',
          location: data?.location ?? '',
          photoUrl: data?.photo_url ?? data?.photoUrl ?? '',
        });
      }),
    ]);
  }

  // Change handlers
  const handleProjectChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setProjectForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleExperienceChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setExperienceForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleEducationChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEducationForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleLanguageChange = (e: ChangeEvent<HTMLInputElement>) => setLanguageForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleSkillChange = (e: ChangeEvent<HTMLInputElement>) => setSkillForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleInterestChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setInterestForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handlePersonalChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setPersonalForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Submit
  async function submitProject(e: FormEvent) {
    e.preventDefault();
    const method = editingProjectId ? 'PUT' : 'POST';
    const url = editingProjectId ? `http://localhost:4000/api/projects/${editingProjectId}` : 'http://localhost:4000/api/projects';
    const payload = {
      title: projectForm.title,
      description: projectForm.description,
      imageUrl: projectForm.imageUrl || undefined,
      demoUrl: projectForm.demoUrl || undefined,
      githubUrl: projectForm.githubUrl || undefined,
    };
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setProjectForm({ title: '', description: '', imageUrl: '', demoUrl: '', githubUrl: '' });
    setEditingProjectId(null);
    loadAll();
  }

  async function submitExperience(e: FormEvent) {
    e.preventDefault();
    const method = editingExperienceId ? 'PUT' : 'POST';
    const url = editingExperienceId ? `http://localhost:4000/api/experiences/${editingExperienceId}` : 'http://localhost:4000/api/experiences';
    const payload = {
      title: experienceForm.title,
      company: experienceForm.company || undefined,
      location: experienceForm.location || undefined,
      startDate: experienceForm.startDate || undefined,
      endDate: experienceForm.endDate || undefined,
      category: experienceForm.category || undefined,
      description: experienceForm.description || undefined,
    };
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setExperienceForm({ title: '', company: '', location: '', startDate: '', endDate: '', category: '', description: '' });
    setEditingExperienceId(null);
    loadAll();
  }

  async function submitEducation(e: FormEvent) {
    e.preventDefault();
    const method = editingEducationId ? 'PUT' : 'POST';
    const url = editingEducationId ? `http://localhost:4000/api/education/${editingEducationId}` : 'http://localhost:4000/api/education';
    const payload = {
      degree: educationForm.degree,
      institution: educationForm.institution || undefined,
      startYear: educationForm.startYear || undefined,
      endYear: educationForm.endYear || undefined,
      description: educationForm.description || undefined,
    };
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setEducationForm({ degree: '', institution: '', startYear: '', endYear: '', description: '' });
    setEditingEducationId(null);
    loadAll();
  }

  async function submitLanguage(e: FormEvent) {
    e.preventDefault();
    const method = editingLanguageId ? 'PUT' : 'POST';
    const url = editingLanguageId ? `http://localhost:4000/api/languages/${editingLanguageId}` : 'http://localhost:4000/api/languages';
    const payload = { name: languageForm.name, level: languageForm.level || undefined };
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setLanguageForm({ name: '', level: '' });
    setEditingLanguageId(null);
    loadAll();
  }

  async function submitSkill(e: FormEvent) {
    e.preventDefault();
    const method = editingSkillId ? 'PUT' : 'POST';
    const url = editingSkillId ? `http://localhost:4000/api/skills/${editingSkillId}` : 'http://localhost:4000/api/skills';
    const payload = { name: skillForm.name, category: skillForm.category || undefined };
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSkillForm({ name: '', category: '' });
    setEditingSkillId(null);
    loadAll();
  }

  async function submitInterest(e: FormEvent) {
    e.preventDefault();
    const method = editingInterestId ? 'PUT' : 'POST';
    const url = editingInterestId ? `http://localhost:4000/api/interests/${editingInterestId}` : 'http://localhost:4000/api/interests';
    const payload = { title: interestForm.title, description: interestForm.description || undefined };
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setInterestForm({ title: '', description: '' });
    setEditingInterestId(null);
    loadAll();
  }

  async function submitPersonalInfo(e: FormEvent) {
    e.preventDefault();
    const payload = {
      fullName: personalForm.fullName || undefined,
      title: personalForm.title || undefined,
      summary: personalForm.summary || undefined,
      email: personalForm.email || undefined,
      phone: personalForm.phone || undefined,
      location: personalForm.location || undefined,
      photoUrl: personalForm.photoUrl || undefined,
    };
    await fetch('http://localhost:4000/api/personal-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    loadAll();
  }

  // Delete
  const deleteProject = async (id: number) => { await fetch(`http://localhost:4000/api/projects/${id}`, { method: 'DELETE' }); loadAll(); }
  const deleteExperience = async (id: number) => { await fetch(`http://localhost:4000/api/experiences/${id}`, { method: 'DELETE' }); loadAll(); }
  const deleteEducation = async (id: number) => { await fetch(`http://localhost:4000/api/education/${id}`, { method: 'DELETE' }); loadAll(); }
  const deleteLanguage = async (id: number) => { await fetch(`http://localhost:4000/api/languages/${id}`, { method: 'DELETE' }); loadAll(); }
  const deleteSkill = async (id: number) => { await fetch(`http://localhost:4000/api/skills/${id}`, { method: 'DELETE' }); loadAll(); }
  const deleteInterest = async (id: number) => { await fetch(`http://localhost:4000/api/interests/${id}`, { method: 'DELETE' }); loadAll(); }

  // Edit (pré-remplissage)
  function editProject(p: ProjectForm) {
    setEditingProjectId(p.id!);
    setProjectForm({
      title: p.title,
      description: p.description,
      imageUrl: p.image_url || p.imageUrl || '',
      demoUrl: p.demo_url || p.demoUrl || '',
      githubUrl: p.github_url || p.githubUrl || '',
    });
  }
  function editExperience(ex: ExperienceForm) {
    setEditingExperienceId(ex.id!);
    setExperienceForm({
      title: ex.title,
      company: ex.company || '',
      location: ex.location || '',
      startDate: ex.startDate || ex.start_date || '',
      endDate: ex.endDate || ex.end_date || '',
      category: ex.category || '',
      description: ex.description || '',
    });
  }
  function editEducation(ed: EducationForm) {
    setEditingEducationId(ed.id!);
    setEducationForm({
      degree: ed.degree,
      institution: ed.institution || '',
      startYear: ed.startYear || ed.start_year || '',
      endYear: ed.endYear || ed.end_year || '',
      description: ed.description || '',
    });
  }
  const editLanguage = (lang: LanguageForm) => { setEditingLanguageId(lang.id!); setLanguageForm({ name: lang.name, level: lang.level || '' }); }
  const editSkill = (sk: SkillForm) => { setEditingSkillId(sk.id!); setSkillForm({ name: sk.name, category: sk.category || '' }); }
  const editInterest = (it: InterestForm) => { setEditingInterestId(it.id!); setInterestForm({ title: it.title, description: it.description || '' }); }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto w-full space-y-10">
        <div className="text-center">
          <h1 className="section-title">Administration</h1>
          <p className="section-subtitle">Gère tes données depuis cette interface.</p>
        </div>

        {/* Infos personnelles */}
        <section className="section-card p-6">
          <h2 className="text-xl font-semibold">Informations personnelles</h2>
          <p className="text-sm text-slate-500 mb-4">Cette section s’affiche tout en haut du CV.</p>

          <form onSubmit={submitPersonalInfo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="fullName">Nom complet</label>
              <input id="fullName" name="fullName" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={personalForm.fullName || ''} onChange={handlePersonalChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="title">Titre</label>
              <input id="title" name="title" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={personalForm.title || ''} onChange={handlePersonalChange} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" htmlFor="summary">Résumé</label>
              <textarea id="summary" name="summary" className="w-full border border-slate-300 rounded-lg px-3 py-2" rows={3} value={personalForm.summary || ''} onChange={handlePersonalChange}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={personalForm.email || ''} onChange={handlePersonalChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="phone">Téléphone</label>
              <input id="phone" name="phone" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={personalForm.phone || ''} onChange={handlePersonalChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="location">Localisation</label>
              <input id="location" name="location" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={personalForm.location || ''} onChange={handlePersonalChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="photoUrl">URL de photo</label>
              <input id="photoUrl" name="photoUrl" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={personalForm.photoUrl || ''} onChange={handlePersonalChange} />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </section>

        {/* Projets */}
        <section className="section-card p-6">
          <h2 className="text-xl font-semibold">Projets</h2>

          <form onSubmit={submitProject} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-3">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="projectTitle">Titre</label>
              <input name="title" id="projectTitle" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={projectForm.title} onChange={handleProjectChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="imageUrl">URL d'image</label>
              <input name="imageUrl" id="imageUrl" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={projectForm.imageUrl || ''} onChange={handleProjectChange} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" htmlFor="projectDescription">Description</label>
              <textarea name="description" id="projectDescription" className="w-full border border-slate-300 rounded-lg px-3 py-2" rows={3} value={projectForm.description} onChange={handleProjectChange} required></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="demoUrl">URL Demo</label>
              <input name="demoUrl" id="demoUrl" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={projectForm.demoUrl || ''} onChange={handleProjectChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="githubUrl">URL Code</label>
              <input name="githubUrl" id="githubUrl" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={projectForm.githubUrl || ''} onChange={handleProjectChange} />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn btn-primary">
                {editingProjectId ? 'Mettre à jour' : 'Ajouter'}
              </button>
              {editingProjectId && (
                <button
                  type="button"
                  className="btn btn-secondary ml-2"
                  onClick={() => { setEditingProjectId(null); setProjectForm({ title: '', description: '', imageUrl: '', demoUrl: '', githubUrl: '' }); }}
                >
                  Annuler
                </button>
              )}
            </div>
          </form>

          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.id} className="border border-slate-200 rounded-lg px-3 py-2 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-slate-600 line-clamp-1 max-w-md">{p.description}</p>
                </div>
                <div className="space-x-2">
                  <button className="text-brand-700 hover:underline" onClick={() => editProject(p)}>Modifier</button>
                  <button className="text-red-600 hover:underline" onClick={() => p.id && deleteProject(p.id)}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Expériences */}
        <section className="section-card p-6">
          <h2 className="text-xl font-semibold">Expériences</h2>

          <form onSubmit={submitExperience} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-3">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="expTitle">Titre</label>
              <input name="title" id="expTitle" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={experienceForm.title} onChange={handleExperienceChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="company">Entreprise</label>
              <input name="company" id="company" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={experienceForm.company || ''} onChange={handleExperienceChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="location">Lieu</label>
              <input name="location" id="location" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={experienceForm.location || ''} onChange={handleExperienceChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="startDate">Date début</label>
              <input name="startDate" id="startDate" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={experienceForm.startDate || ''} onChange={handleExperienceChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="endDate">Date fin</label>
              <input name="endDate" id="endDate" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={experienceForm.endDate || ''} onChange={handleExperienceChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="category">Catégorie</label>
              <input name="category" id="category" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={experienceForm.category || ''} onChange={handleExperienceChange} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" htmlFor="expDescription">Description</label>
              <textarea name="description" id="expDescription" className="w-full border border-slate-300 rounded-lg px-3 py-2" rows={3} value={experienceForm.description || ''} onChange={handleExperienceChange}></textarea>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn btn-primary">{editingExperienceId ? 'Mettre à jour' : 'Ajouter'}</button>
              {editingExperienceId && (
                <button type="button" className="btn btn-secondary ml-2" onClick={() => { setEditingExperienceId(null); setExperienceForm({ title: '', company: '', location: '', startDate: '', endDate: '', category: '', description: '' }); }}>
                  Annuler
                </button>
              )}
            </div>
          </form>

          <div className="space-y-2">
            {experiences.map((ex) => (
              <div key={ex.id} className="border border-slate-200 rounded-lg px-3 py-2 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{ex.title}</p>
                  {ex.company && <p className="text-sm text-slate-600">{ex.company}</p>}
                </div>
                <div className="space-x-2">
                  <button className="text-brand-700 hover:underline" onClick={() => editExperience(ex)}>Modifier</button>
                  <button className="text-red-600 hover:underline" onClick={() => ex.id && deleteExperience(ex.id)}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Formation */}
        <section className="section-card p-6">
          <h2 className="text-xl font-semibold">Formation</h2>

          <form onSubmit={submitEducation} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-3">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="degree">Diplôme</label>
              <input name="degree" id="degree" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={educationForm.degree} onChange={handleEducationChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="institution">Établissement</label>
              <input name="institution" id="institution" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={educationForm.institution || ''} onChange={handleEducationChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="startYear">Année début</label>
              <input name="startYear" id="startYear" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={educationForm.startYear || ''} onChange={handleEducationChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="endYear">Année fin</label>
              <input name="endYear" id="endYear" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={educationForm.endYear || ''} onChange={handleEducationChange} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" htmlFor="eduDescription">Description</label>
              <textarea name="description" id="eduDescription" className="w-full border border-slate-300 rounded-lg px-3 py-2" rows={3} value={educationForm.description || ''} onChange={handleEducationChange}></textarea>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn btn-primary">{editingEducationId ? 'Mettre à jour' : 'Ajouter'}</button>
              {editingEducationId && (
                <button type="button" className="btn btn-secondary ml-2" onClick={() => { setEditingEducationId(null); setEducationForm({ degree: '', institution: '', startYear: '', endYear: '', description: '' }); }}>
                  Annuler
                </button>
              )}
            </div>
          </form>

          <div className="space-y-2">
            {education.map((ed) => (
              <div key={ed.id} className="border border-slate-200 rounded-lg px-3 py-2 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{ed.degree}</p>
                  {ed.institution && <p className="text-sm text-slate-600">{ed.institution}</p>}
                </div>
                <div className="space-x-2">
                  <button className="text-brand-700 hover:underline" onClick={() => editEducation(ed)}>Modifier</button>
                  <button className="text-red-600 hover:underline" onClick={() => ed.id && deleteEducation(ed.id)}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Langues */}
        <section className="section-card p-6">
          <h2 className="text-xl font-semibold">Langues</h2>

          <form onSubmit={submitLanguage} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-3">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="langName">Nom</label>
              <input name="name" id="langName" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={languageForm.name} onChange={handleLanguageChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="langLevel">Niveau</label>
              <input name="level" id="langLevel" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={languageForm.level || ''} onChange={handleLanguageChange} />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn btn-primary">{editingLanguageId ? 'Mettre à jour' : 'Ajouter'}</button>
              {editingLanguageId && (
                <button type="button" className="btn btn-secondary ml-2" onClick={() => { setEditingLanguageId(null); setLanguageForm({ name: '', level: '' }); }}>
                  Annuler
                </button>
              )}
            </div>
          </form>

          <div className="space-y-2">
            {languages.map((lang) => (
              <div key={lang.id} className="border border-slate-200 rounded-lg px-3 py-2 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{lang.name}</p>
                  {lang.level && <p className="text-sm text-slate-600">{lang.level}</p>}
                </div>
                <div className="space-x-2">
                  <button className="text-brand-700 hover:underline" onClick={() => editLanguage(lang)}>Modifier</button>
                  <button className="text-red-600 hover:underline" onClick={() => lang.id && deleteLanguage(lang.id)}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Compétences */}
        <section className="section-card p-6">
          <h2 className="text-xl font-semibold">Compétences</h2>

          <form onSubmit={submitSkill} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-3">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="skillName">Nom</label>
              <input name="name" id="skillName" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={skillForm.name} onChange={handleSkillChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="skillCategory">Catégorie</label>
              <input name="category" id="skillCategory" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={skillForm.category || ''} onChange={handleSkillChange} />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn btn-primary">{editingSkillId ? 'Mettre à jour' : 'Ajouter'}</button>
              {editingSkillId && (
                <button type="button" className="btn btn-secondary ml-2" onClick={() => { setEditingSkillId(null); setSkillForm({ name: '', category: '' }); }}>
                  Annuler
                </button>
              )}
            </div>
          </form>

          <div className="space-y-2">
            {skills.map((sk) => (
              <div key={sk.id} className="border border-slate-200 rounded-lg px-3 py-2 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{sk.name}</p>
                  {sk.category && <p className="text-sm text-slate-600">{sk.category}</p>}
                </div>
                <div className="space-x-2">
                  <button className="text-brand-700 hover:underline" onClick={() => editSkill(sk)}>Modifier</button>
                  <button className="text-red-600 hover:underline" onClick={() => sk.id && deleteSkill(sk.id)}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Centres d’intérêts */}
        <section className="section-card p-6">
          <h2 className="text-xl font-semibold">Centres d'intérêts</h2>

          <form onSubmit={submitInterest} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-3">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="interestTitle">Titre</label>
              <input name="title" id="interestTitle" type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2" value={interestForm.title} onChange={handleInterestChange} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" htmlFor="interestDescription">Description</label>
              <textarea name="description" id="interestDescription" className="w-full border border-slate-300 rounded-lg px-3 py-2" rows={2} value={interestForm.description || ''} onChange={handleInterestChange}></textarea>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn btn-primary">{editingInterestId ? 'Mettre à jour' : 'Ajouter'}</button>
              {editingInterestId && (
                <button type="button" className="btn btn-secondary ml-2" onClick={() => { setEditingInterestId(null); setInterestForm({ title: '', description: '' }); }}>
                  Annuler
                </button>
              )}
            </div>
          </form>

          <div className="space-y-2">
            {interests.map((it) => (
              <div key={it.id} className="border border-slate-200 rounded-lg px-3 py-2 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{it.title}</p>
                  {it.description && <p className="text-sm text-slate-600 line-clamp-1 max-w-md">{it.description}</p>}
                </div>
                <div className="space-x-2">
                  <button className="text-brand-700 hover:underline" onClick={() => editInterest(it)}>Modifier</button>
                  <button className="text-red-600 hover:underline" onClick={() => it.id && deleteInterest(it.id)}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
