import { useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase, faGraduationCap, faLanguage, faLaptopCode,
  faMusic, faCamera, faGamepad, faUtensils, faMicrochip, faStar,
} from '@fortawesome/free-solid-svg-icons';
import Layout from '../components/Layout';
import ProjectCard from '../components/ProjectCard';
import AnimatedIconsBackground from '../components/AnimatedIconsBackground'

interface PersonalInfo { full_name?: string; title?: string; summary?: string; email?: string; phone?: string; location?: string; photo_url?: string; }
interface Experience   { id: number; title: string; company?: string; location?: string; start_date?: string; end_date?: string; description?: string; category?: string; }
interface Education    { id: number; degree: string; institution?: string; start_year?: string; end_year?: string; description?: string; }
interface Language     { id: number; name: string; level?: string; }
interface Skill        { id: number; name: string; category?: string; }
interface Interest     { id: number; title: string; description?: string; }
interface Project      { id: number; title: string; description: string; image_url?: string; demo_url?: string; github_url?: string; }

function iconForInterest(title: string) {
  const t = title.toLowerCase();
  if (t.includes('musique') || t.includes('music')) return faMusic;
  if (t.includes('photo')) return faCamera;
  if (t.includes('jeu') || t.includes('game')) return faGamepad;
  if (t.includes('cuisine') || t.includes('cook')) return faUtensils;
  if (t.includes('tech')) return faMicrochip;
  return faStar;
}

