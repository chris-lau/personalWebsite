import React, { useState, useMemo } from 'react';
import { projectsData } from '../data/projects';
import { BoxContainer } from '../components/ui/BoxContainer';
import { GitHubDashboard } from '../components/github/GitHubDashboard';
import './Pages.css';

export const ProjectsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'featured' | 'github'>('featured');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projectsData.forEach((p) => p.techStack.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!selectedTag) return projectsData;
    return projectsData.filter((p) => p.techStack.includes(selectedTag));
  }, [selectedTag]);

  return (
    <div className="page-container page-projects">
      <section>
        <div className="projects-tab-bar" role="tablist" aria-label="Projects view mode">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'featured'}
            className={`projects-tab-btn ${activeTab === 'featured' ? 'active' : ''}`}
            onClick={() => setActiveTab('featured')}
          >
            📁 Featured Projects
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'github'}
            className={`projects-tab-btn ${activeTab === 'github' ? 'active' : ''}`}
            onClick={() => setActiveTab('github')}
          >
            🐙 Live GitHub Activity
          </button>
        </div>

        {activeTab === 'featured' ? (
          <BoxContainer title="FEATURED PORTFOLIO PROJECTS">
            <div className="filter-bar" role="group" aria-label="Filter projects by technology">
              <span className="filter-label" id="filter-by-label">Filter Tag: </span>
              <button
                type="button"
                className={`filter-tag ${selectedTag === null ? 'active' : ''}`}
                aria-pressed={selectedTag === null}
                onClick={() => setSelectedTag(null)}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={`filter-tag ${selectedTag === tag ? 'active' : ''}`}
                  aria-pressed={selectedTag === tag}
                  onClick={() => setSelectedTag(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="project-grid">
              {filteredProjects.map((project) => (
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
                        GitHub
                      </a>
                    )}
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="link-button">
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </BoxContainer>
        ) : (
          <BoxContainer title="LIVE GITHUB ACTIVITY & REPOSITORIES">
            <GitHubDashboard />
          </BoxContainer>
        )}
      </section>
    </div>
  );
};



