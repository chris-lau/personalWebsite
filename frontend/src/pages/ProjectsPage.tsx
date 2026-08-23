import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ChevronDown, Folder, GitBranch, Globe, ShieldCheck, ShoppingCart } from 'lucide-react';
import { projectsData } from '../data/projects';
import { Section } from '../components/ui/Section';
import { GitHubDashboard } from '../components/github/GitHubDashboard';
import { openChat } from '../components/chat/chatControl';
import { Project } from '../types/portfolio';
import './Pages.css';

/** Domain icon shown in each case-study row. */
const PROJECT_ICONS: Record<string, typeof Bot> = {
  tinyclaw: ShieldCheck,
  'amazon-seller-suite': ShoppingCart,
  'personal-os': Globe,
};

/** One case-study entry: collapsed index row, expands to the story + actions. */
const CaseRow = ({ project }: { project: Project }) => {
  const [open, setOpen] = useState(false);
  const ProjectIcon = PROJECT_ICONS[project.id] ?? Globe;
  const liveUrl = project.liveUrl;

  return (
    <article className={`case-row ${open ? 'case-row--open' : ''}`}>
      <div className="case-row__summary">
        <button
          type="button"
          className="case-row__toggle"
          aria-expanded={open}
          aria-controls={`case-details-${project.id}`}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="work-row__icon" aria-hidden="true">
            <ProjectIcon size={18} strokeWidth={1.75} />
          </span>
          <span className="case-row__heading">
            <span className="case-row__title">{project.title}</span>
            <span className="case-row__desc">{project.description}</span>
          </span>
          <ChevronDown size={16} aria-hidden="true" className="case-row__chevron" />
        </button>
        <button
          type="button"
          className="link-button case-row__ask"
          aria-label={`Ask this site about the ${project.title} project`}
          onClick={() => openChat({ starter: `Tell me about the ${project.title} project.` })}
        >
          Ask this site →
        </button>
      </div>

      {open && (
        <div id={`case-details-${project.id}`} className="case-row__details">
          <div className="tech-tags">
            {project.techStack.map((tech) => (
              <span key={tech} className="tech-tag">#{tech}</span>
            ))}
          </div>
          <div className="work-row__actions">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="link-button">
                GitHub
              </a>
            )}
            {liveUrl && (
              liveUrl.startsWith('/') ? (
                <Link to={liveUrl} className="link-button">
                  Live Demo
                </Link>
              ) : (
                <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="link-button">
                  Live Demo
                </a>
              )
            )}
          </div>
        </div>
      )}
    </article>
  );
};

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
            <Folder size={16} aria-hidden="true" />
            <span>Featured Projects</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'github'}
            className={`projects-tab-btn ${activeTab === 'github' ? 'active' : ''}`}
            onClick={() => setActiveTab('github')}
          >
            <GitBranch size={16} aria-hidden="true" />
            <span>Live GitHub Activity</span>
          </button>
        </div>

        {activeTab === 'featured' ? (
          <Section title="FEATURED PORTFOLIO PROJECTS" index="01">
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

            <div className="case-index">
              {filteredProjects.map((project) => (
                <CaseRow key={project.id} project={project} />
              ))}
            </div>
          </Section>
        ) : (
          <Section title="LIVE GITHUB ACTIVITY & REPOSITORIES" index="02" tint>
            <GitHubDashboard />
          </Section>
        )}
      </section>
    </div>
  );
};