/* -------------------------------------------
   Normalisation & dates (helpers robustes)
------------------------------------------- */
function norm(s?: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

function parseDateToYM(d?: string): { y: number; m: number } | null {
  if (!d) return null;
  const raw = d.trim();

  // Present / Actuel
  if (/^(present|now|actuel|aujourd'hui)$/i.test(raw)) {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  }

  // Mois FR/EN -> index
  const MONTHS: Record<string, number> = {
    jan:0, january:0, janvier:0,
    feb:1, february:1, fev:1, fevr:1, fevrier:1,
    mar:2, march:2, mars:2,
    apr:3, april:3, avril:3,
    may:4, mai:4,
    jun:5, june:5, juin:5,
    jul:6, july:6, juillet:6,
    aug:7, august:7, aout:7, août:7,
    sep:8, sept:8, september:8, septembre:8,
    oct:9, october:9, octobre:9,
    nov:10, november:10, novembre:10,
    dec:11, december:11, decembre:11, décembre:11,
  };

  const s = raw
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // accents ->
    .replace(/\s+/g, ' ')
    .trim();

  // "month yyyy"
  const m = s.match(/^([a-z]+)\s+(\d{4})$/);
  if (m) {
    const mi = MONTHS[m[1]];
    if (Number.isInteger(mi)) return { y: +m[2], m: mi };
  }

  // "yyyy"
  const yOnly = s.match(/^(\d{4})$/);
  if (yOnly) return { y: +yOnly[1], m: 0 };

  return null; // rien de sûr
}

function diffInMonths(a: { y: number; m: number }, b: { y: number; m: number }) {
  return (b.y - a.y) * 12 + (b.m - a.m);
}


/** Blacklist robuste : on exclut bénévolat / projets perso / scolaire, etc. */
function isProfessional(cat?: string, title?: string, company?: string) {
  const c  = norm(cat);
  const t  = norm(title);
  const co = norm(company);

  const blacklist = [
    'volunteer', 'benevol', 'association',
    'personal project', 'projet perso', 'projet personnel', 'side project', 'prototype',
    'school', 'etudiant', 'student', 'scolaire', 'academic'
  ];

  if (blacklist.some(k => c.includes(k) || t.includes(k) || co.includes(k))) {
    return false;
  }
  return true;
}


export default function CV() {
  // data
  const [personal, setPersonal]       = useState<PersonalInfo | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation]     = useState<Education[]>([]);
  const [languages, setLanguages]     = useState<Language[]>([]);
  const [skills, setSkills]           = useState<Skill[]>([]);
  const [interests, setInterests]     = useState<Interest[]>([]);
  const [projects, setProjects]       = useState<Project[]>([]);

  // scroll-spy
  const [active, setActive] = useState<string>('experiences');
  const expRef = useRef<HTMLDivElement | null>(null);
  const eduRef = useRef<HTMLDivElement | null>(null);
  const langRef = useRef<HTMLDivElement | null>(null);
  const skRef  = useRef<HTMLDivElement | null>(null);
  const prjRef = useRef<HTMLDivElement | null>(null);
  const intRef = useRef<HTMLDivElement | null>(null);

  // fetch
  useEffect(() => {
    (async () => {
      const [p, ex, ed, lg, sk, it, pj] = await Promise.all([
        fetch('http://localhost:4000/api/personal-info').then(r => r.json()),
        fetch('http://localhost:4000/api/experiences').then(r => r.json()),
        fetch('http://localhost:4000/api/education').then(r => r.json()),
        fetch('http://localhost:4000/api/languages').then(r => r.json()),
        fetch('http://localhost:4000/api/skills').then(r => r.json()),
        fetch('http://localhost:4000/api/interests').then(r => r.json()),
        fetch('http://localhost:4000/api/projects').then(r => r.json()),
      ]);
      setPersonal(p || null);
      setExperiences(ex || []);
      setEducation(ed || []);
      setLanguages(lg || []);
      setSkills(sk || []);
      setInterests(it || []);
      setProjects(pj || []);
    })();
  }, []);

  /* -------------------------------------------
     Calcul des années/mois d'expérience PRO
  ------------------------------------------- */
  const { totalYears, pretty } = useMemo(() => {
    if (!experiences?.length) return { totalYears: 0, pretty: '' };

    const now = new Date();
    const nowYM = { y: now.getFullYear(), m: now.getMonth() };

    const months = experiences
      .filter(e => isProfessional(e.category, e.title, e.company))
      .map(e => {
        const s = parseDateToYM(e.start_date);
        const end = parseDateToYM(e.end_date) || nowYM;
        if (!s) return 0;
        return Math.max(0, diffInMonths(s, end));
      })
      .reduce((a, b) => a + b, 0);

    const y = Math.floor(months / 12);
    const m = months % 12;

    return {
      totalYears: months / 12,
      pretty: m ? `${y} ans ${m} mois` : `${y} ans`
    };
  }, [experiences]);

  // Niveau : Junior (0-5), Confirmé (5-7), Sénior (7+)
  const levelInfo = useMemo(() => {
    const y = totalYears;
    if (y < 5) {
      return { label: 'Junior', progressPct: Math.min(100, (y / 5) * 100) };
    } else if (y < 7) {
      return { label: 'Confirmé', progressPct: Math.min(100, ((y - 5) / 2) * 100) };
    } else {
      return { label: 'Sénior', progressPct: 100 };
    }
  }, [totalYears]);

  // Répartition de la progression sur trois segments : Junior (0–5 ans), Confirmé (5–7 ans), Sénior (7+ ans).
  const seg1Pct = totalYears < 5 ? (totalYears / 5) * 100 : 100;
  const seg2Pct = totalYears > 5 ? Math.min(((totalYears - 5) / 2) * 100, 100) : 0;
  const seg3Pct = totalYears > 7 ? 100 : 0;

  // Intersection observer
  useEffect(() => {
    const opts = { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0 };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.getAttribute('data-section');
          if (id) setActive(id);
        }
      });
    }, opts);
    const nodes = [expRef.current, eduRef.current, langRef.current, skRef.current, prjRef.current, intRef.current].filter(Boolean) as Element[];
    nodes.forEach(n => io.observe(n));
    return () => { nodes.forEach(n => io.unobserve(n)); };
  }, [experiences, education, languages, skills, projects, interests]);

  // Group skills
  const groupedSkills = useMemo(() => {
    const g: Record<string, string[]> = {};
    for (const s of skills) {
      const c = s.category || 'Autres';
      if (!g[c]) g[c] = [];
      g[c].push(s.name);
    }
    return g;
  }, [skills]);

  return (
    <Layout>
      {/* Header */}
      <div className="relative w-full py-8 overflow-hidden">
        {/* Fond animé qui occupe toute la surface du bandeau */}
        <AnimatedIconsBackground />
        {/* Contenu textuel centré */}
        <div className="relative z-10 pointer-events-none max-w-5xl mx-auto pt-6 pb-4">
          <h1 className="section-title">Curriculum Vitae</h1>
          {personal && (
            <div className="mt-6 flex flex-col items-center text-center">
              {personal.photo_url && (
                <img src={personal.photo_url} alt="" className="w-28 h-28 rounded-full object-cover ring-4 ring-slate-100" />
              )}
              <h2 className="mt-4 text-2xl font-bold">{personal.full_name}</h2>
              {personal.title && <p className="text-sm tracking-wide text-slate-600">{personal.title}</p>}
              {personal.summary && (
                <p className="mt-3 max-w-3xl text-slate-600 whitespace-prewrap leading-relaxed">
                  {personal.summary}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-slate-200">
        <ul className="max-w-5xl mx-auto flex gap-6 overflow-x-auto px-4 py-3 text-sm font-medium">
          {([
            ['experiences','Expériences'],
            ['education','Formation'],
            ['languages','Langues'],
            ['skills','Compétences'],
            ...(projects.length ? [['projects','Projets']] as const : []),
            ...(interests.length ? [['interests',"Centres d'intérêts"]] as const : []),
          ] as const).map(([id,label]) => (
            <li
              key={id}
              className={`nav-link ${active===id ? 'nav-link--active' : ''}`}
              onClick={() => document.getElementById(id)?.scrollIntoView({behavior:'smooth', block:'start'})}
            >
              {label}
            </li>
          ))}
        </ul>
      </nav>

       {/* Bandeau niveau */}
      <div className="max-w-5xl mx-auto my-8 level-card bg-gradient-to-r from-brand-50 via-white to-brand-50 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* libellé du niveau */}
        <div className="flex items-center gap-3">
          <p className="text-xs text-slate-500">Niveau</p>
          <span className="badge badge-neutral">{levelInfo.label}</span>
        </div>
        {/*
          Progression vers les différents paliers (Junior, Confirmé, Sénior).
          L’aperçu principal affiche le niveau courant (badge), la jauge du
          palier actuel et le nombre d’années d’expérience.  Au survol du
          bandeau, une infobulle apparaît : elle contient une barre générale
          divisée en trois segments (Junior : 0–5 ans, Confirmé : 5–7 ans,
          Sénior : 7+ ans) et indique la progression réelle dans chacun de
          ces segments.
        */}
        <div className="flex-1 relative group">
          {/* Jauge du palier courant : progression dans le niveau actuel (ex : Junior) */}
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${levelInfo.progressPct}%` }} />
          </div>
          {/* Années d’XP sous la jauge */}
          <p className="text-xs text-slate-500 mt-1">
            {totalYears > 0 ? `${pretty} d’XP` : 'Pas de données'}
          </p>
          {/* Infobulle contenant la barre générale et les paliers ; affichée au survol */}
          <div className="absolute left-0 mt-3 w-full bg-white/95 border border-slate-200 rounded-lg shadow-sm text-xs p-3 opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100">
            {/* Barre générale avec progression répartie sur les trois paliers */}
            <div className="flex w-full rounded-full overflow-hidden border border-brand-200">
              {/* Segment 1 : Junior (0–5 ans) */}
              <div className="relative flex-1 h-2 bg-brand-50">
                <div className="absolute top-0 left-0 h-full bg-brand-500" style={{ width: `${seg1Pct}%` }} />
              </div>
              {/* Segment 2 : Confirmé (5–7 ans) */}
              <div className="relative flex-1 h-2 bg-brand-50">
                <div className="absolute top-0 left-0 h-full bg-brand-500" style={{ width: `${seg2Pct}%` }} />
              </div>
              {/* Segment 3 : Sénior (7+ ans) */}
              <div className="relative flex-1 h-2 bg-brand-50">
                <div className="absolute top-0 left-0 h-full bg-brand-500" style={{ width: `${seg3Pct}%` }} />
              </div>
            </div>
            {/* Libellés des segments */}
            <div className="flex text-xs mt-1 text-slate-600">
              <span className="flex-1 text-center">Junior</span>
              <span className="flex-1 text-center">Confirmé</span>
              <span className="flex-1 text-center">Sénior</span>
            </div>
          </div>
        </div>
      </div>

      {/* EXPÉRIENCES */}
      {experiences.length>0 && (
        <section id="experiences" ref={expRef} data-section="experiences" className="py-10">
          <h3 className="section-title"><FontAwesomeIcon icon={faBriefcase} className="text-blue-600 mr-2" />Expériences</h3>
          <div className="max-w-5xl mx-auto mt-8 timeline">
            <div className="timeline__line" />
            {experiences.map((ex, i) => (
              <div key={ex.id} className="relative mb-12 sm:grid sm:grid-cols-2 sm:gap-10">
                <span className="timeline__dot top-5" />
                {i % 2 === 0 ? (
                  <>
                    <div />
                    <article className="card card--hover card--ring-blue border-blue-100 p-5">
                      <h4 className="font-semibold">{ex.title}</h4>
                      <p className="text-sm text-slate-700">
                        {[ex.company, ex.location].filter(Boolean).join(', ')}
                      </p>
                      {(ex.start_date || ex.end_date) && (
                        <p className="text-sm text-slate-500">{ex.start_date}{ex.end_date ? ` — ${ex.end_date}` : ''}</p>
                      )}
                      {ex.description && <p className="mt-2 text-slate-700 whitespace-prewrap leading-relaxed">{ex.description}</p>}
                    </article>
                  </>
                ) : (
                  <>
                    <article className="card card--hover card--ring-blue border-blue-100 p-5 text-right">
                      <h4 className="font-semibold">{ex.title}</h4>
                      <p className="text-sm text-slate-700">
                        {[ex.company, ex.location].filter(Boolean).join(', ')}
                      </p>
                      {(ex.start_date || ex.end_date) && (
                        <p className="text-sm text-slate-500">{ex.start_date}{ex.end_date ? ` — ${ex.end_date}` : ''}</p>
                      )}
                      {ex.description && <p className="mt-2 text-slate-700 whitespace-prewrap leading-relaxed">{ex.description}</p>}
                    </article>
                    <div />
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FORMATION */}
      {education.length>0 && (
        <section id="education" ref={eduRef} data-section="education" className="py-12 bg-gradient-to-b from-emerald-50/60 to-white">
          <h3 className="section-title"><FontAwesomeIcon icon={faGraduationCap} className="text-emerald-600 mr-2" />Formation</h3>
          <div className="max-w-5xl mx-auto mt-8 timeline">
            <div className="timeline__line timeline__line--green" />
            {education.map((ed, i) => (
              <div key={ed.id} className="relative mb-12 sm:grid sm:grid-cols-2 sm:gap-10">
                <span className="timeline__dot timeline__dot--green top-5" />
                {i % 2 === 0 ? (
                  <>
                    <div />
                    <article className="card card--hover card--ring-green border-emerald-100 p-5">
                      <h4 className="font-semibold">{ed.degree}</h4>
                      {ed.institution && <p className="text-sm text-slate-700">{ed.institution}</p>}
                      {(ed.start_year || ed.end_year) && (
                        <p className="text-sm text-slate-500">{ed.start_year}{ed.end_year ? ` — ${ed.end_year}` : ''}</p>
                      )}
                      {ed.description && <p className="mt-2 text-slate-700 whitespace-prewrap leading-relaxed">{ed.description}</p>}
                    </article>
                  </>
                ) : (
                  <>
                    <article className="card card--hover card--ring-green border-emerald-100 p-5 text-right">
                      <h4 className="font-semibold">{ed.degree}</h4>
                      {ed.institution && <p className="text-sm text-slate-700">{ed.institution}</p>}
                      {(ed.start_year || ed.end_year) && (
                        <p className="text-sm text-slate-500">{ed.start_year}{ed.end_year ? ` — ${ed.end_year}` : ''}</p>
                      )}
                      {ed.description && <p className="mt-2 text-slate-700 whitespace-prewrap leading-relaxed">{ed.description}</p>}
                    </article>
                    <div />
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LANGUES */}
      {languages.length>0 && (
        <section id="languages" ref={langRef} data-section="languages" className="py-12">
          <h3 className="section-title"><FontAwesomeIcon icon={faLanguage} className="text-purple-600 mr-2" />Langues</h3>
          <div className="max-w-2xl mx-auto mt-8 space-y-5">
            {languages.map((l) => {
              const v = (l.level || '').toLowerCase();
              const w =
                v.includes('native') ? 100 :
                v.includes('fluent') || v.includes('courant') ? 100 :
                v.includes('inter') ? 60 : 40;

              return (
                <div key={l.id} className="language-row">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-purple-800">{l.name}</span>
                    {l.level && <span className="text-purple-600">{l.level}</span>}
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-purple-100">
                    <div className="h-2.5 rounded-full bg-purple-500" style={{ width: `${w}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* COMPÉTENCES */}
      {skills.length>0 && (
        <section id="skills" ref={skRef} data-section="skills" className="py-12 bg-gradient-to-b from-sky-50/60 to-white">
          <h3 className="section-title"><FontAwesomeIcon icon={faLaptopCode} className="text-sky-600 mr-2" />Compétences</h3>
          <div className="max-w-4xl mx-auto mt-8 space-y-8">
            {Object.entries(groupedSkills).map(([cat, list]) => (
              <div key={cat}>
                <p className="text-sm font-semibold text-slate-500 mb-2 text-center">{cat}</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {list.map(n => (
                    <span key={n} className="chip chip--skill">{n}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PROJETS */}
      {projects.length > 0 && (
        <section id="projects" ref={prjRef} data-section="projects" className="py-12">
          <h3 className="section-title">Projets</h3>
          <div
            className={
              "max-w-5xl mx-auto mt-8 grid gap-6 " +
              (projects.length === 1
                ? "grid-cols-1 place-items-center"
                : "grid-cols-1 md:grid-cols-2")
            }
          >
            {projects.map((p) => (
              <div
                key={p.id}
                /* on limite la largeur quand il n’y a qu’une carte : max-w-xl (36 rem) sur petits écrans,
                   et max-w-lg (32 rem) à partir du breakpoint md */
                className={projects.length === 1 ? "w-full sm:max-w-xl md:max-w-lg" : ""}
              >
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        </section>
      )}


      {/* CENTRES D'INTÉRÊTS */}
      {interests.length > 0 && (
        <section id="interests" ref={intRef} data-section="interests" className="py-12 bg-gradient-to-b from-pink-50/60 to-white">
          <h3 className="section-title">
            <FontAwesomeIcon icon={faStar} className="text-pink-500 mr-2" />
            Centres d’intérêts
          </h3>
          <div className="max-w-5xl mx-auto mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {interests.map((it) => (
              <div key={it.id} className="flip-card">
                <div className="flip-card__inner h-40">
                  {/* front */}
                  <div className="flip-card__face bg-pink-50 border-pink-100 flex flex-col items-center justify-center p-4">
                    <FontAwesomeIcon icon={iconForInterest(it.title)} className="text-3xl text-pink-600 mb-3" />
                    <h4 className="font-semibold text-pink-700 text-center">{it.title}</h4>
                  </div>
                  {/* back */}
                  <div className="flip-card__face flip-card__back flex items-center justify-center p-4">
                    {it.description ? (
                      <p className="text-sm text-center whitespace-prewrap">{it.description}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
