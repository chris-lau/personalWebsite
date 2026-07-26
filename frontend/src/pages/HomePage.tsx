import React from 'react';
import { Link } from 'react-router-dom';
import { profileData } from '../data/profile';
import { projectsData } from '../data/projects';
import { skillsData } from '../data/skills';
import { BoxContainer } from '../components/ui/BoxContainer';
import './Pages.css';

export const HomePage: React.FC = () => {
  const featuredProjects = projectsData.filter((p) => p.featured);

  return (
    <div className="page-container page-home">
      <section className="hero-section">
        <BoxContainer title="WELCOME">
          <div className="hero-content">
            <h1 className="hero-title">{profileData.name}</h1>
            <p className="hero-subtitle">{profileData.title} &bull; {profileData.location}</p>
            <p className="hero-bio">{profileData.bio}</p>
            <div className="hero-links">
              {profileData.socials.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-button"
                >
                  [{s.platform}]
                </a>
              ))}
            </div>
          </div>
        </BoxContainer>
      </section>

      <section className="featured-section">
        <BoxContainer title="FEATURED PROJECTS">
          <div className="project-grid">
            {featuredProjects.map((project) => (
              <div key={project.id} className="project-card">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.description}</p>
                <div className="tech-tags">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="tech-tag">#{tech}</span>
                  ))}
                </div>
                <div className="project-actions">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="link-button">
                      [GitHub]
                    </a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="link-button">
                      [Live Demo]
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="section-footer">
            <Link to="/projects" className="link-button primary">[ View All Projects &rarr; ]</Link>
          </div>
        </BoxContainer>
      </section>

      <section className="skills-summary-section">
        <BoxContainer title="SKILLS SNAPSHOT">
          <div className="skills-snapshot">
            {skillsData.map((cat) => (
              <div key={cat.category} className="skill-group">
                <span className="skill-cat-label">{cat.category}:</span>
                <span className="skill-list">{cat.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </BoxContainer>
      </section>
    </div>
  );
};
