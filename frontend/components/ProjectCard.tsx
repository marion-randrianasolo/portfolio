import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faCode } from '@fortawesome/free-solid-svg-icons';

export interface Project {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  demo_url?: string;
  github_url?: string;
}

/**
 * Carte projet lisible avec interactions au survol (lift + zoom image) et
 * possibilité de déplier la description dans un overlay agrandi.
 */
export default function ProjectCard({ project }: { project: Project }) {
  const desc = project.description || '';
  const [expanded, setExpanded] = useState(false);
  const isLong = desc.length > 220;
  const shortDesc = isLong ? `${desc.slice(0, 220)}…` : desc;

  // Définition dynamique de l’overlay selon l’état (couleur, hauteur, scroll)
  const overlayColor = expanded ? 'bg-black/50' : 'bg-black/65';
  const textClamp    = expanded ? '' : 'line-clamp-4';
  const overlaySize  = expanded ? 'max-h-48 overflow-y-auto' : '';

  return (
    <article className="project-card card card--hover card--ring overflow-hidden">
      <div className="relative h-64">
        {/* Image */}
        <img
          src={project.image_url || '/placeholder.png'}
          alt={project.title}
          className="project-card__img"
          loading="lazy"
        />
        {/* voile sombre + dégradé bas */}
        <div className="project-card__overlay" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Boutons Demo / Code */}
        <div className="absolute top-3 right-3 flex gap-2">
          {project.demo_url && (
            <a
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white bg-black/50 hover:bg-black/70 px-3 py-1 rounded-full text-sm"
            >
              <FontAwesomeIcon icon={faLink} /> Demo
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white bg-black/50 hover:bg-black/70 px-3 py-1 rounded-full text-sm"
            >
              <FontAwesomeIcon icon={faCode} /> Code
            </a>
          )}
        </div>

        {/* Overlay avec description : se déplie au clic */}
        <div className="absolute left-4 right-4 bottom-4">
          <div
            className={`${overlayColor} text-white rounded-lg px-4 py-3 backdrop-blur-sm transition-all duration-300 ${overlaySize}`}
          >
            <h4 className="text-lg font-semibold">{project.title}</h4>
            {desc && (
              <p
                className={`mt-1 text-sm opacity-95 whitespace-pre-wrap ${textClamp}`}
              >
                {expanded ? desc : shortDesc}
              </p>
            )}
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                className="mt-2 text-xs underline underline-offset-2 hover:opacity-90"
              >
                {expanded ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
