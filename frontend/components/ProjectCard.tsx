import React from 'react';
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
 * Carte projet lisible avec interactions au survol (lift + zoom image).
 */
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card card card--hover card--ring overflow-hidden">
      <div className="relative h-64">
        <img
          src={project.image_url || '/placeholder.png'}
          alt={project.title}
          className="project-card__img"
          loading="lazy"
        />
        {/* voile sombre + dégradé */}
        <div className="project-card__overlay" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

        {/* actions */}
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

        {/* cartouche lisible */}
        <div className="absolute left-4 right-4 bottom-4">
          <div className="bg-black/65 text-white rounded-lg px-4 py-3 backdrop-blur-sm">
            <h4 className="text-lg font-semibold">{project.title}</h4>
            {project.description && (
              <p className="text-sm opacity-95 whitespace-pre-wrap line-clamp-4">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
